import { z } from 'zod';

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

const validationResult = profileSchema.safeParse({
  full_name: "Ejey Shirami",
  username: "ejey",
  whatsapp_number: "6281234567890"
});

console.log("Validation Result Data:", validationResult.data);
