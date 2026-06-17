'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, ShoppingCart, User, LogOut, ChevronDown, LayoutDashboard } from 'lucide-react';
import { NAV_LINKS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store/useCartStore';
import { Container } from './Container';
import { Button } from '../ui/Button';
import { MobileNavbar } from './MobileNavbar';
import { logoutAction } from '@/lib/auth/actions';
import { text } from '@/lib/dictionary';

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  username: string | null;
}

interface NavbarClientProps {
  profile: Profile | null;
}

export function NavbarClient({ profile }: NavbarClientProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const itemCount = useCartStore((state) => state.itemCount());

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu when route changes
  useEffect(() => { setIsUserMenuOpen(false); }, [pathname]);

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    await logoutAction();
  };

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-40 transition-all duration-300',
          isScrolled
            ? 'bg-background/80 py-4 shadow-sm backdrop-blur-md border-b border-border'
            : 'bg-transparent py-6'
        )}
      >
        <Container>
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 relative z-50">
              <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-[#9089fc] bg-clip-text text-transparent drop-shadow-sm">
                JTT Shop
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={cn(
                      'text-sm font-medium transition-colors hover:text-primary relative py-1',
                      isActive ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {link.name}
                    {isActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-3">
              {/* Cart */}
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative hover:bg-muted/50 rounded-full">
                  <ShoppingCart className="h-5 w-5" />
                  {mounted && itemCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground border border-background">
                      {itemCount}
                    </span>
                  )}
                  <span className="sr-only">Keranjang</span>
                </Button>
              </Link>

              {/* Auth: logged in vs logged out */}
              {profile ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(v => !v)}
                    className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="relative h-8 w-8 rounded-full overflow-hidden bg-primary/10 border border-primary/20">
                      {profile.avatar_url ? (
                        <Image src={profile.avatar_url} alt={profile.full_name ?? 'User'} fill sizes="32px" className="object-cover" />
                      ) : (
                        <User className="h-4 w-4 absolute inset-0 m-auto text-primary" />
                      )}
                    </div>
                    <span className="text-sm font-medium max-w-[100px] truncate">
                      {profile.full_name ?? profile.username ?? 'Account'}
                    </span>
                    <ChevronDown className={cn('h-3 w-3 text-muted-foreground transition-transform', isUserMenuOpen && 'rotate-180')} />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 rounded-2xl bg-card border border-border shadow-xl shadow-black/20 overflow-hidden z-50"
                      >
                        {/* Role badge */}
                        <div className="px-4 py-3 border-b border-border bg-muted/30">
                          <p className="text-xs text-muted-foreground">Masuk sebagai</p>
                          <p className="text-sm font-semibold truncate">{profile.full_name}</p>
                          {profile.role === 'admin' ? (
                            <span className="inline-block mt-1 text-[10px] uppercase tracking-widest font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                              ADMIN
                            </span>
                          ) : (
                            <span className="inline-block mt-1 text-[10px] uppercase tracking-widest font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                              MEMBER
                            </span>
                          )}
                        </div>

                        <div className="p-1.5">
                          <button
                            onClick={() => { setIsUserMenuOpen(false); router.push('/dashboard'); }}
                            className="flex w-full items-center gap-2 px-3 py-2 rounded-xl text-sm hover:bg-muted/60 transition-colors"
                          >
                            <LayoutDashboard className="h-4 w-4 text-primary" />
                            {text.nav.dashboard}
                          </button>
                          <form action={handleLogout}>
                            <button
                              type="submit"
                              className="flex w-full items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <LogOut className="h-4 w-4" />
                              {text.nav.logout}
                            </button>
                          </form>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost" className="rounded-full">
                      {text.nav.login}
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="rounded-full shadow-[0_0_15px_rgba(147,51,234,0.3)]">
                      <User className="mr-2 h-4 w-4" />
                      {text.nav.register}
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-foreground"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </Container>
      </header>

      <MobileNavbar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        profile={profile}
      />
    </>
  );
}
