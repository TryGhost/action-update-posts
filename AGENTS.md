This repo ships a JavaScript GitHub Action that updates Ghost posts through the
Ghost Admin API. See `README.md` for user-facing setup and workflow examples.

## Commands

- `pnpm build` refreshes `dist/index.js` from `index.js`; commit the generated
  bundle whenever runtime code or dependencies change.
- `pnpm lint` runs ESLint with the Ghost ruleset.
- `pnpm test` runs Vitest with coverage; CI expects at least 80% statements,
  branches, functions, and lines.
- `pnpm preship` is the local CI equivalent before publishing.
- `pnpm ship:version <patch|minor|major|version>` creates the release commit
  and semver tag.
- `pnpm ship` runs `preship`, then pushes the current branch and tags when HEAD
  already has a `vX.Y.Z` tag.

## Boundaries

- Do not edit `dist/index.js` by hand. Change `index.js`, then run
  `pnpm build`.
- Do not commit real Ghost Admin API URLs or keys. Tests should use mocked
  `core` and Admin API modules, as in `index.test.mjs`.
- Keep `CLAUDE.md` as the symlink to this file rather than duplicating agent
  instructions.
