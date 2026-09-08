import { describe, expect, it } from "vitest";
import { isIndividualProfileAccessCode } from "./individualProfileAccess";

describe("isIndividualProfileAccessCode", () => {
  it("accepts the configured four-digit access code", () => {
    expect(isIndividualProfileAccessCode("4979")).toBe(true);
  });

  it("rejects incorrect or malformed values", () => {
    expect(isIndividualProfileAccessCode("0000")).toBe(false);
    expect(isIndividualProfileAccessCode("4979 ")).toBe(false);
    expect(isIndividualProfileAccessCode("497")).toBe(false);
  });
});
