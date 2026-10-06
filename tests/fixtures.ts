import type { FeedPage, PostWithAuthor, User } from '../lib/types';

const author: User = {
  id: 1,
  handle: 'ada',
  displayName: 'Ada Lovelace',
  bio: '',
  avatarColor: '#7856ff',
  createdAt: '2026-01-01T00:00:00.000Z',
};

export function makePost(id: number, overrides: Partial<PostWithAuthor> = {}): PostWithAuthor {
  return {
    id,
    text: `Chirp ${id}`,
    imageUrl: null,
    createdAt: new Date(Date.UTC(2026, 0, 1, 0, 0, id)).toISOString(),
    author,
    likeCount: 0,
    repostCount: 0,
    replyCount: 0,
    likedByViewer: false,
    repostedByViewer: false,
    bookmarkedByViewer: false,
    ...overrides,
  };
}

export function makePage(
  ids: number[],
  nextCursor: string | null,
  algo: FeedPage['algo'] = 'recent',
): FeedPage {
  return { algo, items: ids.map((id) => makePost(id)), nextCursor, hasMore: nextCursor !== null };
}

export function ids(posts: PostWithAuthor[]): number[] {
  return posts.map((post) => post.id);
}
