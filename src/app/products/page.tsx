import React from 'react';
import { Container } from '@/components/layout/Container';
import { PageTransition } from '@/components/layout/PageTransition';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { getProducts } from '@/services/productService';
import { ProductsClientPage } from './ProductsClientPage';

/**
 * Server Component — fetches all products from Supabase once,
 * then passes them down to a Client Component that handles
 * search/filter state without extra network calls.
 */
export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <PageTransition className="pt-8">
      <Container>
        <div className="mb-8">
          <SectionTitle
            title="Premium Cues"
            subtitle="Telusuri koleksi lengkap high-performance billiard cues kami."
          />
        </div>
        <ProductsClientPage initialProducts={products} />
      </Container>
    </PageTransition>
  );
}
