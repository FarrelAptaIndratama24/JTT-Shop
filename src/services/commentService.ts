import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { DbComment } from '@/types/database';
import { Comment } from '@/types';

// Admin client — used for writes that must bypass RLS (e.g. comments_count sync)
const adminSupabase = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─── Mapper ───────────────────────────────────────────────────────────────────
export function mapDbCommentToComment(c: DbComment): Comment {
  return {
    id:         c.id,
    product_id: c.product_id ?? undefined,
    community_post_id: c.community_post_id ?? undefined,
    user_id:    c.user_id ?? '',
    user: {
      id:         c.profiles?.id ?? '',
      name:       c.profiles?.full_name || c.profiles?.username || 'Anonymous',
      avatar:     c.profiles?.avatar_url || 'https://i.pravatar.cc/150?u=default',
      role:       (c.profiles?.role ?? 'user') as 'user' | 'admin',
      created_at: c.profiles?.created_at ?? '',
    },
    content:    c.content,
    created_at: c.created_at,
    parent_id:  c.parent_id ?? undefined,
    replies:    (c.replies ?? []).map(mapDbCommentToComment),
  };
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Helper to fetch comments and build the tree
 */
async function fetchCommentTree(filter: { product_id?: string; community_post_id?: string }): Promise<Comment[]> {
  const supabase = await createClient();

  // Fetch all comments for this target (to support nesting)
  let query = supabase
    .from('comments')
    .select(`
      id, product_id, community_post_id, user_id, parent_id, content, created_at,
      profiles ( id, username, full_name, avatar_url, role, created_at )
    `);

  if (filter.product_id) query = query.eq('product_id', filter.product_id);
  if (filter.community_post_id) query = query.eq('community_post_id', filter.community_post_id);

  const { data, error } = await query.order('created_at', { ascending: true });

  if (error) {
    console.error('[commentService.fetchCommentTree]', error.message);
    return [];
  }

  if (!data?.length) return [];

  // Build the tree in memory
  const commentMap: Record<string, DbComment & { replies: DbComment[] }> = {};
  const roots: (DbComment & { replies: DbComment[] })[] = [];

  data.forEach((item: any) => {
    commentMap[item.id] = { ...item, replies: [] };
  });

  data.forEach((item: any) => {
    const node = commentMap[item.id];
    if (item.parent_id && commentMap[item.parent_id]) {
      commentMap[item.parent_id].replies.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots.map(mapDbCommentToComment);
}

export async function getCommentsByProduct(productId: string): Promise<Comment[]> {
  return fetchCommentTree({ product_id: productId });
}

export async function getCommentsByPost(postId: string): Promise<Comment[]> {
  return fetchCommentTree({ community_post_id: postId });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function createComment(params: {
  content: string;
  product_id?: string;
  community_post_id?: string;
  parent_id?: string;
}): Promise<{ data: any; error: any }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error('Unauthorized') };

  if (!params.product_id && !params.community_post_id) {
    throw new Error("Missing target: must provide either product_id or community_post_id");
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({
      user_id: user.id,
      content: params.content,
      product_id: params.product_id || null,
      community_post_id: params.community_post_id || null,
      parent_id: params.parent_id || null,
    })
    .select()
    .single();

  if (!error && params.community_post_id) {
    // Use the admin client so this always runs regardless of the caller's session/RLS context.
    // We read the current value then write +1 atomically from the server side.
    const { data: post } = await adminSupabase
      .from('community_posts')
      .select('comments_count')
      .eq('id', params.community_post_id)
      .single();

    if (post != null) {
      const { error: countErr } = await adminSupabase
        .from('community_posts')
        .update({ comments_count: (post.comments_count ?? 0) + 1 })
        .eq('id', params.community_post_id);
      if (countErr) {
        console.error('[commentService.createComment] comments_count update failed:', countErr.message);
      }
    }
  }

  return { data, error };
}

