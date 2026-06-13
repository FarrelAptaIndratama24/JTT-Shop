'use client';

import React from 'react';
import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem } from '@/types';
import { formatIDR, cn } from '@/lib/utils';
import { useCartStore } from '@/store/useCartStore';
import { Button } from '../ui/Button';

interface CartItemCardProps {
  item: CartItem;
  className?: string;
}

export function CartItemCard({ item, className }: CartItemCardProps) {
  const { product, quantity } = item;
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);

  return (
    <div className={cn('flex items-center gap-4 py-4 border-b border-border', className)}>
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted/30 border border-border">
        <Image src={product.image} alt={product.name} fill className="object-cover" />
      </div>
      
      <div className="flex flex-1 flex-col justify-between h-24 py-1">
        <div className="flex justify-between items-start gap-2">
          <div>
            <h4 className="font-semibold text-foreground line-clamp-1">{product.name}</h4>
            <p className="text-sm text-muted-foreground">{product.category}</p>
          </div>
          <p className="font-bold text-primary shrink-0">{formatIDR(product.price)}</p>
        </div>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-3 bg-secondary rounded-lg p-1 border border-border">
            <button
              onClick={() => decreaseQuantity(product.id)}
              disabled={quantity <= 1}
              className="p-1 rounded-md hover:bg-background disabled:opacity-50 transition-colors"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-4 text-center font-medium text-sm">{quantity}</span>
            <button
              onClick={() => increaseQuantity(product.id)}
              className="p-1 rounded-md hover:bg-background transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeFromCart(product.id)}
            className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
