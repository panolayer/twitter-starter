import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import CommunityRail from '@/components/CommunityRail';
import { PreferencesProvider } from '@/components/PreferencesProvider';

export const metadata: Metadata = {
  title: 'Chirp',
  description: 'A tiny, realistic Twitter/X clone — Next.js 14 + SQLite.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: `try{const p=JSON.parse(localStorage.getItem('chirp:preferences')||'{}');if(['light','dark','system'].includes(p.theme))document.documentElement.dataset.theme=p.theme;}catch{}` }} />
        <PreferencesProvider>
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
              <Link href="/explore" className="side-link"><span aria-hidden="true">⌕</span><span>Explore</span></Link>
              <Link href="/profile/ada" className="side-link">
                <span aria-hidden="true">👤</span> Profile
              </Link>
              <Link href="/settings" className="side-link"><span aria-hidden="true">⚙</span><span>Settings</span></Link>
            </nav>
            <p className="side-foot">A little space for big ideas.<br />Made for the curious.</p>
          </aside>

          <main className="main-col">{children}</main>

          <aside className="right-rail"><CommunityRail /></aside>
        </div>
        </PreferencesProvider>
      </body>
    </html>
  );
}
