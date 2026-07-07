import { NextResponse } from 'next/server';
import { toggleLike } from '@/lib/likes';
import { getPost } from '@/lib/posts';
import { getCurrentViewer } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RouteContext {
  params: { id: string };
}

// POST /api/posts/:id/like -> toggle the current viewer's like on the post.
export async function POST(_request: Request, { params }: RouteContext) {
  const id = Number.parseInt(params.id, 10);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json(
      { error: { code: 'invalid_id', message: 'Invalid post id.' } },
      { status: 400 },
    );
  }

  const viewer = getCurrentViewer();
  const post = getPost(id, viewer.id);
  if (!post) {
    return NextResponse.json(
      { error: { code: 'not_found', message: 'Post not found.' } },
      { status: 404 },
    );
  }

  const result = toggleLike(id, viewer.id);
  return NextResponse.json({
    liked: result.liked,
    likeCount: result.count,
  });
}
