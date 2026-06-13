import React from 'react';
import { notFound } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { PageTransition } from '@/components/layout/PageTransition';
import { Badge } from '@/components/ui/Badge';
import { getCommunityPostById } from '@/services/communityService';
import { getCommentsByPost } from '@/services/commentService';
import { hasUserLiked, getPostLikesCount } from '@/services/likeService';
import { createClient } from '@/lib/supabase/server';
import { formatDistanceToNow } from 'date-fns';
import { id as dateLocaleId } from 'date-fns/locale';
import Image from 'next/image';
import { ArrowLeft, Pin, Hash } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { CommentSection } from '@/components/community/CommentSection';
import { LikeButton } from '@/components/community/LikeButton';
import { text } from '@/lib/dictionary';

interface PostDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [post, comments, likesCount] = await Promise.all([
    getCommunityPostById(id),
    getCommentsByPost(id),
    getPostLikesCount(id),
  ]);

  if (!post) notFound();

  const userHasLiked = user ? await hasUserLiked(id, user.id) : false;

  return (
    <PageTransition className="pt-8 pb-16">
      <Container>
        <Link href="/community">
          <Button variant="ghost" size="sm" className="mb-6 -ml-4 text-muted-foreground hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {text.community.backToCommunity}
          </Button>
        </Link>

        <div className="max-w-4xl mx-auto space-y-8">

          {/* ───────── Original Discussion Post ───────── */}
          <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-b from-primary/5 to-card shadow-lg shadow-primary/5">
            {/* Pinned label bar */}
            <div className="flex items-center gap-2 px-6 py-3 bg-primary/10 border-b border-primary/20">
              <Pin className="h-3.5 w-3.5 text-primary fill-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">{text.community.originalPost}</span>
            </div>

            <div className="p-8">
              {/* Author row */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-primary/40 bg-muted shadow-md">
                  <Image
                    src={post.user.avatar || 'https://i.pravatar.cc/150?u=default'}
                    alt={post.user.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base">{post.user.name}</h4>
                    <Badge variant="outline" className="text-[10px] uppercase border-primary/40 text-primary">
                      {post.user.role}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: dateLocaleId })}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold mb-4 tracking-tight leading-snug">{post.title}</h1>

              {/* Content */}
              <div className="prose prose-invert max-w-none text-foreground/85 leading-relaxed mb-8 text-[15px]">
                {post.content}
              </div>

              {/* Tags + Like button row */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-primary/10">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1 px-3 py-0.5 bg-primary/10 text-primary border-primary/20">
                      <Hash className="h-2.5 w-2.5" />
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Like button on detail page */}
                <LikeButton
                  postId={post.id}
                  initialCount={likesCount}
                  initialLiked={userHasLiked}
                  isAuthenticated={!!user}
                  variant="detail"
                />
              </div>
            </div>
          </div>

          {/* ───────── Comment section (Client Component) ───────── */}
          <CommentSection
            postId={post.id}
            initialComments={comments}
            commentsCount={post.comments_count}
            revalidateUrl={`/community/${post.id}`}
          />

        </div>
      </Container>
    </PageTransition>
  );
}
