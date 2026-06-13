import { NextResponse } from 'next/server';
import { getLikedUsers } from '@/services/likeService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get('postId');

  if (!postId) {
    return NextResponse.json({ error: 'postId is required' }, { status: 400 });
  }

  const users = await getLikedUsers(postId);
  return NextResponse.json(users);
}
