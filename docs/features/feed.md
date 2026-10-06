# Home feed

Home renders its first page on the server, including viewer state. The browser
hydrates the same content and refreshes visible feeds every eight seconds and
on focus. `app/page.tsx` → `lib/feed.ts` → `lib/posts.ts` is the initial path;
subsequent requests use `GET /api/feed`.

For You scores a recent pool of 300 posts using engagement and age. Likes have
weight 1, reposts 2, and replies 1.5. The score divides engagement + 1 by
(ageHours + 2)^1.5. Latest orders by creation time. Ranking uses a single clock
per page and clamps future ages. Show more appends the next page and
deduplicates by post id. A refresh fetches the first page again: before Show
more it replaces the feed; after Show more the fresh first page goes on top,
the loaded pages stay below it, and Show more continues from the furthest page
loaded. `lib/feed-pages.ts` holds this paging state and is covered by
`pnpm test`.

Acceptance: a fresh home response contains post text before JavaScript runs.
Switching tabs or users must not apply an older request's response; a refresh
never discards a Show more response or the pages already loaded. Empty and
failed requests have distinct states. Existing content stays visible on refresh.
