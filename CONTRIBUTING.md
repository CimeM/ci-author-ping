# Contributing to AuthorPing

Thanks for your interest in contributing!

## Getting Started

```bash
git clone <repository-url>
cd authorping
npm install
npm test            # Run Jest unit tests
npm run lint        # Run ESLint
node scripts/test-local.js   # Run the local failure simulation
```

## Development Workflow

### Tests

- Run `npm test` before submitting any change.
- Add or update Jest tests in `tests/` when changing runtime behavior in `src/`.

### Linting

- Run `npm run lint` to check code style and correctness.

### Pre-commit Hooks

Git hooks are managed with [prek](https://github.com/j178/prek); the default hook runs the [zizmor](https://github.com/woodruffw/zizmor) GitHub Actions linter.

```bash
brew install zizmor   # ensure the zizmor binary is on your PATH
prek install           # install the git pre-commit hook
prek run --all-files  # run all pre-commit hooks
```

## Submitting a Pull Request

- Keep pull requests focused; one logical change per PR.
- Ensure `npm test`, `npm run lint`, and `prek run --all-files` pass before requesting review.

## Design Principles

- Always follow standard coding and design principles.
- Apply the principle of least privilege.
- Make features optional; the decision to adopt them belongs to the consumer.
- Log/alert when the CI action runs in a misconfigured state.
