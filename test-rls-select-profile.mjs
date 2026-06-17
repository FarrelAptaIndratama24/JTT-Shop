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

    console.log('3. Signing in to get session...');
    const { data: sessionData, error: signInError } = await userClient.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (signInError) throw signInError;
    const sessionToken = sessionData.session.access_token;

    // Create client authenticated as temp admin
    const authAdminClient = createClient(url, anonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${sessionToken}`
        }
      },
      auth: { autoRefreshToken: false, persistSession: false }
    });

    console.log('4. Trying to read profiles table via authenticated client...');
    const { data: profiles, error: selectError } = await authAdminClient
      .from('profiles')
      .select('id, full_name, role');

    console.log('Profiles read count:', profiles ? profiles.length : null);
    console.log('Profiles read error:', selectError);
    console.log('Profiles returned:', profiles);

  } catch (err) {
    console.error('Test execution failed:', err);
  } finally {
    if (tempUserId) {
      console.log('5. Cleaning up temporary user...');
      await adminClient.auth.admin.deleteUser(tempUserId);
      console.log('Cleaned up.');
    }
  }
}

runTest();
