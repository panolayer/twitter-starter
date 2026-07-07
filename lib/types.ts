// Shared domain types. Every layer (API, data-access, UI) imports its shapes
// from here so the contract stays in exactly one place.

export type FeedAlgo = 'ranked' | 'recent';

export interface User {
  id: number;
  handle: string;
  displayName: string;
  bio: string;
  avatarColor: string; // deterministic avatar background (hex)
  createdAt: string; // ISO 8601
}

export interface Post {
  id: number;
  authorId: number;
  text: string;
  imageUrl: string | null;
  replyCount: number;
  createdAt: string; // ISO 8601
}

// A post joined with its author and viewer-relative engagement state.
export interface PostWithAuthor {
  id: number;
  text: string;
  imageUrl: string | null;
  createdAt: string;
  author: User;
  likeCount: number;
  repostCount: number;
  replyCount: number;
  likedByViewer: boolean;
  repostedByViewer: boolean;
  // Only present for ranked feeds — the score used to order this post.
  score?: number;
}

export interface FeedPage {
  algo: FeedAlgo;
  items: PostWithAuthor[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface Profile {
  user: User;
  posts: PostWithAuthor[];
  postCount: number;
}

// Consistent JSON error envelope returned by every API route.
export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

export interface Viewer {
  id: number;
  handle: string;
  displayName: string;
  avatarColor: string;
}
