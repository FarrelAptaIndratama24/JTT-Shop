import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  // Pick the post with id "premium"
  const POST_ID = 'a19d8be0-c94b-47df-bfba-cc0b05a7847f';
  const USER_ID = '82f086da-50a3-4038-a93d-e6f96f82f8a1';

  const { data: before } = await admin
    .from('community_posts')
    .select('title, comments_count')
    .eq('id', POST_ID)
    .single();

  console.log("BEFORE:", before);

  // Simulate what commentService.createComment() does
  const { data: inserted, error: insertErr } = await admin
    .from('comments')
    .insert({ community_post_id: POST_ID, user_id: USER_ID, content: 'Verify count increment test' })
    .select()
    .single();

  if (insertErr) { console.error("Insert failed:", insertErr); return; }
  console.log("Inserted comment:", inserted.id);

  // Now do the admin increment (exactly as commentService.ts does it)
  const { data: post } = await admin
    .from('community_posts')
    .select('comments_count')
    .eq('id', POST_ID)
    .single();

  if (post != null) {
    const { error: countErr } = await admin
      .from('community_posts')
      .update({ comments_count: (post.comments_count ?? 0) + 1 })
      .eq('id', POST_ID);
    if (countErr) console.error("Count update failed:", countErr);
  }

  const { data: after } = await admin
    .from('community_posts')
    .select('title, comments_count')
    .eq('id', POST_ID)
    .single();

  console.log("AFTER:", after);
  console.log(before?.comments_count === after?.comments_count ? "❌ Count DID NOT change" : "✅ Count incremented correctly");
}

run();
