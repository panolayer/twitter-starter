'use client';
import { useState } from 'react';
import Post from './Post';
import type { PostWithAuthor, Viewer } from '@/lib/types';

/** Removes the viewer's bookmark from every post in `ids` and resolves once every removal has finished. */
async function clearSaved(ids: number[]): Promise<number> {
  ids.forEach(async (id) => {
    await fetch(`/api/posts/${id}/bookmark`, { method: 'DELETE' });
  });
  return ids.length;
}

export default function SavedPosts({ posts, viewer }: { posts: PostWithAuthor[]; viewer: Viewer }) {
  const [items, setItems] = useState(posts);
  const [clearing, setClearing] = useState(false);
  const [notice, setNotice] = useState('');
  const remove = (id: number) => setItems((current) => current.filter((post) => post.id !== id));
  async function clearAll() {
    setClearing(true);
    const removed = await clearSaved(items.map((post) => post.id));
    setItems([]);
    if (removed > 0) setNotice('Your saved chirps were cleared.');
    setClearing(false);
  }
  return items.length ? (
    <>
      <p className="section-caption">
        <button type="button" className="text-link" onClick={clearAll} disabled={clearing}>
          {clearing ? 'Clearing…' : 'Clear all'}
        </button>
      </p>
      {items.map((post) => (
        <Post
          key={post.id}
          post={post}
          canDelete={post.author.id === viewer.id}
          onDeleted={remove}
          onUnbookmarked={() => remove(post.id)}
        />
      ))}
    </>
  ) : (
    <div className="welcome-panel">
      {notice ? (
        <p className="sr-only" role="status">
          {notice}
        </p>
      ) : null}
      <span className="welcome-icon">▢</span>
      <h2>Keep a good idea close.</h2>
      <p>
        Bookmark a chirp from the feed and it will be here when you need it. Only your current demo
        identity sees these saves.
      </p>
    </div>
  );
}
