# Chirp

A small social network for people who build things. Chirp is the Twitter starter
used to explore architecture, documentation, and change verification in
[Panolayer](https://panolayer.com).

## Start in two commands

Use Node.js 20 or 22 and pnpm 10. No accounts, API keys, or external database
are needed.

```sh
pnpm install
pnpm dev
```

Open http://localhost:3000. SQLite creates and seeds `.data/chirp.db` on the
first request. The user menu switches between demo identities. Data survives
restarts; a fresh checkout starts with sample conversations.

```sh
pnpm typecheck
pnpm build
pnpm start
```

The SQLite driver is a native module. If installation needs to compile it,
install your platform's C/C++ build tools (Xcode Command Line Tools on macOS).
The repository allows its install script through pnpm configuration.

## Explore the project

- Home: ranked and chronological feeds, composing, likes, and reposts.
- Explore: search posts and browse topics.
- Profiles: author timelines and profile editing.
- Bookmarks: a private reading list for each demo identity.
- Settings: appearance and language preferences.

Read [the architecture](docs/architecture.md), [the API contract](docs/api.md),
and [feature guides](docs/features/). [AGENTS.md](AGENTS.md) defines the rules
Panolayer checks. This is a local verification playground; review its rules and
implementation before using it as the basis of a public service.

## Local data

Uploaded images live in `public/uploads/`; sample illustrations are checked in.
The database and user uploads are ignored by Git. Stop the app before removing
`.data/` to reset the sample world. Browser appearance and draft preferences
live in local storage.

## History

Each feature and documentation change has a focused commit. Clone with full
history to browse the change timeline:

```sh
git clone git@github.com:panolayer/twitter-starter.git
```

If a tool supplied a shallow checkout, use `git fetch --unshallow` to retrieve
older commits. This repository does not need a history rewrite.
