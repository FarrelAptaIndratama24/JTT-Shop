import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Alamat email wajib diisi')
    .email('Masukkan alamat email yang valid'),
  password: z
    .string()
    .min(1, 'Kata sandi wajib diisi'),
});

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Nama lengkap minimal 2 karakter')
    .max(50, 'Nama lengkap terlalu panjang'),
  email: z
    .string()
    .trim()
    .min(1, 'Alamat email wajib diisi')
    .email('Masukkan alamat email yang valid'),
  password: z
    .string()
    .min(8, 'Kata sandi minimal 8 karakter')
    .max(100, 'Kata sandi terlalu panjang'),
});

export const profileSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, 'Nama lengkap minimal 2 karakter')
    .max(50, 'Nama lengkap terlalu panjang'),
  username: z
    .string()
    .trim()
    .min(3, 'Username minimal 3 karakter')
    .max(30, 'Username terlalu panjang')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username hanya boleh berisi huruf, angka, dan underscore (_)'),
  whatsapp_number: z
    .string()
    .trim()
    .optional(),
  avatar_url: z
    .string()
    .url()
    .optional()
    .or(z.literal('')),
});

export const commentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Komentar tidak boleh kosong')
    .max(1000, 'Komentar terlalu panjang (maksimal 1000 karakter)'),
  product_id: z.string().optional(),
  community_post_id: z.string().optional(),
  parent_id: z.string().optional(),
  revalidateUrl: z.string().optional(),
});

export const postSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, 'Judul minimal 5 karakter')
    .max(150, 'Judul terlalu panjang (maksimal 150 karakter)'),
  content: z
    .string()
    .trim()
    .min(10, 'Konten minimal 10 karakter')
    .max(5000, 'Konten terlalu panjang (maksimal 5000 karakter)'),
  tags: z.string().optional(),
});


export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Nama produk wajib diisi')
    .min(3, 'Nama produk minimal 3 karakter')
    .max(150, 'Nama produk terlalu panjang'),
  description: z
    .string()
    .trim()
    .min(1, 'Deskripsi wajib diisi')
    .min(10, 'Deskripsi minimal 10 karakter')
    .max(5000, 'Deskripsi terlalu panjang'),
  price: z
    .number()
    .positive('Harga harus lebih dari 0'),
  stock: z
    .number()
    .int('Stok harus berupa bilangan bulat')
    .min(0, 'Stok tidak boleh negatif'),
  brand: z
    .string()
    .trim()
    .min(1, 'Merek wajib diisi')
    .max(100, 'Nama merek terlalu panjang'),
  category_id: z
    .string()
    .min(1, 'Kategori wajib diisi'),
  image_url: z
    .string()
    .trim()
    .min(1, 'Gambar produk wajib diisi'),
  weight: z.string().optional().default(''),
  length: z.string().optional().default(''),
  tip: z.string().optional().default(''),
  joint: z.string().optional().default(''),
  shaft: z.string().optional().default(''),
  features: z.string().optional().default(''),
});

export const contactMessageSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .max(50, 'First name is too long'),
  last_name: z
    .string()
    .trim()
    .min(1, 'Last name is required')
    .max(50, 'Last name is too long'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  subject: z
    .string()
    .trim()
    .min(3, 'Subject must be at least 3 characters')
    .max(150, 'Subject is too long (max 150 characters)'),
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message is too long (max 2000 characters)'),
});
