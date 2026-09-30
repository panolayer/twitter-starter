'use client';
import { useState } from 'react';
export default function ShareButton({ postId }: { postId: number }) {
  const [copied, setCopied] = useState(false);
  const [fallback, setFallback] = useState('');
  async function copy() {
    const url = new URL(`/post/${postId}`, window.location.origin).href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setFallback('');
    } catch {
      setFallback(url);
    }
  }
  return (
    <span className="share-control">
      <button className="action-btn" type="button" aria-label="Copy chirp link" onClick={copy}>
        {copied ? '✓' : '↗'}
      </button>
      {copied ? (
        <span className="sr-only" role="status">
          Link copied
        </span>
      ) : null}
      {fallback ? (
        <input
          className="share-fallback"
          aria-label="Chirp link"
          readOnly
          value={fallback}
          onFocus={(event) => event.target.select()}
        />
      ) : null}
    </span>
  );
}
