# Instructions for AI coding agents

## Mission

Build Copilot Config Studio as a small, safe, cross-platform desktop app for
managing GitHub Copilot CLI settings and BYOK providers. Read the project
overview in `README.md` and the behavioral specification in
`docs/IMPLEMENTATION_GUIDE.md` before implementing features.

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

This is an unimplemented starter scaffold. The frontend page still contains
the Tauri/Svelte greeting demo and the Rust backend contains the starter
`greet` command. Dependencies for `jsonc-parser` and xterm are installed.
Neither xterm nor a terminal emulator is a product requirement; do not include
one unless there is a concrete, safe UX case. No settings editor, provider
registry, credential storage, validation, or Copilot launch flow exists yet.
