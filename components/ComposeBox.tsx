'use client';

import { useEffect, useRef, useState } from 'react';
import type { PostWithAuthor, Viewer } from '@/lib/types';
import { MAX_POST_LENGTH } from '@/lib/validation';
import Avatar from './Avatar';
import EmojiPicker from './EmojiPicker';

interface ComposeBoxProps {
  viewer: Viewer;
  onPosted: (post: PostWithAuthor) => void;
}

export default function ComposeBox({ viewer, onPosted }: ComposeBoxProps) {
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [draftReady, setDraftReady] = useState(false);
  const draftKey = `chirp:draft:${viewer.id}`;
  useEffect(() => {
    try { setText(localStorage.getItem(draftKey) ?? ''); } catch {}
    setDraftReady(true);
  }, [draftKey]);
  useEffect(() => {
    if (!draftReady) return;
    try {
      if (text) localStorage.setItem(draftKey, text);
      else localStorage.removeItem(draftKey);
    } catch {}
  }, [text, draftKey, draftReady]);

  const remaining = MAX_POST_LENGTH - text.length;
  const overLimit = remaining < 0;
  const canSubmit = text.trim().length > 0 && !overLimit && !submitting && !uploading;

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      if (!res.ok) throw new Error('Upload failed.');
      const data = (await res.json()) as { url: string };
      setImageUrl(data.url);
    } catch {
      setError('Could not upload image.');
    } finally {
      setUploading(false);
    }
  }

  function clearImage() {
    setImageUrl(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function submit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), imageUrl }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        throw new Error(data?.error?.message ?? 'Could not post.');
      }
      const data = (await res.json()) as { post: PostWithAuthor };
      onPosted(data.post);
      setText('');
      clearImage();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not post.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="compose">
      <Avatar user={viewer} />
      <div className="compose-main">
        <textarea
          className="compose-input"
          placeholder="What are you working on?"
          aria-label="Write a chirp"
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
              event.preventDefault();
              void submit();
            }
          }}
          value={text}
          maxLength={MAX_POST_LENGTH + 40}
          rows={3}
          onChange={(e) => setText(e.target.value)}
        />

        {imageUrl ? (
          <div className="compose-preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="Upload preview" />
            <button type="button" className="compose-preview-remove" onClick={clearImage}>
              Remove
            </button>
          </div>
        ) : null}

        {error ? <p className="compose-error" role="alert">{error}</p> : null}

        <div className="compose-footer">
          <div className="compose-tools">
            <button
              type="button"
              className="compose-image-btn"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Uploading…' : '🖼 Image'}
            </button>
            <EmojiPicker onSelect={(emoji) => setText((value) => value + emoji)} />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleFile}
            />
          </div>

          <div className="compose-actions">
            <span aria-label={`${remaining} characters remaining`} className={`char-counter ${overLimit ? 'over' : ''}`}>{remaining}</span>
            <button
              type="button"
              className="compose-submit"
              title="Post (⌘ or Ctrl + Enter)"
              onClick={submit}
              disabled={!canSubmit}
            >
              {submitting ? 'Posting…' : 'Chirp'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
