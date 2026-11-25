# Project memory

## Product intent & audience

- No explicit product details yet; user is working on a code project within Bolt and may also maintain a separate GitHub repository.

## Brand personality & voice

- Not yet inferred.

## Visual design & UX direction

- Not yet inferred.

## Decisions, constraints & rationale

- Bolt workspace is not a git repository; no GitHub remote is configured.
- Bolt's Version History (clock icon in header) is the sole source of truth for changes made inside Bolt.
- Any comparison between Bolt files and an external GitHub repo must be done outside Bolt.

## Open questions & assumptions

- Whether the user has an external GitHub repo and intends to sync or connect it to Bolt.
- Which environment (Bolt vs GitHub) currently holds the most recent code changes overall.