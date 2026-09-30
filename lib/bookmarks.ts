import { getDb } from './db';
import { getPost } from './posts';
import type { PostWithAuthor } from './types';

export function setBookmark(postId: number, viewerId: number, saved: boolean): void {
  const db = getDb();
  if (saved) db.prepare('INSERT OR IGNORE INTO bookmarks (post_id, user_id, created_at) VALUES (@postId, @viewerId, @createdAt)').run({ postId, viewerId, createdAt: new Date().toISOString() });
  else db.prepare('DELETE FROM bookmarks WHERE post_id = @postId AND user_id = @viewerId').run({ postId, viewerId });
}

export function listBookmarks(viewerId: number): PostWithAuthor[] {
  const rows = getDb().prepare('SELECT post_id FROM bookmarks WHERE user_id = @viewerId ORDER BY created_at DESC, post_id DESC LIMIT 100').all({ viewerId }) as { post_id: number }[];
  return rows.map((row) => getPost(row.post_id, viewerId)).filter((post): post is PostWithAuthor => post !== null);
}
