import type { PostWithAuthor } from './types';

// -------------------------------------------------------------------------
// Feed ranking math. Pure, deterministic, and never divides by zero.
// Kept free of any I/O so it can be unit-tested in isolation.
// -------------------------------------------------------------------------

// Weights for the different engagement signals.
export const ENGAGEMENT_WEIGHTS = {
  like: 1,
  repost: 2,
  reply: 1.5,
} as const;

// Hacker-News style gravity. Higher = faster decay toward zero.
export const DEFAULT_GRAVITY = 1.5;

/**
 * Weighted engagement of a post. Always >= 0.
 */
export function engagementScore(post: {
  likeCount: number;
  repostCount: number;
  replyCount: number;
}): number {
  const likes = Math.max(0, post.likeCount || 0);
  const reposts = Math.max(0, post.repostCount || 0);
  const replies = Math.max(0, post.replyCount || 0);
  return (
    likes * ENGAGEMENT_WEIGHTS.like +
    reposts * ENGAGEMENT_WEIGHTS.repost +
    replies * ENGAGEMENT_WEIGHTS.reply
  );
}

/**
 * Hacker-News style time-decay score:
 *
 *     score = (engagement + 1) / (ageHours + 2) ^ gravity
 *
 * The `+2` on the denominator guarantees we never divide by zero even for a
 * post created "in the future" (clock skew) — ageHours is clamped to >= 0.
 */
export function timeDecayScore(
  createdAtISO: string,
  now: number,
  engagement: number,
  gravity: number = DEFAULT_GRAVITY,
): number {
  const createdMs = Date.parse(createdAtISO);
  const safeCreatedMs = Number.isFinite(createdMs) ? createdMs : now;
  const ageMs = now - safeCreatedMs;
  const ageHours = Math.max(0, ageMs / (1000 * 60 * 60));
  const safeEngagement = Math.max(0, engagement || 0);
  const denom = Math.pow(ageHours + 2, gravity);
  return (safeEngagement + 1) / denom;
}

/**
 * Convenience: full ranked score for a post (engagement folded into decay).
 */
export function rankPost(post: PostWithAuthor, now: number): number {
  return timeDecayScore(post.createdAt, now, engagementScore(post));
}
