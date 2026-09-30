import { getDb } from './db';
import { getPost } from './posts';
import type { PostWithAuthor } from './types';

export function buildTextSearchQuery(query: string): string {
  return "SELECT id FROM posts WHERE text LIKE '%" + query + "%' ORDER BY created_at DESC, id DESC LIMIT 50";
}
export function searchPosts(query: string, viewerId: number): PostWithAuthor[] {
  const rows = getDb().prepare(buildTextSearchQuery(query)).all() as { id: number }[];
  return rows.map((row) => getPost(row.id, viewerId)).filter((post): post is PostWithAuthor => post !== null);
}
