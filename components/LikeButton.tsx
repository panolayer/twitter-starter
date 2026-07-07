'use client';

import { useState } from 'react';

interface LikeButtonProps {
  postId: number;
  initialLiked: boolean;
  initialCount: number;
}

export default function LikeButton({ postId, initialLiked, initialCount }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  async function toggle() {
    if (pending) return;
    setPending(true);

    // Snapshot for rollback, then optimistically update.
    const prevLiked = liked;
    const prevCount = count;
    const nextLiked = !prevLiked;
    setLiked(nextLiked);
    setCount(prevCount + (nextLiked ? 1 : -1));

    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
      if (!res.ok) throw new Error(`like failed: ${res.status}`);
      const data = (await res.json()) as { liked: boolean; likeCount: number };
      setLiked(data.liked);
      setCount(data.likeCount);
    } catch {
      // Roll back on failure.
      setLiked(prevLiked);
      setCount(prevCount);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={liked}
      aria-label={liked ? 'Unlike' : 'Like'}
      className={`action-btn like ${liked ? 'active' : ''}`}
    >
      <span className="action-icon" aria-hidden="true">
        {liked ? '♥' : '♡'}
      </span>
      <span className="action-count">{count}</span>
    </button>
  );
}
