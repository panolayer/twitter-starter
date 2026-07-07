import { NextResponse } from 'next/server';
import { buildFeed } from '@/lib/feed';
import { getCurrentViewer } from '@/lib/session';
import type { FeedAlgo } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/feed?algo=ranked|recent&cursor=... -> paginated feed page.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const algoParam = searchParams.get('algo');
  const algo: FeedAlgo = algoParam === 'recent' ? 'recent' : 'ranked';
  const cursor = searchParams.get('cursor');

  const viewer = getCurrentViewer();
  const page = buildFeed({ algo, viewerId: viewer.id, cursor });

  return NextResponse.json({ viewer, ...page });
}
