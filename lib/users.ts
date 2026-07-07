import { getDb } from './db';
import type { User, Viewer } from './types';

// -------------------------------------------------------------------------
// Data-access for users. Parameterized statements only.
// -------------------------------------------------------------------------

interface UserRow {
  id: number;
  handle: string;
  display_name: string;
  bio: string;
  avatar_color: string;
  created_at: string;
}

function mapUser(row: UserRow): User {
  return {
    id: row.id,
    handle: row.handle,
    displayName: row.display_name,
    bio: row.bio,
    avatarColor: row.avatar_color,
    createdAt: row.created_at,
  };
}

export function listUsers(): User[] {
  const db = getDb();
  const rows = db
    .prepare('SELECT * FROM users ORDER BY id ASC')
    .all() as UserRow[];
  return rows.map(mapUser);
}

export function getUserById(id: number): User | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM users WHERE id = @id').get({ id }) as
    | UserRow
    | undefined;
  return row ? mapUser(row) : null;
}

export function getUserByHandle(handle: string): User | null {
  const db = getDb();
  const row = db
    .prepare('SELECT * FROM users WHERE handle = @handle')
    .get({ handle: handle.replace(/^@/, '') }) as UserRow | undefined;
  return row ? mapUser(row) : null;
}

/**
 * The default viewer (first seeded user) — used when no session cookie is set.
 */
export function getDefaultViewer(): Viewer {
  const db = getDb();
  const row = db
    .prepare('SELECT * FROM users ORDER BY id ASC LIMIT 1')
    .get() as UserRow | undefined;
  if (!row) {
    throw new Error('No users seeded — cannot resolve a default viewer.');
  }
  const u = mapUser(row);
  return {
    id: u.id,
    handle: u.handle,
    displayName: u.displayName,
    avatarColor: u.avatarColor,
  };
}

export function toViewer(user: User): Viewer {
  return {
    id: user.id,
    handle: user.handle,
    displayName: user.displayName,
    avatarColor: user.avatarColor,
  };
}
