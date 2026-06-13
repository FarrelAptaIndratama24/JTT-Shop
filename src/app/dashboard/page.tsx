import React from 'react';
import { getAuthProfile } from '@/lib/auth/actions';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Container } from '@/components/layout/Container';
import { PageTransition } from '@/components/layout/PageTransition';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Button } from '@/components/ui/Button';
import { 
  Package, 
  MessageSquare, 
  Users, 
  ShoppingBag, 
  ArrowRight, 
  Settings, 
  FileText,
  Plus,
  Store,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { text } from '@/lib/dictionary';

export const metadata = {
  title: 'Dashboard — JTT Shop',
  description: 'Manage your products and marketplace activity.',
};

export default async function DashboardPage() {
  // 1. Guard: must be logged in (any role)
  const profile = await getAuthProfile();
  if (!profile) {
    redirect('/login?redirectTo=/dashboard');
  }

  const isAdmin = profile.role === 'admin';
  const supabase = await createClient();

  // 2. Fetch stats based on role
  const [
    { count: myProductCount }
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('seller_id', profile.id)
  ]);

  // Admin-only aggregate stats
  let adminStats: { name: string; value: number; icon: any; color: string; bg: string }[] = [];
  if (isAdmin) {
    const [
      { count: totalProducts },
      { count: totalPosts },
      { count: totalComments },
    ] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('community_posts').select('*', { count: 'exact', head: true }),
      supabase.from('comments').select('*', { count: 'exact', head: true })
    ]);
    adminStats = [
      { name: text.dashboard.totalProducts, value: totalProducts ?? 0, icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10' },
      { name: text.dashboard.totalDiscussions, value: totalPosts ?? 0, icon: FileText, color: 'text-purple-500', bg: 'bg-purple-500/10' },
      { name: text.dashboard.totalComments, value: totalComments ?? 0, icon: MessageSquare, color: 'text-pink-500', bg: 'bg-pink-500/10' }
    ];
  }

  const userStats = [
    { name: text.dashboard.myProducts, value: myProductCount ?? 0, icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10' }
  ];

  return (
    <PageTransition className="pt-8">
      <Container>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="flex flex-col">
            <SectionTitle
              title={isAdmin ? text.dashboard.adminDashboard : text.dashboard.myDashboard}
              subtitle={`${text.dashboard.welcomePrefix} ${profile.full_name}. ${isAdmin ? text.dashboard.adminOverview : text.dashboard.userOverview}`}
            />
            {!profile.whatsapp_number && (
              <div className="mt-4 inline-flex items-center gap-2 bg-red-500/10 text-red-500 px-3 py-1.5 rounded-full text-xs font-bold border border-red-500/20 w-fit">
                <AlertCircle className="h-4 w-4" /> Profil Belum Lengkap
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/products">
              <Button className="rounded-full shadow-lg shadow-primary/20">
                <Store className="mr-2 h-4 w-4" />
                {text.dashboard.myProducts}
              </Button>
            </Link>
          </div>
        </div>

        {/* User Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {userStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div 
                key={idx}
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

        {/* Quick Actions Panel */}
        <div className="bg-card/50 border border-border rounded-3xl p-8 mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
          <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Quick Actions
          </h3>
          
          <div className={`grid grid-cols-1 md:grid-cols-${isAdmin ? '3' : '2'} gap-6 relative z-10`}>
            <div className="bg-background border border-border p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-base mb-2">{text.dashboard.myProducts}</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Tambah produk baru, kelola stok, ubah harga, dan pantau produk Anda.
                </p>
              </div>
              <Link href="/dashboard/products" className="mt-auto">
                <Button variant="outline" size="sm" className="w-full rounded-full group">
                  {text.dashboard.manageProducts} <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>



            <div className="bg-background border border-border p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-base mb-2">Profil Saya</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Kelola informasi pribadi dan atur nomor WhatsApp untuk transaksi jual beli.
                </p>
              </div>
              <Link href="/dashboard/profile" className="mt-auto">
                <Button variant="outline" size="sm" className="w-full rounded-full group">
                  Atur Profil <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            {isAdmin && (
              <div className="bg-background border border-border p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-base mb-2">{text.dashboard.communityModeration}</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Moderasi diskusi, kelola komentar, dan awasi aktivitas komunitas.
                  </p>
                </div>
                <Link href="/community" className="mt-auto">
                  <Button variant="outline" size="sm" className="w-full rounded-full group">
                    {text.dashboard.goToCommunity} <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Admin-only Stats Section */}
        {isAdmin && adminStats.length > 0 && (
          <div className="mb-12">
            <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {text.dashboard.platformOverview}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {adminStats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div 
                    key={idx}
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
          </div>
        )}
      </Container>
    </PageTransition>
  );
}
