import type { User } from '@/lib/types';

interface AvatarProps {
  user: Pick<User, 'displayName' | 'handle' | 'avatarColor'>;
  size?: number;
}

function initials(name: string, handle: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts.length === 1 && parts[0].length > 0) return parts[0][0].toUpperCase();
  return (handle[0] || '?').toUpperCase();
}

export default function Avatar({ user, size = 44 }: AvatarProps) {
  return (
    <div
      className="avatar"
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        background: user.avatarColor,
        fontSize: Math.round(size / 2.4),
      }}
    >
      {initials(user.displayName, user.handle)}
    </div>
  );
}
