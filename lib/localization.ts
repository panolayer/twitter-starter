import type { Locale } from './types';
const PROFILE_COPY: Record<Locale, { posts: string; joined: string }> = {
  en: { posts: 'chirps', joined: 'Joined' },
  es: { posts: 'publicaciones', joined: 'Se unió' },
  ja: { posts: '件の投稿', joined: '参加日' },
};
export function formatPostCount(count: number, locale: Locale): string {
  return count.toString() + PROFILE_COPY[locale].posts;
}
export function formatJoinedDate(iso: string, locale: Locale): string {
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(
    new Date(iso),
  );
  return `${PROFILE_COPY[locale].joined} ${date}`;
}
