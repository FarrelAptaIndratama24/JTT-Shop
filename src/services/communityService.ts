import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { DbCommunityPost } from '@/types/database';
import { CommunityPost } from '@/types';

// Admin client for background revalidations and global public data
const adminSupabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function mapDbPostToPost(p: DbCommunityPost): CommunityPost {
  return {
    id:             p.id,
    user_id:        p.user_id ?? '',
    user: {
      id:         p.profiles?.id ?? '',
      name:       p.profiles?.full_name || p.profiles?.username || 'Anonymous',
      avatar:     p.profiles?.avatar_url || 'https://i.pravatar.cc/150?u=default',
      role:       (p.profiles?.role ?? 'user') as 'user' | 'admin',
      created_at: p.profiles?.created_at ?? '',
    },
    title:          p.title,
    content:        p.content ?? '',
    created_at:     p.created_at,
    likes:          p.likes ?? 0,
    comments_count: p.comments_count ?? 0,
    tags:           (p.community_tags ?? []).map(t => t.tag),
  };
}

const POST_SELECT = `
  id, user_id, title, content, likes, comments_count, created_at,
  profiles ( id, username, full_name, avatar_url, role, created_at ),
  community_tags ( id, post_id, tag )
`;

export async function getCommunityPosts(): Promise<CommunityPost[]> {
  const { data, error } = await adminSupabase
    .from('community_posts')
    .select(POST_SELECT)
    .order('created_at', { ascending: false });
  if (error) { console.error('[communityService.getCommunityPosts]', error.message); return []; }
  return (data as unknown as DbCommunityPost[]).map(mapDbPostToPost);
}

export async function getPreviewPosts(limit = 2): Promise<CommunityPost[]> {
  const { data, error } = await adminSupabase
    .from('community_posts')
    .select(POST_SELECT)
    .order('likes', { ascending: false })
    .limit(limit);
  if (error) { console.error('[communityService.getPreviewPosts]', error.message); return []; }
  return (data as unknown as DbCommunityPost[]).map(mapDbPostToPost);
}

export async function getTopContributors() {
  const { data, error } = await adminSupabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, role')
    .limit(3);
  if (error) { console.error('[communityService.getTopContributors]', error.message); return []; }
  return (data ?? []).map(u => ({
    id:     u.id,
    name:   u.full_name || u.username || 'Anonymous',
    avatar: u.avatar_url || 'https://i.pravatar.cc/150?u=default',
    role:   u.role ?? 'user',
  }));
}

export async function getCommunityPostById(id: string): Promise<CommunityPost | null> {
  const { data, error } = await adminSupabase
    .from('community_posts')
    .select(POST_SELECT)
    .eq('id', id)
    .single();
    
  if (error) { console.error('[communityService.getCommunityPostById]', error.message); return null; }
  return mapDbPostToPost(data as unknown as DbCommunityPost);
}

export async function createCommunityPost(title: string, content: string, tags: string[] = []): Promise<{ data: any; error: any }> {
  const supabase = await createServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error('Unauthorized') };

  // 1. Insert the post
  const { data: post, error: postError } = await supabase
    .from('community_posts')
    .insert({
      user_id: user.id,
      title,
      content,
    })
    .select()
    .single();

  if (postError) return { data: null, error: postError };

  // 2. Insert tags if any
  if (tags.length > 0) {
    const tagEntries = tags.map(tag => ({
      post_id: post.id,
      tag,
    }));
    
    const { error: tagError } = await supabase
      .from('community_tags')
      .insert(tagEntries);
      
    if (tagError) console.error('[communityService.createCommunityPost] tag insertion error:', tagError.message);
  }

  return { data: post, error: null };
}
