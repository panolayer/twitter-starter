import type { FeedPage, PostWithAuthor } from './types';

// -------------------------------------------------------------------------
// Client-side feed paging. The home feed shows the first page, Show more
// appends later pages, and a background refresh replaces only the first page
// so the pages a reader has already loaded stay on screen.
// -------------------------------------------------------------------------

export interface FeedState {
  items: PostWithAuthor[];
  nextCursor: string | null;
  hasMore: boolean;
  // How many server pages are on screen (0 before the first page arrives).
  pages: number;
}

export function emptyFeedState(): FeedState {
  return { items: [], nextCursor: null, hasMore: false, pages: 0 };
}

export function feedStateFromPage(page: FeedPage): FeedState {
  return {
    items: dedupePosts(page.items),
    nextCursor: page.nextCursor,
    hasMore: page.hasMore,
    pages: 1,
  };
}

export function appendFeedPage(state: FeedState, page: FeedPage): FeedState {
  return {
    items: dedupePosts([...state.items, ...page.items]),
    nextCursor: page.nextCursor,
    hasMore: page.hasMore,
    pages: state.pages + 1,
  };
}

// A refresh fetches the first page again. Before Show more it simply replaces
// the feed. After Show more, the fresh first page goes on top, the loaded
// pages stay below it, and paging continues from the furthest page loaded.
export function refreshFeedPage(state: FeedState, page: FeedPage): FeedState {
  if (state.pages <= 1) return feedStateFromPage(page);
  return {
    items: dedupePosts([...page.items, ...state.items]),
    nextCursor: state.nextCursor,
    hasMore: state.hasMore,
    pages: state.pages,
  };
}

export function prependPost(state: FeedState, post: PostWithAuthor): FeedState {
  return { ...state, items: dedupePosts([post, ...state.items]) };
}

export function removePost(state: FeedState, id: number): FeedState {
  return { ...state, items: state.items.filter((post) => post.id !== id) };
}

export function dedupePosts(posts: PostWithAuthor[]): PostWithAuthor[] {
  const unique: PostWithAuthor[] = [];
  for (const post of posts) {
    if (unique.some((kept) => kept.id === post.id)) continue;
    unique.push(post);
  }
  return unique;
}

// -------------------------------------------------------------------------
// Response ordering. A "reset" (first load, tab change, viewer change) starts
// a new feed and makes every older response stale. A "poll" refreshes the
// first page; only the newest reset or poll may apply. "more" is Show more: a
// poll never cancels it, only a reset does.
// -------------------------------------------------------------------------

export type FeedRequestKind = 'reset' | 'poll' | 'more';

export interface FeedRequestToken {
  kind: FeedRequestKind;
  generation: number;
  seq: number;
}

export interface FeedRequestTracker {
  start(kind: FeedRequestKind): FeedRequestToken;
  accepts(token: FeedRequestToken): boolean;
}

export function createFeedRequestTracker(): FeedRequestTracker {
  let generation = 0;
  let seq = 0;
  let latestFirstPage = 0;
  return {
    start(kind) {
      if (kind === 'reset') generation += 1;
      seq += 1;
      if (kind !== 'more') latestFirstPage = seq;
      return { kind, generation, seq };
    },
    accepts(token) {
      if (token.generation !== generation) return false;
      return token.kind === 'more' || token.seq === latestFirstPage;
    },
  };
}
