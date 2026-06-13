import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTests() {
  console.log("--- Query 1: standard alias ---");
  const { data: data1, error: error1 } = await supabase
    .from('community_posts')
    .select(`
      id, user_id, title, content,
      profiles (
        id,
        full_name,
        username,
        avatar_url
      )
    `)
    .limit(1);
    
  console.log("Error 1:", error1);
  console.log("Data 1:", JSON.stringify(data1, null, 2));

  console.log("\n--- Query 2: explicit foreign-key syntax ---");
  const { data: data2, error: error2 } = await supabase
    .from('community_posts')
    .select(`
      id, user_id, title, content,
      profiles!community_posts_user_id_fkey (
        id,
        full_name,
        username,
        avatar_url
      )
    `)
    .limit(1);
    
  console.log("Error 2:", error2);
  console.log("Data 2:", JSON.stringify(data2, null, 2));
}

runTests();
