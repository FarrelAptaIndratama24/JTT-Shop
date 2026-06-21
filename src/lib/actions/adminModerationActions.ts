'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getAuthProfile } from '@/lib/auth/actions';
import type { DbCommunityModeration, ModerationStatus } from '@/types/database';

// ─── Response types ─────────────────────────────────────────────────────────

export type ModerationActionResponse = {
  success: boolean;
  error?: string;
  data?: DbCommunityModeration[];
};

export type ModerationStats = {
  total: number;
  pending: number;
  approved: number;
  reported: number;
};

// ─── Guard: ensure caller is admin or moderator ─────────────────────────────

async function requireAdminOrModerator() {
  const profile = await getAuthProfile();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'moderator')) {
    throw new Error('Unauthorized: Akses admin atau moderator diperlukan.');
  }
  return profile;
}

// ─── Fetch dashboard stats (server-side) ────────────────────────────────────

export async function getModerationStats(): Promise<ModerationStats> {
  try {
    await requireAdminOrModerator();
    const supabase = await createClient();

    const [
      { count: total },
      { count: pending },
      { count: approved },
      { count: reported },
    ] = await Promise.all([
      supabase.from('community_moderation').select('*', { count: 'exact', head: true }),
      supabase.from('community_moderation').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('community_moderation').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('community_moderation').select('*', { count: 'exact', head: true }).eq('status', 'reported'),
    ]);

    return {
      total: total ?? 0,
      pending: pending ?? 0,
      approved: approved ?? 0,
      reported: reported ?? 0,
    };
  } catch {
    return { total: 0, pending: 0, approved: 0, reported: 0 };
  }
}

// ─── Fetch items with optional search & status filter ────────────────────────

export async function getModerationItems(
  search?: string,
  status?: ModerationStatus | 'all'
): Promise<ModerationActionResponse> {
  try {
    await requireAdminOrModerator();
    const supabase = await createClient();

    let query = supabase
      .from('community_moderation')
      .select(`
        id, user_id, content_type, title, content, status, report_count, created_at, updated_at,
        profiles ( id, username, full_name, avatar_url, role, created_at )
      `)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query = query.or(`title.ilike.${term},content.ilike.${term}`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[adminModeration.getItems] error:', error.message);
      return { success: false, error: 'Gagal memuat data moderasi.' };
    }

    return { success: true, data: (data as unknown as DbCommunityModeration[]) ?? [] };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak terduga.';
    return { success: false, error: errorMessage };
  }
}

// ─── Update item status ─────────────────────────────────────────────────────

export async function updateModerationStatus(
  id: string,
  newStatus: ModerationStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdminOrModerator();
    const supabase = await createClient();

    const { error } = await supabase
      .from('community_moderation')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('[adminModeration.updateStatus] error:', error.message);
      return { success: false, error: 'Gagal memperbarui status.' };
    }

    revalidatePath('/admin/community-moderation');
    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak terduga.';
    return { success: false, error: errorMessage };
  }
}

// ─── Delete item ────────────────────────────────────────────────────────────

export async function deleteModerationItem(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdminOrModerator();
    const supabase = await createClient();

    const { error } = await supabase
      .from('community_moderation')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[adminModeration.delete] error:', error.message);
      return { success: false, error: 'Gagal menghapus konten.' };
    }

    revalidatePath('/admin/community-moderation');
    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak terduga.';
    return { success: false, error: errorMessage };
  }
}
