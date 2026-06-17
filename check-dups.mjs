import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDups() {
  const { data, error } = await supabase.from('products').select('*');
  if (error) {
    console.error('Error fetching products:', error);
    return;
  }
  
  console.log('Total products:', data.length);
  
  const idCounts = {};
  const slugCounts = {};
  
  for (const p of data) {
    idCounts[p.id] = (idCounts[p.id] || 0) + 1;
    slugCounts[p.slug] = (slugCounts[p.slug] || 0) + 1;
  }
  
  const dupIds = Object.entries(idCounts).filter(([_, c]) => c > 1);
  const dupSlugs = Object.entries(slugCounts).filter(([_, c]) => c > 1);
  
  console.log('Duplicate IDs:', dupIds);
  console.log('Duplicate Slugs:', dupSlugs);
}

checkDups();
