import Link from 'next/link';
import { notFound } from 'next/navigation';
import Post from '@/components/Post';
import { getPost } from '@/lib/posts';
import { getCurrentViewer } from '@/lib/session';
import { validatePositiveId } from '@/lib/validation';
export const dynamic = 'force-dynamic';
export default function PostPage({ params }: { params: { id: string } }) {
  const id = validatePositiveId(params.id);
  if (id === null) notFound();
  const viewer = getCurrentViewer();
  const post = getPost(id, viewer.id);
  if (!post) notFound();
  return (
    <>
      <header className="page-heading">
        <Link href="/" className="text-link">
          ← Back to the conversation
        </Link>
        <h1>Chirp</h1>
      </header>
      <Post post={post} canDelete={post.author.id === viewer.id} />
      <p className="section-caption">
        Posted{' '}
        {new Intl.DateTimeFormat('en', {
          dateStyle: 'long',
          timeStyle: 'short',
          timeZone: 'UTC',
        }).format(new Date(post.createdAt))}{' '}
        UTC
      </p>
      <div className="welcome-panel">
        <h2>An idea worth passing on.</h2>
        <p>Like it, save it for later, or visit the author to see what else they are making.</p>
      </div>
    </>
  );
}
