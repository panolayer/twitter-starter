import fs from 'node:fs';
import path from 'node:path';
import type { PostWithAuthor } from './types';

const DATA_DIR = process.env.CHIRP_DATA_DIR ?? path.join(process.cwd(), '.data');
const EXPORT_DIR = path.join(DATA_DIR, 'exports');

/** Writes the posts to a new JSON Lines file in the exports folder and returns its path. */
export function writeArchive(handle: string, posts: PostWithAuthor[]): string {
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
  const file = path.join(EXPORT_DIR, `${handle}-${Date.now()}.jsonl`);
  const fd = fs.openSync(file, 'w');
  for (const post of posts) {
    const line = {
      id: post.id,
      text: post.text,
      imageUrl: post.imageUrl,
      createdAt: post.createdAt,
      likes: post.likeCount,
      reposts: post.repostCount,
      replies: post.replyCount,
    };
    fs.writeSync(fd, JSON.stringify(line) + '\n');
  }
  return file;
}
