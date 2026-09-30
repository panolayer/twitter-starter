import { NextResponse } from 'next/server';
import { searchPosts } from '@/lib/search';
import { getCurrentViewer } from '@/lib/session';
import { validateSearchQuery } from '@/lib/validation';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const result = validateSearchQuery(new URL(request.url).searchParams.get('q') ?? '');
  if (!result.ok || result.value === undefined) {
    return NextResponse.json(
      { error: { code: 'invalid_query', message: result.error ?? 'Invalid query.' } },
      { status: 400 },
    );
  }
  const viewer = getCurrentViewer();
  try {
    return NextResponse.json({ query: result.value, viewer, results: result.value ? searchPosts(result.value, viewer.id) : [] });
  } catch {
    return NextResponse.json(
      { error: { code: 'search_failed', message: 'Could not search these terms.' } },
      { status: 500 },
    );
  }
}
