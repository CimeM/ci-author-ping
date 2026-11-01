# ci-author-ping

Route CI failure alerts to the developer who actually wrote the code, not whoever triggered the run. Using git blame and custom fallback rules, notifications go straight to the last contributor of the broken lines.

[![Tests](https://github.com/CimeM/ci-author-ping/actions/workflows/test.yml/badge.svg)](https://github.com/CimeM/ci-author-ping/actions/workflows/test.yml)
[![Latest Release](https://img.shields.io/github/v/release/CimeM/ci-author-ping?color=blue&label=latest%20tag)](https://github.com/CimeM/ci-author-ping/releases/latest)

## How it works

1. Capture failure context in CI (failed step + error logs).
2. Evaluate rules in `.github/alert-config.yml`.
3. Resolve target (static routes bypass blame; `alert_source_files` overrides the alert scope).
4. Dispatch notification to Slack.

## Usage

Add a post-failure step to your workflow:

```yaml
name: CI Pipeline

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build Docker Image
        run: docker build -t my-app .

      - name: Notify Author on Failure
        if: failure()
        uses: cimem/ci-author-ping@v0.0.3
        with:
          slack_webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
          rules_file: '.github/alert-config.yml'
          fallback_contact: '#pipeline-alerts'
```

### Inputs

| Input | Required | Default | Description |
|---|---|---|---|
| `slack_webhook_url` | No | — | Slack Webhook URL for incoming alerts |
| `rules_file` | No | `.github/alert-config.yml` | Path to custom rules configuration file |
| `fallback_contact` | Yes | `#pipeline-alerts` | Default fallback email or Slack channel |

- Failing step must run **after** `actions/checkout`.
- Notify step must use `if: failure()`.
- `fallback_contact` is required.

### Optional Pipeline Details

The Slack alert can include the pipeline name, failed action, and a direct link to the failed run. These are read from (optionally supplied) GitHub env vars:

- `GITHUB_PIPELINE_NAME` — pipeline name (falls back to GitHub's `GITHUB_WORKFLOW` when set).
- `GITHUB_RUN_ID`, `GITHUB_REPOSITORY`, `GITHUB_SERVER_URL` — used to build the failed-run link.

All of the above are optional; when they are not supplied, the alert simply omits those details.

### Slack User Mapping

You can map GitHub usernames (or author emails) to Slack user IDs so alerts go directly to a person instead of the fallback channel:

```yaml
slack_user_map:
  "some-git-username": "U012ABCDEF"
```

When the resolved culprit matches a key, the alert is dispatched to that Slack user (`<@U012ABCDEF>` mention) instead of the fallback contact. A Slack bot token (`slack_bot_token`) is required for DM delivery via `chat.postMessage`; without it, the webhook/fallback is used.

## Configuration

`.github/alert-config.yml`:

```yaml
default_fallback_channel: "#pipeline-alerts"
ignore_authors:
  - "dependabot[bot]"
  - "github-actions[bot]"

rules:
  - name: "Docker Build Failure Tracking"
    match_step: "Build Docker Image"
    blame_source_files:
      - "package.json"
      - "src/"
    route_to:
      mode: "dynamic_code_author"
```

See the full rules reference for all supported keys.

## Local Development

```bash
npm install
npm test            # Run Jest unit tests
npm run lint        # Run ESLint
node scripts/test-local.js   # Run the local failure simulation
```

### Pre-commit hooks (zizmor)

Git hooks are managed with [prek](https://github.com/j178/prek) and lint GitHub
Actions workflows via [zizmor](https://github.com/woodruffw/zizmor).

```bash
brew install zizmor   # or: cargo install zizmor
prek install           # Install the git pre-commit hook
prek run --all-files  # Run all pre-commit hooks
```


## License

MIT
