/**
 * Database-level TypeScript types matching the actual Supabase schema.
 * These complement the frontend types in src/types/index.ts.
 */

export interface DbProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  rating: number | null;
  reviews_count: number | null;
  stock: number | null;
  brand: string | null;
  image_url: string | null;
  category_id: string | null;
  seller_id: string | null;
  specs: Record<string, string> | null;
  features: string[] | null;
  created_at: string;
  categories?: DbCategory | null;
  seller?: DbProfile | null;       // Joined via seller_id → profiles
}

export interface DbCategory {
  id: string;
  name: string;
  slug: string;
}

export interface DbProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  created_at: string;
}

export interface DbComment {
  id: string;
  product_id: string | null;
  community_post_id: string | null;
  user_id: string | null;
  parent_id: string | null;
  content: string;
  created_at: string;
  profiles?: DbProfile | null;
  replies?: DbComment[];
}

export interface DbCommunityPost {
  id: string;
  user_id: string | null;
  title: string;
  content: string | null;
  likes: number | null;
  comments_count: number | null;
  created_at: string;
  profiles?: DbProfile | null;
  community_tags?: DbCommunityTag[];
}

export interface DbCommunityTag {
  id: string;
  post_id: string;
  tag: string;
}

export interface DbPostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
  profiles?: DbProfile | null;
}

export interface LikedUser {
  id: string;
  name: string;
  username: string | null;
  avatar: string;
}
