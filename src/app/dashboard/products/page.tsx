import React from 'react';
import { getAuthProfile } from '@/lib/auth/actions';
import { redirect } from 'next/navigation';
import { getProducts, getMyProducts } from '@/services/productService';
import { createClient } from '@/lib/supabase/server';
import { Container } from '@/components/layout/Container';
import { PageTransition } from '@/components/layout/PageTransition';
import { ProductsManagerClient } from './ProductsManagerClient';

export const metadata = {
  title: 'My Products — Dashboard',
  description: 'Manage your product listings, pricing, stock, and images.',
};

export default async function DashboardProductsPage() {
  // 1. Guard: must be logged in (any role)
  const profile = await getAuthProfile();
  if (!profile) {
    redirect('/login?redirectTo=/dashboard/products');
  }

  const isAdmin = profile.role === 'admin';

  // 2. Fetch products based on role
  // Admin sees ALL products; regular user sees only their own
  const products = isAdmin ? await getProducts() : await getMyProducts();
  
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name');

  return (
    <PageTransition className="pt-8">
      <Container>
        <ProductsManagerClient 
          initialProducts={products} 
          categories={categories || []}
          isAdmin={isAdmin}
          currentUserId={profile.id}
          userWhatsapp={profile.whatsapp_number}
        />
      </Container>
    </PageTransition>
  );
}
