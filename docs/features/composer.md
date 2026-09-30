# Compose a chirp

The composer posts text of 1–280 UTF-16 code units, with an optional uploaded
image path. Emoji buttons append to the draft without submitting. The remaining
counter uses the same length rule as server validation, including surrogate
pairs. Submit remains disabled during an upload or request.

Text drafts are stored per demo identity on this device. Successful posting
clears the draft; failed posting retains it. Image attachments are not restored
from a draft. Ctrl+Enter or Command+Enter sends a valid draft. Images go through
`POST /api/upload`, then their returned path joins `POST /api/posts`.

Acceptance: switch identities while drafting and find each identity's text
when returning. A successful post appears immediately in the feed. Upload and
posting failures should offer a visible error without discarding draft text.
