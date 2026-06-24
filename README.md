# Action Update Posts

Action Update Posts is a GitHub Action that updates Ghost posts on a schedule
through the Ghost Admin API.

Use it when a Ghost site needs scheduled post field changes, such as making
posts public after an early-access period or unfeaturing posts after a campaign.
The action finds posts by tag, checks how many days have passed since each post
was published, and edits the chosen field when the configured threshold has
passed.

## Usage

Create a Ghost custom integration in Ghost Admin, then add these repository
secrets to the GitHub repository that will run the workflow:

- `GHOST_ADMIN_API_URL`: the Admin API URL from the integration.
- `GHOST_ADMIN_API_KEY`: the Admin API key from the integration.

Add a workflow such as `.github/workflows/update-posts.yml`:

```yml
name: Update Ghost Posts

on:
  schedule:
    - cron: '1 0 * * *'

jobs:
  update-posts:
    runs-on: ubuntu-latest
    steps:
      - uses: TryGhost/action-update-posts@v0
        with:
          api-url: ${{ secrets.GHOST_ADMIN_API_URL }}
          api-key: ${{ secrets.GHOST_ADMIN_API_KEY }}
          tag: hash-early-access
          field: visibility
          value: public
          days: 30
```

This example runs once per day at 00:01 UTC. It finds posts tagged
`#early-access` and changes `visibility` to `public` once each post is more than
30 days old.

## Inputs

| Key | Description | Required |
| --- | --- | --- |
| `api-url` | Ghost Admin API URL from the custom integration. | Yes |
| `api-key` | Ghost Admin API key from the custom integration. | Yes |
| `tag` | Tag slug to look up, for example `hash-early-access`. | Yes |
| `field` | Post field to update, for example `visibility` or `featured`. | Yes |
| `value` | New value for the field, for example `public` or `false`. String values of `true` and `false` are converted to booleans. | Yes |
| `days` | Number of days after publish before the post should be updated. | Yes |

## Examples

Unfeature sponsored posts after seven days:

```yml
with:
  api-url: ${{ secrets.GHOST_ADMIN_API_URL }}
  api-key: ${{ secrets.GHOST_ADMIN_API_KEY }}
  tag: hash-sponsored
  field: featured
  value: 'false'
  days: 7
```

Publish members-only early access posts after 30 days:

```yml
with:
  api-url: ${{ secrets.GHOST_ADMIN_API_URL }}
  api-key: ${{ secrets.GHOST_ADMIN_API_KEY }}
  tag: hash-early-access
  field: visibility
  value: public
  days: 30
```

## Development

This action runs on Node.js 24 in GitHub Actions and uses pnpm for local
development.

```sh
pnpm install --frozen-lockfile
pnpm lint
pnpm test
pnpm build
```

`pnpm build` refreshes `dist/index.js` from `index.js`. Commit the generated
bundle whenever runtime code or dependencies change.

See [docs/release.md](docs/release.md) for the publishing workflow.

## Copyright & License

Copyright (c) 2013-2026 Ghost Foundation - Released under the
[MIT license](LICENSE).
