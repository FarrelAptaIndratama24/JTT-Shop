'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { loginSchema, registerSchema, profileSchema } from '../validation';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuthState = {
  error?: string;
  success?: string;
} | undefined;

// ─── Register ─────────────────────────────────────────────────────────────────
/**
 * Profile row is created automatically by a PostgreSQL trigger on auth.users.
 * The trigger reads raw_user_meta_data.full_name to populate profiles.full_name.
 * We only need to call signUp() here — no manual profile upsert required.
 */
export async function registerAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const fullName = String(formData.get('full_name') ?? '');
  const email    = String(formData.get('email')     ?? '');
  const password = String(formData.get('password')  ?? '');

  // Validation via Zod schema
  const validationResult = registerSchema.safeParse({ fullName, email, password });
  if (!validationResult.success) {
    return { error: validationResult.error.issues[0].message };
  }
  
  const parsedData = validationResult.data;

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: parsedData.email,
    password: parsedData.password,
    options: {
      // The trigger reads raw_user_meta_data to populate profiles
      data: {
        full_name: parsedData.fullName,
        username:  parsedData.email.split('@')[0],
        role:      'user',
      },
    },
  });

  if (error) {
    console.error('[auth.register] signUp error:', error.message);
    return { error: error.message };
  }

  // Revalidate layout so Navbar re-fetches auth profile
  revalidatePath('/', 'layout');
  redirect('/');
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email    = String(formData.get('email')    ?? '');
  const password = String(formData.get('password') ?? '');

  // Validation via Zod schema
  const validationResult = loginSchema.safeParse({ email, password });
  if (!validationResult.success) {
    return { error: validationResult.error.issues[0].message };
  }

  const parsedData = validationResult.data;

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ 
    email: parsedData.email, 
    password: parsedData.password 
  });

  if (error) {
    console.error('[auth.login] signIn error:', error.message);
    // Give a friendly message regardless of exact error
    return { error: 'Email atau kata sandi tidak valid. Silakan coba lagi.' };
  }

  // Revalidate layout so Navbar re-fetches auth profile immediately
  revalidatePath('/', 'layout');
  redirect('/');
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}

// ─── Get current auth user (lightweight — no profile join) ───────────────────

export async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    // Token expired or invalid — not a crash, just unauthenticated
    return null;
  }
  return user ?? null;
}

// ─── Get current profile (with fallback from auth metadata) ──────────────────
/**
 * Fetches the profiles row for the current session user.
 *
 * Fallback chain (if trigger hasn't run yet or profile is missing):
 *   1. profiles table row
 *   2. Synthesised profile built from auth.user metadata
 *   3. null (user is not authenticated)
 */
export async function getAuthProfile() {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) return null;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, role, username, whatsapp_number')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError || !profile) {
    if (profileError) {
      console.warn('[auth.getAuthProfile] profile lookup error:', profileError.message);
    } else {
      console.info('[auth.getAuthProfile] profile row missing in DB, using auth metadata fallback');
    }

    // Fallback: synthesise from auth user metadata so Navbar still renders
    const meta = user.user_metadata ?? {};
    return {
      id:         user.id,
      full_name:  meta.full_name  ?? user.email?.split('@')[0] ?? 'User',
      avatar_url: meta.avatar_url ?? null,
      role:       meta.role       ?? 'user',
      username:   meta.username   ?? user.email?.split('@')[0] ?? null,
      whatsapp_number: null,
    };
  }

  return profile;
}

// ─── Update Profile ───────────────────────────────────────────────────────────

export async function updateProfileAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'Anda harus masuk untuk memperbarui profil.' };
  }

  const rawFullName = String(formData.get('full_name') ?? '');
  const rawUsername = String(formData.get('username') ?? '');
  const whatsapp_number = String(formData.get('whatsapp_number') ?? '');
  
  // Format WhatsApp number (e.g. 0812... -> 62812...)
  let formattedWhatsapp = whatsapp_number.trim();
  if (formattedWhatsapp.startsWith('0')) {
    formattedWhatsapp = '62' + formattedWhatsapp.slice(1);
  }

  // Validate
  const validationResult = profileSchema.safeParse({
    full_name: rawFullName,
    username: rawUsername,
    whatsapp_number: formattedWhatsapp,
  });

  if (!validationResult.success) {
    return { error: validationResult.error.issues[0].message };
  }

  const parsedData = validationResult.data;

  const payload = {
    full_name: parsedData.full_name,
    username: parsedData.username,
    whatsapp_number: parsedData.whatsapp_number || null,
  };

  console.log("Current User ID:", user.id);
  console.log("WhatsApp From Form:", whatsapp_number);
  console.log("Update Payload:", payload);

  // Update profile
  const { data, error: updateError } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', user.id)
    .select();

  console.log("Supabase Result:", data);
  console.log("Supabase Error:", updateError);

  if (updateError) {
    console.error('[auth.updateProfile] error:', updateError.message);
    if (updateError.code === '23505') {
      return { error: 'Username sudah digunakan oleh orang lain.' };
    }
    return { error: 'Gagal memperbarui profil. Silakan coba lagi.' };
  }

  revalidatePath('/dashboard/profile');
  revalidatePath('/', 'layout');
  
  return { success: 'Profil berhasil diperbarui!' };
}
