# Product and UX concept

This concept gives Copilot Config Studio a clear product shape and guides the
initial interactive UI prototype. It is a decision guide for design and
implementation, not evidence of user research or a claim that any pictured
state already works.

The current prototype includes a browser-memory-only provider form, local
format checks, a draft review/finish walkthrough, global configuration
profiles, workspace overrides, opt-in discovery-source controls, and
appearance customization. Named color profiles group editable brand/focus,
surface, and text/border colors; a workspace can inherit the global palette or
select its own. None of these profiles persist data or inspect the device;
appearance choices last only for the current session. Format checks are not
provider connectivity, model availability, CLI support, or persistence checks.

## Product idea

**Copilot Config Studio is a calm setup workbench for Copilot CLI.** It helps
people understand which model route they are configuring, safely prepare it,
and see what has and has not been verified.

It is not a model marketplace, an account-plan manager, or a promise of free
inference. The interface must make the distinction between GitHub-hosted
Copilot, a model running on the user's machine, and a separately billed hosted
provider visible at the point of choice.

### Product promise

> Know what will change, where your prompts will go, and what was actually
> checked—before you apply settings or launch Copilot CLI.

### Primary audience and jobs

Avoid fictional personas. Design around these user situations:

1. **“I already use Copilot CLI; help me understand and adjust its setup.”**
   Discover the installed CLI and current settings, then inspect/edit
   supported preferences without losing unrelated config.
2. **“I want to try a local model with Copilot CLI.”** Connect to a local
   provider such as Ollama, discover or enter a model ID, validate what can be
   checked locally, and launch only after reviewing the route.
3. **“I have a provider endpoint and credentials.”** Configure a hosted
   provider, understand data/cost implications, test deliberately, and keep
   credentials protected.

Whether these are the right top-level jobs should be validated with real users
before finalizing navigation or terminology.

## UX principles

1. **Route before settings.** First make clear whether the user wants
   GitHub-hosted Copilot, a local model, or an external provider; then show
   only the relevant choices.
2. **Trust is part of the interface.** Say what is local, what leaves the
   device, which file is edited, and when a credential is used.
3. **No surprise writes or requests.** Discovery, live inference checks,
   saving secrets, applying settings, and launching each have explicit user
   actions and distinct outcomes.
4. **Evidence, not green badges.** Separate local validation, CLI capability,
   reachability, model listing, live compatibility, and settings-file
   verification.
5. **Progressive disclosure.** Present the short path first. Reveal API wire
   mode, token limits, custom headers, and advanced settings when needed.
6. **Manual entry stays possible.** Model-list endpoints are optional and
   incomplete; autocomplete assists but does not dictate.
7. **Recovery is a first-class path.** Preview edits, make backups, preserve
   unknown settings/comments, detect concurrent edits, and explain how to
   restore.
8. **Utility over dashboard decoration.** Prefer a clear next action and
   actionable state over charts, scores, or gamified setup completion.

## Information architecture

Keep the first release to three primary destinations:

```text
SETUP
  Current route summary
  Start or resume provider setup
  Readiness checks and next actions

PROVIDERS
  Profile list
  Provider setup/edit
  Model selection and provider-specific advanced options
  Validation results

CLI SETTINGS
  Searchable, version-aware user settings
  Change review and apply
```

Shared shell:

- App identity and compact global status.
- Current workspace/page title and contextual action.
- Profile and appearance destinations for defaults, workspace overrides, and
  interface preferences.
- Named palette profiles with grouped color controls and per-workspace
  appearance overrides, visibly marked as session-only.
- Help/about only when it has real behavior.
- Status text should never reveal keys, tokens, auth headers, or private model
  response content.

Keep validation embedded in the setup step/profile it belongs to, rather than
making an empty top-level “Validation” destination before validation exists.
Likewise, defer Activity until there is a meaningful, privacy-safe history.

## First-run journey

### Step 1: Understand the current environment

On launch, show a truthful checking state while the app inspects only local
CLI/config metadata. If detection is not yet implemented or fails, say so
plainly and offer the supported next step. Do not use a sample path/version
that looks real.

### Step 2: Choose the route

Ask **“How do you want Copilot CLI to use a model?”** with three balanced
options:

| Choice | Supporting explanation | Primary action |
|---|---|---|
| GitHub Copilot | Use the model choices available to the signed-in Copilot CLI account. Availability and limits depend on the account/policy. | Review CLI setup |
| Local model | Connect to a model server running on this device or local network. Provider API charges may be avoided, but hardware is used. | Set up local provider |
| Hosted provider | Connect to a compatible provider endpoint. Provider billing and data handling are separate from GitHub Copilot. | Add provider |

Avoid “free model” as a route label. The app cannot promise account entitlement,
unmetered availability, or that a model listing represents zero cost.

### Step 3: Configure the minimum

For a local route, ask for provider type, endpoint, and model. Start with
manual model entry and offer **Discover models** as an explicit helper action
when supported.

For a hosted provider, ask for type, endpoint, model/deployment, and
authentication method. Reveal credentials and advanced protocol details only
when needed. Explain where the key will be stored before saving it.

For GitHub-hosted Copilot, do not ask the user to re-enter a GitHub token.
Guide them to the existing CLI sign-in/setup path and inspect supported
settings only when implemented.

### Step 4: Review and validate

Show independent results rather than one overall “ready” score:

- Local fields/configuration: **Checked / Needs attention**
- Copilot CLI support: **Checked / Unknown / Unsupported**
- Endpoint reachability: **Not run / Passed / Failed**
- Model discovery: **Not run / Available / Unsupported**
- Live compatibility: **Not run** until explicitly requested
- Settings change: **Not applied / Applied and reread**

