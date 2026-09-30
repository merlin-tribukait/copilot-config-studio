export type ProviderRoute = "local" | "hosted";

export type ProviderDraftValidation =
  | { ok: true; host: string }
  | { ok: false; error: string };

export function validateProviderDraft(input: {
  route: ProviderRoute;
  name: string;
  endpoint: string;
  model: string;
}): ProviderDraftValidation {
  let parsed: URL;

  try {
    parsed = new URL(input.endpoint.trim());
  } catch {
    return { ok: false, error: "Enter a valid provider URL, including http:// or https://." };
  }

  if (!["http:", "https:"].includes(parsed.protocol) || !parsed.hostname) {
    return { ok: false, error: "Use a provider URL with an http or https address." };
  }

  if (!input.name.trim()) {
    return { ok: false, error: "Enter a name for this draft profile." };
  }

  if (parsed.username || parsed.password || parsed.search || parsed.hash) {
    return {
      ok: false,
      error: "For this preview, keep credentials, query parameters, and fragments out of the URL."
    };
  }

  if (input.route === "hosted" && parsed.protocol !== "https:") {
    return { ok: false, error: "Hosted providers must use https://." };
  }

  if (!input.model.trim()) {
    return { ok: false, error: "Enter a model or deployment ID to continue." };
  }

  return { ok: true, host: parsed.host };
}
