import Link from 'next/link';
import { notFound } from 'next/navigation';
import Avatar from '@/components/Avatar';
import Post from '@/components/Post';
import { countPostsByAuthor, listPosts } from '@/lib/posts';
import { getCurrentViewer } from '@/lib/session';
import { relativeTime } from '@/lib/time';
import { getUserByHandle } from '@/lib/users';

export const dynamic = 'force-dynamic';

interface ProfilePageProps {
  params: { handle: string };
}

// Profile page + that user's posts. A server component that reads the data
// layer directly and renders the (client) Post cards.
export default function ProfilePage({ params }: ProfilePageProps) {
  const handle = decodeURIComponent(params.handle).replace(/^@/, '');
  const user = getUserByHandle(handle);
  if (!user) notFound();

  const viewer = getCurrentViewer();
  const posts = listPosts({ viewerId: viewer.id, authorId: user.id, limit: 50 });
  const postCount = countPostsByAuthor(user.id);
  const joined = relativeTime(user.createdAt);

  return (
    <div className="profile">
      <header className="profile-header">
        <Link href="/" className="profile-back">
          ← Home
        </Link>
        <div className="profile-hero" style={{ background: `${user.avatarColor}22` }}>
          <Avatar user={user} size={88} />
          <div className="profile-meta">
            <h1 className="profile-name">{user.displayName}</h1>
            <p className="profile-handle">@{user.handle}</p>
            <p className="profile-bio">{user.bio}</p>
            <p className="profile-stats">
              <span>
                <strong>{postCount}</strong> chirps
              </span>
              <span className="profile-joined">Joined {joined} ago</span>
            </p>
          </div>
        </div>
      </header>

      <section className="profile-posts">
        {posts.length === 0 ? (
          <p className="feed-empty">@{user.handle} hasn&apos;t chirped yet.</p>
        ) : (
          <div className="feed-list">
            {posts.map((post) => (
              <Post key={post.id} post={post} canDelete={post.author.id === viewer.id} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
