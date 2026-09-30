# First pull request checklist

This is the prioritized, bounded plan for the first implementation PR. It
turns the scaffold into a coherent, testable app shell without prematurely
implementing config writes, provider networking, credentials, or process
launch. Continue the deeper feature work from
[`IMPLEMENTATION_GUIDE.md`](IMPLEMENTATION_GUIDE.md).

## PR goal

Replace the starter greeting screen with a polished, responsive, accessible
app shell and Overview empty/detected states. Add the smallest useful typed
UI primitives and tests. It must remain an honest prototype: do not show
fabricated CLI detection, validation success, provider data, or working
settings.

## Priority 0 — required in this PR

### 1. Remove scaffold demo behavior

- [ ] Replace the Tauri/Svelte greeting page in `src/routes/+page.svelte`.
- [ ] Remove the unused `greet` Tauri command from `src-tauri/src/lib.rs`.
- [ ] Remove unused xterm dependencies unless the approved wireframes now
  include a concrete terminal feature. A terminal emulator is not required
  for this project.
- [ ] Update window/product labels and basic document metadata to consistently
  say **Copilot Config Studio**.

**Done when:** no Tauri/Svelte welcome logos, greeting form, or unused greet
command remains; no terminal dependency remains without an implemented use.

### 2. Build the shared app frame

- [ ] Implement navigation for Overview, CLI Settings, and Providers, matching
  [`UI_WIREFRAMES.md`](UI_WIREFRAMES.md).
- [ ] Add app header, main content region, and persistent CLI/config status
  region.
- [ ] Make the navigation and cards responsive from compact to desktop widths.
- [ ] Add loading-independent prototype states without implying backend
  detection. Mark not-yet-implemented features as unavailable or coming later.
- [ ] Do not expose a functional Apply, Test, or Launch action in this shell
  until that operation exists end-to-end.

**Done when:** every visible navigation item has a meaningful implemented
destination/state; no dead buttons or fake completion status remain.

### 3. Implement an honest Overview empty state

- [ ] Show the purpose and GitHub-hosted vs BYOK/local distinction.
- [ ] Provide clear next-step entry points into settings and provider setup,
  but disable or label flows that are not yet implemented.
- [ ] Add an explicit CLI-detection unavailable state that says detection is
  not implemented yet, rather than presenting a hard-coded path/version.
- [ ] Include concise privacy/cost copy: local inference uses local hardware;
  remote providers may receive prompts/context and may charge independently.

**Done when:** a screenshot of a fresh install cannot be mistaken for a
connected or validated Copilot/provider setup.

### 4. Add design tokens and accessibility behavior

- [ ] Define a small consistent color, spacing, typography, radius, and focus
  token set in the app stylesheet.
- [ ] Support keyboard navigation and visible focus for every active control.
- [ ] Use semantic landmarks/headings, accessible names, and text labels for
  statuses. Do not rely on color alone.
- [ ] Check compact window layout and reduced-motion behavior.
- [ ] Avoid adding UI component dependencies unless there is a concrete
  accessibility/maintenance benefit.

**Done when:** primary flows can be navigated without a mouse, status is
understandable without color, and no clipped horizontal content appears at
compact width.

### 5. Add basic frontend validation gates

- [ ] Add a test runner compatible with the existing Svelte/Vite setup only if
  the PR includes testable UI state/components; prefer small unit tests over
  brittle screenshot-only tests.
- [ ] Test navigation state and that prototype status never renders as
  connected/validated.
- [ ] Keep test data fictitious and ensure it contains no real credentials.
- [ ] Update package scripts and lockfile for any new tooling.

**Done when:** CI runs the new tests consistently and `npm run check` plus
`npm run build` pass.

### 6. Update docs and remove starter assets

- [ ] Update `README.md` and the current repository state in
  `IMPLEMENTATION_GUIDE.md`.
- [ ] Add the wireframes and this checklist to the README's project structure.
- [ ] Remove scaffold logos/assets that are no longer referenced.
- [ ] Keep all setup instructions accurate for the current package/tool
  scripts.

**Done when:** project docs describe the app shell that actually exists, not a
future state.

## Priority 1 — only if P0 is complete without expanding the PR

- [ ] Add a reusable typed result/status model for future CLI detection,
  without claiming it is connected.
- [ ] Add a “CLI detection unavailable” reason component that can later render
  missing CLI, unsupported version, or access errors.
- [ ] Validate the current frontend-only CI job on GitHub; fix any real startup
  issue before relying on required checks.
- [ ] Review npm advisory detail and apply a compatible patch only if the
  tested dependency graph remains stable. Do not use a forced major upgrade
  just to clear a low-severity alert.
- [ ] Add a short recording or screenshots with all paths, user names, prompts,
  and secrets excluded.

## Explicitly not part of this PR

- Reading or writing Copilot CLI configuration files.
- Discovering CLI version/model lists or making provider network requests.
- Storing provider/API credentials.
- Applying settings, launching Copilot CLI, or running model compatibility
  checks.
- Adding arbitrary shell, filesystem, or broad Tauri permissions.
- Claiming supported operating-system packaging is verified based on a
  frontend-only build.

Those are separate vertical slices in the implementation guide. Do not create
empty modules or broad abstractions for them in the first PR.

## PR submission evidence

- [ ] Summary explains app-shell behavior and explicitly lists unimplemented
  operations.
- [ ] `npm run check` passes.
- [ ] `npm run build` passes.
- [ ] Relevant unit tests pass.
- [ ] If Rust was changed: `cargo fmt --check`, `cargo test`, and
  `cargo clippy --all-targets --all-features -- -D warnings` pass.
- [ ] Screenshot(s) demonstrate empty state and compact layout without
  sensitive information.
- [ ] Docs and screenshots do not claim settings/provider validation works.
