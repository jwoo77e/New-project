import { describe, expect, it } from "vitest";
import { buildGammaCreditSnapshot, extractGammaCreditsFromText } from "./fetch-gamma-credits.mjs";

describe("Gamma web credit extraction", () => {
  it("extracts remaining credits from English UI text", () => {
    const result = extractGammaCreditsFromText("Account\nCredits 3,250\nSettings");

    expect(result.credits).toBe(3250);
    expect(result.matchedText).toBe("Credits 3,250");
  });

  it("extracts remaining credits from Korean UI text", () => {
    const result = extractGammaCreditsFromText("계정\n잔여 크레딧 1,020\n청구");

    expect(result.credits).toBe(1020);
  });

  it("builds a serializable credit snapshot", () => {
    const snapshot = buildGammaCreditSnapshot({
      collectedAt: new Date("2026-05-22T01:00:00.000Z"),
      credits: 100,
      matchedText: "Credits 100",
      status: "정상",
      note: "ok",
      url: "https://gamma.app/",
    });

    expect(snapshot.currentCreditsRemaining).toBe(100);
    expect(snapshot.source.status).toBe("정상");
    expect(snapshot.source.collectedAt).toBe("2026-05-22T01:00:00.000Z");
  });
});
