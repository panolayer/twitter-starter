'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation({
  viewerHandle,
  mobile = false,
}: {
  viewerHandle: string;
  mobile?: boolean;
}) {
  const pathname = usePathname();
  const items = [
    { href: '/', icon: '⌂', label: 'Home' },
    { href: '/explore', icon: '⌕', label: 'Explore' },
    { href: '/people', icon: '♧', label: 'People' },
    { href: `/profile/${viewerHandle}`, icon: '◉', label: 'Profile' },
    { href: '/bookmarks', icon: '▢', label: 'Saved' },
    { href: '/settings', icon: '⚙', label: 'Settings' },
  ];
  return (
    <nav
      className={mobile ? 'mobile-nav' : 'side-links'}
      aria-label={mobile ? 'Mobile navigation' : 'Main navigation'}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={mobile ? 'mobile-link' : 'side-link'}
          aria-current={pathname === item.href ? 'page' : undefined}
          title={item.label}
        >
          <span aria-hidden="true">{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
