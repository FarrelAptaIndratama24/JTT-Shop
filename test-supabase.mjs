import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase
    .from('community_posts')
    .select(`
      id, user_id, title, content, likes, comments_count, created_at,
      profiles ( id, username, full_name, avatar_url, role, created_at ),
      community_tags ( id, post_id, tag )
    `)
    .limit(1);

  console.log("Service Role Data:", JSON.stringify(data, null, 2));
}

test();
