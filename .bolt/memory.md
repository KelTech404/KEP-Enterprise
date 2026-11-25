# Project memory

## Product intent & audience

- No explicit product details yet; user is working on a code project within Bolt.

## Brand personality & voice

- Not yet inferred.

## Visual design & UX direction

- Not yet inferred.

## Decisions, constraints & rationale

- Bolt workspace is not a git repository; no GitHub remote is configured.
- Git CLI commands are unavailable in Bolt; pushing to GitHub must be done via Bolt's in-browser GitHub integration (GitHub icon → Log in → Create/select repo).
- Bolt's Version History (clock icon in header) is the sole source of truth for changes made inside Bolt.
- Any comparison between Bolt files and an external GitHub repo must be done outside Bolt.
- User confirmed Bolt code is the most up-to-date version and wants it pushed to GitHub before continuing work.

## Open questions & assumptions

- Whether the user has successfully connected GitHub and created/pushed the repo yet.
- Name and visibility (public/private) of the intended GitHub repo.