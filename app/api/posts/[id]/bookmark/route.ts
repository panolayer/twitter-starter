import { NextResponse } from 'next/server';
import { setBookmark } from '@/lib/bookmarks';
import { getPost } from '@/lib/posts';
import { getCurrentViewer } from '@/lib/session';
import { validatePositiveId } from '@/lib/validation';
import type { BookmarkState } from '@/lib/types';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
interface Context { params: { id: string }; }
function mutate(rawId: string, saved: boolean) {
  const id = validatePositiveId(rawId);
  if (id === null) return NextResponse.json({ error: { code: 'invalid_id', message: 'Invalid post id.' } }, { status: 400 });
  const viewer = getCurrentViewer();
  if (!getPost(id, viewer.id)) return NextResponse.json({ error: { code: 'not_found', message: 'Post not found.' } }, { status: 404 });
  setBookmark(id, viewer.id, saved);
  const state: BookmarkState = { bookmarked: saved };
  return NextResponse.json(state);
}
export async function PUT(_request: Request, { params }: Context) { return mutate(params.id, true); }
export async function DELETE(_request: Request, { params }: Context) { return mutate(params.id, false); }
