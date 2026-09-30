import assert from "node:assert/strict";
import test from "node:test";
import { buildGitHubFeedbackUrl } from "../src/lib/github-feedback.ts";

test("creates a GitHub issue draft with category and safe click-dummy context", () => {
  const url = new URL(
    buildGitHubFeedbackUrl({
      category: "bug",
      title: "Dark colors are difficult to read",
      details: "Secondary text is too faint on the profile screen.",
      page: "Profiles",
      area: "Workspace list",
      viewport: "800×600"
    })
  );

  assert.equal(url.origin, "https://github.com");
  assert.equal(url.pathname, "/merlin-tribukait/copilot-config-studio/issues/new");
  assert.equal(url.searchParams.get("title"), "[Bug] Dark colors are difficult to read");
  assert.match(url.searchParams.get("body"), /Page: Profiles/);
  assert.match(url.searchParams.get("body"), /Area: Workspace list/);
  assert.match(url.searchParams.get("body"), /Viewport: 800×600/);
});

test("does not include unrelated provider, prompt, or local-path values", () => {
  const url = new URL(
    buildGitHubFeedbackUrl({
      category: "feature",
      title: "Add a compact mode",
      details: "Please add a tighter layout.",
      page: "Appearance",
      area: "Theme selector",
      viewport: "1024x768"
    })
  );
  const body = url.searchParams.get("body");

  assert.doesNotMatch(body, /localhost|\/home\/|api.?key|prompt body/i);
  assert.match(body, /No app configuration values, local paths, provider URLs, prompts, or credentials are read or attached/);
});

test("requires a non-empty title and description", () => {
  assert.throws(
    () => buildGitHubFeedbackUrl({
      category: "question",
      title: " ",
      details: "Details",
      page: "Setup",
      area: "Route cards"
    }),
    /title and description/
  );
});
