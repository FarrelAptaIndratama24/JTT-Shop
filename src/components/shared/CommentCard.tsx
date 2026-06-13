'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { Comment } from '@/types';
import { cn } from '@/lib/utils';
import { MessageSquare } from 'lucide-react';
import { CommentForm } from './CommentForm';
import { Badge } from '../ui/Badge';
import { usePathname } from 'next/navigation';
import { text } from '@/lib/dictionary';

interface CommentCardProps {
  comment: Comment;
  className?: string;
  isReply?: boolean;
  depth?: number;
  index?: number;
}

export function CommentCard({ comment, className, isReply = false, depth = 0, index = 0 }: CommentCardProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const pathname = usePathname();

  const accentColors = [
    'border-primary/50',
    'border-blue-500/50',
    'border-emerald-500/50',
    'border-violet-500/50',
    'border-amber-500/50',
  ];
  const accentColor = accentColors[depth % accentColors.length];

  return (
    <div className={cn('group relative flex flex-col gap-3', className)}>
      {/* Main comment card */}
      <div className={cn(
        'flex items-start gap-3 p-4 rounded-xl transition-all duration-200',
        isReply
          ? 'bg-muted/20 border border-border/40 hover:bg-muted/30'
          : 'bg-card border border-border shadow-sm hover:shadow-md hover:border-border/80',
        // left accent bar
        !isReply && `border-l-2 ${accentColor}`,
      )}>
        {/* Avatar */}
        <div className={cn(
          'relative shrink-0 overflow-hidden rounded-full border bg-muted',
          isReply ? 'h-7 w-7 border-border/40' : 'h-9 w-9 border-border'
        )}>
          <Image
            src={comment.user.avatar || 'https://i.pravatar.cc/150?u=default'}
            alt={comment.user.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mb-1.5">
            <span className={cn('font-semibold', isReply ? 'text-xs' : 'text-sm')}>{comment.user.name}</span>
            <Badge
              variant="outline"
              className="text-[9px] py-0 px-1 h-3.5 uppercase tracking-tighter opacity-60 hidden sm:inline-flex"
            >
              {comment.user.role}
            </Badge>
            <span className="text-[10px] text-muted-foreground ml-auto shrink-0">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: id })}
            </span>
          </div>

          {/* Content */}
          <p className={cn(
            'text-foreground/85 leading-relaxed break-words',
            isReply ? 'text-xs' : 'text-sm'
          )}>
            {comment.content}
          </p>

          {/* Reply button */}
          {!isReply && (
            <div className="flex items-center gap-4 pt-2 mt-1">
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className={cn(
                  'flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-primary',
                  showReplyForm ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <MessageSquare className="h-3 w-3" />
                {showReplyForm ? text.community.cancel : `${text.community.reply}${comment.replies?.length ? ` (${comment.replies.length})` : ''}`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Inline Reply form */}
      {showReplyForm && (
        <div className="ml-10 animate-in slide-in-from-top-2 duration-200">
          <CommentForm
            parent_id={comment.id}
            product_id={comment.product_id}
            community_post_id={comment.community_post_id}
            revalidateUrl={pathname}
            onSuccess={() => setShowReplyForm(false)}
            placeholder={`Balas ke ${comment.user.name}...`}
            autoFocus
            className="bg-muted/20 p-4 rounded-xl border border-border/50"
          />
        </div>
      )}

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-10 space-y-2 relative">
          {/* Vertical connector line */}
          <div className="absolute left-0 top-0 bottom-4 -translate-x-5 w-px bg-border/50 rounded-full" />
          {comment.replies.map((reply, replyIndex) => (
            <div key={reply.id} className="relative">
              {/* Horizontal connector nub */}
              <div className="absolute left-0 top-4 h-px w-4 -translate-x-5 bg-border/50" />
              <CommentCard
                comment={reply}
                isReply
                depth={depth + 1}
                index={replyIndex}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
