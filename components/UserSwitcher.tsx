'use client';

import { useEffect, useState } from 'react';
import type { User, Viewer } from '@/lib/types';
import Avatar from './Avatar';

interface UserSwitcherProps {
  viewer: Viewer;
  onSwitch: (viewer: Viewer) => void;
}

// Lets the visitor switch which seeded identity they browse as. Likes/reposts
// are per-user, so switching changes what's "liked by you" across the feed.
export default function UserSwitcher({ viewer, onSwitch }: UserSwitcherProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch('/api/session')
      .then((r) => r.json())
      .then((data: { users: User[] }) => {
        if (alive) setUsers(data.users);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  async function pick(userId: number) {
    if (busy || userId === viewer.id) {
      setOpen(false);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        const data = (await res.json()) as { viewer: Viewer };
        onSwitch(data.viewer);
      }
    } finally {
      setBusy(false);
      setOpen(false);
    }
  }

  return (
    <div className="switcher">
      <button
        type="button"
        className="switcher-current"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <Avatar user={viewer} size={36} />
        <span className="switcher-labels">
          <span className="switcher-name">{viewer.displayName}</span>
          <span className="switcher-handle">@{viewer.handle}</span>
        </span>
        <span className="switcher-caret" aria-hidden="true">
          ⌄
        </span>
      </button>

      {open ? (
        <ul className="switcher-menu" role="menu">
          {users.map((u) => (
            <li key={u.id}>
              <button
                type="button"
                role="menuitem"
                className={`switcher-item ${u.id === viewer.id ? 'active' : ''}`}
                onClick={() => pick(u.id)}
                disabled={busy}
              >
                <Avatar user={u} size={32} />
                <span className="switcher-labels">
                  <span className="switcher-name">{u.displayName}</span>
                  <span className="switcher-handle">@{u.handle}</span>
                </span>
                {u.id === viewer.id ? <span className="switcher-check">✓</span> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
