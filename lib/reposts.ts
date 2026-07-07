import { getDb } from './db';

// -------------------------------------------------------------------------
// Per-viewer repost toggling + counts. Parameterized statements only.
// -------------------------------------------------------------------------

export interface RepostResult {
  reposted: boolean;
  count: number;
}

export function isReposted(postId: number, userId: number): boolean {
  const db = getDb();
  const row = db
    .prepare('SELECT 1 AS hit FROM reposts WHERE post_id = @postId AND user_id = @userId')
    .get({ postId, userId }) as { hit: number } | undefined;
  return Boolean(row);
}

export function countReposts(postId: number): number {
  const db = getDb();
  const row = db
    .prepare('SELECT COUNT(*) AS count FROM reposts WHERE post_id = @postId')
    .get({ postId }) as { count: number };
  return row.count;
}

/**
 * Toggle a repost for (postId, userId). Returns the new state + count.
 */
export function toggleRepost(postId: number, userId: number): RepostResult {
  const db = getDb();
  const tx = db.transaction((): RepostResult => {
    if (isReposted(postId, userId)) {
      db.prepare('DELETE FROM reposts WHERE post_id = @postId AND user_id = @userId').run({
        postId,
        userId,
      });
      return { reposted: false, count: countReposts(postId) };
    }
    db.prepare(
      'INSERT OR IGNORE INTO reposts (post_id, user_id, created_at) VALUES (@postId, @userId, @createdAt)',
    ).run({ postId, userId, createdAt: new Date().toISOString() });
    return { reposted: true, count: countReposts(postId) };
  });
  return tx();
}
