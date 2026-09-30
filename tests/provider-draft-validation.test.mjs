import assert from "node:assert/strict";
import test from "node:test";
import { validateProviderDraft } from "../src/lib/provider-draft-validation.ts";

const validDraft = {
  route: "hosted",
  name: "Example profile",
  endpoint: "https://api.example.test/v1",
  model: "example-model"
};

test("accepts a hosted HTTPS draft and returns only its host", () => {
  assert.deepEqual(validateProviderDraft(validDraft), {
    ok: true,
    host: "api.example.test"
  });
});

test("accepts an HTTP endpoint for the local route", () => {
  assert.deepEqual(
    validateProviderDraft({
      ...validDraft,
      route: "local",
      endpoint: "http://localhost:11434/v1"
    }),
    { ok: true, host: "localhost:11434" }
  );
});

test("rejects HTTP for a hosted route", () => {
  const result = validateProviderDraft({ ...validDraft, endpoint: "http://api.example.test/v1" });
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.error, /https:\/\//);
});

test("rejects malformed URLs and unsupported URL schemes", () => {
  for (const endpoint of ["not a URL", "ftp://api.example.test/v1"]) {
    const result = validateProviderDraft({ ...validDraft, endpoint });
    assert.equal(result.ok, false);
  }
});

test("rejects credentials, query parameters, and fragments in URLs", () => {
  for (const endpoint of [
    "https://user:secret@api.example.test/v1",
    "https://api.example.test/v1?token=secret",
    "https://api.example.test/v1#fragment"
  ]) {
    const result = validateProviderDraft({ ...validDraft, endpoint });
    assert.equal(result.ok, false);
    if (!result.ok) assert.match(result.error, /credentials, query parameters, and fragments/);
  }
});

test("requires a profile name and model ID", () => {
  assert.equal(validateProviderDraft({ ...validDraft, name: "  " }).ok, false);
  assert.equal(validateProviderDraft({ ...validDraft, model: " " }).ok, false);
});
