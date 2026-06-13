import React from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { MessageSquare } from 'lucide-react';
import { CommunityPost } from '@/types';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/Badge';
import { LikeButton } from '@/components/community/LikeButton';
import Link from 'next/link';

interface CommunityCardProps {
  post: CommunityPost;
  className?: string;
  /** Whether the current viewer has already liked this post */
  hasLiked?: boolean;
  /** Whether the current viewer is authenticated */
  isAuthenticated?: boolean;
}

export function CommunityCard({
  post,
  className,
  hasLiked = false,
  isAuthenticated = false,
}: CommunityCardProps) {
  return (
    <div className={cn(
      'group flex flex-col p-6 rounded-2xl bg-card border border-border shadow-sm transition-all hover:shadow-md hover:border-primary/50',
      className
    )}>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
          <Image
            src={post.user.avatar || 'https://i.pravatar.cc/150?u=default'}
            alt={post.user.name}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h4 className="font-semibold text-sm leading-none mb-1">{post.user.name}</h4>
          <span className="text-[10px] text-muted-foreground">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: id })}
          </span>
        </div>
      </div>

      <Link href={`/community/${post.id}`} className="mb-4 flex-1">
        <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
          {post.content}
        </p>
      </Link>

      <div className="flex flex-wrap gap-2 mb-4">
        {post.tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="font-normal text-[10px] px-2 py-0">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="flex items-center gap-6 mt-auto pt-4 border-t border-border">
        {/* Like button — interactive, with optimistic UI */}
        <LikeButton
          postId={post.id}
          initialCount={post.likes}
          initialLiked={hasLiked}
          isAuthenticated={isAuthenticated}
          variant="card"
        />

        {/* Comment count — links to detail page */}
        <Link
          href={`/community/${post.id}`}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <MessageSquare className="h-4 w-4" />
          <span>{post.comments_count}</span>
        </Link>
      </div>
    </div>
  );
}
