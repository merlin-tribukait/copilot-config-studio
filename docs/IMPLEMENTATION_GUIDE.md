# Implementation guide

This document is the handoff specification for continuing Copilot Config
Studio in a later session. It describes the product, the safe configuration
model, implementation order, and acceptance criteria. Re-check official
documentation and the installed Copilot CLI help before relying on details:
the CLI and provider support evolve.

## Product goal

Build an approachable, windowed, cross-platform setup tool for people who use
GitHub Copilot CLI and want to configure either:

1. GitHub-hosted Copilot models and CLI preferences; or
2. their own provider/model through Copilot CLI's BYOK environment variables,
   including a local model server such as Ollama.

The app is configuration/launch assistance, not a model host, a GitHub plan
upgrade, or a promise of free inference. A local model avoids provider API
charges but uses the user's hardware. Hosted providers can charge separately
from GitHub Copilot. Show these distinctions clearly.

The core interaction should be: **discover current setup → edit → validate →
preview → explicitly apply or launch → show result**. Never make an unreviewed
system change on startup.

## Scope

### In scope

- Linux, macOS, and Windows desktop builds from Tauri 2.
- Copilot CLI user configuration: read/edit `settings.json` (JSONC), including
  validated settings and model/Auto tier choices exposed by the installed CLI.
- BYOK profiles for provider types documented by Copilot CLI: `openai`
  (OpenAI-compatible endpoints, Ollama, vLLM, Foundry Local), `azure`, and
  `anthropic`.
- Endpoint/model discovery when an endpoint offers a compatible model-list
  endpoint, with a manual model-ID option for providers without discovery.
- Local validation, explicit optional live inference testing, safe apply, and
  an explicit launch of Copilot CLI with a selected provider profile.
- Helpful status for missing CLI, unsupported CLI/version, unreachable
  endpoint, invalid JSONC, invalid URL, missing required model, unavailable
  credential store, rejected credentials, timeout, and write failure.

### Out of scope for the first usable release

- Managing Copilot settings in VS Code or other products.
- Managing GitHub subscriptions, account entitlements, organization policy, or
  model allow-lists. The app cannot infer all of these from the local machine.
- Inventing undocumented Copilot CLI provider integrations or model APIs.
- Automatically adding secrets to shell profiles or writing credentials into
  Copilot settings.
- Arbitrary terminal command execution from the UI.

## Current repository state

The repository is at `/home/hack/Projects/copilot-config-studio`.

- Scaffold: Tauri 2 + SvelteKit + Svelte 5 + TypeScript.
- Static SPA mode is set in `src/routes/+layout.ts`.
- `src/routes/+page.svelte` is still the untouched greeting demo.
- `src-tauri/src/lib.rs` is still the greeting-command demo.
- `jsonc-parser`, `@xterm/xterm`, and `@xterm/addon-fit` have been added.
  `jsonc-parser` supports the planned JSONC editor. The xterm packages are
  currently unused; remove them if no actual terminal panel is implemented.
- There is no settings UI, settings schema, provider profile store, secure
  credential store, provider/model discovery, validation, launch, or test
  suite yet.
- This environment did not have `webkit2gtk-4.1` when scaffolded. Install the
  official Tauri Linux prerequisites before native Linux `tauri dev/build`.
- The generated package installs completed. `npm install` reported three low
  severity advisories; inspect with `npm audit` and make a deliberate,
  compatible update rather than applying a breaking forced fix.
- Copilot CLI references observed in this environment: `copilot help config`
  enumerates settings; `copilot help providers` documents BYOK variables and
  examples; `copilot help environment` lists relevant environment variables.
  Do not assume another user's CLI has the same version or model set.

## UX outline

Use a simple left navigation or top tabs:

1. **Overview** — detected Copilot CLI path/version, current model mode, active
   provider profile, and clear setup/validation status.
2. **Copilot settings** — search/filter settings from the installed CLI's
   supported settings catalog, with type-aware inputs, descriptions, valid
   enum choices, scope, current value, and source/override warnings.
3. **Providers** — profile list and form for provider type, base URL, wire/API
   mode, model ID, optional distinct wire model, token limits, auth method,
   custom headers, and secret input. Show locally discovered models as
   autocomplete suggestions but always permit deliberate manual entry.
4. **Validate** — run preflight checks and display separate results for local
   validation, endpoint reachability, model listing, credentials, and optional
   live tool/streaming compatibility.
5. **Apply / Launch** — review proposed settings changes and profile selection,
   then confirm. Offer a clear button to launch Copilot CLI with the profile.
6. **Activity** — safe, redacted history of outcomes and timestamps; never
   retain prompt bodies, API keys, auth headers, or raw sensitive provider
   responses.

