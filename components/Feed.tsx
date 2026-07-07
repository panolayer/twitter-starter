'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { FeedAlgo, FeedPage, PostWithAuthor, Viewer } from '@/lib/types';
import ComposeBox from './ComposeBox';
import FeedTabs from './FeedTabs';
import Post from './Post';
import UserSwitcher from './UserSwitcher';

const POLL_INTERVAL_MS = 8000;
const DEFAULT_ALGO: FeedAlgo = 'ranked';

interface FeedProps {
  // Optional SSR-provided seed. When omitted, the feed bootstraps on mount.
  initialViewer?: Viewer;
  initialPage?: FeedPage;
}

export default function Feed({ initialViewer, initialPage }: FeedProps) {
  const [viewer, setViewer] = useState<Viewer | null>(initialViewer ?? null);
  const [algo, setAlgo] = useState<FeedAlgo>(initialPage?.algo ?? DEFAULT_ALGO);
  const [items, setItems] = useState<PostWithAuthor[]>(initialPage?.items ?? []);
  const [nextCursor, setNextCursor] = useState<string | null>(
    initialPage?.nextCursor ?? null,
  );
  const [hasMore, setHasMore] = useState(initialPage?.hasMore ?? false);
  const [loading, setLoading] = useState(!initialPage);
  const [loadingMore, setLoadingMore] = useState(false);

  // Track the latest request so out-of-order poll responses can't clobber a
  // newer tab/viewer selection.
  const requestSeq = useRef(0);

  const loadFeed = useCallback(
    async (nextAlgo: FeedAlgo) => {
      const seq = ++requestSeq.current;
      setLoading(true);
      try {
        const res = await fetch(`/api/feed?algo=${nextAlgo}`, { cache: 'no-store' });
        if (!res.ok) return;
        const page = (await res.json()) as FeedPage & { viewer: Viewer };
        if (seq !== requestSeq.current) return; // superseded
        setItems(page.items);
        setNextCursor(page.nextCursor);
        setHasMore(page.hasMore);
        if (page.viewer) setViewer(page.viewer);
      } finally {
        if (seq === requestSeq.current) setLoading(false);
      }
    },
    [],
  );

  // Bootstrap the feed on first mount when no SSR seed was provided.
  useEffect(() => {
    if (!initialPage) void loadFeed(DEFAULT_ALGO);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll the active feed periodically + when the tab regains focus.
  useEffect(() => {
    let cancelled = false;
    const refresh = () => {
      if (!cancelled && document.visibilityState === 'visible') {
        void loadFeed(algo);
      }
    };
    const timer = setInterval(refresh, POLL_INTERVAL_MS);
    window.addEventListener('focus', refresh);
    return () => {
      cancelled = true;
      clearInterval(timer);
      window.removeEventListener('focus', refresh);
    };
  }, [algo, loadFeed]);

  function changeTab(next: FeedAlgo) {
    if (next === algo) return;
    setAlgo(next);
    void loadFeed(next);
  }

  async function loadMore() {
    if (!hasMore || !nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/feed?algo=${algo}&cursor=${encodeURIComponent(nextCursor)}`,
        { cache: 'no-store' },
      );
      if (!res.ok) return;
      const page = (await res.json()) as FeedPage;
      setItems((prev) => dedupe([...prev, ...page.items]));
      setNextCursor(page.nextCursor);
      setHasMore(page.hasMore);
    } finally {
      setLoadingMore(false);
    }
  }

  function handlePosted(post: PostWithAuthor) {
    // New posts always show immediately at the top regardless of algorithm.
    setItems((prev) => dedupe([post, ...prev]));
  }

  function handleDeleted(id: number) {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }

  function handleSwitch(next: Viewer) {
    setViewer(next);
    void loadFeed(algo);
  }

  return (
    <div className="feed">
      <header className="feed-header">
        <div className="feed-title-row">
          <h1 className="feed-title">Home</h1>
          {viewer ? <UserSwitcher viewer={viewer} onSwitch={handleSwitch} /> : null}
        </div>
        <FeedTabs active={algo} onChange={changeTab} />
      </header>

      {viewer ? <ComposeBox viewer={viewer} onPosted={handlePosted} /> : null}

      {loading && items.length === 0 ? (
        <p className="feed-empty">Loading…</p>
      ) : items.length === 0 ? (
        <p className="feed-empty">No chirps yet. Say something!</p>
      ) : (
        <div className="feed-list">
          {items.map((post) => (
            <Post
              key={post.id}
              post={post}
              canDelete={post.author.id === viewer?.id}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}

      {hasMore ? (
        <button
          type="button"
          className="feed-more"
          onClick={loadMore}
          disabled={loadingMore}
        >
          {loadingMore ? 'Loading…' : 'Show more'}
        </button>
      ) : null}
    </div>
  );
}

function dedupe(posts: PostWithAuthor[]): PostWithAuthor[] {
  const seen = new Set<number>();
  const out: PostWithAuthor[] = [];
  for (const p of posts) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    out.push(p);
  }
  return out;
}
