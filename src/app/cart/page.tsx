'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Container } from '@/components/layout/Container';
import { PageTransition } from '@/components/layout/PageTransition';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { CartItemCard } from '@/components/shared/CartItemCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/useCartStore';
import { formatIDR } from '@/lib/utils';
import { ShoppingBag, ArrowRight, MessageCircle, MapPin, Store } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { text } from '@/lib/dictionary';
import { getSellersInfo, SellerInfo } from '@/lib/actions/checkoutActions';
import { CartItem } from '@/types';

export default function CartPage() {
  const { items, clearCart } = useCartStore();
  const [shippingAddress, setShippingAddress] = useState('');
  const [sellersInfo, setSellersInfo] = useState<Record<string, SellerInfo>>({});

  // Group items by seller
  const itemsBySeller = useMemo(() => {
    const groups: Record<string, CartItem[]> = {};
    items.forEach(item => {
      const sellerId = item.product.seller_id || 'unknown';
      if (!groups[sellerId]) groups[sellerId] = [];
      groups[sellerId].push(item);
    });
    return groups;
  }, [items]);

  // Fetch seller details (names & WhatsApp numbers)
  useEffect(() => {
    const sellerIds = Object.keys(itemsBySeller).filter(id => id !== 'unknown');
    if (sellerIds.length > 0) {
      getSellersInfo(sellerIds).then(info => {
        const infoMap = info.reduce((acc, curr) => {
          acc[curr.id] = curr;
          return acc;
        }, {} as Record<string, SellerInfo>);
        setSellersInfo(infoMap);
      });
    }
  }, [itemsBySeller]);

  const handleCheckoutSeller = (sellerId: string, groupItems: CartItem[], sellerData?: SellerInfo) => {
    if (!shippingAddress.trim() || shippingAddress.trim().length < 5) {
      return toast.error('Alamat pengiriman harus minimal 5 karakter.');
    }

    if (!sellerData || !sellerData.whatsapp_number) {
      return toast.error('Nomor WhatsApp penjual belum tersedia.');
    }

    const groupTotal = groupItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    let message = `Halo, saya ingin memesan produk berikut:\n\n`;
    groupItems.forEach((item) => {
      message += `${item.quantity}x ${item.product.name}\n${formatIDR(item.product.price * item.quantity)}\n\n`;
    });
    message += `📍 Alamat Pengiriman:\n${shippingAddress}\n\n`;
    message += `💰 Total:\n${formatIDR(groupTotal)}\n\n`;
    message += `Mohon informasi ketersediaan produk dan estimasi pengiriman.\n\nTerima kasih.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${sellerData.whatsapp_number}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <PageTransition className="pt-8">
      <Container>
        <SectionTitle title={text.cart.title} className="mb-10" />

        {items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Main Area: List of items grouped by Seller */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              
              {/* Global Shipping Address Input */}
              <div className="bg-card border border-border p-6 rounded-3xl shadow-sm">
                <label htmlFor="address" className="text-sm font-semibold flex items-center gap-2 mb-4">
                  <MapPin className="h-4 w-4 text-primary" />
                  {text.cart.shippingAddress}
                </label>
                <textarea
                  id="address"
                  rows={3}
                  placeholder={text.cart.addressPlaceholder}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full bg-background border border-border rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all placeholder:text-muted-foreground/50 resize-none"
                  required
                />
              </div>

              {Object.entries(itemsBySeller).map(([sellerId, groupItems]) => {
                const sellerData = sellersInfo[sellerId];
                const sellerName = sellerData?.name || groupItems[0].product.seller_name || 'Penjual';
                const groupTotal = groupItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
                
                return (
                  <div key={sellerId} className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                    {/* Seller Header */}
                    <div className="flex items-center gap-2 bg-muted/30 px-6 py-4 border-b border-border">
                      <Store className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-sm">Penjual: {sellerName}</span>
                    </div>

                    {/* Items */}
                    <div className="px-6 py-2">
                      {groupItems.map((item) => (
                        <CartItemCard key={item.product.id} item={item} />
                      ))}
                    </div>

                    {/* Seller Checkout Footer */}
                    <div className="bg-muted/10 px-6 py-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground mb-1">Subtotal dari {sellerName}</span>
                        <span className="font-bold text-lg text-primary">{formatIDR(groupTotal)}</span>
                      </div>
                      
                      <Button 
                        onClick={() => handleCheckoutSeller(sellerId, groupItems, sellerData)}
                        className="w-full sm:w-auto rounded-full bg-[#25D366] hover:bg-[#25D366]/90 text-white border-none shadow-[0_0_15px_rgba(37,211,102,0.2)] whitespace-nowrap"
                        disabled={!sellerData?.whatsapp_number}
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Pesan via WhatsApp
                      </Button>
                      {!sellerData?.whatsapp_number && (
                         <p className="text-xs text-red-500 max-w-[200px] text-center sm:text-right">
                           Nomor WhatsApp penjual belum tersedia.
                         </p>
                      )}
                    </div>
                  </div>
                );
              })}

              <div className="mt-2 flex justify-between items-center px-2">
                <Button variant="ghost" onClick={clearCart} className="text-muted-foreground hover:text-red-500">
                  {text.cart.removeItem}
                </Button>
                <Link href="/products">
                  <Button variant="outline" className="rounded-full">
                    {text.cart.continueShopping}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Total Summary Card (Optional, for whole cart) */}
            <div className="bg-card border border-border p-6 rounded-3xl shadow-sm h-fit sticky top-24">
              <h3 className="font-bold text-lg mb-6">{text.cart.orderSummary}</h3>
              
              <div className="flex flex-col gap-4 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Item</span>
                  <span className="font-medium">{items.length} Barang</span>
                </div>
                <div className="h-px w-full bg-border my-2" />
                <div className="flex justify-between items-end">
                  <span className="font-semibold text-base">{text.cart.total}</span>
                  <span className="font-bold text-2xl text-primary">
                    {formatIDR(items.reduce((sum, item) => sum + item.product.price * item.quantity, 0))}
                  </span>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-center mt-6">
                <p className="text-xs text-primary leading-relaxed">
                  Silakan isi alamat pengiriman di form sebelah kiri, lalu klik tombol <b>Pesan via WhatsApp</b> pada masing-masing penjual.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState 
            icon={ShoppingBag}
            title={text.cart.emptyTitle}
            description={text.cart.emptyDesc}
            action={
              <Link href="/products">
                <Button className="rounded-full mt-4">
                  {text.cart.exploreProducts} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            }
          />
        )}
      </Container>
    </PageTransition>
  );
}
