import { getDb } from './db';
import { listPosts } from './posts';
import { engagementScore, timeDecayScore } from './ranking';
import type { FeedAlgo, FeedPage, PostWithAuthor } from './types';

// -------------------------------------------------------------------------
// Feed assembly. Turns raw posts into an ordered, paginated page for a given
// algorithm:
//   - "recent": strict createdAt DESC, keyset-paginated by the createdAt cursor.
//   - "ranked": HN-style time-decay of engagement, offset-paginated over a
//     bounded candidate pool.
// -------------------------------------------------------------------------

export const FEED_PAGE_SIZE = 20;
// Ranked ordering is global, so we score a bounded recent window rather than
// the entire table. Comfortably larger than any single page.
const RANKED_CANDIDATE_POOL = 300;

export interface BuildFeedOptions {
  algo: FeedAlgo;
  viewerId: number;
  cursor?: string | null;
  limit?: number;
}

export function buildFeed(opts: BuildFeedOptions): FeedPage {
  const limit = Math.min(Math.max(opts.limit ?? FEED_PAGE_SIZE, 1), 50);
  if (opts.algo === 'ranked') {
    return buildRankedFeed(opts.viewerId, opts.cursor ?? null, limit);
  }
  return buildRecentFeed(opts.viewerId, opts.cursor ?? null, limit);
}

// Recent feed: keyset pagination on created_at (stable, no offset drift).
function buildRecentFeed(
  viewerId: number,
  cursor: string | null,
  limit: number,
): FeedPage {
  const beforeCreatedAt = cursor ?? undefined;
  // Fetch one extra to know whether another page exists.
  const rows = listPosts({ viewerId, beforeCreatedAt, limit: limit + 1 });
  const hasMore = rows.length > limit;
  const items = rows.slice(0, limit);
  const nextCursor = hasMore ? items[items.length - 1].createdAt : null;
  return { algo: 'recent', items, nextCursor, hasMore };
}

// Ranked feed: score a bounded recent pool, sort by score desc, offset-paginate.
function buildRankedFeed(
  viewerId: number,
  cursor: string | null,
  limit: number,
): FeedPage {
  const offset = parseOffset(cursor);
  const now = Date.now();

  const pool = listPosts({ viewerId, limit: RANKED_CANDIDATE_POOL });
  const scored = pool
    .map((post) => scorePost(post, now))
    .sort((a, b) => {
      const bScore = b.score ?? 0;
      const aScore = a.score ?? 0;
      if (bScore !== aScore) return bScore - aScore;
      // Deterministic tie-break: newer first, then by id.
      const at = Date.parse(a.createdAt);
      const bt = Date.parse(b.createdAt);
      if (bt !== at) return bt - at;
      return b.id - a.id;
    });

  const page = scored.slice(offset, offset + limit);
  const hasMore = offset + limit < scored.length;
  const nextCursor = hasMore ? String(offset + limit) : null;
  return { algo: 'ranked', items: page, nextCursor, hasMore };
}

function scorePost(post: PostWithAuthor, now: number): PostWithAuthor {
  const score = timeDecayScore(post.createdAt, now, engagementScore(post));
  return { ...post, score };
}

function parseOffset(cursor: string | null): number {
  if (!cursor) return 0;
  const n = Number.parseInt(cursor, 10);
  return Number.isInteger(n) && n >= 0 ? n : 0;
}

/**
 * Total number of posts in the system (used for UI counts/diagnostics).
 */
export function totalPostCount(): number {
  const db = getDb();
  const row = db.prepare('SELECT COUNT(*) AS count FROM posts').get() as {
    count: number;
  };
  return row.count;
}
