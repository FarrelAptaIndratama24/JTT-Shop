import { NextResponse } from 'next/server';
import { getCommunityPosts } from '@/services/communityService';

export const dynamic = 'force-dynamic';

export async function GET() {
  const posts = await getCommunityPosts();
  return NextResponse.json(posts[0]);
}