Use keyboard-accessible controls, focus indication, labels, and responsive
layout. Give every asynchronous operation a loading state, timeout/cancel
behavior where feasible, and a useful error state. Do not make a console/log
pane that can reveal secrets.

## Configuration model

### Copilot settings

- Detect `copilot` from PATH first; allow the user to select an executable
  explicitly if it is not found. Do not assume shell aliases/functions are
  available to a spawned process.
- Query `copilot --version`, `copilot help config`, and (where relevant)
  `copilot help providers` using an argv-based process call and a timeout.
- Resolve Copilot home using `COPILOT_HOME` if set, otherwise the documented
  default `~/.copilot`. Respect the current process environment and provide a
  visible resolved path. Do not invent XDG rules.
- Read `settings.json` as JSONC. Treat legacy values in `config.json` according
  to the current official docs, but do not modify the CLI-managed
  `config.json` directly.
- Build the form catalog from CLI help output when robust parsing is possible;
  retain a versioned curated schema as a fallback. If the installed CLI
  format cannot be parsed, show that fact and let the user edit known settings
  only. Never delete or rewrite unrecognized settings.
- Do not persist secrets in this file. Before save: validate JSONC and values,
  compare the on-disk file fingerprint/mtime with the version loaded, show a
  diff, create a timestamped backup, write a temporary sibling file, flush if
  practical, and atomically replace. On failure, keep the original intact and
  report the error.
- Test persistence by rereading the new file and validating it. A reread only
  verifies file content, not that Copilot accepts every setting; label these
  checks accurately.
- Settings precedence can be affected by managed policy, user settings,
  repository settings, local settings, environment variables, and command-line
  flags. Show the scope and warn when a higher-precedence value may override
  the value being edited. Do not change repository files unless the user
  explicitly chooses that scope.

### BYOK provider profiles

Copilot CLI BYOK is configured with environment variables when starting the
CLI. Important values documented by the installed CLI include:

- `COPILOT_PROVIDER_BASE_URL` (required to activate BYOK)
- `COPILOT_PROVIDER_TYPE` (`openai`, `azure`, or `anthropic`)
- `COPILOT_PROVIDER_API_KEY`, `COPILOT_PROVIDER_API_KEY_COMMAND`, or
  `COPILOT_PROVIDER_BEARER_TOKEN`
- `COPILOT_PROVIDER_WIRE_API` (`completions` or `responses`)
- `COPILOT_PROVIDER_TRANSPORT` (`http` or `websockets`)
- `COPILOT_PROVIDER_AZURE_API_VERSION`
- `COPILOT_PROVIDER_HEADERS`
- `COPILOT_MODEL`, `COPILOT_PROVIDER_MODEL_ID`,
  `COPILOT_PROVIDER_WIRE_MODEL`
- `COPILOT_PROVIDER_MAX_PROMPT_TOKENS`,
  `COPILOT_PROVIDER_MAX_OUTPUT_TOKENS`

Verify all current names, provider-specific requirements, defaults, and wire
API limitations against `copilot help providers` and official documentation
at runtime/development time. In particular, GPT-5-series models may require
the documented Responses API; do not silently choose a protocol.

Store non-secret profile fields in an app-owned configuration file with
restrictive OS permissions. Store credential values using the platform
credential manager/keychain (e.g. an actively maintained cross-platform
keyring library or Tauri plugin). If a secure store is unavailable, fail
closed for credential persistence: allow a one-shot launch secret only if it
can be kept in memory, and explain that it will not be saved.

Do not use a plaintext `.env`, shell startup file, Copilot `settings.json`,
command-line argument, or activity log as a secret store. Avoid retaining API
keys in Svelte state longer than necessary; clear form values after successful
secure storage. Do not place credentials in exception text.

Launch Copilot with a safe OS process API, passing the explicit executable,
discrete arguments, and a child-only environment. Never concatenate untrusted
form data into a shell command. Make it clear that launching a remote provider
will transmit prompts and context to that provider. Redact credentials from
all diagnostics and error output.

## Autocomplete and validation

### Model suggestions

- Endpoint discovery should be explicitly triggered or run after entering a
  provider URL; use the selected provider's documented endpoint and auth
  scheme. Use bounded timeouts, respect TLS verification, and report HTTP
  status without including secret response fields.
- For OpenAI-compatible servers, `/v1/models` is a common listing route; confirm
  provider-specific behavior. Local Ollama versions/configurations vary.
- Do not assume Anthropic or Azure expose the same list API as OpenAI; permit a
  manual model/deployment ID.
- Suggestions are metadata, not a claim that inference, tool use, streaming, or
  billing will work. Clearly mark source and last-refreshed time.
- Never send credentials to an origin other than the configured endpoint.

### Validation levels

Make validations separate buttons/checks so users know what ran:

