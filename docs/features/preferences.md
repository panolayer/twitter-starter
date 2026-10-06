# Appearance and language

Preferences are device-local, shared across demo identities. `UserPreferences`
in `lib/types.ts` defines theme (`system`, `light`, `dark`) and locale (`en`,
`es`, `ja`). `PreferencesProvider` owns reads and writes to
`chirp:preferences` in local storage, accepting only supported values.

System follows the operating system via CSS media queries. Explicit light and
dark modes override it. A small startup script applies a saved theme before
hydration to avoid a bright flash. Storage failures use in-memory defaults.
Language changes the document language and profile count preview; the wider
interface is currently English.

Settings also offers "Download my chirps", which saves the current demo
identity's posts through `GET /api/export` as a JSON Lines file. A copy of each
export stays in `.data/exports/` alongside the database.

Acceptance: changing a preference survives reload, changing identity preserves
it, and unavailable local storage does not block the app.
