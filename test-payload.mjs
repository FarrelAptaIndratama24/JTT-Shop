import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export function mapDbPostToPost(p) {
  return {
    id:             p.id,
    user_id:        p.user_id ?? '',
    user: {
      id:         p.profiles?.id ?? '',
      name:       p.profiles?.full_name || p.profiles?.username || 'Anonymous',
      avatar:     p.profiles?.avatar_url || 'https://i.pravatar.cc/150?u=default',
      role:       (p.profiles?.role ?? 'user'),
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

async function run() {
  const POST_SELECT = `
    id, user_id, title, content, likes, comments_count, created_at,
    profiles ( id, username, full_name, avatar_url, role, created_at ),
    community_tags ( id, post_id, tag )
  `;
  
  const { data, error } = await supabase
    .from('community_posts')
    .select(POST_SELECT)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error(error);
    return;
  }
  
  const mappedPosts = data.map(mapDbPostToPost);
  console.log(JSON.stringify(mappedPosts[0], null, 2));
}

run();
