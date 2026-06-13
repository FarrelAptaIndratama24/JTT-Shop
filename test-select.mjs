import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSelect() {
  const userId = 'fa1ae645-b511-4a02-bc3e-50433c36db98';
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId);
    
  console.log("Supabase Select Result:", data);
  console.log("Supabase Select Error:", error);
}

testSelect();
