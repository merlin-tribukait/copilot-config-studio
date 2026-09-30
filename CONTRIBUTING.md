# Contributing

Thanks for helping improve Copilot Config Studio. The project is an early
scaffold; check existing issues and the implementation guide before starting
larger changes.

## Before you start

- Read `AGENTS.md` for project-wide implementation and security requirements.
- Read `docs/IMPLEMENTATION_GUIDE.md` for product scope and planned phases.
- For significant behavior or architecture changes, open an issue or draft
  discussion first so the approach can be agreed before substantial work.
- Do not include real provider credentials, personal configuration files,
  private prompts, or unredacted logs in issues or pull requests.

## Local development

Install Node.js/npm, Rust stable/Cargo, and the platform prerequisites for
Tauri 2. On Linux, follow the GTK/WebKitGTK instructions in the
[Tauri prerequisites](https://tauri.app/start/prerequisites/).

```sh
npm ci
npm run check
npm run build
npm run tauri dev
```

For Rust changes:

```sh
cd src-tauri
cargo fmt --check
cargo test
cargo clippy --all-targets --all-features -- -D warnings
```

The CI workflow runs frontend checks and Rust checks on Linux, macOS, and
Windows. A local build on one operating system does not establish that native
packaging works on the other platforms.

## Pull requests

- Keep changes focused and explain user-visible behavior and tradeoffs.
- Add or update tests for behavior changes, especially parsing, validation,
  persistence, credential handling, and error cases.
- Update the README or implementation guide when scope, setup, or behavior
  changes.
- Include the checks you ran and clearly identify checks you could not run.
- Never claim that a provider is compatible or a model works unless the
  corresponding validation actually ran.
- Do not include secrets in screenshots, fixtures, test output, or commits.

## Security issues

Please do not report security vulnerabilities in public issues. Follow
`SECURITY.md` for private reporting guidance.
