import React from 'react';
import { HeroSection } from '@/components/shared/HeroSection';
import { CTASection } from '@/components/shared/CTASection';
import { ProductGrid } from '@/components/shared/ProductGrid';
import { ProductCard } from '@/components/shared/ProductCard';
import { Container } from '@/components/layout/Container';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { CommunityCard } from '@/components/shared/CommunityCard';
import { ShieldCheck, Zap, MessageSquareText, Award } from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { getFeaturedProducts } from '@/services/productService';
import { getPreviewPosts } from '@/services/communityService';

// ─── Server Component: fetches data at request time ──────────────────────────
export default async function Home() {
  // Parallel data fetching — runs simultaneously for best performance
  const [featuredProducts, previewPosts] = await Promise.all([
    getFeaturedProducts(),
    getPreviewPosts(2),
  ]);

  return (
    <PageTransition>
      <div className="flex flex-col gap-24 pb-12">
        <HeroSection />

        {/* Featured Products */}
        <section>
          <Container>
            <div className="flex items-end justify-between mb-10">
              <SectionTitle
                title="Produk Unggulan"
                subtitle="Temukan koleksi pilihan premium billiard cues kami."
              />
            </div>
            {featuredProducts.length > 0 ? (
              <ProductGrid>
                {featuredProducts.map((product, idx) => (
                  <ProductCard key={product.id} product={product} index={idx} />
                ))}
              </ProductGrid>
            ) : (
              <p className="text-muted-foreground text-center py-12">
                Belum ada produk.
              </p>
            )}
          </Container>
        </section>

        {/* Why Choose Us */}
        <section className="bg-card/50 border-y border-border py-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
          <Container className="relative z-10">
            <SectionTitle
              title="Kenapa Memilih JTT Shop"
              subtitle="Kami berkomitmen untuk menyediakan perlengkapan dan pelayanan terbaik bagi pemain serius."
              centered
              className="mb-16"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Award, title: "Kualitas Premium", desc: "Hanya brand terbaik dan produk otentik." },
                { icon: ShieldCheck, title: "Penjual Terpercaya", desc: "100% checkout aman dan jaminan keaslian." },
                { icon: Zap, title: "Respon Cepat", desc: "Dukungan pelanggan 24/7 via WhatsApp." },
                { icon: MessageSquareText, title: "Didorong oleh Komunitas", desc: "Bergabunglah dengan ribuan pemain di komunitas aktif kami." }
              ].map((feature, idx) => (
                <div key={idx} className="flex flex-col items-center text-center p-6 rounded-2xl bg-background border border-border shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Community Preview */}
        <section>
          <Container>
            <SectionTitle
              title="Diskusi Komunitas"
              subtitle="Ikut serta dalam percakapan dengan para penggemar billiard lainnya."
              className="mb-10"
            />
            {previewPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {previewPosts.map((post) => (
                  <CommunityCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-12">
                Belum ada diskusi komunitas.
              </p>
            )}
          </Container>
        </section>

        <CTASection />
      </div>
    </PageTransition>
  );
}
