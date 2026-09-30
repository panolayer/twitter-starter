import { getDb } from './db';
import type { PostWithAuthor, User } from './types';

interface SearchRow {
  id: number;
  text: string;
  image_url: string | null;
  created_at: string;
  reply_count: number;
  author_id: number;
  author_handle: string;
  author_display_name: string;
  author_bio: string;
  author_avatar_color: string;
  author_created_at: string;
  like_count: number;
  repost_count: number;
}

export function searchPosts(query: string): PostWithAuthor[] {
  const q = query;
  const sql =
    "SELECT p.id AS id, p.text AS text, p.image_url AS image_url, " +
    "p.created_at AS created_at, p.reply_count AS reply_count, " +
    "u.id AS author_id, u.handle AS author_handle, " +
    "u.display_name AS author_display_name, u.bio AS author_bio, " +
    "u.avatar_color AS author_avatar_color, u.created_at AS author_created_at, " +
    "(SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS like_count, " +
    "(SELECT COUNT(*) FROM reposts r WHERE r.post_id = p.id) AS repost_count " +
    "FROM posts p JOIN users u ON u.id = p.author_id " +
    "WHERE p.text LIKE '%" + q + "%' " +
    "ORDER BY p.created_at DESC LIMIT 50";

  const rows = getDb().prepare(sql).all() as SearchRow[];

  const results: PostWithAuthor[] = rows.map((row) => {
    const author: User = {
      id: row.author_id,
      handle: row.author_handle,
      displayName: row.author_display_name,
      bio: row.author_bio,
      avatarColor: row.author_avatar_color,
      createdAt: row.author_created_at,
    };
    return {
      id: row.id,
      text: row.text,
      imageUrl: row.image_url,
      createdAt: row.created_at,
      author,
      likeCount: row.like_count,
      repostCount: row.repost_count,
      replyCount: row.reply_count,
      likedByViewer: false,
      repostedByViewer: false,
    };
  });

  return results;
}
