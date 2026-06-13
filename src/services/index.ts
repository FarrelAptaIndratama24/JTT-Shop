/**
 * Central export for all service modules.
 * Import from '@/services' instead of individual files.
 */
export { getProducts, getFeaturedProducts, getProductBySlug, getProductById, getMyProducts, getProductsBySeller } from './productService';
export { getCommunityPosts, getPreviewPosts, getTopContributors } from './communityService';
export { getCommentsByProduct } from './commentService';