1. **Local preflight (no network):** required values, URL scheme/host, provider
   type, mutually-exclusive credential choices, custom header syntax, model
   fields, numeric token limits, CLI executable and version.
2. **Reachability:** request the configured endpoint with a short timeout;
   distinguish DNS, TLS, refused connection, HTTP errors, and authentication
   failures.
3. **Model discovery:** request a model list if supported and autocomplete
   selection.
4. **Optional live compatibility check:** only after an explicit click and
   warning. Make the smallest harmless request possible, advertise that prompt
   data is transmitted and a hosted provider may bill, test streaming and tool
   calling if safely supported, and do not execute returned tool calls.
5. **Apply verification:** reread settings/profile after an atomic write,
   compare the intended values, and report actual outcome. This does not prove
   Copilot CLI will accept a specific upstream inference request.

Never describe level 1–3 as proof that a model "works." Reserve that claim for a
completed live compatibility check, and state exactly which properties were
tested.

## Suggested implementation phases

Complete phases as working vertical slices; keep this document updated.

### Phase 0 — Clean scaffold and portability

- Replace the Svelte greeting screen with an app shell, navigation, visual
  system, status bar, and responsive layout.
- Replace or remove the Rust greeting command.
- Configure app identity/window title, error boundary, and a usable app icon.
- Add formatter/lint/test scripts only if they are used in CI.
- Verify Svelte checks and production frontend build.

### Phase 1 — Read-only diagnostics

- Add typed Rust commands for CLI detection/version/help capture and resolved
  Copilot configuration paths.
- Add frontend types and error/result schemas.
- Render the detected setup and supported settings without mutating any file.
- Unit-test CLI output parsing with saved sanitized fixtures for multiple
  versions; handle missing/malformed output.

### Phase 2 — Safe settings editor

- Load JSONC settings and known schema; add search, type-aware fields, dirty
  tracking, source/scope annotations, and unknown-field preservation.
- Add validation, diff preview, external-change detection, backup, atomic
  apply, reread verification, and error recovery.
- Test comments and unknown fields, malformed input, stale file conflicts,
  backup creation, interrupted/failed replace, and invalid setting values.

### Phase 3 — Provider profiles and secure credentials

- Decide and document app-owned profile path/schema and profile migration
  versioning.
- Integrate cross-platform secret storage with clear get/set/delete semantics.
- Implement OpenAI-compatible, Azure, and Anthropic profile forms with
  provider-specific validation and manual model entry.
- Add secret-redaction tests and verify credentials never enter persistent
  profile JSON, logs, frontend error text, or process arguments.

### Phase 4 — Discovery, validation, launch

- Implement bounded network requests and provider-specific model discovery.
- Implement the distinct validation levels in this guide.
- Launch the installed Copilot CLI with argv and child-only environment.
- Add confirmation, user-facing data-transmission/billing notice, cancellation,
  timeout, and redacted operation outcomes.
- Mock endpoints/processes in tests; do not require real keys/network for CI.

### Phase 5 — Cross-platform delivery

- Test on Linux, macOS, and Windows (native runners where possible).
- Add CI for frontend checks, Rust formatting/lints/tests, and platform
  packaging. Keep signing/notarization secrets out of the repository.
- Document package formats, installation, upgrades, config backup/recovery,
  uninstall behavior, and supported versions.
- Review accessibility, security, dependency licenses/advisories, and the
  public release checklist.

## Commands and checks

Run from the project root:

```sh
npm ci
npm run check
npm run build
npm run tauri dev
```

For native code changes:

```sh
cd src-tauri
cargo fmt --check
cargo test
cargo clippy --all-targets --all-features -- -D warnings
```

`npm run tauri dev` and `npm run tauri build` need host Tauri prerequisites.
On Linux, consult Tauri's official prerequisite list for the distribution's
GTK/WebKitGTK development packages. On Windows/macOS, validate on native hosts
or CI; cross-compiling the Rust crate alone does not verify the desktop bundle.

## Definition of done for a usable first release

- A new user can see their current CLI status and understand whether they are
  using GitHub-hosted Copilot or a BYOK provider.
- The UI only offers setting edits valid for that installed CLI version, and
  reports possible policy/scope overrides.
- A user can configure a supported provider with manual model input even if
  endpoint discovery is unavailable.
- API credentials are kept out of plaintext files, logs, URLs, process args,
  and error messages.
- Before changes are applied, the user sees a clear preview; failures preserve
  the previous configuration and present recovery guidance.
- No network/inference request occurs without user intent; live checks warn
  about data transmission and possible provider cost.
- Each validation result states exactly what was checked; no false claim that
  endpoint reachability proves tool use or model compatibility.
- Automated checks pass and builds are validated on supported native OSes.
- README explains setup, scope, security behavior, limitations, and community
  contribution steps. The license file matches the declared package license.
