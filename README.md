# Copilot Config Studio

A cross-platform desktop companion for configuring GitHub Copilot CLI and its
bring-your-own-key (BYOK) model providers. The goal is to make model setup
discoverable, validate configurations before use, and show clearly what the
app will change.

**Project page and browser click dummy:** [merlin-tribukait.github.io/copilot-config-studio](https://merlin-tribukait.github.io/copilot-config-studio/)

**Report a bug or suggest an improvement:** [open a GitHub issue](https://github.com/merlin-tribukait/copilot-config-studio/issues/new)

> **Status:** early concept prototype. The Svelte screen includes an
> project overview, interactive route chooser, provider setup click dummy,
> in-memory profile and workspace previews, and session-only appearance
> customization with named editable color profiles and per-workspace palette
> overrides. Local required-field/URL checks are not provider compatibility
> tests. It does not discover integrations or workspaces, persist settings,
> send provider requests, store credentials, or launch Copilot CLI. The web
> page is a demonstration, not a hosted configuration service. See
> [AGENTS.md](AGENTS.md), [docs/PRODUCT_UX_CONCEPT.md](docs/PRODUCT_UX_CONCEPT.md),
> [docs/IMPLEMENTATION_GUIDE.md](docs/IMPLEMENTATION_GUIDE.md), and the
> [click dummy guide](docs/CLICK_DUMMY_GUIDE.md) and [brand asset guide](docs/BRAND_ASSETS.md).

## Try the click dummy

Open the [browser demo](https://merlin-tribukait.github.io/copilot-config-studio/)
and choose **Try the interactive click dummy**. The setup, provider, profile,
workspace, and appearance screens demonstrate intended interaction patterns;
values are in-memory drafts and reset when the page reloads.

The provider walkthrough only checks required fields and URL shape locally.
Use obviously fictional values. It does not check network connectivity,
provider compatibility, model availability, account entitlement, or cost.
Workspace paths are manually typed placeholders and are never opened or
discovered. No credentials should be entered.

Use the **Feedback** button to draft a bug report, feature request, usability
note, or question. It opens a prefilled GitHub issue composer with the selected
page, UI area, and viewport dimensions. The title and description you
intentionally enter are included when opening that draft. Review and edit it
on GitHub before submitting; you must be signed in. The demo does not read or
attach app configuration values, workspace paths, provider URLs, prompts,
credentials, or device files. Never put secrets or private prompts in a public
issue. Security issues must follow [SECURITY.md](SECURITY.md), not the public
feedback form.

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
- Offer an explicit global default profile, optional per-workspace overrides,
  and user-controlled integration discovery once safe local integrations are
  implemented.

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
npm test
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

- `src/routes/+page.svelte` — project overview, interactive click dummy, and
  context-aware GitHub issue composer.
- `.github/workflows/pages.yml` — tests, builds, and publishes the web demo to
  GitHub Pages on changes to the application.
- `.github/ISSUE_TEMPLATE/` — structured bug and feature request templates.
- `src/lib/github-feedback.ts` — privacy-limited GitHub issue draft URL helper.
- `static/brand/` — editable SVG icon, monochrome mark, and wordmark artwork.
- `src-tauri/icons/` — generated desktop and mobile application icon sizes.
- `docs/BRAND_ASSETS.md` — logo variants, usage guidance, and source files.
- `src/routes/+layout.ts` — static SPA mode required by Tauri.
- `src-tauri/src/lib.rs` — Rust/Tauri backend commands. Replace the starter
  `greet` command with typed, narrowly scoped configuration operations.
- `src-tauri/tauri.conf.json` — desktop window and bundling configuration.
- `AGENTS.md` — project-wide instructions for AI coding agents.
- `docs/PRODUCT_UX_CONCEPT.md` — product promise, user journeys, information
  architecture, visual direction, and MVP boundary.
- `docs/CLICK_DUMMY_GUIDE.md` — complete click-through instructions, feature
  boundaries, feedback flow, and privacy details.
- `docs/IMPLEMENTATION_GUIDE.md` — product behavior, architecture, safety,
  validation, and acceptance-test guide.
- `docs/UI_WIREFRAMES.md` — screen-by-screen low-fidelity UX and interaction
  guidance.
- `docs/FIRST_PR_CHECKLIST.md` — prioritized, bounded checklist for the first
  UI implementation PR.
- `CONTRIBUTING.md` — local setup and contribution expectations.
- `.github/workflows/ci.yml` — frontend and Rust checks across supported OSes.

## Continue development

Start with `AGENTS.md`, then read the current-state section and next incomplete
phase in `docs/IMPLEMENTATION_GUIDE.md`. The browser page is a click dummy,
not a working configuration manager; its guide identifies which actions are
illustrative and which checks actually run.

GitHub Pages is built by `.github/workflows/pages.yml` with the project
subpath configured for this repository. The workflow tests and type-checks
before publishing; it runs on pushes to `main` that change the frontend or
deployment workflow.

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
