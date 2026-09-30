'use client';
import { usePreferences } from './PreferencesProvider';
import { formatPostCount, formatJoinedDate } from '@/lib/localization';
export default function ProfileStats({ count, joinedAt }: { count: number; joinedAt: string }) {
  const { locale } = usePreferences();
  return (
    <p className="profile-stats">
      <span>{formatPostCount(count, locale)}</span>
      <span>{formatJoinedDate(joinedAt, locale)}</span>
    </p>
  );
}
