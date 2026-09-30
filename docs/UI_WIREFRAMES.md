# UI wireframes

These low-fidelity wireframes describe the intended first desktop experience.
They are structure and interaction guidance, not pixel-perfect mockups.
Controls shown for future phases must be visibly disabled or omitted until
their behavior is implemented and validated; do not ship decorative buttons
that imply an operation succeeded.
Follow [`PRODUCT_UX_CONCEPT.md`](PRODUCT_UX_CONCEPT.md) for the product
rationale, first-run route choice, content voice, and MVP boundary. Example
paths, model IDs, endpoint names, versions, and ready states below are
illustrative—not detected user configuration.

## Shared app frame

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Copilot Config Studio                              [Help] [Preferences] [—□×]│
├───────────────────┬────────────────────────────────────────────────────────┤
│ SETUP             │ Page title                     [contextual primary action]│
│ CLI SETTINGS      │                                                        │
│ PROVIDERS         │ Main content                                          │
│                   │                                                        │
│                   │                                                        │
├───────────────────┴────────────────────────────────────────────────────────┤
│ ● CLI detected · Copilot CLI vX.Y · Config: ~/.copilot/settings.json       │
└──────────────────────────────────────────────────────────────────────────────┘
```

- Keep a persistent, non-sensitive CLI/config status visible without taking
  focus from the current task.
- Navigation should expose Setup, Providers, and CLI Settings in the first
  usable release. Validation belongs with the setup/profile it checks.
  Activity can be added later if a privacy-safe history is useful.
- Show the active app scope and selected provider profile. Never show a
  credential value in status text.
- The window must remain useful at a compact width: collapse navigation to
  icons with accessible names or a menu; do not force horizontal scrolling.

## Setup — first-run and configured states

The configured-state values below are illustrative synthetic values. The
prototype currently shows the explicit not-checked state only.

First-run route choice:

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ Set up Copilot CLI                                                         │
│ Choose how you want Copilot CLI to use a model.                            │
│                                                                            │
│ ┌─ GitHub Copilot ──────┐ ┌─ Local model ─────────┐ ┌─ Hosted provider ──┐ │
│ │ Use model access      │ │ Use a model server on │ │ Connect an external│ │
│ │ available to your     │ │ your device/network.  │ │ model provider.    │ │
│ │ signed-in account.    │ │ Uses your hardware.   │ │ May bill separately│ │
│ │ [Review CLI setup]    │ │ [Set up local model]  │ │ [Add provider]     │ │
│ └──────────────────────┘ └───────────────────────┘ └────────────────────┘ │
│                                                                            │
│ Availability and usage limits depend on your Copilot account and policy.   │
│ External providers may receive prompts and context and may charge fees.   │
└────────────────────────────────────────────────────────────────────────────┘
```

Do not label any route “free.” At compact widths, stack the cards vertically.
Explain hosting, data destination, and possible cost before the user saves
credentials, sends a request, or launches the CLI.

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ Your Copilot CLI setup                                                     │
│ Understand and manage the model route used by Copilot CLI.                 │
│                                                                            │
│ ┌─ Copilot CLI ────────────────────┐  ┌─ Current model route ────────────┐ │
│ │ ✓ Found: /usr/local/bin/copilot │  │ GitHub-hosted · Auto (Efficiency)│ │
│ │ Version: vX.Y.Z                 │  │ No BYOK profile active           │ │
│ │ [Recheck] [Choose executable]   │  │ [Edit CLI settings]              │ │
│ └─────────────────────────────────┘  └───────────────────────────────────┘ │
│                                                                            │
│ Next step                                                                  │
│ ┌────────────────────────────────────────────────────────────────────────┐ │
│ │ Configure a provider, or review your Copilot CLI settings.              │ │
│ │ [Set up a provider]  [Review settings]                                 │ │
│ └────────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
│ External provider billing and data handling are separate from GitHub.      │
│ Local models use your own hardware.                                        │
└────────────────────────────────────────────────────────────────────────────┘
```

Missing CLI state:

```text
⚠ Copilot CLI was not found on PATH.
  Install it or select its executable. No settings have been changed.
  [Choose executable] [Check PATH again]
```

Do not represent model entitlements or billing estimates as facts unless a
reliable, current source is available. Keep status wording limited to what was
actually detected.

## CLI settings — browse and edit

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ Copilot CLI settings                                      [Discard] [Review]│
│ Scope: User · ~/.copilot/settings.json · Loaded just now                   │
│ [Search settings…                         ] [All ▾] [Modified only □]      │
│                                                                            │
│ Model                                                                       │
│ ┌────────────────────────────────────────────────────────────────────────┐ │
│ │ model   AI model to use for Copilot CLI                                │ │
│ │ Current: auto                     [Auto (Efficiency) ▾]                │ │
│ │ Source: User settings            Note: higher-precedence values may    │ │
│ │                                  override this value.                  │ │
│ └────────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
│ Display                                                                     │
│ ┌────────────────────────────────────────────────────────────────────────┐ │
│ │ theme   Color palette                         [github ▾]               │ │
│ │ renderMarkdown   Render Markdown              [On ▾]                   │ │
│ └────────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
│ 2 unsaved changes · Unknown settings and comments will be preserved.       │
└────────────────────────────────────────────────────────────────────────────┘
```

Behavior:

- Search by key, label, or description; filter to modified fields.
- Render controls by known setting type and installed CLI version. Enum
  choices must not be guessed. Read-only/unknown values stay intact and are
  not presented as editable.
- Clearly distinguish an unset value from an explicit value.
- Show setting scope and likely overrides without pretending the app can
  inspect managed policy it cannot access.
