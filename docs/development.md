# Local development

Use **pnpm 10.4.1**, as pinned by `packageManager` in `package.json`, and
Node.js 20, 22, or 24 to bootstrap the project. pnpm is the supported package
manager; do not mix npm or Yarn installs with this checkout. Commit dependency
changes to `pnpm-lock.yaml`, without adding `package-lock.json` or `yarn.lock`.

The repository's `.npmrc` selects Node 20.20.0 for project commands. The
`onlyBuiltDependencies` allowlist permits the SQLite driver's install hook.
Native build output caching is disabled so pnpm does not reuse a SQLite binary
compiled for another Node ABI. Downloaded package caching remains available.

Check the tools selected by the current shell, including inside an agent:

```sh
pnpm --version           # 10.4.1
pnpm exec node --version # v20.20.0
```

Then install and start the development server from the repository root:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

`pnpm run dev` is equivalent. Use `pnpm install` when intentionally updating
dependencies; `--frozen-lockfile` checks that the existing manifest and lockfile
agree without changing the lockfile.

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

Stop the development server before `pnpm build`. Development and production
builds share `.next/`, so use separate checkouts if they need to run at the same
time. `pnpm start` requires a successful production build first.

In another terminal, run `pnpm smoke` against the server. To use another port,
run `pnpm start --port 3100` and `pnpm smoke http://127.0.0.1:3100`.
The smoke script accepts only local hosts, creates its own temporary post, and
removes it in a finally block. Seeding checks use a temporary database directory
and four separate Node processes. They leave the development database alone.

Product workflow checks establish a runnable baseline. Review each feature
against AGENTS.md and the feature contracts when evaluating correctness.

## Troubleshooting

### The agent and terminal select different tools

Shells can have different `PATH` ordering. On macOS/Linux, `type -a node pnpm
corepack` shows the available installations. A global pnpm 11 launched with the
project's Node 20 can fail with a Node-version warning or
`ERR_UNKNOWN_BUILTIN_MODULE: node:sqlite` before switching to pnpm 10.4.1.

If pnpm is missing, reports a different version, or fails before starting, use
Corepack explicitly from the repository root:

```sh
corepack pnpm --version           # 10.4.1
corepack pnpm exec node --version # v20.20.0
corepack pnpm install --frozen-lockfile
corepack pnpm dev
```

Use the same prefix for other commands, such as `corepack pnpm typecheck` and
`corepack pnpm build`. This selects the project's `packageManager` version
without changing global tools or shell configuration. If Corepack is unavailable,
install pnpm 10.4.1 using the [pnpm installation guide](https://pnpm.io/10.x/installation),
then verify the versions above. Downloads require network access on first use.

### `npm install` warns or crashes

The `packageManager` field records the selected tool; it does not make a plain
`npm install` invoke pnpm or reject the command. See
[Corepack's npm behavior](https://nodejs.org/download/release/v20.20.0/docs/api/corepack.html#how-does-corepack-interact-with-npm).
The `.npmrc` settings `use-node-version` and `side-effects-cache` are pnpm
settings, so npm warns about them and does not apply the same runtime setup.

The reported `Cannot read properties of null (reading 'matches')` failure came
from npm's Arborist dependency resolver while processing an existing pnpm
`node_modules/.pnpm` tree. That stack trace is an installer failure, before
Chirp runs. npm does not use `pnpm-lock.yaml`, so an npm installation would
also resolve dependencies independently of the project's lockfile.

Return to `pnpm install --frozen-lockfile` (or the Corepack form above). If it
succeeds, no cleanup is needed. If a mixed install left broken dependencies,
stop the app, remove only the generated `node_modules/` directory and any
accidentally created `package-lock.json`, then reinstall with pnpm. Preserve
`pnpm-lock.yaml`, `.data/`, and `public/uploads/`; resetting application data
does not repair dependency installation.

### SQLite was built for a different Node version

If a previous installation used a different Node version, run
`pnpm rebuild better-sqlite3`. If no prebuilt driver is available, installation
needs a C++ compiler and Python. Use Xcode Command Line Tools on macOS. Stop
other Chirp processes before resetting the local database. Preserve seed images
when clearing uploaded files.
