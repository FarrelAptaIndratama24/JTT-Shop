import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, adminKey);

async function testFullTrace() {
  // 1. Create a test user
  const email = `test-${Date.now()}@example.com`;
  const password = 'password123';
  
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    console.error("Failed to create user", authError);
    return;
  }

  const userId = authData.user.id;
  console.log("Created test user:", userId);

  // 2. Sign in to get session
  const supabaseClient = createClient(supabaseUrl, supabaseKey);
  const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    console.error("Failed to sign in", signInError);
    return;
  }

  console.log("Signed in. Session user:", signInData.user.id);

  // 3. Try to update profile exactly like the server action
  const rawWhatsapp = "081234567890";
  let formattedWhatsapp = rawWhatsapp.trim();
  if (formattedWhatsapp.startsWith('0')) {
    formattedWhatsapp = '62' + formattedWhatsapp.slice(1);
  }

  const payload = {
    full_name: 'Test User',
    username: 'testuser',
    whatsapp_number: formattedWhatsapp || null,
  };

  console.log("Current User ID:", signInData.user.id);
  console.log("WhatsApp From Form:", rawWhatsapp);
  console.log("Update Payload:", payload);

  const { data: updateData, error: updateError } = await supabaseClient
    .from('profiles')
    .update(payload)
    .eq('id', signInData.user.id)
    .select();

  console.log("Supabase Result:", updateData);
  console.log("Supabase Error:", updateError);

  // Clean up
  await supabaseAdmin.auth.admin.deleteUser(userId);
}

testFullTrace();
