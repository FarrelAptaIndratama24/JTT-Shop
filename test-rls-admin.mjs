import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspect() {
  const { data: profiles, error: err1 } = await supabase.from('profiles').select('*');
  const { data: products, error: err2 } = await supabase.from('products').select('*');
  console.log('--- PROFILES ---');
  console.log(profiles);
  console.log('--- PRODUCTS ---');
  console.log(products);
}

inspect();
