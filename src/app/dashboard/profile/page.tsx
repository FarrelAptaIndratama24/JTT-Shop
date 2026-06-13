import React from 'react';
import { getAuthProfile } from '@/lib/auth/actions';
import { redirect } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { PageTransition } from '@/components/layout/PageTransition';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { ProfileFormClient } from './ProfileFormClient';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Profil Saya — Dashboard',
  description: 'Kelola informasi profil dan kontak Anda.',
};

export default async function ProfilePage() {
  const profile = await getAuthProfile();
  
  if (!profile) {
    redirect('/login?redirectTo=/dashboard/profile');
  }

  return (
    <PageTransition className="pt-8 pb-24">
      <Container>
        <div className="max-w-2xl mx-auto">
          <Link href="/dashboard" className="inline-flex items-center text-xs text-muted-foreground hover:text-primary transition-colors mb-6">
            <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Kembali ke Dashboard
          </Link>
          
          <SectionTitle
            title="Profil Saya"
            subtitle="Kelola informasi pribadi dan nomor WhatsApp untuk keperluan transaksi."
          />
          
          <div className="mt-8 bg-card border border-border rounded-3xl p-8 shadow-sm">
            <ProfileFormClient profile={profile} />
          </div>
        </div>
      </Container>
    </PageTransition>
  );
}
