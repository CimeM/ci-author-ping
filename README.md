# AuthorPing

GitHub Action that routes pipeline failure notifications based on **code authorship (git blame)** and **custom cascading rules** — so the right developer gets notified instead of whoever triggered the build.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
[![Tests](https://github.com/CimeM/AuthorPing/actions/workflows/test.yml/badge.svg)](https://github.com/CimeM/AuthorPing/actions/workflows/test.yml)
[![Latest Release](https://img.shields.io/github/v/release/CimeM/AuthorPing)](https://github.com/CimeM/AuthorPing/releases)
![Node.js Version](https://img.shields.io/node/v20)

## Why

Blind CI notifications go to the person who happened to push. AuthorPing finds the actual author of the failed code and notifies them.

- **Git blame:** attribute failures to the real developer.
- **Cascading rules:** e.g. a Docker build failure caused by a broken dependency blames the dependency's author, not the Dockerfile author.
- **Fallback routing:** unresolvable or bot-related failures go to a fallback channel.

## How it works

1. Capture failure context (failed step + error logs).
2. Evaluate rules in `.github/blame-rules.yml`.
3. Resolve target (static routes bypass blame; `blame_source_files` overrides the blame scope).
4. Dispatch notification.

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

      - name: Notify Blamed Author on Failure
        if: failure()
        uses: cimem/ci-blame-notifier@v1
        with:
          slack_webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
          rules_file: '.github/blame-rules.yml'
          fallback_contact: '#pipeline-alerts'
```

### Inputs

| Input | Required | Default | Description |
|---|---|---|---|
| `slack_webhook_url` | No | — | Slack Webhook URL for incoming alerts |
| `rules_file` | No | `.github/blame-rules.yml` | Path to custom rules configuration file |
| `fallback_contact` | Yes | `#pipeline-alerts` | Default fallback email or Slack channel |

- Failing step must run **after** `actions/checkout`.
- Notify step must use `if: failure()`.
- `fallback_contact` is required.

## Configuration

`.github/blame-rules.yml`:

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

## License

MIT
