import { getDb } from './db';
import type { Post, PostWithAuthor, User } from './types';

// -------------------------------------------------------------------------
// Data-access for posts. EVERY query here uses parameterized prepared
// statements — no string concatenation of user input into SQL. (The one
// deliberate exception lives in app/api/search/route.ts, on purpose.)
// -------------------------------------------------------------------------

interface PostJoinRow {
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
  liked_by_viewer: number;
  reposted_by_viewer: number;
}

const SELECT_WITH_AUTHOR = `
  SELECT
    p.id                         AS id,
    p.text                       AS text,
    p.image_url                  AS image_url,
    p.created_at                 AS created_at,
    p.reply_count                AS reply_count,
    u.id                         AS author_id,
    u.handle                     AS author_handle,
    u.display_name               AS author_display_name,
    u.bio                        AS author_bio,
    u.avatar_color               AS author_avatar_color,
    u.created_at                 AS author_created_at,
    (SELECT COUNT(*) FROM likes   l WHERE l.post_id = p.id)                  AS like_count,
    (SELECT COUNT(*) FROM reposts r WHERE r.post_id = p.id)                  AS repost_count,
    (SELECT COUNT(*) FROM likes   l WHERE l.post_id = p.id AND l.user_id = @viewerId) AS liked_by_viewer,
    (SELECT COUNT(*) FROM reposts r WHERE r.post_id = p.id AND r.user_id = @viewerId) AS reposted_by_viewer
  FROM posts p
  JOIN users u ON u.id = p.author_id
`;

function mapRow(row: PostJoinRow): PostWithAuthor {
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
    likedByViewer: row.liked_by_viewer > 0,
    repostedByViewer: row.reposted_by_viewer > 0,
  };
}

export interface ListPostsOptions {
  viewerId: number;
  authorId?: number;
  limit?: number;
  // Cursor is the created_at ISO of the last item from the previous page.
  beforeCreatedAt?: string;
}

/**
 * List posts (newest-first) with author + viewer-relative engagement.
 * Used by the recent feed and profile pages; the ranked feed post-processes.
 */
export function listPosts(opts: ListPostsOptions): PostWithAuthor[] {
  const db = getDb();
  const limit = Math.min(Math.max(opts.limit ?? 20, 1), 100);

  const clauses: string[] = [];
  const params: Record<string, unknown> = {
    viewerId: opts.viewerId,
    limit,
  };

  if (typeof opts.authorId === 'number') {
    clauses.push('p.author_id = @authorId');
    params.authorId = opts.authorId;
  }
  if (opts.beforeCreatedAt) {
    clauses.push('p.created_at < @beforeCreatedAt');
    params.beforeCreatedAt = opts.beforeCreatedAt;
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const sql = `${SELECT_WITH_AUTHOR} ${where} ORDER BY p.created_at DESC LIMIT @limit`;

  const rows = db.prepare(sql).all(params) as PostJoinRow[];
  return rows.map(mapRow);
}

export function getPost(id: number, viewerId: number): PostWithAuthor | null {
  const db = getDb();
  const sql = `${SELECT_WITH_AUTHOR} WHERE p.id = @id`;
  const row = db.prepare(sql).get({ id, viewerId }) as PostJoinRow | undefined;
  return row ? mapRow(row) : null;
}

export interface CreatePostInput {
  authorId: number;
  text: string;
  imageUrl?: string | null;
}

export function createPost(input: CreatePostInput): Post {
  const db = getDb();
  const createdAt = new Date().toISOString();
  const info = db
    .prepare(
      `INSERT INTO posts (author_id, text, image_url, reply_count, created_at)
       VALUES (@authorId, @text, @imageUrl, 0, @createdAt)`,
    )
    .run({
      authorId: input.authorId,
      text: input.text,
      imageUrl: input.imageUrl ?? null,
      createdAt,
    });

  const id = Number(info.lastInsertRowid);
  return {
    id,
    authorId: input.authorId,
    text: input.text,
    imageUrl: input.imageUrl ?? null,
    replyCount: 0,
    createdAt,
  };
}

/**
 * Delete a post. Returns true if a row was removed. The optional
 * `requireAuthorId` enforces that only the author may delete their post.
 */
export function deletePost(id: number, requireAuthorId?: number): boolean {
  const db = getDb();
  if (typeof requireAuthorId === 'number') {
    const info = db
      .prepare('DELETE FROM posts WHERE id = @id AND author_id = @authorId')
      .run({ id, authorId: requireAuthorId });
    return info.changes > 0;
  }
  const info = db.prepare('DELETE FROM posts WHERE id = @id').run({ id });
  return info.changes > 0;
}

export function countPostsByAuthor(authorId: number): number {
  const db = getDb();
  const row = db
    .prepare('SELECT COUNT(*) AS count FROM posts WHERE author_id = @authorId')
    .get({ authorId }) as { count: number };
  return row.count;
}
