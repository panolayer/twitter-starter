 'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
export default function ProfileEditor({ user }: { user: User }) {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const router = useRouter();
  return <details className="profile-editor"><summary>Edit profile</summary><form onSubmit={async (event) => {
    event.preventDefault(); if (busy) return; setBusy(true); setStatus('');
    try {
      const res = await fetch(`/api/users/${user.handle}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ displayName, bio }) });
      if (!res.ok) throw new Error('Could not save profile.');
      setStatus('Profile saved.'); router.refresh();
    } catch { setStatus('Could not save. Please try again.'); } finally { setBusy(false); }
  }}><label>Display name<input value={displayName} required maxLength={50} onChange={(event) => setDisplayName(event.target.value)} /></label><label>Bio<textarea value={bio} maxLength={160} rows={3} onChange={(event) => setBio(event.target.value)} /></label><button className="compose-submit" disabled={busy || !displayName.trim()}>{busy ? 'Saving…' : 'Save profile'}</button><p role="status">{status}</p></form></details>;
}
