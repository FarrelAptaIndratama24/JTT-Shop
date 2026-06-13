import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  // 1. Try to select from community_post_likes to verify table exists
  const { data, error } = await admin
    .from('community_post_likes')
    .select('id, post_id, user_id, created_at')
    .limit(5);

  console.log("=== community_post_likes table probe ===");
  if (error) {
    console.error("ERROR (table may not exist):", error.message, error.code);
  } else {
    console.log("Table exists. Sample rows:", JSON.stringify(data, null, 2));
  }

  // 2. Test an insert (use a real post_id and user_id)
  const { data: posts } = await admin
    .from('community_posts')
    .select('id, user_id')
    .limit(1)
    .single();

  if (posts) {
    console.log("\n=== Test INSERT into community_post_likes ===");
    const { data: ins, error: insErr } = await admin
      .from('community_post_likes')
      .upsert({ post_id: posts.id, user_id: posts.user_id }, { onConflict: 'post_id,user_id', ignoreDuplicates: true })
      .select();
    console.log("Insert result:", JSON.stringify(ins, null, 2));
    if (insErr) console.error("Insert error:", insErr.message);

    // 3. Test a DELETE
    console.log("\n=== Test DELETE from community_post_likes ===");
    const { error: delErr } = await admin
      .from('community_post_likes')
      .delete()
      .eq('post_id', posts.id)
      .eq('user_id', posts.user_id);
    if (delErr) console.error("Delete error:", delErr.message);
    else console.log("Delete OK");

    // 4. Count check
    console.log("\n=== Count after delete ===");
    const { count } = await admin
      .from('community_post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', posts.id);
    console.log("Likes count for post:", count);

    // 5. Test profile join
    console.log("\n=== Joined query (likes + profiles) ===");
    const { data: likers, error: joinErr } = await admin
      .from('community_post_likes')
      .select('id, post_id, user_id, created_at, profiles ( id, full_name, username, avatar_url )')
      .eq('post_id', posts.id);
    if (joinErr) console.error("Join error:", joinErr.message);
    else console.log("Likers:", JSON.stringify(likers, null, 2));
  }
}

run();
