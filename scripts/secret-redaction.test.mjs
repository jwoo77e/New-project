import { describe, expect, it } from "vitest";
import { redactRequestError, redactSecretData, redactSecrets } from "./secret-redaction.mjs";

describe("secret redaction", () => {
  it("removes exact credentials and escaped variants without losing useful error details", () => {
    const secret = "custom-credential/with+symbols";
    const result = redactSecrets(`403 permission denied: ${secret} ${encodeURIComponent(secret)}`, [secret]);
    expect(result).toBe("403 permission denied: [REDACTED] [REDACTED]");
  });

  it("removes recognizable keys, partially masked keys, bearer tokens and private keys", () => {
    const result = redactSecrets('sk-admin-abcdef***suffix AIza1234567890123456 Bearer opaque.token\n-----BEGIN PRIVATE KEY-----\nprivate-content\n-----END PRIVATE KEY-----');
    expect(result).not.toMatch(/sk-admin|AIza|opaque|private-content/);
    expect(result.match(/\[REDACTED\]/g)).toHaveLength(4);
  });

  it("redacts URL and JSON credentials even without knowing their values", () => {
    const result = redactSecrets('https://example.com?key=arbitrary-value&days=7 {"x-api-key":"another-secret","access_token":"third-secret"}');
    expect(result).not.toMatch(/arbitrary-value|another-secret|third-secret/);
    expect(result).toContain("days=7");
  });

  it("redacts request credential echoes in errors for all header representations", () => {
    for (const headers of [{ Authorization: "Bearer opaque-secret" }, new Headers({ "x-goog-api-key": "opaque-secret" }), [["x-api-key", "opaque-secret"]]]) {
      expect(redactRequestError(new Error("invalid opaque-secret"), "https://example.com", { headers })).toBe("invalid [REDACTED]");
    }
    expect(redactRequestError("invalid request-assertion", "https://example.com", { body: new URLSearchParams({ assertion: "request-assertion" }) })).toBe("invalid [REDACTED]");
  });

  it("sanitizes nested snapshots while preserving metrics and the original object", () => {
    const source = { cost: 12.5, rows: [{ label: "secret-label", ok: true }], empty: null };
    expect(redactSecretData(source, ["secret-label"])).toEqual({ cost: 12.5, rows: [{ label: "[REDACTED]", ok: true }], empty: null });
    expect(source.rows[0].label).toBe("secret-label");
  });
});
