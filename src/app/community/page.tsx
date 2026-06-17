import React from 'react';
import { Container } from '@/components/layout/Container';
import { PageTransition } from '@/components/layout/PageTransition';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { CommunityCard } from '@/components/shared/CommunityCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MessageSquarePlus, TrendingUp, Users } from 'lucide-react';
import Image from 'next/image';
import { getCommunityPosts, getTopContributors } from '@/services/communityService';
import { getUserLikeMap } from '@/services/likeService';
import { createClient } from '@/lib/supabase/server';
import { CreatePostModal } from '@/components/community/CreatePostModal';
import Link from 'next/link';
import { text } from '@/lib/dictionary';
import { cn } from '@/lib/utils';

/**
 * Server Component — fetches community posts, contributors, and current user like map.
 */
export default async function CommunityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [posts, contributors] = await Promise.all([
    getCommunityPosts(),
    getTopContributors(),
  ]);

  // Batch-fetch which posts the current user has liked (empty map if logged out)
  const likeMap = user
    ? await getUserLikeMap(posts.map((p) => p.id), user.id)
    : {};


  return (
    <PageTransition className="pt-8">
      <Container>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <SectionTitle
            title={text.community.hubTitle}
            subtitle={text.community.hubSubtitle}
          />
          <CreatePostModal />
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {posts.length > 0 ? (
              posts.map(post => (
                <CommunityCard
                  key={post.id}
                  post={post}
                  hasLiked={!!likeMap[post.id]}
                  isAuthenticated={!!user}
                />
              ))
            ) : (
              <div className="text-center py-16 bg-card/50 rounded-2xl border border-border border-dashed">
                <MessageSquarePlus className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {text.community.emptyPosts}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Search */}
            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
              <h3 className="font-semibold mb-4">{text.community.searchTitle}</h3>
              <Input placeholder={text.community.searchPlaceholder} className="w-full bg-background" />
            </div>

            {/* Trending */}
            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-primary">
                <TrendingUp className="h-5 w-5" />
                <h3 className="font-semibold text-foreground">{text.community.trendingTopics}</h3>
              </div>
              <div className="space-y-4">
                {['Carbon Shaft Maintenance', 'Best break cue under 5M?', 'JTT Shop Tournament 2026'].map((topic, i) => (
                  <div key={i} className="flex flex-col gap-1 cursor-pointer group">
                    <p className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-1">
                      {topic}
                    </p>
                    <span className="text-xs text-muted-foreground">{12 + i * 5} discussions</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Contributors */}
            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-primary">
                <Users className="h-5 w-5" />
                <h3 className="font-semibold text-foreground">{text.community.topContributors}</h3>
              </div>
              <div className="space-y-4">
                {contributors.length > 0 ? (
                  contributors.map((user) => (
                    <div key={user.id} className="flex items-center gap-3">
                      <div className="relative h-8 w-8 overflow-hidden rounded-full border border-border shrink-0">
                        <Image
                          src={user.avatar}
                          alt={user.name}
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium truncate">{user.name}</span>
                        <span className={cn(
                          "text-[10px] uppercase font-bold",
                          user.role === 'admin' ? "text-amber-500" : "text-muted-foreground"
                        )}>
                          {user.role === 'admin' ? 'ADMIN' : 'MEMBER'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">{text.community.emptyContributors}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </PageTransition>
  );
}
