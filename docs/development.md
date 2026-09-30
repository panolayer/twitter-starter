# Local development

Install pnpm 10 and use Node.js 20, 22, or 24 to bootstrap the project. The
repository's `.npmrc` selects Node 20.20.0 for project commands. The
`onlyBuiltDependencies` allowlist permits the SQLite driver's install hook.
Native build output caching is disabled so pnpm does not reuse a SQLite binary
compiled for another Node ABI. Downloaded package caching remains available.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

No environment configuration is needed. `CHIRP_DATA_DIR` optionally selects a
separate database directory for isolated runs. Upload paths stay relative to
the project root. The checked-in SVG illustrations are local assets.

## Checks

```sh
pnpm format:check
pnpm typecheck
pnpm test:seed
pnpm build
pnpm start
```

In another terminal, run `pnpm smoke` against the server. To use another port,
run `pnpm start --port 3100` and `pnpm smoke http://127.0.0.1:3100`.
The smoke script accepts only local hosts, creates its own temporary post, and
removes it in a finally block. Seeding checks use a temporary database directory
and four separate Node processes. They leave the development database alone.

Product workflow checks establish a runnable baseline. Review each feature
against AGENTS.md and the feature contracts when evaluating correctness.

## Troubleshooting

If a previous installation used a different Node version, run
`pnpm rebuild better-sqlite3`. If no prebuilt driver is available, installation
needs a C++ compiler and Python. Use Xcode Command Line Tools on macOS. Stop
other Chirp processes before resetting the local database. Preserve seed images
when clearing uploaded files.
