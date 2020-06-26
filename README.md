# Action Update Posts

## Getting Started

💡This action expects that you already have a working Ghost install running at least v3.20.0

1. Generate a set of Ghost Admin API credentials, by configuring a new Custom Integration in Ghost Admin&raquo;Integrations.

2. On GitHub, navigate to your theme repository&raquo;Settings&raquo;Secrets. Create a secret called `GHOST_ADMIN_API_URL` containing the API URL and another called `GHOST_ADMIN_API_KEY` containing the Admin API Key. Both must be copied exactly from Ghost Admin&raquo;Integrations.

3. Once your secrets are in place, copy this example config into `.github/workflows/update-posts.yml`.

```yml
name: Update Early Access Posts
on:
  schedule:
    - cron: "00 00 * * *"
jobs:
  deploy:
    runs-on: ubuntu-18.04
    steps:
      - uses: actions/checkout@master
      - name: Update Ghost Posts
        with:
          api-url: ${{ secrets.GHOST_ADMIN_API_URL }}
          api-key: ${{ secrets.GHOST_ADMIN_API_KEY }}
          tag: 'hash-early-access'
          field: 'visibility'
          value: 'public'
          days: 30
```

This will run once per day at midnight. It will find all posts tagged with `#early-access`, and if the were published more than 30 days ago, will update the `visibility` field to `public`.

4. Tweak the configuration values to whatever you like, and then commit and push your changes.

<p align="center">Don't forget to 🌟 Star 🌟 the repo if you like this GitHub Action !</p>

# Copyright & License

Copyright (c) 2020 Ghost Foundation - Released under the [MIT license](LICENSE).