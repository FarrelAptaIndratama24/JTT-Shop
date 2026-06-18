'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getAuthProfile } from '@/lib/auth/actions';
import type { DbContactMessage, ContactMessageStatus } from '@/types/database';

export type AdminActionResponse = {
  success: boolean;
  error?: string;
  data?: DbContactMessage[];
};

export type ContactMessageStats = {
  total: number;
  new_messages: number;
  read: number;
  replied: number;
};

// ─── Guard: ensure caller is admin ──────────────────────────────────────────

async function requireAdmin() {
  const profile = await getAuthProfile();
  if (!profile || profile.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required.');
  }
  return profile;
}

// ─── Fetch dashboard stats (server-side) ────────────────────────────────────

export async function getContactMessageStats(): Promise<ContactMessageStats> {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const [
      { count: total },
      { count: new_messages },
      { count: read },
      { count: replied },
    ] = await Promise.all([
      supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
      supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('status', 'new'),
      supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('status', 'read'),
      supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('status', 'replied'),
    ]);

    return {
      total: total ?? 0,
      new_messages: new_messages ?? 0,
      read: read ?? 0,
      replied: replied ?? 0,
    };
  } catch {
    return { total: 0, new_messages: 0, read: 0, replied: 0 };
  }
}

// ─── Fetch messages with optional search & status filter ─────────────────────

export async function getContactMessages(
  search?: string,
  status?: ContactMessageStatus | 'all'
): Promise<AdminActionResponse> {
  try {
    await requireAdmin();
    const supabase = await createClient();

    let query = supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query = query.or(`email.ilike.${term},subject.ilike.${term}`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[adminContact.getMessages] error:', error.message);
      return { success: false, error: 'Failed to fetch messages.' };
    }

    return { success: true, data: (data as DbContactMessage[]) ?? [] };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return { success: false, error: errorMessage };
  }
}

// ─── Update message status ──────────────────────────────────────────────────

export async function updateMessageStatus(
  id: string,
  newStatus: ContactMessageStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const { error } = await supabase
      .from('contact_messages')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      console.error('[adminContact.updateStatus] error:', error.message);
      return { success: false, error: 'Failed to update message status.' };
    }

    revalidatePath('/admin/contact-messages');
    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return { success: false, error: errorMessage };
  }
}

// ─── Delete message ─────────────────────────────────────────────────────────

export async function deleteContactMessage(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[adminContact.delete] error:', error.message);
      return { success: false, error: 'Failed to delete message.' };
    }

    revalidatePath('/admin/contact-messages');
    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return { success: false, error: errorMessage };
  }
}
