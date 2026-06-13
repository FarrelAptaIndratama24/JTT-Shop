import React from 'react';
import { notFound } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { PageTransition } from '@/components/layout/PageTransition';
import { getProductBySlug } from '@/services/productService';
import { getCommentsByProduct } from '@/services/commentService';
import { getAuthUser } from '@/lib/auth/actions';
import { getSellerWhatsApp } from '@/services/profileService';
import { ProductDetailClient } from './ProductDetailClient';

/**
 * Server Component — fetches product data by slug, then delegates
 * interactive UI (cart, toast) to the Client Component below.
 */
export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: slug } = await params;

  // 1. Fetch product by its unique SEO slug first
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  // 2. Fetch comments using the real product ID
  const productComments = await getCommentsByProduct(product.id);

  // 3. Get current user ID for ownership check (null if not logged in)
  const user = await getAuthUser();
  const currentUserId = user?.id ?? null;

  // 4. Fetch Seller's WhatsApp
  const sellerWhatsApp = product.seller_id ? await getSellerWhatsApp(product.seller_id) : null;

  return (
    <PageTransition className="pt-8">
      <Container>
        <ProductDetailClient 
          product={product} 
          comments={productComments} 
          currentUserId={currentUserId}
          sellerWhatsApp={sellerWhatsApp}
        />
      </Container>
    </PageTransition>
  );
}
