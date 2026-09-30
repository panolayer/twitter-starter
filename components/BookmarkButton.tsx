 'use client';
import { useEffect, useState } from 'react';
import type { BookmarkState } from '@/lib/types';
export default function BookmarkButton({ postId, initialSaved, onRemoved }: { postId: number; initialSaved: boolean; onRemoved?: () => void }) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => { setSaved(initialSaved); }, [initialSaved]);
  async function toggle() {
    if (pending) return;
    setPending(true); setError(false);
    try {
      const response = await fetch(`/api/posts/${postId}/bookmark`, { method: saved ? 'DELETE' : 'PUT' });
      if (!response.ok) throw new Error('Save failed');
      const state = await response.json() as BookmarkState;
      setSaved(state.bookmarked);
      if (!state.bookmarked) onRemoved?.();
    } catch { setError(true); } finally { setPending(false); }
  }
  return <span><button type="button" className={`action-btn bookmark ${saved ? 'active' : ''}`} aria-pressed={saved} aria-label={saved ? 'Remove bookmark' : 'Bookmark chirp'} disabled={pending} onClick={toggle}><span aria-hidden="true">{saved ? '▣' : '▢'}</span></button>{error ? <small role="alert">Try again</small> : null}</span>;
}
