import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data, error } = await supabase
    .rpc('get_columns', { table_name: 'profiles' }); // We don't have this RPC.

  // Instead let's just insert a test and see if it fails, or query it.
  const { data: cols, error: err } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);
    
  if (cols && cols.length > 0) {
    console.log("Columns:", Object.keys(cols[0]));
  } else {
    console.log("No data or error:", err);
  }
}

checkSchema();
