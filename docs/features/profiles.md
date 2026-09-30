# Profiles and demo identity

Profiles show a user's biography, joined date, post count, and latest 50 posts.
The signed-in demo identity sees an edit form for their own profile. Display
names accept 1–50 characters and biographies accept up to 160. Both are trimmed
at the boundary. A successful save refreshes server-rendered profile content.

`PATCH /api/users/:handle` accepts `{ displayName, bio }` and returns the updated
user. The API must enforce ownership independently of whether a form is visible.
A request to update another identity must return 403. Profile edits use prepared
SQL and React escapes rendered text.

The session cookie chooses among seeded users and is intentionally simple demo
identity switching. It is not password-based authentication. Switching identity
changes engagement and private bookmarks; device preferences stay the same.
