# Instructions for AI coding agents

## Mission

Build Copilot Config Studio as a small, safe, cross-platform desktop app for
managing GitHub Copilot CLI settings and BYOK providers. Read the project
overview in `README.md`, product framing in `docs/PRODUCT_UX_CONCEPT.md`,
screen flows in `docs/UI_WIREFRAMES.md`, and the behavioral specification in
`docs/IMPLEMENTATION_GUIDE.md` before implementing UI features.

## Non-negotiable safety and correctness

- Treat API keys, bearer tokens, custom authorization headers, and provider
  command output as secrets. Never put them in logs, UI diagnostics, crash
  messages, URLs, process arguments, plaintext JSON, or test snapshots.
- Do not write secrets to Copilot's `settings.json`, shell startup files, or
  global process environment. Store credentials in an OS credential store.
  When launching Copilot CLI, pass secrets only through the child process
  environment and redact all displayed process details.
- Never run a shell command assembled from form input. Use Tauri/Rust process
  APIs with an executable and argument list. Validate executable paths and
  provider URLs; do not silently bypass TLS verification.
- Show a diff/summary and ask for confirmation before changing user files.
  Back up files before applying. Write atomically, preserve unrelated
  settings/comments where feasible, and detect external edits before replacing
  a file.
- Do not claim a provider/model is free, available under the user's GitHub
  plan, or compatible solely because it appears in a list. Distinguish
  GitHub-hosted models from BYOK models and local models.
- Do not execute a live model request during background discovery. A live
  compatibility test can incur charges or transmit prompt data: explain this
  and require an explicit user action.
- Surface errors with actionable detail. No broad catch-and-ignore behavior,
  false success, or silent fallback.

## Implementation conventions

- Keep the Svelte UI typed, accessible by keyboard, and usable at different
  window sizes. Use Svelte 5 conventions already in the scaffold.
- Keep filesystem, process, and credential operations in narrowly scoped Rust
  Tauri commands. Validate arguments again on the Rust side; frontend
  validation is for usability, not a security boundary.
- Avoid giving the frontend broad filesystem/shell permissions. Add only
  specific capabilities/plugins needed by an implemented feature.
- Use `jsonc-parser` for Copilot JSONC settings. Preserve unknown settings and
  existing comments. Validate JSONC before preview or apply.
- Make provider discovery asynchronous, cancellable where practical, and
  bounded by request timeouts. Never expose a secret to model-listing endpoints
  other than the configured provider.
- Prefer official CLI help output and official documentation for supported
  settings, provider variables, and model IDs. Handle unsupported/older CLI
  versions explicitly.
- Add tests alongside each feature. Test validation, secret redaction, failed
  writes, atomic replacement, backup/restore, and preservation of unknown
  settings—not only the happy path.
- Keep `README.md` and `docs/IMPLEMENTATION_GUIDE.md` current with user-visible
  behavior and setup steps.

## Working loop

1. Read the relevant guide section and inspect existing code before editing.
2. Implement one vertical feature at a time with proper error states.
3. Run `npm run check` and `npm run build`; run Rust tests/checks for backend
   changes. Native Tauri builds also require the host OS development libraries.
4. Report the exact checks run, any unavailable platform checks, and remaining
   limitations. Do not say a live configuration was validated unless the
   actual check ran and its result is known.

## Current scaffold state

The frontend contains a project overview for the GitHub Pages build, an
interactive setup-route concept, provider setup click dummy, in-memory
global/workspace profile previews, opt-in discovery-source controls, and
session-only appearance settings with named editable color profiles and
workspace-specific palette overrides. The provider draft form performs only
local required-field and URL-shape checks. The Feedback dialog prepares a
prefilled GitHub issue URL containing the visitor's entered report plus the
current prototype page, selected UI area, and viewport size; it does not submit
the issue automatically or collect app configuration values. No profile or
workspace path is persisted; discovery controls do not scan or inspect the
device. Nothing reads/writes configuration, contacts a provider, stores
credentials, or launches the CLI. CLI Settings remains a placeholder. The
GitHub Pages workflow builds with the `/copilot-config-studio` base path; the
native app build must retain its root base. Brand source artwork and usage
guidance are in
`static/brand/` and `docs/BRAND_ASSETS.md`; product rationale is in
`docs/PRODUCT_UX_CONCEPT.md`, with rough layouts in `docs/UI_WIREFRAMES.md`.

The Rust backend still contains the starter `greet` command, which should be
removed in the first native-backend change. Dependencies for `jsonc-parser`
and xterm are installed. xterm is unused and should be removed unless a
specific terminal feature is approved. No settings editor, provider registry,
credential storage, validation, or Copilot launch flow exists yet.
