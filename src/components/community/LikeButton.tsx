'use client';

import React, { useState, useTransition, useCallback } from 'react';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toggleLikeAction } from '@/lib/actions/communityActions';
import { LikedUser } from '@/types/database';
import { toast } from 'sonner';
import { text } from '@/lib/dictionary';

// ─── Likes Modal ──────────────────────────────────────────────────────────────

interface LikesModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  likeCount: number;
}

function LikesModal({ isOpen, onClose, postId, likeCount }: LikesModalProps) {
  const [users, setUsers] = useState<LikedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  // Fetch liked users lazily when the modal opens
  React.useEffect(() => {
    if (!isOpen || fetched) return;
    setLoading(true);
    fetch(`/api/community/likes?postId=${postId}`)
      .then((r) => r.json())
      .then((data: LikedUser[]) => {
        setUsers(data);
        setFetched(true);
      })
      .catch(() => setFetched(true))
      .finally(() => setLoading(false));
  }, [isOpen, postId, fetched]);

  if (!isOpen) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-card border border-border rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary fill-primary" />
            <h2 className="font-bold text-base">{text.community.likedBy}</h2>
            <span className="text-xs text-muted-foreground font-normal">({likeCount})</span>
          </div>
          <button
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* User list */}
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground text-sm gap-2">
              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              {text.common.loading}
            </div>
          ) : users.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground text-sm">Belum ada yang menyukai.</p>
          ) : (
            users.map((u) => (
              <div key={u.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/40 transition-colors">
                <div className="relative h-9 w-9 shrink-0 rounded-full overflow-hidden border border-border bg-muted">
                  <Image src={u.avatar} alt={u.name} fill className="object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{u.name}</p>
                  {u.username && (
                    <p className="text-xs text-muted-foreground truncate">@{u.username}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Like Button ──────────────────────────────────────────────────────────────

interface LikeButtonProps {
  postId: string;
  /** Initial count from the server */
  initialCount: number;
  /** Whether the current user has already liked this post */
  initialLiked: boolean;
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Layout variant */
  variant?: 'card' | 'detail';
}

export function LikeButton({
  postId,
  initialCount,
  initialLiked,
  isAuthenticated,
  variant = 'card',
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [modalOpen, setModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!isAuthenticated) {
        toast.error('Silakan login untuk menyukai postingan.');
        return;
      }

      // Optimistic update
      const wasLiked = liked;
      const prevCount = count;
      setLiked(!wasLiked);
      setCount((c) => (wasLiked ? c - 1 : c + 1));

      startTransition(async () => {
        const result = await toggleLikeAction(postId);
        if (!result.success) {
          // Rollback
          setLiked(wasLiked);
          setCount(prevCount);
          toast.error(result.error || 'Gagal memproses like.');
        } else {
          // Sync with authoritative DB value
          setLiked(result.liked);
          setCount(result.newCount);
        }
      });
    },
    [postId, liked, count, isAuthenticated]
  );

  const handleCountClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (count > 0) setModalOpen(true);
  }, [count]);

  const isDetail = variant === 'detail';

  return (
    <>
      <div className={cn('flex items-center gap-1', isDetail && 'gap-2')}>
        {/* Heart toggle button */}
        <button
          onClick={handleToggle}
          disabled={isPending}
          aria-label={liked ? 'Unlike post' : 'Like post'}
          className={cn(
            'flex items-center gap-1.5 rounded-full transition-all duration-200 select-none',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            isDetail
              ? 'px-4 py-2 text-sm font-medium border'
              : 'p-1 text-sm',
            liked
              ? isDetail
                ? 'bg-primary/10 border-primary/40 text-primary hover:bg-primary/20'
                : 'text-primary'
              : isDetail
              ? 'bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-primary'
              : 'text-muted-foreground hover:text-primary',
            isPending && 'scale-95'
          )}
        >
          <Heart
            className={cn(
              'transition-all duration-200',
              isDetail ? 'h-4 w-4' : 'h-4 w-4',
              liked ? 'fill-current scale-110' : 'scale-100'
            )}
          />
          {isDetail && <span>{liked ? 'Disukai' : 'Suka'}</span>}
        </button>

        {/* Count — clickable to open modal */}
        <button
          onClick={handleCountClick}
          className={cn(
            'tabular-nums transition-colors',
            isDetail ? 'text-sm font-semibold' : 'text-sm',
            count > 0
              ? 'text-foreground/80 hover:text-primary cursor-pointer'
              : 'text-muted-foreground cursor-default'
          )}
          aria-label="Lihat yang menyukai"
        >
          {count}
        </button>
      </div>

      <LikesModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        postId={postId}
        likeCount={count}
      />
    </>
  );
}
