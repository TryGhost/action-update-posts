# Release

This repository publishes versioned GitHub Action tags. Consumers normally use
the floating major tag, for example `TryGhost/action-update-posts@v0`.

Publishing is intentionally split into two steps:

1. Define the next version with `pnpm ship:version`.
2. Ship the already-tagged release commit with `pnpm ship`.

## Define the version

Use `pnpm ship:version` with exactly one version argument:

```sh
pnpm ship:version patch
pnpm ship:version minor
pnpm ship:version major
pnpm ship:version 0.1.0
```

The command delegates to `pnpm version`, creates the version commit, and creates
the matching `vX.Y.Z` tag. Review the resulting commit and tag before shipping.

## Ship the release

After the version commit and tag exist on `HEAD`, run:

```sh
pnpm ship
```

The `ship` script runs the `preship` lifecycle first, so it verifies the build,
lint, and test suite before pushing. It then checks that the working tree is
clean and that `HEAD` has a full semver tag such as `v0.0.5`, then pushes the
current branch and tags with `git push --follow-tags`.

## Major tag

The `.github/workflows/major.yml` workflow runs when a full semver tag is pushed.
It updates the floating major tag that action consumers use, such as `v0` for
`v0.0.5`.

Do not push or move the floating major tag by hand during the normal release
flow. Let the workflow update it from the full semver tag.
