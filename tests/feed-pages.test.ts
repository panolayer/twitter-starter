import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  appendFeedPage,
  createFeedRequestTracker,
  dedupePosts,
  emptyFeedState,
  feedStateFromPage,
  prependPost,
  refreshFeedPage,
  removePost,
} from '../lib/feed-pages';
import { ids, makePage, makePost } from './fixtures';

describe('feed state', () => {
  it('starts empty until the first page arrives', () => {
    assert.deepEqual(emptyFeedState(), { items: [], nextCursor: null, hasMore: false, pages: 0 });
  });

  it('builds the first page from a server page', () => {
    const state = feedStateFromPage(makePage([3, 2, 1], 'c1'));
    assert.deepEqual(ids(state.items), [3, 2, 1]);
    assert.equal(state.nextCursor, 'c1');
    assert.equal(state.hasMore, true);
    assert.equal(state.pages, 1);
  });

  it('Show more appends the next page and advances the cursor', () => {
    const first = feedStateFromPage(makePage([6, 5, 4], 'c1'));
    const second = appendFeedPage(first, makePage([3, 2, 1], null));
    assert.deepEqual(ids(second.items), [6, 5, 4, 3, 2, 1]);
    assert.equal(second.nextCursor, null);
    assert.equal(second.hasMore, false);
    assert.equal(second.pages, 2);
  });

  it('Show more drops posts that are already on screen', () => {
    const first = feedStateFromPage(makePage([6, 5, 4], 'c1'));
    const second = appendFeedPage(first, makePage([4, 3], 'c2'));
    assert.deepEqual(ids(second.items), [6, 5, 4, 3]);
  });

  it('a refresh before Show more replaces the first page', () => {
    const first = feedStateFromPage(makePage([3, 2, 1], 'c1'));
    const refreshed = refreshFeedPage(first, makePage([4, 3, 2], 'c1b'));
    assert.deepEqual(ids(refreshed.items), [4, 3, 2]);
    assert.equal(refreshed.nextCursor, 'c1b');
    assert.equal(refreshed.pages, 1);
  });

  it('a refresh after Show more keeps the loaded pages and their cursor', () => {
    const first = feedStateFromPage(makePage([6, 5, 4], 'c1'));
    const extended = appendFeedPage(first, makePage([3, 2, 1], 'c2'));
    const refreshed = refreshFeedPage(extended, makePage([7, 6, 5], 'c1-new'));
    assert.deepEqual(ids(refreshed.items), [7, 6, 5, 4, 3, 2, 1]);
    assert.equal(refreshed.nextCursor, 'c2');
    assert.equal(refreshed.hasMore, true);
    assert.equal(refreshed.pages, 2);
  });

  it('a refresh after Show more shows the fresh copy of a post', () => {
    const first = feedStateFromPage(makePage([6, 5, 4], 'c1'));
    const extended = appendFeedPage(first, makePage([3, 2, 1], null));
    const fresh = makePage([6, 5, 4], 'c1');
    fresh.items[0] = makePost(6, { likeCount: 9 });
    const refreshed = refreshFeedPage(extended, fresh);
    assert.equal(refreshed.items.find((post) => post.id === 6)?.likeCount, 9);
    assert.equal(refreshed.items.length, 6);
    assert.equal(refreshed.hasMore, false);
  });

  it('puts a new post on top and removes deleted posts', () => {
    const state = feedStateFromPage(makePage([2, 1], null));
    const posted = prependPost(state, makePost(3));
    assert.deepEqual(ids(posted.items), [3, 2, 1]);
    assert.deepEqual(ids(prependPost(posted, makePost(2)).items), [2, 3, 1]);
    assert.deepEqual(ids(removePost(posted, 2).items), [3, 1]);
  });

  it('dedupes by post id, keeping the first copy', () => {
    const posts = [makePost(1, { text: 'first' }), makePost(2), makePost(1, { text: 'second' })];
    const result = dedupePosts(posts);
    assert.deepEqual(ids(result), [1, 2]);
    assert.equal(result[0].text, 'first');
  });
});

describe('feed request tracker', () => {
  it('a newer reset supersedes an older one', () => {
    const tracker = createFeedRequestTracker();
    const older = tracker.start('reset');
    const newer = tracker.start('reset');
    assert.equal(tracker.accepts(older), false);
    assert.equal(tracker.accepts(newer), true);
  });

  it('a poll does not discard an in-flight Show more', () => {
    const tracker = createFeedRequestTracker();
    tracker.start('reset');
    const more = tracker.start('more');
    const poll = tracker.start('poll');
    assert.equal(tracker.accepts(more), true);
    assert.equal(tracker.accepts(poll), true);
  });

  it('a tab or viewer change discards an in-flight Show more and poll', () => {
    const tracker = createFeedRequestTracker();
    tracker.start('reset');
    const more = tracker.start('more');
    const poll = tracker.start('poll');
    tracker.start('reset');
    assert.equal(tracker.accepts(more), false);
    assert.equal(tracker.accepts(poll), false);
  });

  it('only the latest refresh may replace the first page', () => {
    const tracker = createFeedRequestTracker();
    const first = tracker.start('poll');
    const second = tracker.start('poll');
    assert.equal(tracker.accepts(first), false);
    assert.equal(tracker.accepts(second), true);
  });
});