Before a live test, show its destination, data transmission, and possible
provider cost. Never execute tools returned during a model test.

### Step 5: Confirm and launch

Preview the target route, changed settings, backup, executable, and data
destination. Then let the user explicitly apply changes or launch Copilot CLI.
Report the result from the actual process/file outcome.

## Visual direction: “Workbench”

Use a focused desktop utility aesthetic: compact but breathable, legible
technical labels, quiet surfaces, clear focus, and one obvious primary action
per page. It should feel at home next to a terminal without imitating a
terminal, GitHub settings page, or AI chat interface.

### Layout

- Desktop: narrow persistent navigation rail, generous main content column,
  and contextual right-side detail only for complex validation/review.
- Window resizing: reflow provider forms from two columns to one; avoid
  horizontal scrolling.
- Compact width: collapse navigation to a labeled menu; keep headings and
  contextual back navigation visible.
- Forms: labels above controls, helper/error text adjacent, related advanced
  fields grouped in a disclosure section.
- Review: use a readable diff/summary with changed keys, old/new values, scope,
  backup path, and a clear cancel/apply distinction.

### Color and typography

- Build semantic CSS tokens (`canvas`, `surface`, `surface-muted`,
  `foreground`, `foreground-muted`, `border`, `accent`, `success`, `warning`,
  `danger`, `focus-ring`) so light/dark/high-contrast modes can be changed
  without restyling components.
- Use Primer Primitives as an optional reference/source for compatible
  semantic tokens, while retaining product identity; do not copy GitHub
  branding, marks, or exact page layouts.
- Keep neutral surfaces dominant. Reserve the accent color for primary
  actions, active navigation, and focus. Status colors always have text/icon
  labels and meet contrast requirements.
- Use a system sans-serif for interface text and a system monospace for paths,
  environment variable names, model IDs, and diffs. Avoid long all-monospace
  screens.
- Select final token values only after rendering both light and dark themes
  and checking contrast; avoid freezing arbitrary colors in this concept.

### Component language

- **Route card:** title, who hosts it, where data goes, concise cost/hardware
  note, and a single selection action.
- **Profile row:** profile name, provider kind, endpoint locality/host, model
  ID, and a text readiness summary; never show secret values.
- **Field group:** persistent label, control, help, inline validation, and
  optional “advanced” disclosure.
- **Check row:** named check, evidence summary, timestamp/source, and a
  contextual next action.
- **Notice:** direct, non-alarmist message with cause and recovery action.
- **Review diff:** explicit before/after with secret redaction and no
  success-shaped fallback.
- **Confirmation dialog:** reserved for applying, deleting, or transmitting
  data; ordinary navigation should not use modal confirmation.

## Content voice

Use concise, plain language and explain technical terms at the point they
matter. Prefer:

- “This will send a test request to `provider.example`.”
- “Connected to the endpoint. Tool calling has not been tested.”
- “This changes your Copilot CLI user settings. A backup will be created.”
- “No model list is available from this endpoint. You can enter an ID.”

Avoid:

- “100% free,” “works perfectly,” or “all set” without evidence.
- “Connected” when only a URL passed local format checks.
- “Save” when the action also makes a live model request.
- Raw exception dumps, opaque numeric error codes, or provider response bodies
  containing sensitive data.

## MVP boundary

### First UI slice

- Replace the starter welcome page with the Workbench shell and a truthful
  Setup route chooser/not-detected state.
- Add useful navigation destinations for Setup, Profiles, Providers,
  Appearance, and CLI Settings, clearly marking operations not yet implemented.
- Preview a global default profile and manually entered workspace overrides;
  keep discovery-source selection opt-in and do not inspect paths or tools.
- Preview system/light/dark/dimmed themes and accents without persistent
  preferences.
- Establish semantic design tokens, accessible focus/status treatment, and
  responsive layouts.
- Do not show fake CLI detection, models, provider profiles, validation
  success, Apply, or Launch behavior.

### Add only when end-to-end behavior exists

- Provider editing once profiles and safe persistence exist.
- Model autocomplete once the selected provider's discovery flow is tested.
- Live validation once its privacy/cost confirmation and error handling exist.
- Apply review once atomic writes, backups, conflict detection, and reread
  verification exist.
- Launch actions once child-process environment handling and secret redaction
  are tested.

## Design review acceptance questions

Before accepting a screen, answer:

1. Can a new user tell which route is selected and who hosts the model?
2. Can they tell whether information stays local or is sent remotely?
3. Are cost and availability phrased as known facts vs unknown/plan-dependent?
4. Does every button perform the behavior it promises?
5. Are not-run, failed, partial, and successful checks distinguishable?
6. Can the main task be completed with keyboard only and at text scaling?
7. Are errors actionable and is recovery clear?
8. Are risky actions separate from discovery/navigation and explicitly
   confirmed?
9. Has the screen been reviewed at compact and desktop sizes in light and
   dark/high-contrast modes?
10. What usability/accessibility/platform evidence is still missing?

## Open questions for later validation

- Do users understand “BYOK,” or should the UI use “your own provider” and
  introduce the acronym only in help text?
- Should the main Setup page show GitHub-hosted Copilot and provider routes as
  peer choices, or should existing Copilot CLI users start with detected
  configuration?
- Which local servers and model-list protocols matter most to the target
  audience?
- Do users prefer a persistent provider profile or a one-time launch setup?
- Which settings need plain-language descriptions beyond the installed CLI
  help?

Do not settle these by agent preference alone; validate with user feedback or
record a reversible decision and its evidence.
