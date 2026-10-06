import fs from 'node:fs';
import { NextResponse } from 'next/server';
import { writeArchive } from '@/lib/archive';
import { latestPosts } from '@/lib/exports';
import { listPosts } from '@/lib/posts';
import { getCurrentViewer } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/export?limit= -> downloads the current viewer's chirps, one JSON object per line.
export async function GET(request: Request) {
  const viewer = getCurrentViewer();
  const posts = listPosts({ viewerId: viewer.id, authorId: viewer.id, limit: 300 });
  const selected = latestPosts(posts, new URL(request.url).searchParams);
  const file = writeArchive(viewer.handle, selected);
  return new NextResponse(fs.readFileSync(file), {
    headers: {
      'content-type': 'application/x-ndjson; charset=utf-8',
      'content-disposition': `attachment; filename="chirps-${viewer.handle}.jsonl"`,
    },
  });
}
