# Action Update Posts

<p align="center">
  <a href="https://ghost.org">
    <img src="https://user-images.githubusercontent.com/65487235/157884383-1b75feb1-45d8-4430-b636-3f7e06577347.png" width="200px" alt="Ghost" />
  </a>
</p>
<h3 align="center">Update Ghost Posts on a schedule</h3>

<p align="center">
    This <a href="https://github.com/features/actions">GitHub action</a> allows you to automatically update any fields of any <a href="https://ghost.org">Ghost</a> post <br>
    on a schedule from GitHub via the Ghost Admin API!
</p>

---

&nbsp;


## Getting Started

💡This action expects that you already have a working Ghost install running at least v3.20.0

1. Generate a set of Ghost Admin API credentials, by configuring a new Custom Integration in Ghost Admin&raquo;Integrations.

2. On GitHub, navigate to your theme repository&raquo;Settings&raquo;Secrets. Create a secret called `GHOST_ADMIN_API_URL` containing the API URL and another called `GHOST_ADMIN_API_KEY` containing the Admin API Key. Both must be copied exactly from Ghost Admin&raquo;Integrations.

3. Once your secrets are in place, copy this example config into `.github/workflows/update-posts.yml`.

```yml
name: Update Ghost Posts
on:
  schedule:
    - cron: "01 00 * * *"
jobs:
  deploy:
    runs-on: ubuntu-18.04
    steps:
      - uses: actions/checkout@master
      - name: Update Ghost Posts
        uses: TryGhost/action-update-posts@v0
        with:
          api-url: ${{ secrets.GHOST_ADMIN_API_URL }}
          api-key: ${{ secrets.GHOST_ADMIN_API_KEY }}
          tag: 'hash-early-access'
          field: 'visibility'
          value: 'public'
          days: 30
```

Using the schedule `"01 00 * * *"` will run this action once per day at one minute past midnight. For testing purposes, you may wish to use `""*/5 * * * *"`, which will run every 5 minutes.

The example `with` configuration will find all posts tagged with `#early-access`, and if they were published more than 30 days ago, will update the `visibility` field to `public`.


4. Tweak the `tag`, `field`, `value` and `days` configuration values to whatever you like, and then commit and push your changes.


## Configuration

The `with` portion of the workflow **must** be configured before the action will work. Any `secrets` must be referenced using the bracket syntax and stored in the GitHub repositories `Settings/Secrets` menu. You can learn more about setting environment variables with GitHub actions [here](https://help.github.com/en/articles/workflow-syntax-for-github-actions#jobsjob_idstepsenv).

| Key  | Value Information | Type | Required |
| ------------- | ------------- | ------------- | ------------- |
| `api-url`  | The base URL of your Ghost Admin API, found by configuring a new Custom Integration in Ghost Admin&raquo;Integrations | `secrets` | **Yes** |
| `api-key`  | The authentication key for your Ghost Admin API, found by configuring a new Custom Integration in Ghost Admin&raquo;Integrations | `secrets` | **Yes** |
| `tag` | The tag to lookup to find posts to update e.g. `hash-early-access` | `string` | Yes |
| `field` | The post field that you want to update e.g. `visibility` or `featured` | `string` | Yes |
| `value` | The new value for the field e.g. `public` or `false` | `string` | Yes |
| `days` | Number of days after the post was published to update the post e.g. 30 | `number` | Yes |

### Examples



```yml
with:
  api-url: ${{ secrets.GHOST_ADMIN_API_URL }}
  api-key: ${{ secrets.GHOST_ADMIN_API_KEY }}
  tag: 'hash-sponsored'
  field: 'featured'
  value: 'false'
  days: 7
```

&nbsp;

<p align="center">Don't forget to 🌟 Star 🌟 the repo if you like this GitHub Action !</p>

# Copyright & License

Copyright (c) 2013-2022 Ghost Foundation - Released under the [MIT license](LICENSE).
