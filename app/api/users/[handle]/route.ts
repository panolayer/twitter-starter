import { NextResponse } from 'next/server';
import { countPostsByAuthor, listPosts } from '@/lib/posts';
import { getCurrentViewer } from '@/lib/session';
import { getUserByHandle, updateUserProfile } from '@/lib/users';
import { validateHandle, validateProfileUpdate } from '@/lib/validation';
import type { Profile } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RouteContext {
  params: { handle: string };
}

// GET /api/users/:handle -> profile + that user's posts.
export async function GET(_request: Request, { params }: RouteContext) {
  const handle = validateHandle(params.handle || '');
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

export async function PATCH(request: Request, { params }: RouteContext) {
  const handle = validateHandle(params.handle);
  if (!handle) return NextResponse.json({ error: { code: 'invalid_handle', message: 'Invalid profile handle.' } }, { status: 400 });
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: { code: 'invalid_json', message: 'Body must be valid JSON.' } }, { status: 400 }); }
  const input = validateProfileUpdate(body);
  if (!input.ok || !input.value) return NextResponse.json({ error: { code: 'validation_error', message: input.error ?? 'Invalid profile.' } }, { status: 400 });
  const user = updateUserProfile(handle, input.value);
  if (!user) return NextResponse.json({ error: { code: 'not_found', message: 'Profile not found.' } }, { status: 404 });
  return NextResponse.json(user);
}
