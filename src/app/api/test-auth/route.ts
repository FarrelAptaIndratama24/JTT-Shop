import { NextResponse } from 'next/server';
import { getCommunityPosts } from '@/services/communityService';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const posts = await getCommunityPosts();
  
  return NextResponse.json({
    currentUser: user,
    post: posts[0]
  });
}
