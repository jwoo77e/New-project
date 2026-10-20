import { describe, expect, it } from "vitest";
import type { ApiUsageDetail } from "../data/apiUsageData";
import { apiUsageKeyId, filterApiUsageDetails, summarizeApiUsageDetails } from "./apiUsageDetails";
import { buildApiUsagePeriodSummaries } from "./apiUsagePeriods";

const fact = (date: string, overrides: Partial<ApiUsageDetail> = {}): ApiUsageDetail => ({
  date, provider: "OpenAI", sourceName: "본사", keyId: "key-a", keyName: "서비스 A",
  model: "model-a", requests: 1, inputTokens: 100, outputTokens: 20, costUsd: 0.1, ...overrides,
});

describe("API key/model period breakdowns", () => {
  it("filters facts by calendar month and Monday week without depending on provider daily rows", () => {
    const facts = [fact("2026-08-31"), fact("2026-09-01"), fact("2026-09-30"), fact("2026-10-01"),
      fact("2026-10-18"), fact("2026-10-19"), fact("2026-10-21"), fact("2026-10-22")];
    const periods = buildApiUsagePeriodSummaries([], new Date("2026-10-21T03:00:00Z"));
    expect(filterApiUsageDetails(facts, periods[3]).map(row => row.date)).toEqual(["2026-09-01", "2026-09-30"]);
    expect(filterApiUsageDetails(facts, periods[2])).toHaveLength(4);
    expect(filterApiUsageDetails(facts, periods[1]).map(row => row.date)).toEqual(["2026-10-19", "2026-10-21"]);
    expect(filterApiUsageDetails(facts, buildApiUsagePeriodSummaries([], new Date("2026-10-31T15:00:00Z"))[3]))
      .toHaveLength(5);
  });

  it("reconciles key/model totals and isolates matching model names across providers", () => {
    const facts = [fact("2026-10-01"), fact("2026-10-02", { keyId: "key-b" }),
      fact("2026-10-02", { model: "model-b" }), fact("2026-10-02", { provider: "Claude" })];
    const keys = summarizeApiUsageDetails(facts, "key");
    const models = summarizeApiUsageDetails(facts, "model");
    expect(keys).toHaveLength(3);
    expect(models).toHaveLength(3);
    expect(keys.reduce((sum, row) => sum + row.totalTokens, 0)).toBe(480);
    expect(models.reduce((sum, row) => sum + row.totalTokens, 0)).toBe(480);
    const period = { startDate: "2026-10-01", endDate: "2026-10-21" };
    const selected = filterApiUsageDetails(facts, period, "OpenAI", apiUsageKeyId(facts[0]));
    expect(selected).toHaveLength(2);
    expect(summarizeApiUsageDetails(selected, "model")).toHaveLength(2);
  });

  it("preserves unknown metrics, zero usage and unattributed key rows", () => {
    const rows = summarizeApiUsageDetails([
      fact("2026-10-01", { keyId: null, requests: null, costUsd: null }),
      fact("2026-10-02", { keyId: null }),
      fact("2026-10-02", { requests: 0, inputTokens: 0, outputTokens: 0, costUsd: 0 }),
    ], "key");
    expect(rows[0]).toMatchObject({ keyId: null, requests: null, costUsd: null, totalTokens: 240 });
    expect(rows[1]).toMatchObject({ requests: 0, costUsd: 0, totalTokens: 0 });
    expect(summarizeApiUsageDetails([], "model")).toEqual([]);
  });
});

describe("Gemini project breakdowns", () => {
  it("separates projects with the same model and applies project/period filters together", () => {
    const rows = [
      fact("2026-10-01", { provider: "Gemini", keyId: null, projectId: "project-alpha" }),
      fact("2026-10-02", { provider: "Gemini", keyId: null, projectId: "project-beta" }),
      fact("2026-09-30", { provider: "Gemini", keyId: null, projectId: "project-alpha" }),
    ];
    const period = { startDate: "2026-10-01", endDate: "2026-10-21" };
    const monthly = filterApiUsageDetails(rows, period, "Gemini");
    expect(summarizeApiUsageDetails(monthly, "key")).toHaveLength(2);
    expect(summarizeApiUsageDetails(monthly, "model")[0].totalTokens).toBe(240);
    expect(filterApiUsageDetails(rows, period, "Gemini", apiUsageKeyId(rows[0]))).toEqual([rows[0]]);
    expect(apiUsageKeyId(rows[0])).toBe(apiUsageKeyId({ ...rows[0], sourceName: "different label" }));
    expect(apiUsageKeyId(rows[0])).not.toBe(apiUsageKeyId({ ...rows[0], projectId: undefined }));
  });
});
