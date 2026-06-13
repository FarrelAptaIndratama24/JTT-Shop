'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { formatIDR } from '@/lib/utils';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { RatingStars } from './RatingStars';
import { useCartStore } from '@/store/useCartStore';
import { toast } from 'sonner';
import { text } from '@/lib/dictionary';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    toast.success(`${product.name} berhasil ditambahkan ke keranjang!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-card border border-border shadow-sm transition-all hover:shadow-xl hover:shadow-primary/5"
    >
      <Link href={`/products/${product.slug ?? product.id}`} className="absolute inset-0 z-10">
        <span className="sr-only">View {product.name}</span>
      </Link>

      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/30">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-3 left-3 z-20">
          <Badge variant="glass">{product.category}</Badge>
        </div>
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute top-3 right-3 z-20">
            <Badge variant="destructive" className="animate-pulse">{text.products.lowStock}</Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-lg leading-tight tracking-tight text-foreground line-clamp-1">
            {product.name}
          </h3>
          <p className="font-bold text-primary shrink-0">
            {formatIDR(product.price)}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <RatingStars rating={product.rating} size={14} />
            <span className="text-xs text-muted-foreground">({product.reviewsCount})</span>
          </div>
          {product.seller_name && (
            <span className="text-xs text-muted-foreground font-medium truncate max-w-[120px]">
              {text.products.bySeller} {product.seller_name}
            </span>
          )}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
          {product.description}
        </p>

        {/* Action Buttons */}
        <div className="relative z-20 mt-auto flex items-center gap-2">
          <Button 
            variant="default" 
            className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {text.products.addToCart}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
