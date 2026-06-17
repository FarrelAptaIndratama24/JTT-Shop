'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, User, ShoppingCart, LogOut, LayoutDashboard } from 'lucide-react';
import { NAV_LINKS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store/useCartStore';
import { logoutAction } from '@/lib/auth/actions';
import Image from 'next/image';
import { text } from '@/lib/dictionary';

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  username: string | null;
}

interface MobileNavbarProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile | null;
}

export function MobileNavbar({ isOpen, onClose, profile }: MobileNavbarProps) {
  const pathname = usePathname();
  const itemCount = useCartStore((state) => state.itemCount());

  const handleLogout = async () => {
    onClose();
    await logoutAction();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xs flex-col border-l border-border bg-background p-6 shadow-2xl lg:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-[#9089fc] bg-clip-text text-transparent">
                JTT Shop
              </span>
              <button
                onClick={onClose}
                className="rounded-full p-2 hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Nav Links */}
            <nav className="flex flex-col space-y-4 flex-1">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={onClose}
                    className={cn(
                      'text-lg font-medium transition-colors hover:text-primary',
                      isActive ? 'text-primary' : 'text-foreground'
                    )}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom Actions */}
            <div className="flex flex-col gap-4 pt-6 border-t border-border mt-auto">
              <Link
                href="/cart"
                onClick={onClose}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {itemCount}
                    </span>
                  )}
                </div>
                <span className="font-medium">{text.cart.title}</span>
              </Link>

              {/* Conditional Auth Rendering */}
              {profile ? (
                <div className="flex flex-col gap-3 p-3 rounded-xl bg-muted/30 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 rounded-full overflow-hidden bg-primary/10 border border-primary/20 shrink-0">
                      {profile.avatar_url ? (
                        <Image src={profile.avatar_url} alt={profile.full_name ?? 'User'} fill sizes="40px" className="object-cover" />
                      ) : (
                        <User className="h-5 w-5 absolute inset-0 m-auto text-primary" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate leading-none mb-1">
                        {profile.full_name ?? 'Billiard Player'}
                      </p>
                      {profile.role === 'admin' ? (
                        <span className="text-[9px] uppercase tracking-wider font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                          ADMIN
                        </span>
                      ) : (
                        <span className="text-[9px] uppercase tracking-wider font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          MEMBER
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="h-px bg-border my-1" />

                  <Link
                    href="/dashboard"
                    onClick={onClose}
                    className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors py-1.5"
                  >
                    <LayoutDashboard className="h-4 w-4 text-primary" />
                    {text.nav.dashboard}
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm text-red-400 hover:text-red-500 transition-colors py-1.5 w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    {text.nav.logout}
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={onClose}
                  className="flex items-center gap-3 p-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors justify-center"
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">{text.nav.login} / {text.nav.register}</span>
                </Link>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