- **Review** opens the apply preview; it does not write the file.
- Invalid JSONC, stale on-disk content, or failed validation blocks applying
  and leaves the original untouched.

## Provider profiles — list and edit

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ Providers                                                   [+ Add profile]│
│                                                                            │
│ ┌───────────────────┐  ┌─ Local Ollama ──────────────────────────────────┐ │
│ │ ● Local Ollama    │  │ Provider type      [OpenAI-compatible ▾]        │ │
│ │   OpenAI compat.  │  │ Base URL           [http://localhost:11434/v1  ]│ │
│ │                   │  │ Model              [Enter model ID…          ▾] │ │
│ │   Work gateway    │  │ API / wire mode    [Choose supported mode ▾]   │ │
│ │   + Add profile   │  │ Authentication    [No credential ▾]           │ │
│ │                   │  │ API key            [••••••••••••••] [Replace]  │ │
│ │                   │  │                                                   │ │
│ │                   │  │ [Discover models] [Check endpoint] [Save draft]│ │
│ └───────────────────┘  └───────────────────────────────────────────────────┘ │
│                                                                            │
│ Secret is stored in the operating system credential store. It is not      │
│ written to settings.json or the profile file.                              │
└────────────────────────────────────────────────────────────────────────────┘
```

Provider form details adapt to provider type:

- **OpenAI-compatible:** endpoint, optional key, model ID, wire API and
  transport where supported.
- **Azure:** resource/project endpoint, API version as required by the
  installed CLI/provider, deployment wire model, and underlying model ID where
  needed for capabilities.
- **Anthropic:** endpoint, model ID, auth method, and supported CLI options.
- Offer an autocomplete list only when discovery actually returned valid
  choices. Always retain manual model-ID entry; a discovery result does not
  prove compatibility.
- Mask stored credentials and never prefill a recoverable secret. Let users
  replace or clear a credential explicitly.
- Give fields labels and helper text; placeholder text is not a label.
- Don't persist a profile until required local checks pass. Credential
  persistence failure must be explicit.

## Validation — make evidence clear

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ Validate: Local Ollama                                                     │
│                                                                            │
│ Local preflight       ✓ Passed       Required fields and URL format checked│
│ CLI support           ✓ Passed       Copilot CLI vX.Y provider variables  │
│ Endpoint reachability ✓ Passed       Connected in 230 ms                  │
│ Model discovery       ✓ Passed       4 suggestions · refreshed just now   │
│ Live compatibility   Not run        Sends a test request to the provider │
│                                                                            │
│ A successful connection does not prove tool calling or streaming works.   │
│ A live test may send data to the provider and may incur charges.           │
│ [Run optional live test…]                         [Back to provider]       │
└────────────────────────────────────────────────────────────────────────────┘
```

For the live test, show the exact minimal test payload category (not a hidden
prompt), destination origin, whether the endpoint is local or remote, and the
possibility of provider charges. Ask for explicit confirmation immediately
before sending. Never execute tool calls returned by a test model.

Use distinct, honest states: **Not run**, **Passed**, **Warning**, **Failed**,
**Timed out**, and **Canceled**. Every result says what was checked and when.
Do not use one green "Working!" badge for checks with different evidence.

## Apply preview — deliberate, reversible changes

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ Review changes                                                             │
│ These changes affect your Copilot CLI user settings.                        │
│                                                                            │
│ settings.json                                                              │
│   model:       "auto" → "gpt-5-mini"                                       │
│   autoTier:    "balance" → "efficiency"                                   │
│   Unrelated settings and comments will be preserved.                       │
│                                                                            │
│ Backup: settings.json.backup-<timestamp>                                   │
│ No API key will be written to this file.                                   │
│                                                                            │
│ [Cancel]                                      [Apply changes]               │
└────────────────────────────────────────────────────────────────────────────┘
```

- Show exact changed keys and scope; hide secrets even if a field was changed.
- Explain backup and rollback location before applying.
- If the file changed since it was loaded, stop and offer reload/compare. Do
  not overwrite external edits.
- After apply, reread and compare values; report file verification separately
  from provider inference compatibility.
- Provide a post-apply outcome with a link/action to reveal the backup
  location, not an unverified success toast.

## Launch confirmation

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ Launch Copilot CLI with Local Ollama?                                      │
│                                                                            │
│ This starts: /path/to/copilot                                             │
│ Provider: Local Ollama · http://localhost:11434                            │
│ Model: qwen2.5-coder:14b                                                  │
│                                                                            │
│ The selected profile is passed only to the new Copilot process.            │
│ Prompts/context go to this provider. No profile secret is shown below.     │
│                                                                            │
│ [Cancel]                                         [Launch Copilot CLI]       │
└────────────────────────────────────────────────────────────────────────────┘
```

Use a native child-process API with explicit executable, argument list, and
child-only environment. Do not build a shell command from form values. Explain
whether a terminal/window will open and keep provider credentials out of
visible command text and logs.

## Responsive and accessibility notes

- At wide sizes, use a stable navigation rail and two-column overview/forms.
- At narrow sizes, stack cards and fields, collapse the rail, and preserve
  visible section context. Avoid fixed minimum widths that clip content.
- Keyboard users can reach navigation, fields, suggestions, dialogs, and
  actions in logical order; dialogs trap focus and restore it on close.
- Suggestions support arrow-key navigation, Enter selection, Escape dismissal,
  and manual input without requiring a mouse.
- Pair color/status icons with text; do not convey validation status by color
  alone. Honor reduced-motion preferences.
- Use accessible names and descriptions for icon-only controls and announce
  asynchronous completion/errors to assistive technology.
