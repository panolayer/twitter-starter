'use client';

import Link from 'next/link';
import type { PostWithAuthor } from '@/lib/types';
import Avatar from './Avatar';
import LikeButton from './LikeButton';
import RepostButton from './RepostButton';
import RelativeTime from './RelativeTime';
import PostText from './PostText';
import BookmarkButton from './BookmarkButton';

interface PostProps {
  post: PostWithAuthor;
  onDeleted?: (id: number) => void;
  canDelete?: boolean;
  onUnbookmarked?: () => void;
}

export default function Post({ post, onDeleted, canDelete, onUnbookmarked }: PostProps) {
  async function handleDelete() {
    if (!canDelete) return;
    if (!confirm('Delete this chirp?')) return;
    const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' });
    if (res.ok) {
      if (onDeleted) onDeleted(post.id);
      else window.location.reload();
    }
  }

  return (
    <article className="post">
      <Link href={`/profile/${post.author.handle}`} className="post-avatar-link">
        <Avatar user={post.author} />
      </Link>

      <div className="post-body">
        <div className="post-head">
          <Link href={`/profile/${post.author.handle}`} className="post-author">
            <span className="post-name">{post.author.displayName}</span>
            <span className="post-handle">@{post.author.handle}</span>
          </Link>
          <span className="post-dot" aria-hidden="true">
            ·
          </span>
          <Link href={`/post/${post.id}`} aria-label="Open chirp"><RelativeTime iso={post.createdAt} /></Link>
          {canDelete ? (
            <button type="button" className="post-delete" onClick={handleDelete}>
              Delete
            </button>
          ) : null}
        </div>

        <PostText text={post.text} />

        {post.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="post-image" src={post.imageUrl} alt="" loading="lazy" />
        ) : null}

        <div className="post-actions">
          <LikeButton
            postId={post.id}
            initialLiked={post.likedByViewer}
            initialCount={post.likeCount}
          />
          <RepostButton
            postId={post.id}
            initialReposted={post.repostedByViewer}
            initialCount={post.repostCount}
          />
          <span className="action-btn reply" aria-label="Replies">
            <span className="action-icon" aria-hidden="true">
              💬
            </span>
            <span className="action-count">{post.replyCount}</span>
          </span>
          <BookmarkButton postId={post.id} initialSaved={post.bookmarkedByViewer} onRemoved={onUnbookmarked} />
          {typeof post.score === 'number' ? (
            <span className="post-score" title="Ranking score">
              score {post.score.toFixed(3)}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
