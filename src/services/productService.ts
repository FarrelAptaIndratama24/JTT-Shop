import { createClient } from '@/lib/supabase/server';
import { DbProduct } from '@/types/database';
import { Product } from '@/types';

// ─── Mapper ───────────────────────────────────────────────────────────────────
export function mapDbProductToProduct(p: DbProduct): Product {
  return {
    id:           p.id,
    slug:         p.slug,
    name:         p.name,
    description:  p.description ?? '',
    price:        p.price,
    rating:       p.rating ?? 0,
    reviewsCount: p.reviews_count ?? 0,
    image:        p.image_url ?? '/images/predator-panther.jpg',
    category:     (p.categories?.name ?? 'Carbon') as Product['category'],
    specs:        (p.specs as { weight: string; length: string; tip: string; joint: string; shaft: string } | null) ?? { weight: '', length: '', tip: '', joint: '', shaft: '' },
    features:     p.features ?? [],
    stock:        p.stock ?? 0,
    created_at:   p.created_at,
    seller_id:    p.seller_id ?? undefined,
    seller_name:  p.seller?.full_name ?? p.seller?.username ?? undefined,
  };
}

const PRODUCT_SELECT = `
  id, name, slug, description, price,
  rating, reviews_count, stock, brand,
  image_url, category_id, seller_id, specs, features, created_at,
  categories ( id, name, slug ),
  seller:profiles!seller_id ( id, full_name, username, avatar_url )
`;

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .order('created_at', { ascending: false });
  if (error) { console.error('[productService.getProducts]', error.message); return []; }
  return (data as unknown as DbProduct[]).map(mapDbProductToProduct);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .order('rating', { ascending: false })
    .limit(4);
  if (error) { console.error('[productService.getFeaturedProducts]', error.message); return []; }
  return (data as unknown as DbProduct[]).map(mapDbProductToProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('slug', slug)
    .limit(1)
    .maybeSingle();
  if (error) { console.error('[productService.getProductBySlug]', error.message); return null; }
  return mapDbProductToProduct(data as unknown as DbProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('id', id)
    .limit(1)
    .maybeSingle();
  if (error) { console.error('[productService.getProductById]', error.message); return null; }
  return mapDbProductToProduct(data as unknown as DbProduct);
}

/**
 * Fetch products owned by the currently authenticated user.
 * Used in the dashboard "My Products" page.
 */
export async function getMyProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return [];

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false });
  if (error) { console.error('[productService.getMyProducts]', error.message); return []; }
  return (data as unknown as DbProduct[]).map(mapDbProductToProduct);
}

/**
 * Fetch products by a specific seller ID.
 * Useful for public seller profile pages.
 */
export async function getProductsBySeller(sellerId: string): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });
  if (error) { console.error('[productService.getProductsBySeller]', error.message); return []; }
  return (data as unknown as DbProduct[]).map(mapDbProductToProduct);
}
