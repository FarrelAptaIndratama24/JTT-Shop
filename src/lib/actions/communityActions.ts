'use server';

import { revalidatePath } from 'next/cache';
import { createCommunityPost } from '@/services/communityService';
import { createComment } from '@/services/commentService';
import { toggleLike } from '@/services/likeService';
import { postSchema, commentSchema } from '../validation';


export type ActionResponse = {
  success: boolean;
  error?: string;
  data?: any;
};

export async function postDiscussionAction(formData: FormData): Promise<ActionResponse> {
  const title = formData.get('title') as string || '';
  const content = formData.get('content') as string || '';
  const tagsString = formData.get('tags') as string || '';
  
  // Validation via Zod schema
  const validationResult = postSchema.safeParse({ title, content, tags: tagsString });
  if (!validationResult.success) {
    return { success: false, error: validationResult.error.issues[0].message };
  }

  const parsedData = validationResult.data;
  const tags = parsedData.tags ? parsedData.tags.split(',').map(t => t.trim()).filter(t => t !== '') : [];

  try {
    const { data, error } = await createCommunityPost(parsedData.title, parsedData.content, tags);
    if (error) throw error;
    
    revalidatePath('/community');
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal membuat diskusi.' };
  }
}

export async function postCommentAction(formData: FormData): Promise<ActionResponse> {
  const content = formData.get('content') as string || '';
  const product_id = formData.get('product_id') as string || undefined;
  const community_post_id = formData.get('community_post_id') as string || undefined;
  const parent_id = formData.get('parent_id') as string || undefined;
  const revalidateUrl = formData.get('revalidateUrl') as string || '/';

  // Validation via Zod schema
  const validationResult = commentSchema.safeParse({ content, product_id, community_post_id, parent_id, revalidateUrl });
  if (!validationResult.success) {
    return { success: false, error: validationResult.error.issues[0].message };
  }

  const parsedData = validationResult.data;

  try {
    const { data, error } = await createComment({
      content: parsedData.content,
      product_id: parsedData.product_id,
      community_post_id: parsedData.community_post_id,
      parent_id: parsedData.parent_id
    });

    if (error) throw error;

    revalidatePath(revalidateUrl);
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal mengirim komentar.' };
  }
}

export async function toggleLikeAction(
  postId: string
): Promise<{ success: boolean; liked: boolean; newCount: number; error?: string }> {
  try {
    const result = await toggleLike(postId);
    if (result.error) return { success: false, liked: false, newCount: result.newCount, error: result.error };
    // Revalidate both the listing page and the detail page so SSR caches are refreshed
    revalidatePath('/community');
    revalidatePath(`/community/${postId}`);
    return { success: true, liked: result.liked, newCount: result.newCount };
  } catch (err: any) {
    return { success: false, liked: false, newCount: 0, error: err.message || 'Gagal mengubah status like.' };
  }
}
