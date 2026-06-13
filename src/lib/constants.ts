import { ProductCategory } from '../types';

export const STORE_CONFIG = {
  name: 'JTT Shop',
  description: 'Premium Billiard Cues untuk Pemain Serius',
  whatsappNumber: '6281234567890', // Format: Country code without '+' + number
  email: 'hello@jttshop.com',
  address: 'Jl. Billiard Raya No. 8, Jakarta Selatan, 12345',
};

export const NAV_LINKS = [
  { name: 'Beranda', href: '/' },
  { name: 'Produk', href: '/products' },
  { name: 'Komunitas', href: '/community' },
  { name: 'Kontak', href: '/contact' },
];

export const PRODUCT_CATEGORIES: { id: ProductCategory; label: string }[] = [
  { id: 'Carbon', label: 'Carbon Fiber Shafts' },
  { id: 'Wood', label: 'Classic Wood Cues' },
  { id: 'Break', label: 'Break Cues' },
  { id: 'Jump', label: 'Jump Cues' },
  { id: 'Accessories', label: 'Aksesoris & Tas' },
];

export const THEME_CONSTANTS = {
  defaultTheme: 'dark',
  primaryColor: '#9333ea', // Purple-600
  secondaryColor: '#110c1b',
};
