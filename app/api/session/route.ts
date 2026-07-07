import { NextResponse } from 'next/server';
import { getCurrentViewer, setCurrentViewer } from '@/lib/session';
import { listUsers } from '@/lib/users';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/session -> { viewer, users }
// Returns the current viewer plus the roster of switchable identities.
export async function GET() {
  const viewer = getCurrentViewer();
  const users = listUsers();
  return NextResponse.json({ viewer, users });
}

// POST /api/session { userId } -> switch the active viewer (cookie).
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

  const userId = (body as { userId?: unknown })?.userId;
  const id = typeof userId === 'number' ? userId : Number.parseInt(String(userId), 10);
  if (!Number.isInteger(id)) {
    return NextResponse.json(
      { error: { code: 'invalid_user', message: 'A numeric userId is required.' } },
      { status: 400 },
    );
  }

  const viewer = setCurrentViewer(id);
  if (!viewer) {
    return NextResponse.json(
      { error: { code: 'not_found', message: 'No such user.' } },
      { status: 404 },
    );
  }
  return NextResponse.json({ viewer });
}
