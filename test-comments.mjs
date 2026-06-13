import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Fetching a community post...");
  const { data: post, error: postErr } = await supabase
    .from('community_posts')
    .select('id, title, comments_count, user_id')
    .limit(1)
    .single();
    
  if (postErr) {
    console.error("Error fetching post", postErr);
    return;
  }
  
  console.log("Post:", post);
  
  console.log("Inserting a comment...");
  const { data: newComment, error: commentErr } = await supabase
    .from('comments')
    .insert({
      community_post_id: post.id,
      user_id: post.user_id, // just use the same user
      content: "Test comment via script"
    })
    .select()
    .single();
    
  if (commentErr) {
    console.error("Error inserting comment", commentErr);
    // Is the trigger breaking?
    return;
  }
  
  console.log("Inserted comment:", newComment);
  
  console.log("Refetching post to check comment count...");
  const { data: post2 } = await supabase
    .from('community_posts')
    .select('id, title, comments_count')
    .eq('id', post.id)
    .single();
    
  console.log("Updated Post:", post2);
}

run();
