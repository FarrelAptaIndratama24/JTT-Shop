import React from 'react';
import Link from 'next/link';
import { Container } from './Container';
import { STORE_CONFIG, NAV_LINKS } from '@/lib/constants';
import { MessageCircle } from 'lucide-react';
import { text } from '@/lib/dictionary';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border pt-16 pb-8 mt-auto">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand & About */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-[#9089fc] bg-clip-text text-transparent">
                {STORE_CONFIG.name}
              </span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-sm">
              {STORE_CONFIG.description}. We provide high-quality gear to elevate your game to the next level.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                Instagram
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                Facebook
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                Twitter
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Tautan Cepat</h3>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Hubungi Kami</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <MessageCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>+{STORE_CONFIG.whatsappNumber}</span>
              </li>
              <li>{STORE_CONFIG.email}</li>
              <li className="text-sm">{STORE_CONFIG.address}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {currentYear} {STORE_CONFIG.name}. Hak Cipta Dilindungi.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-primary transition-colors">{text.auth.privacyPolicy}</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">{text.auth.termsOfService}</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
