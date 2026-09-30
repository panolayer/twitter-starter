import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import CommunityRail from '@/components/CommunityRail';
import Navigation from '@/components/Navigation';
import { getCurrentViewer } from '@/lib/session';
import { PreferencesProvider } from '@/components/PreferencesProvider';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: 'Chirp',
  description: 'A tiny, realistic Twitter/X clone — Next.js 14 + SQLite.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const viewer = getCurrentViewer();
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: `try{const p=JSON.parse(localStorage.getItem('chirp:preferences')||'{}');if(['light','dark','system'].includes(p.theme))document.documentElement.dataset.theme=p.theme;}catch{}` }} />
        <a href="#main-content" className="skip-link">Skip to content</a>
        <PreferencesProvider>
        <div className="app-shell">
          <aside className="side-nav">
            <Link href="/" className="brand">
              <span className="brand-mark" aria-hidden="true">
                🐦
              </span>
              <span className="brand-name">Chirp</span>
            </Link>
            <Navigation viewerHandle={viewer.handle} />
            <p className="side-foot">A little space for big ideas.<br />Made for the curious.</p>
          </aside>

          <main className="main-col" id="main-content">{children}</main>
          <Navigation viewerHandle={viewer.handle} mobile />

          <aside className="right-rail"><CommunityRail /></aside>
        </div>
        </PreferencesProvider>
      </body>
    </html>
  );
}
