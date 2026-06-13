import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // 1. Check community_posts.comments_count
  console.log("=== community_posts.comments_count ===");
  const { data: posts, error: postsErr } = await supabase
    .from('community_posts')
    .select('id, title, comments_count');
  if (postsErr) { console.error(postsErr); return; }
  console.log(JSON.stringify(posts, null, 2));

  // 2. Count actual comments per post
  console.log("\n=== Actual comment count per post ===");
  const { data: comments, error: commentsErr } = await supabase
    .from('comments')
    .select('community_post_id');
  if (commentsErr) { console.error(commentsErr); return; }

  const counts = {};
  for (const c of comments) {
    if (c.community_post_id) {
      counts[c.community_post_id] = (counts[c.community_post_id] || 0) + 1;
    }
  }
  console.log("Actual counts by post_id:", JSON.stringify(counts, null, 2));

  // 3. Compare
  console.log("\n=== Discrepancy Report ===");
  for (const post of posts) {
    const actual = counts[post.id] || 0;
    const stored = post.comments_count || 0;
    const mismatch = actual !== stored ? '⚠️  MISMATCH' : '✅ OK';
    console.log(`${mismatch}  "${post.title}": stored=${stored}, actual=${actual}`);
  }

  // 4. Fix: update all posts to match actual count
  console.log("\n=== Syncing comments_count ===");
  for (const post of posts) {
    const actual = counts[post.id] || 0;
    const { error: updateErr } = await supabase
      .from('community_posts')
      .update({ comments_count: actual })
      .eq('id', post.id);
    if (updateErr) {
      console.error(`Failed to update "${post.title}":`, updateErr.message);
    } else {
      console.log(`✅ Updated "${post.title}" → comments_count = ${actual}`);
    }
  }

  // 5. Verify final state
  console.log("\n=== Final state after sync ===");
  const { data: final } = await supabase
    .from('community_posts')
    .select('id, title, comments_count');
  console.log(JSON.stringify(final, null, 2));
}

run();
