# Explore and search

`/explore?q=...` is a URL-addressable search surface. Submitting its form
navigates to a server-rendered result page. Queries are trimmed and capped at
100 characters by `validateSearchQuery`. Empty queries show topic suggestions.
`GET /api/search` exposes the same search capability as JSON, with a maximum
of 50 results. Database errors return a visible retry message.

The data path is page or API → `lib/search.ts` → SQLite. Topics are a curated
list in `lib/topics.ts`, not a computed trends ranking. Search matches post
text, including hashtags. When the query names a member's handle, with or
without a leading `@` and in any letter case, a person card linking to their
profile appears above the results. There is no external indexing service.

Acceptance: topic links retain their query in the URL, empty results offer a
next step, and invalid queries produce a consistent error envelope in the API.
