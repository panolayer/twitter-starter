import type { PostWithAuthor } from './types';

/** The newest `limit` posts for the export endpoint's optional `limit` query parameter (all of them when it is absent). */
export function latestPosts(posts: PostWithAuthor[], params: URLSearchParams): PostWithAuthor[] {
  const limit = Number(params.get('limit'));
  const selected = posts.slice(0, limit);
  return selected;
}
