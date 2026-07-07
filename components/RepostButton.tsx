'use client';

import { useState } from 'react';

interface RepostButtonProps {
  postId: number;
  initialReposted: boolean;
  initialCount: number;
}

export default function RepostButton({
  postId,
  initialReposted,
  initialCount,
}: RepostButtonProps) {
  const [reposted, setReposted] = useState(initialReposted);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  async function toggle() {
    if (pending) return;
    setPending(true);

    const prevReposted = reposted;
    const prevCount = count;
    const nextReposted = !prevReposted;
    setReposted(nextReposted);
    setCount(prevCount + (nextReposted ? 1 : -1));

    try {
      const res = await fetch(`/api/posts/${postId}/repost`, { method: 'POST' });
      if (!res.ok) throw new Error(`repost failed: ${res.status}`);
      const data = (await res.json()) as { reposted: boolean; repostCount: number };
      setReposted(data.reposted);
      setCount(data.repostCount);
    } catch {
      setReposted(prevReposted);
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
      aria-pressed={reposted}
      aria-label={reposted ? 'Undo repost' : 'Repost'}
      className={`action-btn repost ${reposted ? 'active' : ''}`}
    >
      <span className="action-icon" aria-hidden="true">
        ⇄
      </span>
      <span className="action-count">{count}</span>
    </button>
  );
}
