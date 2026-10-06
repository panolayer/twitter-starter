# AGENTS.md — engineering rules for Chirp

These are the project-wide rules any human or AI agent must follow when working
in this repo. They are intentionally simple and enforceable; Panolayer maps the
architecture and checks changes against rules like these.

## Required tooling and commands

Use **pnpm 12.9.1**, pinned by `packageManager` in `package.json`, for all
dependency and project commands. Do not use `npm install`, `npm ci`, `npm run`,
or Yarn in this repository, and do not add their lockfiles. Keep
`pnpm-lock.yaml` as the dependency lockfile.

Before starting, check `pnpm --version` (expected: `12.9.1`) and
`node --version` (expected: Node.js 24, e.g. `v24.21.0`). If the shell selects
an incompatible global pnpm or pnpm is missing, use `corepack pnpm` in place of
`pnpm` for the commands below. Corepack reads the project's version pin. Do not
work around a tooling problem by switching the project to npm.

| Task                          | Command                           |
| ----------------------------- | --------------------------------- |
| Install existing dependencies | `pnpm install --frozen-lockfile`  |
| Start the development server  | `pnpm dev` (or `pnpm run dev`)    |
| Typecheck                     | `pnpm typecheck`                  |
| Run unit tests                | `pnpm test`                       |
| Build for production          | `pnpm build`                      |
| Serve the production build    | `pnpm start` (after `pnpm build`) |

Use `pnpm exec <tool>` for local tools so they use the pinned runtime. Do not
run development and production builds concurrently in the same checkout;
both write to `.next/`. See [development setup](docs/development.md) for
additional checks, setup, and recovery instructions.

## Engineering rules

1. **Validate every input at the API boundary.** Route handlers (`app/api/**`)
   must validate and normalize request bodies/params before doing any work.
   Use the helpers in `lib/validation.ts`; never trust client-supplied data.

2. **Parameterized SQL only — never concatenate user input into a query.**
   All database access uses better-sqlite3 prepared statements with bound
   parameters (`@name` / `?`). Building SQL strings from request data is
   forbidden (it is SQL injection). See `lib/posts.ts` for the pattern.

3. **Respect the layering: UI → API → data-access → db.** React components call
   API routes (or read the data layer in server components); API routes call the
   `lib/*` data-access modules; only `lib/*` touches `lib/db.ts`. Components must
   never import `better-sqlite3` or open the database directly.

4. **Validate and constrain uploads.** Uploaded files must be checked for
   content-type and size before being written to disk
   (`validateImageUpload` in `lib/validation.ts`). Never persist an unvalidated,
   unbounded file.

5. **Ranking must be deterministic and never divide by zero.** The feed math in
   `lib/ranking.ts` is pure: clamp age to `>= 0`, keep a positive constant in the
   denominator, and produce the same score for the same inputs. No randomness in
   ordering.

6. **Share domain types from `lib/types.ts`.** `User`, `Post`, `PostWithAuthor`,
   feed and error shapes live in one place. Don't redefine these shapes ad hoc
   in components or routes.

7. **Return a consistent JSON error shape.** API errors are
   `{ "error": { "code": string, "message": string } }` with an appropriate HTTP
   status. Success responses return the relevant resource directly.

8. **No secrets in the repo.** There are no credentials to commit. Never add API
   keys, tokens, or `.env` secrets to source control; runtime data lives under
   the gitignored `.data/` and `public/uploads/`.

9. **Localize counts and dates as complete messages.** Use locale-aware number,
   date, and plural formatting. Do not construct translated sentences by
   concatenating numbers, English suffixes, and translated fragments.

10. **Scope private collections to the current viewer.** Bookmarks are private;
    read and mutate them only using the viewer resolved by the server session.

11. **Enforce ownership before changing profiles.** A profile update must target
    the current viewer. A client-supplied handle is not authorization.

## Project map

Chirp is a local social-feed demo for Panolayer. It runs on Node.js with Next.js
App Router and SQLite. Identity switching is a demo capability, not account
security. The home feed, Explore, profiles, bookmarks, and preferences form the
primary product surfaces. Feature contracts live under `docs/features/`.

Runtime files belong in ignored directories. Keep changes small enough that
their intent is clear in Git history. Preserve a runnable checkout after each
feature.
