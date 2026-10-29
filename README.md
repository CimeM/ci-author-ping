# AuthorPing 🚀

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
[![Tests](https://github.com/cimem/ci-blame-notifier/actions/workflows/test.yml/badge.svg)](https://github.com/cimem/ci-blame-notifier/actions/workflows/test.yml)
[![Latest Release](https://img.shields.io/github/v/release/cimem/ci-blame-notifier)](https://github.com/cimem/ci-blame-notifier/releases)
![Node.js Version](https://img.shields.io/node/v20)

An intelligent GitHub Action that routes pipeline failure notifications based on **code authorship (git blame)** and **custom cascading rules**, ensuring the right developer gets notified instead of blindly spamming whoever triggered the build.

## Why use AuthorPing?
* **Smart Git Blame:** Automatically traces pipeline step failures to the real developer who wrote or touched the code.
* **Cascading Failure Rules:** Prevent false blame (e.g., if a Docker build fails due to a broken dependency file, it looks up who modified `package.json` rather than blaming who wrote the Dockerfile 6 months ago).
* **Infrastructure Routing:** Intercepts system or network errors and routes them straight to DevOps channels instead of developer inboxes.
* **Graceful Fallbacks:** Falls back to team channels or fallback emails if an author can't be reached or is an automated bot.

---

## How It Works

When your pipeline fails, the action executes this flow:

1. **Capture Failure Context:** Extracts the failed step name (e.g., `Build Docker Image`) and pulls the raw error logs from the GitHub Actions API for that step.
2. **Evaluate Rules:** Scans your `.github/blame-rules.yml` file, testing error logs and step names against regex patterns (`match_error`, `match_step`).
3. **Resolve the Target:** Static routes bypass git blame entirely; `blame_source_files` overrides the Dockerfile history and blames the source files that actually changed.
4. **Dispatch:** Mentions the correct developer or routes to the specified fallback channel.

---

## Usage

Add this action as a post-failure step in your workflow file (e.g., `.github/workflows/ci.yml`):

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

### Action Inputs

| Input | Required | Default | Description |
|---|---|---|---|
| `slack_webhook_url` | No | — | Slack Webhook URL for incoming alerts |
| `rules_file` | No | `.github/blame-rules.yml` | Path to custom rules configuration file |
| `fallback_contact` | Yes | `#pipeline-alerts` | Default fallback email or Slack channel |

> **Integration notes:**
> - The failing step must run **after** `actions/checkout`.
> - The notify step must use `if: failure()` (or `if: always()` if you also want to catch cancelled runs).
> - `fallback_contact` is required and is used when no rule matches or the blamed author is an ignored bot.

---

## Configuration (`.github/blame-rules.yml`)

Create a rules file in your repository to map error types and exceptions:

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

See the full rules reference in the conversation notes / original spec for all supported keys.

---

## Local Development & Testing

```bash
npm install
npm test            # Run Jest unit tests
npm run lint        # Run ESLint
node scripts/test-local.js   # Run the local failure simulation
```

---

## License

MIT License
