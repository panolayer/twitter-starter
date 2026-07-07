'use client';

import Feed from '@/components/Feed';

// Home feed. Client component: <Feed> bootstraps from /api/feed on mount and
// then polls every ~8s (and on window focus) to stay fresh. Tabs switch
// between the ranked ("For You") and recent ("Latest") algorithms.
export default function HomePage() {
  return <Feed />;
}
