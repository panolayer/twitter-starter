# Chirp 🐦

A small but **realistic** Twitter/X clone built with **Next.js 14 (App Router,
TypeScript)** and a **real SQLite backend** (`better-sqlite3`). It's a teaching
sample for [Panolayer](https://panolayer.com) — an IDE that maps a codebase's
architecture and enforces engineering rules — so it's deliberately layered into
many small files with single responsibilities.

Chirp does genuine backend work: persisted posts, per-user likes and reposts, an
HN-style ranked feed, cursor pagination, image uploads, and cookie-based
multi-user identity switching.

## Run it

```bash
pnpm install     # compiles the better-sqlite3 native module (expected)
pnpm dev         # http://localhost:3000
```

On first run the app creates `.data/chirp.db`, migrates the schema, and seeds
four users and a dozen posts. Delete `.data/` to start fresh.

```bash
pnpm typecheck   # tsc --noEmit
pnpm build       # production build
```

## Architecture — the layers

Chirp keeps a strict, one-directional dependency flow. Panolayer visualizes
exactly this shape:

```
  UI (components/, app pages)
        │  fetch()
        ▼
  API routes (app/api/**)         ← input validation, JSON error shape
        │  function calls
        ▼
  Data access (lib/posts, likes, reposts, users, feed)
        │  prepared statements
        ▼
  Database (lib/db.ts → better-sqlite3 → .data/chirp.db)
```

| Layer | Files | Responsibility |
| --- | --- | --- |
| **UI** | `app/page.tsx`, `app/profile/[handle]/page.tsx`, `components/*` | Render + interact; poll the feed; call the API. Never touches SQL. |
| **API** | `app/api/**/route.ts` | Validate input, resolve the viewer, call the data layer, return JSON. Every route is `runtime=nodejs`, `dynamic=force-dynamic`. |
| **Data access** | `lib/posts.ts`, `lib/likes.ts`, `lib/reposts.ts`, `lib/users.ts`, `lib/feed.ts` | Parameterized queries; map rows to domain types. |
| **Ranking** | `lib/ranking.ts` | Pure feed math (engagement + time-decay). |
| **DB / infra** | `lib/db.ts`, `lib/session.ts`, `lib/validation.ts`, `lib/time.ts`, `lib/types.ts` | Connection + schema + seed, session cookie, validation helpers, shared types. |

`better-sqlite3` is a native Node module, so it's marked as an external server
package in `next.config.mjs` and only imported from server code. The `Database`
handle is cached on `globalThis` to survive dev hot-reloads.

## Feed algorithms

Two tabs, two algorithms (both in `lib/feed.ts` + `lib/ranking.ts`):

- **For You (`ranked`)** — Hacker-News style time-decay of engagement:

  ```
  engagement = likes·1 + reposts·2 + replies·1.5
  score      = (engagement + 1) / (ageHours + 2) ^ 1.5
  ```

  `ageHours` is clamped to `>= 0` and the `+2` keeps the denominator non-zero,
  so scoring is deterministic and never divides by zero. Posts are scored over a
  bounded recent pool and offset-paginated.

- **Latest (`recent`)** — strict `createdAt DESC`, keyset-paginated by a
  timestamp cursor.

The home page polls `/api/feed` every ~8 seconds (and on window focus) so new
chirps and engagement appear without a manual refresh.

## ⚠️ Two intentional issues

This sample ships **two deliberate problems** so Panolayer's rules have
something real to flag (and so you can practice fixing them):

1. **SQL injection in `app/api/search/route.ts`** — the search query is built by
   string-concatenating the raw `?q=` param into the SQL. Every *other* query in
   the app is a parameterized prepared statement. **Fix:** use `... LIKE ?` and
   bind `%q%` as a parameter.

2. **Unvalidated upload in `app/api/upload/route.ts`** — the route saves whatever
   file is posted with no content-type or size check. The helper
   `validateImageUpload` already exists in `lib/validation.ts` but isn't called.
   **Fix:** call it and reject anything that isn't an allowed image within the
   size cap.

See `AGENTS.md` for the full rule set these two violations break.
