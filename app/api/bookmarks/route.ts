import { NextResponse } from 'next/server';
import { listBookmarks } from '@/lib/bookmarks';
import { getCurrentViewer } from '@/lib/session';
import type { BookmarkCollection } from '@/lib/types';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export async function GET() {
  const viewer = getCurrentViewer();
  const collection: BookmarkCollection = { viewer, items: listBookmarks(viewer.id) };
  return NextResponse.json(collection);
}
