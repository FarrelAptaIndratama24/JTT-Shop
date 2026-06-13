import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdate() {
  const userId = 'fa1ae645-b511-4a02-bc3e-50433c36db98';
  const whatsapp = '6281234567890';
  
  const payload = {
    whatsapp_number: whatsapp
  };
  
  console.log("Current User ID:", userId);
  console.log("WhatsApp From Form:", whatsapp);
  console.log("Update Payload:", payload);
  
  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select();
    
  console.log("Supabase Result:", data);
  console.log("Supabase Error:", error);
}

testUpdate();
