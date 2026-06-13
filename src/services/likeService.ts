import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { LikedUser } from '@/types/database';

// Admin client — bypasses RLS for reading like counts publicly
const adminSupabase = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * Returns the number of likes for a post directly from the likes table.
 * Use this as the authoritative count (not community_posts.likes).
 */
export async function getPostLikesCount(postId: string): Promise<number> {
  const { count, error } = await adminSupabase
    .from('community_post_likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);

  if (error) {
    console.error('[likeService.getPostLikesCount]', error.message);
    return 0;
  }
  return count ?? 0;
}

/**
 * Returns whether the given user has liked the given post.
 */
export async function hasUserLiked(postId: string, userId: string): Promise<boolean> {
  const { data, error } = await adminSupabase
    .from('community_post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[likeService.hasUserLiked]', error.message);
    return false;
  }
  return data !== null;
}

/**
 * Returns a map of { postId → hasLiked } for an array of posts for the current user.
 * Efficient single query for listing pages.
 */
export async function getUserLikeMap(
  postIds: string[],
  userId: string
): Promise<Record<string, boolean>> {
  if (!postIds.length || !userId) return {};

  const { data, error } = await adminSupabase
    .from('community_post_likes')
    .select('post_id')
    .eq('user_id', userId)
    .in('post_id', postIds);

  if (error) {
    console.error('[likeService.getUserLikeMap]', error.message);
    return {};
  }

  return Object.fromEntries((data ?? []).map((r) => [r.post_id, true]));
}

/**
 * Returns the list of users who liked a post (for the Liked-By modal).
 */
export async function getLikedUsers(postId: string): Promise<LikedUser[]> {
  const { data, error } = await adminSupabase
    .from('community_post_likes')
    .select('user_id, profiles ( id, full_name, username, avatar_url )')
    .eq('post_id', postId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[likeService.getLikedUsers]', error.message);
    return [];
  }

  return (data ?? []).map((row: any) => ({
    id:       row.profiles?.id ?? row.user_id,
    name:     row.profiles?.full_name || row.profiles?.username || 'Anonymous',
    username: row.profiles?.username ?? null,
    avatar:   row.profiles?.avatar_url || 'https://i.pravatar.cc/150?u=default',
  }));
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Toggles like for the currently authenticated user.
 * Returns { liked: true } if the user has now liked the post,
 * Returns { liked: false } if the user has now un-liked the post.
 */
export async function toggleLike(
  postId: string
): Promise<{ liked: boolean; newCount: number; error?: string }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { liked: false, newCount: 0, error: 'Unauthorized' };
  }

  // Check current state
  const { data: existing } = await adminSupabase
    .from('community_post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    // Un-like
    const { error } = await adminSupabase
      .from('community_post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);

    if (error) return { liked: true, newCount: 0, error: error.message };
  } else {
    // Like
    const { error } = await adminSupabase
      .from('community_post_likes')
      .insert({ post_id: postId, user_id: user.id });

    if (error) return { liked: false, newCount: 0, error: error.message };
  }

  // Sync community_posts.likes column to reflect the authoritative count
  const newCount = await getPostLikesCount(postId);
  await adminSupabase
    .from('community_posts')
    .update({ likes: newCount })
    .eq('id', postId);

  return { liked: !existing, newCount };
}
