import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="welcome-panel">
      <span className="welcome-icon">⌕</span>
      <h1>This corner is quiet.</h1>
      <p>That profile or chirp could not be found. There is plenty more happening back home.</p>
      <Link className="text-link" href="/">
        Return to the feed →
      </Link>
    </div>
  );
}
