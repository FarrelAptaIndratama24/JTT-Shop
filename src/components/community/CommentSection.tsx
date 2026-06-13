'use client';

import React, { useState } from 'react';
import { Comment } from '@/types';
import { CommentCard } from '@/components/shared/CommentCard';
import { CommentForm } from '@/components/shared/CommentForm';
import { MessageSquare, PlusCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { text } from '@/lib/dictionary';

interface CommentSectionProps {
  postId: string;
  initialComments: Comment[];
  commentsCount: number;
  revalidateUrl: string;
}

export function CommentSection({
  postId,
  initialComments,
  commentsCount,
  revalidateUrl,
}: CommentSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  // Lazily check auth when the user tries to open the form
  const handleOpenForm = async () => {
    if (isLoggedIn === null) {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
      if (!!user) setShowForm(true);
    } else if (isLoggedIn) {
      setShowForm(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Section header + toggle button ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex items-center gap-4 flex-1">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-card border border-border shadow-sm shrink-0">
            <MessageSquare className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">{text.community.discussion}</span>
            <span className="flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold">
              {commentsCount}
            </span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
      </div>

      {/* ── Toggle button row ── */}
      <div className="flex justify-center">
        {isLoggedIn === false ? (
          /* Not logged in nudge */
          <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-muted/40 border border-border text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4 shrink-0" />
            <span>{text.community.loginToComment}</span>
            <a
              href={`/login?redirectTo=${encodeURIComponent(revalidateUrl)}`}
              className="font-semibold text-primary hover:underline"
            >
              {text.nav.login} →
            </a>
          </div>
        ) : showForm ? (
          <button
            onClick={() => setShowForm(false)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
          >
            <X className="h-3.5 w-3.5 transition-transform group-hover:rotate-90 duration-200" />
            {text.community.closeForm}
          </button>
        ) : (
          <Button
            onClick={handleOpenForm}
            size="sm"
            className="rounded-full px-6 gap-2 shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            {text.community.writeComment}
          </Button>
        )}
      </div>

      {/* ── Collapsible comment form ── */}
      <div
        className={cn(
          'grid transition-all duration-300 ease-in-out',
          showForm ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
        )}
      >
        <div className="overflow-hidden">
          <div className="bg-card/70 border border-border rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              {text.community.shareOpinion}
            </h3>
            <CommentForm
              community_post_id={postId}
              revalidateUrl={revalidateUrl}
              placeholder={text.community.shareOpinion}
              className="bg-transparent"
              onSuccess={() => setShowForm(false)}
              showCancelButton
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      </div>

      {/* ── Comment list ── */}
      <div className="space-y-4">
        {initialComments.length > 0 ? (
          initialComments.map((comment, index) => (
            <CommentCard key={comment.id} comment={comment} index={index} />
          ))
        ) : (
          <div className="text-center py-16 bg-muted/5 rounded-2xl border border-dashed border-border">
            <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm font-medium">{text.community.emptyComments}</p>
            <p className="text-muted-foreground/60 text-xs mt-1">Jadilah yang pertama berdiskusi!</p>
          </div>
        )}
      </div>
    </div>
  );
}
