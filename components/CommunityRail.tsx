import Link from 'next/link';
import Avatar from './Avatar';
import { listUsers } from '@/lib/users';
import { TOPICS } from '@/lib/topics';

export default function CommunityRail() {
  return (
    <>
      <div className="rail-card">
        <p className="eyebrow">The conversation starts here</p>
        <h2 className="rail-title">People to meet</h2>
        <div className="people-list">
          {listUsers()
            .slice(0, 4)
            .map((user) => (
              <Link key={user.id} href={`/profile/${user.handle}`} className="person-row">
                <Avatar user={user} size={36} />
                <span>
                  <strong>{user.displayName}</strong>
                  <small>@{user.handle}</small>
                </span>
                <span className="person-arrow">↗</span>
              </Link>
            ))}
        </div>
      </div>
      <div className="rail-card">
        <h2 className="rail-title">Around Chirp</h2>
        {TOPICS.slice(0, 3).map((topic) => (
          <Link
            className="rail-topic"
            href={`/explore?q=${encodeURIComponent('#' + topic.tag)}`}
            key={topic.tag}
          >
            <small>Community topic</small>
            <strong>#{topic.tag}</strong>
          </Link>
        ))}
        <Link href="/explore" className="text-link">
          Explore more →
        </Link>
      </div>
      <p className="rail-footer">
        Small conversations. Lasting ideas.
        <br />
        Chirp · Built with curiosity
      </p>
    </>
  );
}
