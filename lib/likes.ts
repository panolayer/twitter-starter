import { getDb } from './db';

// -------------------------------------------------------------------------
// Per-viewer like toggling + counts. Parameterized statements only.
// -------------------------------------------------------------------------

export interface LikeResult {
  liked: boolean;
  count: number;
}

export function isLiked(postId: number, userId: number): boolean {
  const db = getDb();
  const row = db
    .prepare('SELECT 1 AS hit FROM likes WHERE post_id = @postId AND user_id = @userId')
    .get({ postId, userId }) as { hit: number } | undefined;
  return Boolean(row);
}

export function countLikes(postId: number): number {
  const db = getDb();
  const row = db
    .prepare('SELECT COUNT(*) AS count FROM likes WHERE post_id = @postId')
    .get({ postId }) as { count: number };
  return row.count;
}

/**
 * Toggle a like for (postId, userId). Idempotent per call: if the like
 * exists it is removed, otherwise it is created. Returns the new state + count.
 */
export function toggleLike(postId: number, userId: number): LikeResult {
  const db = getDb();
  const tx = db.transaction((): LikeResult => {
    if (isLiked(postId, userId)) {
      db.prepare('DELETE FROM likes WHERE post_id = @postId AND user_id = @userId').run({
        postId,
        userId,
      });
      return { liked: false, count: countLikes(postId) };
    }
    db.prepare(
      'INSERT OR IGNORE INTO likes (post_id, user_id, created_at) VALUES (@postId, @userId, @createdAt)',
    ).run({ postId, userId, createdAt: new Date().toISOString() });
    return { liked: true, count: countLikes(postId) };
  });
  return tx();
}
