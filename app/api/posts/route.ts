import { NextResponse } from 'next/server';
import { createPost, getPost, listPosts } from '@/lib/posts';
import { getCurrentViewer } from '@/lib/session';
import { validateCreatePost } from '@/lib/validation';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/posts?cursor=&limit= -> recent posts (newest first).
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get('cursor') ?? undefined;
  const limitRaw = searchParams.get('limit');
  const limit = limitRaw ? Number.parseInt(limitRaw, 10) : undefined;

  const viewer = getCurrentViewer();
  const posts = listPosts({
    viewerId: viewer.id,
    beforeCreatedAt: cursor,
    limit: Number.isInteger(limit) ? limit : undefined,
  });
  return NextResponse.json({ viewer, posts });
}

// POST /api/posts { text, imageUrl? } -> create a post as the current viewer.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'invalid_json', message: 'Body must be valid JSON.' } },
      { status: 400 },
    );
  }

  // Validation happens at the API boundary before any DB write.
  const result = validateCreatePost(body);
  if (!result.ok || !result.value) {
    return NextResponse.json(
      { error: { code: 'validation_error', message: result.error ?? 'Invalid post.' } },
      { status: 400 },
    );
  }

  const viewer = getCurrentViewer();
  const created = createPost({
    authorId: viewer.id,
    text: result.value.text,
    imageUrl: result.value.imageUrl,
  });

  // Return the hydrated post (with author + counts) so the UI can render it.
  const post = getPost(created.id, viewer.id);
  return NextResponse.json({ post }, { status: 201 });
}
