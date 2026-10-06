# JSON API

All routes run in Node.js and resolve local demo identity from the
`chirp_viewer` cookie. Absent identity uses the first seeded user. Errors use
`{ "error": { "code": "...", "message": "..." } }` and meaningful HTTP status.
The tables below describe the existing success envelopes.

| Method and path                  | Input                                      | Success                                        |
| -------------------------------- | ------------------------------------------ | ---------------------------------------------- |
| GET `/api/feed`                  | `algo=ranked` or `recent`, optional cursor | `{ viewer, algo, items, nextCursor, hasMore }` |
| GET `/api/posts`                 | optional timestamp cursor, limit           | `{ viewer, posts }`                            |
| POST `/api/posts`                | `{ text, imageUrl? }`                      | 201 `{ post }`                                 |
| GET `/api/posts/:id`             | positive integer id                        | `{ post }`                                     |
| DELETE `/api/posts/:id`          | author-owned id                            | `{ deleted }`                                  |
| POST `/api/posts/:id/like`       | positive integer id                        | `{ liked, likeCount }`                         |
| POST `/api/posts/:id/repost`     | positive integer id                        | `{ reposted, repostCount }`                    |
| PUT `/api/posts/:id/bookmark`    | positive integer id                        | `{ bookmarked: true }`                         |
| DELETE `/api/posts/:id/bookmark` | positive integer id                        | `{ bookmarked: false }`                        |
| GET `/api/bookmarks`             | none                                       | `{ viewer, items }`                            |
| GET `/api/search`                | trimmed `q`, at most 100 characters        | `{ query, viewer, results }`                   |
| GET `/api/users/:handle`         | normalized handle                          | `{ viewer, user, posts, postCount }`           |
| PATCH `/api/users/:handle`       | `{ displayName, bio }`                     | updated User                                   |
| GET `/api/session`               | none                                       | `{ viewer, users }`                            |
| POST `/api/session`              | `{ userId }`                               | `{ viewer }` and selected-user cookie          |
| POST `/api/upload`               | multipart `file`                           | 201 `{ url }`                                  |
| GET `/api/export`                | optional `limit`                           | JSON Lines download of the viewer's chirps     |

PostWithAuthor includes author, counts, viewer-specific like/repost/bookmark
flags, and an optional ranked score. Clients should display error messages
without interpreting SQL errors or server internals.

`GET /api/export` downloads the viewer's newest chirps (up to 300), one JSON
object per line. With `limit`, it keeps only the newest `limit` of them. Each
export is also saved under `.data/exports/`.

## Paging

Latest uses a creation timestamp cursor; ranked uses a nonnegative offset into
a bounded recent candidate pool. Treat cursors as opaque to the UI. Each feed
page has up to 20 posts. Ranking can change as posts age or engagement changes;
a refresh intentionally returns a new first page. The client deduplicates ids
when appending pages.

## Boundary contracts

Post text must be trimmed, nonempty, and no longer than 280 UTF-16 code units.
Profile names must be 1–50 characters, bios at most 160. Bookmark requests never
accept a viewer id. The server must enforce profile and post ownership. The
upload contract permits only bounded image uploads and search must bind query
values as SQL parameters. See AGENTS.md for the enforceable rules.
