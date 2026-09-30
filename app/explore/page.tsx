import Link from 'next/link';
import SearchPanel from '@/components/SearchPanel';
import Post from '@/components/Post';
import { searchPosts } from '@/lib/search';
import { getCurrentViewer } from '@/lib/session';
import { TOPICS } from '@/lib/topics';
import { validateSearchQuery } from '@/lib/validation';
import type { PostWithAuthor } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default function ExplorePage({ searchParams }: { searchParams: { q?: string } }) {
  const input = validateSearchQuery(searchParams.q ?? '');
  const query = input.value ?? '';
  const viewer = getCurrentViewer();
  let posts: PostWithAuthor[] = [];
  let error = input.error;
  if (query) {
    try { posts = searchPosts(query, viewer.id); }
    catch { error = 'Could not search these terms. Try another phrase.'; }
  }
  return <>
    <header className="page-heading"><p className="eyebrow">Find your next idea</p><h1>Explore</h1><SearchPanel initialQuery={query} /></header>
    {error ? <p className="feed-empty" role="alert">{error}</p> : query ? <>
      <p className="section-caption">{posts.length} results for “{query}”</p>
      {posts.length ? posts.map((post) => <Post key={post.id} post={post} canDelete={post.author.id === viewer.id} />) : <p className="feed-empty">No chirps found. Try a topic below.</p>}
    </> : <div className="welcome-panel"><span className="welcome-icon">✦</span><h2>Good ideas travel.</h2><p>Follow a thread of curiosity. Start with a topic or search for something on your mind.</p></div>}
    <section className="topic-grid" aria-label="Browse topics">{TOPICS.map((topic) => <Link key={topic.tag} className="topic-card" href={`/explore?q=${encodeURIComponent('#' + topic.tag)}`}><strong>#{topic.tag}</strong><span>{topic.description}</span></Link>)}</section>
  </>;
}
