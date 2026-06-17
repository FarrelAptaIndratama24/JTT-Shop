import { supabase } from './test-supabase.mjs';

async function check() {
  const { data, error } = await supabase.rpc('exec_sql', { query: `
    SELECT constraint_name, constraint_type
    FROM information_schema.table_constraints
    WHERE table_name = 'products';
  `});
  if (error) console.error("RPC exec_sql error:", error);
  else console.log("Constraints:", data);
  
  const { data: d2, error: e2 } = await supabase.from('products').select('id');
  if (d2) {
    console.log("Total products:", d2.length);
    const ids = d2.map(p => p.id);
    const uniqueIds = new Set(ids);
    console.log("Unique IDs:", uniqueIds.size);
  }
}
check();
