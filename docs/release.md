# Release

This repository publishes versioned GitHub Action tags. Consumers normally use
the floating major tag, for example `TryGhost/action-update-posts@v0`.

Publishing is handled by `@tryghost/pro-ship` through the repo's `ship` script:

```sh
pnpm ship patch
pnpm ship minor
pnpm ship major
pnpm ship 0.1.0
```

The `ship` script runs the `preship` lifecycle first, so it verifies the build,
lint, and test suite before releasing. `pro-ship` then runs `pnpm version`,
creates the matching `vX.Y.Z` release commit and tag, and pushes with
`git push --follow-tags`. The command only succeeds from a clean working tree.

## Major tag

The `.github/workflows/major.yml` workflow runs when a full semver tag is pushed.
It updates the floating major tag that action consumers use, such as `v0` for
`v0.0.5`.

Do not push or move the floating major tag by hand during the normal release
flow. Let the workflow update it from the full semver tag.
