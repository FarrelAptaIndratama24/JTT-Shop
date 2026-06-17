import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testUpdate() {
  const productId = 'f5201684-f2f8-45d8-b8f5-056fb335c48d'; // From previous log
  const newUrl = 'https://example.com/test-image.jpg';
  
  const { data, error } = await supabase
    .from('products')
    .update({ image_url: newUrl })
    .eq('id', productId)
    .select('id, name, image_url')
    .maybeSingle();
    
  console.log('Update result:', data, error);
}

testUpdate();
