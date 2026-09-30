# Sample world

The first database connection seeds four demo identities, 38 posts, likes,
reposts, and two local illustrations in one transaction. No network assets or
credentials are needed. Reply counts and engagement follow fixed index patterns.
Post dates are relative to initialization so a fresh install feels active.

Seeding runs only when the users table is empty. It does not overwrite existing
posts. Reset by stopping the server and removing `.data/`. Uploads and browser
preferences have separate lifetimes. The four personas make viewer-dependent
state easy to compare without signup.
