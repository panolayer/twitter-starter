import Feed from '@/components/Feed';
import { buildFeed } from '@/lib/feed';
import { getCurrentViewer } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default function HomePage() {
  const viewer = getCurrentViewer();
  const page = buildFeed({ algo: 'ranked', viewerId: viewer.id });
  return <Feed initialViewer={viewer} initialPage={page} />;
}
