import { NextResponse } from 'next/server';
import { countPostsByAuthor, listPosts } from '@/lib/posts';
import { getCurrentViewer } from '@/lib/session';
import { getUserByHandle } from '@/lib/users';
import type { Profile } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RouteContext {
  params: { handle: string };
}

// GET /api/users/:handle -> profile + that user's posts.
export async function GET(_request: Request, { params }: RouteContext) {
  const handle = decodeURIComponent(params.handle || '').replace(/^@/, '');
  if (!handle) {
    return NextResponse.json(
      { error: { code: 'invalid_handle', message: 'Handle is required.' } },
      { status: 400 },
    );
  }

  const user = getUserByHandle(handle);
  if (!user) {
    return NextResponse.json(
      { error: { code: 'not_found', message: `No user @${handle}.` } },
      { status: 404 },
    );
  }

  const viewer = getCurrentViewer();
  const posts = listPosts({ viewerId: viewer.id, authorId: user.id, limit: 50 });
  const profile: Profile = {
    user,
    posts,
    postCount: countPostsByAuthor(user.id),
  };
  return NextResponse.json({ viewer, ...profile });
}
