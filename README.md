# Copilot Config Studio

A cross-platform desktop companion for configuring GitHub Copilot CLI and its
bring-your-own-key (BYOK) model providers. The goal is to make model setup
discoverable, validate configurations before use, and show clearly what the
app will change.

> **Status:** early concept prototype. The Svelte screen has an interactive
> in-memory route choice and placeholder navigation. It does not read or edit
> settings, connect to providers, or launch Copilot CLI. See
> [AGENTS.md](AGENTS.md), [docs/PRODUCT_UX_CONCEPT.md](docs/PRODUCT_UX_CONCEPT.md),
> and [docs/IMPLEMENTATION_GUIDE.md](docs/IMPLEMENTATION_GUIDE.md).

## Intended capabilities

- Inspect and edit Copilot CLI's user-level `settings.json` and supported
  settings, including model and Auto routing preferences.
- Configure named BYOK profiles for OpenAI-compatible APIs (including Ollama),
  Azure OpenAI, and Anthropic.
- Fetch model suggestions from endpoints that support listing them; allow
  manual model IDs for providers that do not.
- Validate local settings, provider connectivity, and model selection before
  applying or launching Copilot CLI.
- Preview changes, preserve unrelated settings, back up changed files, and
  report exactly what succeeded or failed.
- Keep API credentials in the operating system credential store, never in
  plaintext settings, logs, or shell command strings.

This project is independent community software and is not affiliated with or
endorsed by GitHub.

## Development setup

Requirements:

- Node.js and npm
- Rust stable and Cargo
- Tauri 2 system prerequisites for your OS. On Linux, install the WebKitGTK
  4.1 and GTK development packages listed in the
  [Tauri prerequisites](https://tauri.app/start/prerequisites/).

Install and run:

```sh
npm ci
npm run check
npm run tauri dev
```

Build the frontend and desktop bundles:

```sh
npm run build
npm run tauri build
```

The current development machine is Linux and did not have `webkit2gtk-4.1`
available when this scaffold was created. Frontend checks and builds can still
be run without that library; launching/building the native desktop shell needs
the platform prerequisites.

## Project structure

- `src/routes/+page.svelte` — Svelte UI entry point.
- `src/routes/+layout.ts` — static SPA mode required by Tauri.
- `src-tauri/src/lib.rs` — Rust/Tauri backend commands. Replace the starter
  `greet` command with typed, narrowly scoped configuration operations.
- `src-tauri/tauri.conf.json` — desktop window and bundling configuration.
- `AGENTS.md` — project-wide instructions for AI coding agents.
- `docs/PRODUCT_UX_CONCEPT.md` — product promise, user journeys, information
  architecture, visual direction, and MVP boundary.
- `docs/IMPLEMENTATION_GUIDE.md` — product behavior, architecture, safety,
  validation, and acceptance-test guide.
- `docs/UI_WIREFRAMES.md` — screen-by-screen low-fidelity UX and interaction
  guidance.
- `docs/FIRST_PR_CHECKLIST.md` — prioritized, bounded checklist for the first
  UI implementation PR.
- `CONTRIBUTING.md` — local setup and contribution expectations.
- `.github/workflows/ci.yml` — frontend and Rust checks across supported OSes.

## Continue development

Start with `AGENTS.md`, then follow Phase 0 in
`docs/IMPLEMENTATION_GUIDE.md`. The checked-in scaffold is intentionally only a
starting point; the guide's current-state section calls out what is and is not
implemented yet.

## Configuration references

- [Copilot CLI BYOK guide](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/use-byok-models)
- [Copilot CLI configuration directory](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-config-dir-reference)
- [Copilot CLI settings command](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/change-settings)
- Local installed CLI references: `copilot help config`,
  `copilot help providers`, and `copilot help environment`.

Copilot CLI changes over time. Treat the installed CLI's help output and
official documentation as sources of truth; do not hard-code claims about
which GitHub-hosted models or plan entitlements a user can access.

## License

MIT. See [LICENSE](LICENSE).
