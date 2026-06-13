'use client';

import React from 'react';
import { ShoppingCart, Check, Info, Edit2, User } from 'lucide-react';
import { ProductGallery } from '@/components/shared/ProductGallery';
import { RatingStars } from '@/components/shared/RatingStars';
import { WhatsAppButton } from '@/components/shared/WhatsAppButton';
import { CommentCard } from '@/components/shared/CommentCard';
import { CommentForm } from '@/components/shared/CommentForm';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatIDR } from '@/lib/utils';
import { useCartStore } from '@/store/useCartStore';
import { toast } from 'sonner';
import { Product, Comment } from '@/types';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface ProductDetailClientProps {
  product: Product;
  comments: Comment[];
  currentUserId: string | null;
  sellerWhatsApp: string | null;
}

/**
 * Client Component — handles cart interactions, toast notifications,
 * and receives pre-fetched product data from the Server Component.
 */
export function ProductDetailClient({ product, comments, currentUserId, sellerWhatsApp }: ProductDetailClientProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const pathname = usePathname();

  const isOwner = currentUserId !== null && product.seller_id === currentUserId;

  const handleAddToCart = () => {
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <>
      {/* Main Product Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
        <div>
          <ProductGallery images={[product.image, product.image, product.image]} />
        </div>

        <div className="flex flex-col">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <Badge>{product.category}</Badge>
              {product.stock > 0 ? (
                <Badge variant="outline" className="text-green-500 border-green-500/20 bg-green-500/10">
                  <Check className="mr-1 h-3 w-3" /> In Stock ({product.stock})
                </Badge>
              ) : (
                <Badge variant="destructive">Out of Stock</Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">{product.name}</h1>
            <div className="flex items-center gap-4">
              <p className="text-3xl font-bold text-primary">{formatIDR(product.price)}</p>
              <div className="flex items-center gap-2 border-l border-border pl-4">
                <RatingStars rating={product.rating} size={18} />
                <span className="text-sm text-muted-foreground underline">
                  {product.reviewsCount} reviews
                </span>
              </div>
            </div>
          </div>

          {/* Seller Info */}
          {product.seller_name && (
            <div className="flex items-center gap-2 mb-6 px-4 py-2.5 rounded-xl bg-muted/30 border border-border w-fit">
              <User className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Sold by:</span>
              <span className="text-sm font-semibold">{product.seller_name}</span>
            </div>
          )}

          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            {product.description}
          </p>

          {/* Specs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 p-6 rounded-2xl bg-muted/30 border border-border">
            <div>
              <span className="text-sm text-muted-foreground block mb-1">Weight</span>
              <span className="font-semibold">{product.specs.weight || '—'}</span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground block mb-1">Length</span>
              <span className="font-semibold">{product.specs.length || '—'}</span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground block mb-1">Joint</span>
              <span className="font-semibold">{product.specs.joint || '—'}</span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground block mb-1">Tip</span>
              <span className="font-semibold">{product.specs.tip || '—'}</span>
            </div>
          </div>

          {/* Features */}
          {product.features.length > 0 && (
            <div className="mb-8">
              <h3 className="font-semibold mb-3">Key Features</h3>
              <ul className="space-y-2">
                {product.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mt-auto">
            <Button
              size="lg"
              className="flex-1 rounded-full text-base h-14"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
            {sellerWhatsApp ? (
              <WhatsAppButton
                size="lg"
                variant="outline"
                className="flex-1 rounded-full text-base h-14 bg-[#25D366]/10 text-[#25D366] border-[#25D366]/20 hover:bg-[#25D366]/20 hover:text-[#25D366]"
                phoneNumber={sellerWhatsApp}
                message={`Halo, saya tertarik dengan produk berikut:\n\n📦 Produk: ${product.name}\n💰 Harga: ${formatIDR(product.price)}\n\nApakah produk ini masih tersedia?\n\nTerima kasih.`}
              >
                Beli via WhatsApp
              </WhatsAppButton>
            ) : (
              <Button
                size="lg"
                variant="outline"
                disabled
                className="flex-1 rounded-full text-base h-14 bg-muted text-muted-foreground border-border"
              >
                Nomor WhatsApp penjual belum tersedia.
              </Button>
            )}
          </div>

          {/* Owner: Edit Product Button */}
          {isOwner && (
            <Link href="/dashboard/products" className="mt-4">
              <Button
                variant="outline"
                className="w-full rounded-full"
              >
                <Edit2 className="mr-2 h-4 w-4" />
                Edit My Product
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Discussion Section */}
      <div className="max-w-4xl mx-auto mb-20">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border">
          <h2 className="text-2xl font-bold">Customer Discussion</h2>
          <Badge variant="secondary" className="rounded-full">{comments.length}</Badge>
        </div>

        {/* New Comment Form */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-10 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">Have a question or review?</h3>
          <CommentForm 
            product_id={product.id} 
            revalidateUrl={pathname}
            placeholder="Ask anything about this product..."
          />
        </div>

        <div className="space-y-6">
          {comments.length > 0 ? (
            comments.map(comment => (
              <CommentCard key={comment.id} comment={comment} />
            ))
          ) : (
            <div className="text-center py-12 bg-muted/20 rounded-2xl border border-border border-dashed">
              <Info className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No discussions yet. Be the first to ask a question!</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
