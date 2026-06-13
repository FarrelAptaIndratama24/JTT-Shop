/**
 * Re-exports for backward compatibility.
 * Existing code importing from '@/lib/supabase' continues to work.
 */
export { createClient as supabase } from './supabase/client';
export { createClient as createServerClient } from './supabase/server';