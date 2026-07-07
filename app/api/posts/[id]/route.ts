import { NextResponse } from 'next/server';
import { deletePost, getPost } from '@/lib/posts';
import { getCurrentViewer } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RouteContext {
  params: { id: string };
}

function parseId(raw: string): number | null {
  const id = Number.parseInt(raw, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// GET /api/posts/:id -> a single hydrated post.
export async function GET(_request: Request, { params }: RouteContext) {
  const id = parseId(params.id);
  if (id === null) {
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
  return NextResponse.json({ post });
}

// DELETE /api/posts/:id -> delete, but only if the current viewer authored it.
export async function DELETE(_request: Request, { params }: RouteContext) {
  const id = parseId(params.id);
  if (id === null) {
    return NextResponse.json(
      { error: { code: 'invalid_id', message: 'Invalid post id.' } },
      { status: 400 },
    );
  }
  const viewer = getCurrentViewer();
  const existing = getPost(id, viewer.id);
  if (!existing) {
    return NextResponse.json(
      { error: { code: 'not_found', message: 'Post not found.' } },
      { status: 404 },
    );
  }
  if (existing.author.id !== viewer.id) {
    return NextResponse.json(
      { error: { code: 'forbidden', message: 'You can only delete your own posts.' } },
      { status: 403 },
    );
  }
  const removed = deletePost(id, viewer.id);
  return NextResponse.json({ deleted: removed });
}
