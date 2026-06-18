import { ProductCategory } from '../types';

export const STORE_CONFIG = {
  name: 'JTT Shop',
  description: 'Premium Billiard Cues untuk Pemain Serius',
  whatsappNumber: '6281216857823', // Format: Country code without '+' + number
  email: 'farrelz22014@gmail.com',
  address: 'Jl. Yusuf Bauty, Makassar, Indonesia',
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
