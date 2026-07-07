import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

// -------------------------------------------------------------------------
// Connection + schema + seed.
//
// The Database handle is cached on globalThis so that Next.js hot-reloads in
// development don't open a new connection (and re-run migrations) on every
// edit. This is the standard "singleton across HMR" pattern.
// -------------------------------------------------------------------------

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_PATH = path.join(DATA_DIR, 'chirp.db');

type Db = Database.Database;

interface GlobalWithDb {
  __chirpDb?: Db;
}

const globalForDb = globalThis as unknown as GlobalWithDb;

function connect(): Db {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  migrate(db);
  seed(db);
  return db;
}

function migrate(db: Db): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      handle        TEXT NOT NULL UNIQUE,
      display_name  TEXT NOT NULL,
      bio           TEXT NOT NULL DEFAULT '',
      avatar_color  TEXT NOT NULL DEFAULT '#1d9bf0',
      created_at    TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS posts (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      author_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      text          TEXT NOT NULL,
      image_url     TEXT,
      reply_count   INTEGER NOT NULL DEFAULT 0,
      created_at    TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
    CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);

    CREATE TABLE IF NOT EXISTS likes (
      post_id    INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      PRIMARY KEY (post_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS reposts (
      post_id    INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      PRIMARY KEY (post_id, user_id)
    );
  `);
}

// Seed a small, deterministic world the first time the DB is empty.
function seed(db: Db): void {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM users').get() as {
    count: number;
  };
  if (count > 0) return;

  const insertUser = db.prepare(
    `INSERT INTO users (handle, display_name, bio, avatar_color, created_at)
     VALUES (@handle, @displayName, @bio, @avatarColor, @createdAt)`,
  );
  const insertPost = db.prepare(
    `INSERT INTO posts (author_id, text, image_url, reply_count, created_at)
     VALUES (@authorId, @text, @imageUrl, @replyCount, @createdAt)`,
  );
  const insertLike = db.prepare(
    `INSERT OR IGNORE INTO likes (post_id, user_id, created_at) VALUES (?, ?, ?)`,
  );
  const insertRepost = db.prepare(
    `INSERT OR IGNORE INTO reposts (post_id, user_id, created_at) VALUES (?, ?, ?)`,
  );

  const now = Date.now();
  const iso = (msAgo: number) => new Date(now - msAgo).toISOString();
  const MIN = 60 * 1000;
  const HOUR = 60 * MIN;

  const seedTx = db.transaction(() => {
    const users = [
      {
        handle: 'ada',
        displayName: 'Ada Lovelace',
        bio: 'Writing the first algorithm, one loop at a time.',
        avatarColor: '#7856ff',
        createdAt: iso(90 * 24 * HOUR),
      },
      {
        handle: 'grace',
        displayName: 'Grace Hopper',
        bio: 'Compilers, nanoseconds, and a healthy distrust of "we\'ve always done it this way".',
        avatarColor: '#00ba7c',
        createdAt: iso(88 * 24 * HOUR),
      },
      {
        handle: 'linus',
        displayName: 'Linus T.',
        bio: 'Talk is cheap. Show me the code.',
        avatarColor: '#f91880',
        createdAt: iso(80 * 24 * HOUR),
      },
      {
        handle: 'margaret',
        displayName: 'Margaret Hamilton',
        bio: 'Software engineering — I coined the term. Also I got us to the Moon.',
        avatarColor: '#ff7a00',
        createdAt: iso(75 * 24 * HOUR),
      },
    ];

    const userIds: Record<string, number> = {};
    for (const u of users) {
      const info = insertUser.run(u);
      userIds[u.handle] = Number(info.lastInsertRowid);
    }

    const posts = [
      { h: 'ada', t: 'The Analytical Engine weaves algebraic patterns just as the Jacquard loom weaves flowers and leaves. 🧵', img: null, age: 26 * HOUR },
      { h: 'grace', t: 'It is often easier to ask for forgiveness than to ask for permission. Ship the patch. 🚀', img: null, age: 22 * HOUR },
      { h: 'linus', t: 'Given enough eyeballs, all bugs are shallow. Send more eyeballs.', img: null, age: 20 * HOUR },
      { h: 'margaret', t: 'There was no such thing as "software engineering" — so we made it a discipline. Rigor is a feature.', img: '/uploads/seed-apollo.svg', age: 18 * HOUR },
      { h: 'ada', t: 'A new kind of language: not just numbers, but symbols manipulated by rules. Poetical science. ✨', img: null, age: 14 * HOUR },
      { h: 'grace', t: 'The most dangerous phrase in the language is "we\'ve always done it this way."', img: null, age: 11 * HOUR },
      { h: 'linus', t: 'Rewrote the scheduler over the weekend. Regression tests are green. Merged.', img: '/uploads/seed-terminal.svg', age: 9 * HOUR },
      { h: 'margaret', t: 'Priority displays saved Apollo 11 during descent. Error handling isn\'t optional — it\'s the mission.', img: null, age: 7 * HOUR },
      { h: 'ada', t: 'Imagination is the discovering faculty, pre-eminently. It is that which penetrates unseen worlds around us.', img: null, age: 5 * HOUR },
      { h: 'grace', t: 'A ship in port is safe, but that is not what ships are built for. Deploy to prod. ⛵', img: null, age: 3 * HOUR },
      { h: 'linus', t: 'Reminder: your commit message is documentation someone will read at 3am during an outage. Be kind.', img: null, age: 90 * MIN },
      { h: 'margaret', t: 'Testing is not about proving you\'re right. It\'s about finding out where you\'re wrong, before your users do.', img: null, age: 35 * MIN },
      { h: 'ada', t: 'Just prototyped a tiny feed ranker. Time-decay + engagement. Surprisingly fun to tune. 📈', img: null, age: 12 * MIN },
      { h: 'grace', t: 'Nanoseconds add up. So do wasted meetings.', img: null, age: 4 * MIN },
    ];

    const postIds: number[] = [];
    for (const p of posts) {
      const info = insertPost.run({
        authorId: userIds[p.h],
        text: p.t,
        imageUrl: p.img,
        replyCount: Math.floor(Math.random() * 5),
        createdAt: iso(p.age),
      });
      postIds.push(Number(info.lastInsertRowid));
    }

    // Sprinkle deterministic-ish likes/reposts so ranked ≠ recent out of the box.
    const allUserIds = Object.values(userIds);
    postIds.forEach((postId, idx) => {
      const likers = allUserIds.filter((_, i) => (idx + i) % 2 === 0);
      for (const uid of likers) {
        insertLike.run(postId, uid, iso(idx * MIN));
      }
      if (idx % 3 === 0) {
        const reposter = allUserIds[(idx + 1) % allUserIds.length];
        insertRepost.run(postId, reposter, iso(idx * MIN));
      }
    });
  });

  seedTx();
}

export function getDb(): Db {
  if (!globalForDb.__chirpDb) {
    globalForDb.__chirpDb = connect();
  }
  return globalForDb.__chirpDb;
}
