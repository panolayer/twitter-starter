# Private bookmarks

A bookmark is a `(post_id, user_id)` relation with a creation timestamp. The
composite primary key makes repeated saves idempotent. Foreign keys remove
bookmarks when their post or user is deleted. The collection returns the latest
100 saves in deterministic order.

`PUT /api/posts/:id/bookmark` saves; `DELETE` removes; `GET /api/bookmarks`
returns the current viewer's collection. Requests supply a post id only. Viewer
identity always comes from the session. Unknown posts return 404 and malformed
ids return 400. The same post can be saved independently by different viewers.

Acceptance: save as Ada, switch to Grace, and verify Grace's collection stays
empty. Return to Ada and find the saved post after restarting the app. Removing
it from the saved page removes the card immediately.
