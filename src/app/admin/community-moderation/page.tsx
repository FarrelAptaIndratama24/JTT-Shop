import React from 'react';
import { getAuthProfile } from '@/lib/auth/actions';
import { redirect } from 'next/navigation';
import { getModerationStats } from '@/lib/actions/adminModerationActions';
import { Container } from '@/components/layout/Container';
import { PageTransition } from '@/components/layout/PageTransition';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { CommunityModerationClient } from './CommunityModerationClient';
import {
  Activity,
  Clock,
  CheckCircle2,
  Flag,
} from 'lucide-react';

export const metadata = {
  title: 'Moderasi Komunitas — JTT Shop Admin',
  description: 'Kelola diskusi, komentar, dan aktivitas komunitas.',
};

export default async function AdminCommunityModerationPage() {
  const profile = await getAuthProfile();

  if (!profile) {
    redirect('/login?redirectTo=/admin/community-moderation');
  }

  if (profile.role !== 'admin' && profile.role !== 'moderator') {
    redirect('/dashboard');
  }

  const stats = await getModerationStats();

  const statCards = [
    {
      name: 'Total Aktivitas',
      value: stats.total,
      icon: Activity,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      name: 'Menunggu Moderasi',
      value: stats.pending,
      icon: Clock,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      name: 'Disetujui',
      value: stats.approved,
      icon: CheckCircle2,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    {
      name: 'Dilaporkan',
      value: stats.reported,
      icon: Flag,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
    },
  ];

  return (
    <PageTransition className="pt-8">
      <Container>
        <SectionTitle
          title="Moderasi Komunitas"
          subtitle="Kelola diskusi, komentar, dan aktivitas komunitas."
          className="mb-10"
        />

        {/* ─── Dashboard Stats ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.name}
                className="bg-card border border-border p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl rounded-full pointer-events-none" />
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">{stat.name}</p>
                    <h3 className="text-3xl font-extrabold tracking-tight mt-1">{stat.value}</h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── Moderation Table ─── */}
        <CommunityModerationClient />
      </Container>
    </PageTransition>
  );
}
