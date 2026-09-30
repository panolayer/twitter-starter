import Link from 'next/link';
import Avatar from '@/components/Avatar';
import { listUsers } from '@/lib/users';
export const dynamic = 'force-dynamic';
export default function PeoplePage() {
  return <><header className="page-heading"><p className="eyebrow">Meet the neighborhood</p><h1>People</h1><p>Different perspectives. Shared curiosity.</p></header><div className="people-directory">{listUsers().map((user) => <Link key={user.id} className="directory-card" href={`/profile/${user.handle}`}><Avatar user={user} size={56} /><div><h2>{user.displayName}</h2><span className="post-handle">@{user.handle}</span><p>{user.bio}</p><span className="text-link">Visit profile →</span></div></Link>)}</div></>;
}
