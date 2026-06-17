import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const adminClient = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const userClient = createClient(url, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function runTest() {
  const testEmail = 'temp_admin_test@jttshop.dev';
  const testPassword = 'TempAdminPassword123!';
  let tempUserId = null;

  try {
    console.log('1. Creating temporary test user...');
    const { data: userData, error: userError } = await adminClient.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'Temp Admin Test',
        role: 'admin'
      }
    });

    if (userError) throw userError;
    tempUserId = userData.user.id;
    console.log(`Temporary user created with ID: ${tempUserId}`);

    console.log('2. Promoting temporary user to admin in profiles table...');
    const { error: profileError } = await adminClient
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', tempUserId);

    if (profileError) throw profileError;
    console.log('Promoted successfully.');

    console.log('3. Signing in as temporary admin to get session token...');
    const { data: sessionData, error: signInError } = await userClient.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (signInError) throw signInError;
    const sessionToken = sessionData.session.access_token;
    console.log('Signed in successfully.');

    // Create a client authenticated as the temporary admin
    const authAdminClient = createClient(url, anonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${sessionToken}`
        }
      },
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Let's find a product owned by someone else
    console.log('4. Finding a product owned by another user...');
    // We'll update the product 'hc cue' (id: '56ada2ad-cae8-4220-9bcc-7e5acdb5d4b3') owned by '82f086da-50a3-4038-a93d-e6f96f82f8a1'
    const targetProductId = '56ada2ad-cae8-4220-9bcc-7e5acdb5d4b3';

    // Verify current state of target product
    const { data: productBefore } = await adminClient
      .from('products')
      .select('id, name, seller_id, description')
      .eq('id', targetProductId)
      .single();

    console.log('Target product before update:', productBefore);

    console.log('5. Attempting to update product as admin (via authenticated client)...');
    const newDescription = 'Updated description by admin test ' + new Date().toISOString();
    const { data: updateData, error: updateError } = await authAdminClient
      .from('products')
      .update({ description: newDescription })
      .eq('id', targetProductId)
      .select()
      .maybeSingle();

    console.log('Update return data:', updateData);
    console.log('Update return error:', updateError);

    // Verify if it actually changed in DB
    const { data: productAfter } = await adminClient
      .from('products')
      .select('description')
      .eq('id', targetProductId)
      .single();

    if (productAfter.description === newDescription) {
      console.log('🎉 SUCCESS: Admin could update product owned by user!');
    } else {
      console.log('❌ FAILURE: Admin update was blocked or did not persist!');
    }

  } catch (err) {
    console.error('Test execution failed:', err);
  } finally {
    if (tempUserId) {
      console.log('6. Cleaning up temporary user...');
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(tempUserId);
      if (deleteError) {
        console.error('Failed to delete temporary user:', deleteError.message);
      } else {
        console.log('Temporary user cleaned up.');
      }
    }
  }
}

runTest();
