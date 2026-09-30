import SavedPosts from '@/components/SavedPosts';
import { listBookmarks } from '@/lib/bookmarks';
import { getCurrentViewer } from '@/lib/session';
export const dynamic = 'force-dynamic';
export default function BookmarksPage() {
  const viewer = getCurrentViewer();
  return <><header className="page-heading"><p className="eyebrow">For a quieter moment</p><h1>Bookmarks</h1><p>Saved by @{viewer.handle} · just for you</p></header><SavedPosts posts={listBookmarks(viewer.id)} viewer={viewer} /></>;
}
