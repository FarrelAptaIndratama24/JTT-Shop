import React from 'react';
import { getAuthProfile } from '@/lib/auth/actions';
import { redirect } from 'next/navigation';
import { getContactMessageStats } from '@/lib/actions/adminContactActions';
import { Container } from '@/components/layout/Container';
import { PageTransition } from '@/components/layout/PageTransition';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { ContactMessagesClient } from './ContactMessagesClient';
import {
  Inbox,
  MailWarning,
  MailCheck,
  Reply,
} from 'lucide-react';

export const metadata = {
  title: 'Contact Messages — JTT Shop Admin',
  description: 'View and manage contact form submissions.',
};

export default async function AdminContactMessagesPage() {
  const profile = await getAuthProfile();

  if (!profile) {
    redirect('/login?redirectTo=/admin/contact-messages');
  }

  if (profile.role !== 'admin') {
    redirect('/dashboard');
  }

  const stats = await getContactMessageStats();

  const statCards = [
    { name: 'Total Messages', value: stats.total, icon: Inbox, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { name: 'New Messages', value: stats.new_messages, icon: MailWarning, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { name: 'Read Messages', value: stats.read, icon: MailCheck, color: 'text-green-500', bg: 'bg-green-500/10' },
    { name: 'Replied Messages', value: stats.replied, icon: Reply, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <PageTransition className="pt-8">
      <Container>
        <SectionTitle
          title="Contact Messages"
          subtitle="View and manage messages from the contact form."
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

        {/* ─── Messages Table ─── */}
        <ContactMessagesClient />
      </Container>
    </PageTransition>
  );
}
