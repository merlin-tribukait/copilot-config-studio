export type FeedbackCategory = "bug" | "feature" | "usability" | "question";

export interface GitHubFeedbackDraft {
  category: FeedbackCategory;
  title: string;
  details: string;
  page: string;
  area: string;
  viewport?: string;
  repository?: string;
}

const defaultRepository = "https://github.com/merlin-tribukait/copilot-config-studio";

const categoryLabels: Record<FeedbackCategory, string> = {
  bug: "Bug",
  feature: "Feature request",
  usability: "Usability",
  question: "Question"
};

export function buildGitHubFeedbackUrl(draft: GitHubFeedbackDraft): string {
  const title = draft.title.trim();
  const details = draft.details.trim();
  if (!title || !details) {
    throw new Error("A title and description are required to draft feedback.");
  }

  const body = [
    "## Summary",
    details,
    "",
    "## Click dummy context",
    `- Type: ${categoryLabels[draft.category]}`,
    `- Page: ${draft.page}`,
    `- Area: ${draft.area}`,
    ...(draft.viewport ? [`- Viewport: ${draft.viewport}`] : []),
    "",
    "_The app adds only the selected screen, UI area, and viewport size as context. Your feedback text is included because you entered it. No app configuration values, local paths, provider URLs, prompts, or credentials are read or attached._"
  ].join("\n");
  const repositoryUrl = `${(draft.repository ?? defaultRepository).replace(/\/+$/, "")}/`;
  const issueUrl = new URL("issues/new", repositoryUrl);
  issueUrl.searchParams.set("title", `[${categoryLabels[draft.category]}] ${title}`);
  issueUrl.searchParams.set("body", body);
  return issueUrl.toString();
}
