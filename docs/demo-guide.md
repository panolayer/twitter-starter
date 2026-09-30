# A first tour of Chirp

Start the app, open Home, and browse For You before switching to Latest. Both
feeds begin with content. Scroll to Show more to see the longer sample timeline.
Visit a person's profile through their avatar; open a chirp using its timestamp.

Try the product in this order:

1. Add an emoji to a draft. Switch identity and return to find the draft again.
2. Post using Command+Enter or Ctrl+Enter. Like and repost from another identity.
3. Save a post and open Bookmarks. Compare collections between two identities.
4. Search `SQLite` or choose a hashtag in Explore. Open a result's permalink.
5. Open Settings and try a different appearance and profile-count language.
6. Visit your profile and edit its display name and bio.

## A first tour in Panolayer

Open the repository with its full Git history. The change timeline includes
small feature additions, data-layer changes, documentation, and reliability
fixes. Start with the server home page and follow its calls through feed
assembly and prepared post queries. Compare that flow to client mutations.

The Markdown files in `docs/features/` provide feature-specific context. The
architecture and API guides connect them, while AGENTS.md describes the
engineering contracts. Use the verification findings to inspect differences
between a feature's required behavior and its implementation. Changing a
contract should be deliberate and reviewed alongside its code.

## Reset and recovery

Stop the server before resetting the database. Remove `.data/` and restart for a
fresh sample community. Clear browser storage to reset drafts and preferences.
User uploads can be removed independently, preserving checked-in seed images.
Run `pnpm test:seed` for initialization checks and `pnpm smoke` against a running
local server for normal browsing and mutation flows.
