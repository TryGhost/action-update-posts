This repo ships a JavaScript GitHub Action that updates Ghost posts through the
Ghost Admin API. See `README.md` for user-facing setup and workflow examples.

## Commands

- `pnpm build` refreshes `dist/index.js` from `index.js`; commit the generated
  bundle whenever runtime code or dependencies change.
- `pnpm lint` runs oxlint and checks formatting with oxfmt.
- `pnpm lint:fix` applies oxlint fixes and oxfmt formatting.
- `pnpm format` runs oxfmt over the supported source files.
- `pnpm test` runs Vitest with coverage; CI expects at least 80% statements,
  branches, functions, and lines.
- `pnpm preship` is the local CI equivalent before publishing.
- `pnpm ship <patch|minor|major|version>` runs `preship`, then delegates to
  `@tryghost/pro-ship` to create the release commit, semver tag, and push.
- `docs/release.md` documents the publishing flow and the
  floating major-tag workflow.

## Boundaries

- Do not edit `dist/index.js` by hand. Change `index.js`, then run
  `pnpm build`.
- Do not commit real Ghost Admin API URLs or keys. Tests should use mocked
  `core` and Admin API modules, as in `index.test.mjs`.
- Keep `CLAUDE.md` as the symlink to this file rather than duplicating agent
  instructions.
