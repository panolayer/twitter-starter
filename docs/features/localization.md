# Profile localization

Settings offers English, Spanish, and Japanese previews for profile statistics.
`lib/localization.ts` is the formatting boundary; components pass a count, a
creation timestamp, and a supported locale. Dates use UTC so server and browser
rendering are consistent. The provider updates the document language.

Counts must follow each language's spacing and plural rules, and numbers must
use locale grouping. English examples: `1 chirp`, `2 chirps`, `1,000 chirps`.
Spanish examples: `1 publicación`, `2 publicaciones`. Japanese uses `1件の投稿`.
Store semantic values and format complete display messages at render time.

Acceptance: compare counts 0, 1, 2, and 1000 in each language. Switching language
must not change database contents or feed ordering. Navigation and composer
strings remain English during this preview phase.
