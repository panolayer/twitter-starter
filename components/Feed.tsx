'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  appendFeedPage,
  createFeedRequestTracker,
  emptyFeedState,
  feedStateFromPage,
  prependPost,
  refreshFeedPage,
  removePost,
  type FeedRequestTracker,
  type FeedState,
} from '@/lib/feed-pages';
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
  const [feed, setFeed] = useState<FeedState>(() =>
    initialPage ? feedStateFromPage(initialPage) : emptyFeedState(),
  );
  const [loading, setLoading] = useState(!initialPage);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { items, hasMore, nextCursor } = feed;

  // Orders responses: a tab or viewer change discards older requests, a newer
  // refresh wins over an older one, and a refresh never discards Show more.
  const requests = useRef<FeedRequestTracker | null>(null);
  if (!requests.current) requests.current = createFeedRequestTracker();

  const loadFeed = useCallback(async (nextAlgo: FeedAlgo, kind: 'reset' | 'poll') => {
    const tracker = requests.current!;
    const token = tracker.start(kind);
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/feed?algo=${nextAlgo}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Feed unavailable');
      const page = (await res.json()) as FeedPage & { viewer: Viewer };
      if (!tracker.accepts(token)) return; // superseded
      setFeed((current) =>
        kind === 'reset' ? feedStateFromPage(page) : refreshFeedPage(current, page),
      );
      if (page.viewer) setViewer(page.viewer);
    } catch {
      if (tracker.accepts(token)) setError('Could not refresh the feed. Try again.');
    } finally {
      if (tracker.accepts(token)) setLoading(false);
    }
  }, []);

  // Bootstrap the feed on first mount when no SSR seed was provided.
  useEffect(() => {
    if (!initialPage) void loadFeed(DEFAULT_ALGO, 'reset');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll the active feed periodically + when the tab regains focus.
  useEffect(() => {
    let cancelled = false;
    const refresh = () => {
      if (!cancelled && document.visibilityState === 'visible') {
        void loadFeed(algo, 'poll');
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
    void loadFeed(next, 'reset');
  }

  async function loadMore() {
    if (!hasMore || !nextCursor || loadingMore) return;
    const tracker = requests.current!;
    const token = tracker.start('more');
    setLoadingMore(true);
    setError('');
    try {
      const res = await fetch(`/api/feed?algo=${algo}&cursor=${encodeURIComponent(nextCursor)}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Feed unavailable');
      const page = (await res.json()) as FeedPage;
      if (!tracker.accepts(token)) return;
      setFeed((current) => appendFeedPage(current, page));
    } catch {
      if (tracker.accepts(token)) setError('Could not load more chirps. Try again.');
    } finally {
      setLoadingMore(false);
    }
  }

  function handlePosted(post: PostWithAuthor) {
    // New posts always show immediately at the top regardless of algorithm.
    setFeed((current) => prependPost(current, post));
  }

  function handleDeleted(id: number) {
    setFeed((current) => removePost(current, id));
  }

  function handleSwitch(next: Viewer) {
    setViewer(next);
    setFeed(emptyFeedState());
    void loadFeed(algo, 'reset');
    router.refresh();
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

      {viewer ? <ComposeBox key={viewer.id} viewer={viewer} onPosted={handlePosted} /> : null}

      {error ? (
        <div className="feed-notice" role="alert">
          {error}{' '}
          <button type="button" className="text-link" onClick={() => void loadFeed(algo, 'poll')}>
            Retry
          </button>
        </div>
      ) : null}
      {loading && items.length === 0 ? (
        <p className="feed-empty">Loading…</p>
      ) : items.length === 0 ? (
        <p className="feed-empty">No chirps yet. Say something!</p>
      ) : (
        <div className="feed-list">
          {items.map((post) => (
            <Post
              key={`${viewer?.id}:${post.id}`}
              post={post}
              canDelete={post.author.id === viewer?.id}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}

      {hasMore ? (
        <button type="button" className="feed-more" onClick={loadMore} disabled={loadingMore}>
          {loadingMore ? 'Loading…' : 'Show more'}
        </button>
      ) : null}
    </div>
  );
}
