# Post interactions

A post has a stable `/post/:id` permalink. Its timestamp opens that page. Likes
and reposts are viewer-specific toggles with optimistic UI and rollback on
failure. Bookmarks persist a private relation. The share action copies the
permalink, displaying a selectable link if clipboard access is unavailable.

Only the author sees the delete action, and the delete API checks author
ownership before removing the post. Associated engagement and bookmarks are
removed by SQLite foreign keys. Images use local paths and lazy loading.

Acceptance: open a permalink directly, copy it, reload it, and find the same
post. Invalid or missing post ids produce the application's not-found state.
