'use client';

import type { FeedAlgo } from '@/lib/types';

interface FeedTabsProps {
  active: FeedAlgo;
  onChange: (algo: FeedAlgo) => void;
}

const TABS: { algo: FeedAlgo; label: string }[] = [
  { algo: 'ranked', label: 'For You' },
  { algo: 'recent', label: 'Latest' },
];

export default function FeedTabs({ active, onChange }: FeedTabsProps) {
  return (
    <div className="feed-tabs" role="tablist" aria-label="Feed algorithm">
      {TABS.map((tab) => (
        <button
          key={tab.algo}
          role="tab"
          type="button"
          aria-selected={active === tab.algo}
          className={`feed-tab ${active === tab.algo ? 'active' : ''}`}
          onClick={() => onChange(tab.algo)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
