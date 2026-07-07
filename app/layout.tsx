import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Chirp',
  description: 'A tiny, realistic Twitter/X clone — Next.js 14 + SQLite.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <aside className="side-nav">
            <Link href="/" className="brand">
              <span className="brand-mark" aria-hidden="true">
                🐦
              </span>
              <span className="brand-name">Chirp</span>
            </Link>
            <nav className="side-links">
              <Link href="/" className="side-link">
                <span aria-hidden="true">🏠</span> Home
              </Link>
              <Link href="/profile/ada" className="side-link">
                <span aria-hidden="true">👤</span> Profile
              </Link>
            </nav>
            <p className="side-foot">
              A Panolayer teaching sample.
              <br />
              Ships two intentional issues.
            </p>
          </aside>

          <main className="main-col">{children}</main>

          <aside className="right-rail">
            <div className="rail-card">
              <h2 className="rail-title">About Chirp</h2>
              <p className="rail-text">
                Real SQLite backend, HN-style ranked feed, per-user likes &amp; reposts,
                and image uploads. Built to be mapped and rule-checked by Panolayer.
              </p>
            </div>
            <div className="rail-card">
              <h2 className="rail-title">Feed algorithms</h2>
              <ul className="rail-list">
                <li>
                  <strong>For You</strong> — engagement × time-decay
                </li>
                <li>
                  <strong>Latest</strong> — newest first
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </body>
    </html>
  );
}
