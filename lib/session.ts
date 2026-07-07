import { cookies } from 'next/headers';
import { getDefaultViewer, getUserById, toViewer } from './users';
import type { Viewer } from './types';

// -------------------------------------------------------------------------
// Viewer identity via an httpOnly cookie. This is a teaching sample, so the
// "session" is simply the selected user id — there is no password/auth. In a
// real app this would be a signed session token.
// -------------------------------------------------------------------------

export const SESSION_COOKIE = 'chirp_viewer';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * Resolve the current viewer from the session cookie, falling back to the
 * first seeded user. Always returns a valid viewer.
 */
export function getCurrentViewer(): Viewer {
  const raw = cookies().get(SESSION_COOKIE)?.value;
  if (raw) {
    const id = Number.parseInt(raw, 10);
    if (Number.isInteger(id)) {
      const user = getUserById(id);
      if (user) return toViewer(user);
    }
  }
  return getDefaultViewer();
}

/**
 * Persist the selected viewer id to the session cookie. Returns the resolved
 * viewer, or null if the id doesn't map to a real user.
 */
export function setCurrentViewer(userId: number): Viewer | null {
  const user = getUserById(userId);
  if (!user) return null;
  cookies().set(SESSION_COOKIE, String(user.id), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
  return toViewer(user);
}
