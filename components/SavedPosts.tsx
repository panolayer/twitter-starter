'use client';
import { useState } from 'react';
import Post from './Post';
import type { PostWithAuthor, Viewer } from '@/lib/types';
export default function SavedPosts({ posts, viewer }: { posts: PostWithAuthor[]; viewer: Viewer }) {
  const [items, setItems] = useState(posts);
  const remove = (id: number) => setItems((current) => current.filter((post) => post.id !== id));
  return items.length ? (
    <>
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
      <span className="welcome-icon">▢</span>
      <h2>Keep a good idea close.</h2>
      <p>
        Bookmark a chirp from the feed and it will be here when you need it. Only your current demo
        identity sees these saves.
      </p>
    </div>
  );
}
