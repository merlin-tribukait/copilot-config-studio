# Browser click dummy guide

The [public project page](https://merlin-tribukait.github.io/copilot-config-studio/)
is a static browser build of the Copilot Config Studio interaction prototype.
It is provided for design feedback and workflow exploration, not as a
configuration service.

## Start here

1. Open the project page and choose **Try the interactive click dummy**.
2. Use the left navigation to explore Setup, Providers, Profiles, Appearance,
   and CLI settings.
3. Try the provider walkthrough with fictional sample data only.
4. Use **Feedback** at the top of the page to prepare an issue or feature
   request.

## Walkthroughs

### Setup routes

Setup presents GitHub Copilot, Local model, and Hosted provider as different
routes. Selecting the GitHub-hosted route only displays the existing CLI
settings placeholder. Selecting Local model or Hosted provider lets you open
the provider form.

These cards explain intended trade-offs. They do not detect your Copilot CLI,
subscription, organization policy, local model server, or provider account.

### Provider form

The Local and Hosted provider walkthrough has Details, Review, and Finish
steps. You can enter a sample profile name, provider kind, endpoint, and model
ID. The local validation checks required fields and URL formatting only;
hosted routes require HTTPS, while the local route permits HTTP.

Use invented values. The prototype does not make a network request, list
models, verify endpoint reachability, validate credentials, establish
compatibility, estimate cost, save a provider, or launch Copilot CLI. A
successful local format check is not a provider health check.

### Profiles and workspaces

Create named in-memory configuration profiles, choose a global default, add a
workspace name/path draft, and compare inherited defaults with workspace
overrides. Workspace data is fabricated by the visitor and held only in page
memory. No folder picker, filesystem scan, Git command, GitHub CLI, Copilot
CLI, or VS Code inspection runs.

The discovery-source choices are an interaction preview. Toggling them does
not grant permission or inspect the corresponding application.

### Appearance

Choose System, Light, Dark, or Dark Dimmed. Create a named color profile and
edit grouped brand/focus, surface, text, and border colors. Profiles can be
selected as the global palette or as a per-workspace override. All values
reset when the web page reloads.

### CLI settings

This destination is intentionally a placeholder. No settings file is read or
changed.

## Report a bug or request a feature

The **Feedback** dialog is available from every page:

1. Choose Bug, Feature request, Usability, or Question.
2. Enter a short title and a description of what happened or what you would
   like to be able to do.
3. Check the context: current prototype page, selected UI area, and viewport
   dimensions.
4. Choose **Review issue on GitHub**. This opens the repository's issue
   composer with the title and description you entered plus the context above.
5. Review and edit the issue in GitHub, then submit it yourself. GitHub
   requires sign-in.

The prototype never submits the issue directly. Before the review link is
opened, feedback stays in browser memory. The issue draft contains the
visitor-written title/description and only the selected page, UI area, and
viewport dimensions as application context. It does not read or attach app
configuration forms, provider endpoints, local workspace paths, prompts,
credentials, hostnames, or device files.

Do not put credentials, personal information, private repository paths,
unredacted logs, or prompt contents in public issues. For suspected
vulnerabilities, use the private reporting process in
[`../SECURITY.md`](../SECURITY.md).

The repository also provides [bug report](../.github/ISSUE_TEMPLATE/bug_report.md)
and [feature request](../.github/ISSUE_TEMPLATE/feature_request.md) templates
for people who open issues directly on GitHub.

## What feedback is useful?

- Tell us which page and control you were using.
- For a bug, include what you expected and what you saw, plus short
  reproduction steps.
- For an idea, describe the user goal and why the current flow does not support
  it.
- Mention browser/window size when layout is involved.
- Keep reports focused; do not attach secrets or real Copilot configuration.
