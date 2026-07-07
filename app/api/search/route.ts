import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentViewer } from '@/lib/session';
import type { PostWithAuthor, User } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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

// GET /api/search?q=... -> posts whose text matches the query.
//
// ⚠️ INTENTIONAL VULNERABILITY (teaching sample):
// This is a "simple" search that builds the SQL by string-concatenating the
// raw user-supplied `q` directly into the WHERE clause. It is a classic SQL
// injection hole and Panolayer's rules will flag it. The fix is to use a
// parameterized prepared statement (`... LIKE ?` with `%q%` bound as a param),
// exactly like every query in lib/*.ts already does.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') ?? '';

  if (q.trim().length === 0) {
    return NextResponse.json({ query: q, results: [] });
  }

  const viewer = getCurrentViewer();
  const db = getDb();

  // BUG: user input concatenated straight into the SQL string. Do not copy this.
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

  const rows = db.prepare(sql).all() as SearchRow[];

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

  return NextResponse.json({ query: q, viewer, results });
}
