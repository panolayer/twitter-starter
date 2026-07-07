'use client';

import { useEffect, useState } from 'react';
import { relativeTime } from '@/lib/time';

interface RelativeTimeProps {
  iso: string;
}

// Renders a compact relative timestamp that re-computes on the client so it
// stays fresh without a full refresh. Guards against SSR/CSR hydration drift
// by rendering the same value on first paint.
export default function RelativeTime({ iso }: RelativeTimeProps) {
  const [label, setLabel] = useState(() => relativeTime(iso));

  useEffect(() => {
    const tick = () => setLabel(relativeTime(iso));
    tick();
    const timer = setInterval(tick, 30_000);
    return () => clearInterval(timer);
  }, [iso]);

  const absolute = new Date(iso).toLocaleString();
  return (
    <time dateTime={iso} title={absolute} className="relative-time">
      {label}
    </time>
  );
}
