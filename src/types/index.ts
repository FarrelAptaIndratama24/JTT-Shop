export type ProductCategory = 'Carbon' | 'Wood' | 'Break' | 'Jump' | 'Shaft' | 'Accessories';

export interface Product {
  id: string;
  slug?: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  reviewsCount: number;
  image: string;
  category: ProductCategory;
  specs: {
    weight: string;
    length: string;
    tip: string;
    joint: string;
    shaft: string;
  };
  features: string[];
  stock: number;
  created_at: string;
  seller_id?: string;
  seller_name?: string;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Comment {
  id: string;
  product_id?: string;
  community_post_id?: string;
  user_id: string;
  user: User;
  content: string;
  created_at: string;
  parent_id?: string;
  replies: Comment[];
}


export interface CommunityPost {
  id: string;
  user_id: string;
  user: User;
  title: string;
  content: string;
  created_at: string;
  likes: number;
  comments_count: number;
  tags: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}
