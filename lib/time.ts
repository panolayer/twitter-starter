// Format an ISO timestamp as a compact relative time (e.g. "3m", "2h", "5d").
// Shared by the server and client so timestamps read consistently.

export function relativeTime(iso: string, now: number = Date.now()): string {
  const then = Date.parse(iso);
  if (!Number.isFinite(then)) return '';

  let deltaSec = Math.round((now - then) / 1000);
  if (deltaSec < 0) deltaSec = 0; // clamp future timestamps to "now"

  if (deltaSec < 10) return 'now';
  if (deltaSec < 60) return `${deltaSec}s`;

  const min = Math.floor(deltaSec / 60);
  if (min < 60) return `${min}m`;

  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w`;

  // Fall back to an absolute date for anything older than a month.
  return new Date(then).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
