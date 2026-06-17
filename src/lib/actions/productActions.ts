'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getAuthProfile } from '@/lib/auth/actions';
import { productSchema } from '../validation';
import slugify from 'slugify';
import crypto from 'crypto';

export type ActionResponse = {
  success: boolean;
  error?: string;
  data?: any;
};

/**
 * Verify that the current user is the owner of a product, or an admin.
 * Returns the profile if authorized, throws if not.
 */
async function verifyOwnerOrAdmin(productId: string) {
  const profile = await getAuthProfile();
  if (!profile) {
    throw new Error('Otentikasi diperlukan. Silakan login terlebih dahulu.');
  }

  // Admin bypasses ownership check
  if (profile.role === 'admin') return profile;

  // Check ownership
  const supabase = await createClient();
  const { data: product, error } = await supabase
    .from('products')
    .select('seller_id')
    .eq('id', productId)
    .single();

  if (error || !product) {
    throw new Error('Produk tidak ditemukan.');
  }

  if (product.seller_id !== profile.id) {
    throw new Error('Akses ditolak. Anda hanya dapat mengubah produk Anda sendiri.');
  }

  return profile;
}

/**
 * Create a new product.
 * seller_id is ALWAYS set from the authenticated session — never from the form.
 */
export async function createProductAction(formData: FormData): Promise<ActionResponse> {
  try {
    const profile = await getAuthProfile();
    if (!profile) {
      return { success: false, error: 'Silakan login untuk menambahkan produk.' };
    }

    // Parse & validate with Zod
    const raw = {
      name: formData.get('name') as string,
      price: Number(formData.get('price')),
      stock: Number(formData.get('stock') || 0),
      brand: (formData.get('brand') as string) || '',
      category_id: formData.get('category_id') as string,
      image_url: (formData.get('image_url') as string) || '/images/predator-panther.jpg',
      description: (formData.get('description') as string) || '',
      weight: (formData.get('weight') as string) || '',
      length: (formData.get('length') as string) || '',
      tip: (formData.get('tip') as string) || '',
      joint: (formData.get('joint') as string) || '',
      shaft: (formData.get('shaft') as string) || '',
      features: (formData.get('features') as string) || '',
    };

    const validation = productSchema.safeParse(raw);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0].message };
    }

    const v = validation.data;
    const featuresList = v.features.split(',').map(f => f.trim()).filter(f => f !== '');

    const slug = slugify(v.name, { lower: true, strict: true });
    
    // We construct the payload without id to let PostgreSQL auto-generate a UUID
    const insertPayload: any = {
      name: v.name,
      slug,
      price: v.price,
      category_id: v.category_id,
      stock: v.stock,
      description: v.description,
      image_url: v.image_url || '/images/predator-panther.jpg',
      brand: v.brand || v.name.split(' ')[0],
      seller_id: profile.id,  // ← ALWAYS from server session
      specs: { weight: v.weight, length: v.length, tip: v.tip, joint: v.joint, shaft: v.shaft },
      features: featuresList,
    };

    const supabase = await createClient();
    let result = await supabase
      .from('products')
      .insert(insertPayload)
      .select()
      .single();

    // Fallback: If DB default generator is missing (error code 23502 or null value in column "id")
    if (result.error && (result.error.message.includes('null value in column "id"') || result.error.code === '23502')) {
      console.warn('[productActions.createProductAction] Database default UUID generator missing for products.id, falling back to crypto.randomUUID()');
      insertPayload.id = crypto.randomUUID();
      result = await supabase
        .from('products')
        .insert(insertPayload)
        .select()
        .single();
    }

    if (result.error) throw result.error;
    const data = result.data;

    // Save image reference in product_images table if image_url exists
    if (v.image_url) {
      const imgPayload: any = {
        product_id: data.id,
        image_url: v.image_url,
        is_thumbnail: true
      };

      let imgResult = await supabase
        .from('product_images')
        .insert(imgPayload);

      // Fallback: If DB default generator for product_images.id is missing
      if (imgResult.error && (imgResult.error.message.includes('null value in column "id"') || imgResult.error.code === '23502')) {
        console.warn('[productActions.createProductAction] Database default UUID generator missing for product_images.id, falling back to crypto.randomUUID()');
        imgPayload.id = crypto.randomUUID();
        imgResult = await supabase
          .from('product_images')
          .insert(imgPayload);
      }

      if (imgResult.error) {
        console.error('[productActions.createProductAction] Image insertion failed:', imgResult.error.message);
      }
    }

    revalidatePath('/products');
    revalidatePath('/dashboard/products');
    return { success: true, data };
  } catch (err: any) {
    console.error('[productActions.createProductAction]', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Update an existing product.
 * Verifies ownership: only the product owner or admin can update.
 */
export async function updateProductAction(id: string, formData: FormData): Promise<ActionResponse> {
  try {
    await verifyOwnerOrAdmin(id);

    // Parse & validate with Zod
    const raw = {
      name: formData.get('name') as string,
      price: Number(formData.get('price')),
      stock: Number(formData.get('stock') || 0),
      brand: (formData.get('brand') as string) || '',
      category_id: formData.get('category_id') as string,
      image_url: (formData.get('image_url') as string) || '',
      description: (formData.get('description') as string) || '',
      weight: (formData.get('weight') as string) || '',
      length: (formData.get('length') as string) || '',
      tip: (formData.get('tip') as string) || '',
      joint: (formData.get('joint') as string) || '',
      shaft: (formData.get('shaft') as string) || '',
      features: (formData.get('features') as string) || '',
    };

    const validation = productSchema.safeParse(raw);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0].message };
    }

    const v = validation.data;
    const featuresList = v.features.split(',').map(f => f.trim()).filter(f => f !== '');

    const supabase = await createClient();
    const slug = slugify(v.name, { lower: true, strict: true });

    const { data, error } = await supabase
      .from('products')
      .update({
        name: v.name,
        slug,
        price: v.price,
        category_id: v.category_id,
        stock: v.stock,
        description: v.description,
        image_url: v.image_url,
        brand: v.brand,
        specs: { weight: v.weight, length: v.length, tip: v.tip, joint: v.joint, shaft: v.shaft },
        features: featuresList,
      })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;

    // Update image reference in product_images table if image_url exists
    if (v.image_url) {
      const { data: existingImg } = await supabase
        .from('product_images')
        .select('id')
        .eq('product_id', id)
        .eq('is_thumbnail', true)
        .maybeSingle();

      if (existingImg) {
        await supabase
          .from('product_images')
          .update({ image_url: v.image_url })
          .eq('id', existingImg.id);
      } else {
        const imgPayload: any = {
          product_id: id,
          image_url: v.image_url,
          is_thumbnail: true
        };

        let imgResult = await supabase
          .from('product_images')
          .insert(imgPayload);

        // Fallback: If DB default generator for product_images.id is missing
        if (imgResult.error && (imgResult.error.message.includes('null value in column "id"') || imgResult.error.code === '23502')) {
          console.warn('[productActions.updateProductAction] Database default UUID generator missing for product_images.id, falling back to crypto.randomUUID()');
          imgPayload.id = crypto.randomUUID();
          imgResult = await supabase
            .from('product_images')
            .insert(imgPayload);
        }

        if (imgResult.error) {
          console.error('[productActions.updateProductAction] Image insertion failed:', imgResult.error.message);
        }
      }
    }

    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath(`/products/${slug}`);
    revalidatePath('/dashboard/products');
    return { success: true, data };
  } catch (err: any) {
    console.error('[productActions.updateProductAction]', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Delete a product.
 * Verifies ownership: only the product owner or admin can delete.
 */
export async function deleteProductAction(id: string): Promise<ActionResponse> {
  try {
    await verifyOwnerOrAdmin(id);

    const supabase = await createClient();
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/products');
    revalidatePath('/dashboard/products');
    return { success: true };
  } catch (err: any) {
    console.error('[productActions.deleteProductAction]', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Upload a product image to Supabase Storage.
 * Returns the public URL of the uploaded image.
 */
export async function uploadProductImageAction(formData: FormData): Promise<ActionResponse> {
  try {
    const profile = await getAuthProfile();
    if (!profile) {
      return { success: false, error: 'Silakan login untuk mengunggah gambar.' };
    }

    const file = formData.get('file') as File;
    if (!file || file.size === 0) {
      return { success: false, error: 'File gambar tidak ditemukan.' };
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Tipe file tidak valid. Gunakan JPG, PNG, WebP, atau GIF.' };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { success: false, error: 'Ukuran file terlalu besar. Maksimal 5MB.' };
    }

    // Generate safe filename
    const ext = file.name.split('.').pop() || 'jpg';
    const safeName = `${profile.id}/${crypto.randomUUID()}.${ext}`;

    const supabase = await createClient();
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(safeName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(safeName);

    return { success: true, data: { url: urlData.publicUrl } };
  } catch (err: any) {
    console.error('[productActions.uploadProductImageAction]', err.message);
    return { success: false, error: err.message };
  }
}
