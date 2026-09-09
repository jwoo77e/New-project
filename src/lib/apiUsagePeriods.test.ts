import { describe, expect, it } from "vitest";
import type { ApiDailyUsage } from "../data/apiUsageData";
import { buildApiUsagePeriodSummaries } from "./apiUsagePeriods";

function usage(date: string, tokens: number, costUsd: number): ApiDailyUsage {
  return {
    date,
    label: date.slice(5).replace("-", "/"),
    openaiRequests: 1,
    geminiRequests: 2,
    claudeRequests: 3,
    openaiTokens: tokens,
    geminiTokens: 0,
    claudeTokens: 0,
    totalTokens: tokens,
    openaiCostUsd: costUsd,
    geminiCostUsd: 0,
    claudeCostUsd: 0,
    costUsd,
  };
}

describe("buildApiUsagePeriodSummaries", () => {
  it("builds recent-seven-day, calendar-week, and month-to-date totals", () => {
    const daily = Array.from({ length: 10 }, (_, index) =>
      usage(`2026-09-${String(index + 1).padStart(2, "0")}`, (index + 1) * 100, index + 0.1),
    );
    const summaries = buildApiUsagePeriodSummaries(daily);

    expect(summaries.map((summary) => summary.key)).toEqual(["recent7", "week", "month"]);
    expect(summaries[0]).toMatchObject({
      rangeLabel: "9월 4일 ~ 9월 10일",
      requests: 42,
      totalTokens: 4_900,
      costUsd: 42.7,
      isPartial: false,
    });
    expect(summaries[1]).toMatchObject({
      rangeLabel: "9월 7일 ~ 9월 10일",
      requests: 24,
      totalTokens: 3_400,
      costUsd: 30.4,
      isPartial: true,
    });
    expect(summaries[2]).toMatchObject({
      rangeLabel: "9월 1일 ~ 9월 10일",
      requests: 60,
      totalTokens: 5_500,
      costUsd: 46,
      isPartial: true,
    });
  });

  it("returns zero summaries when daily usage is unavailable", () => {
    expect(buildApiUsagePeriodSummaries([])).toEqual([
      expect.objectContaining({ key: "recent7", totalTokens: 0, costUsd: 0 }),
      expect.objectContaining({ key: "week", totalTokens: 0, costUsd: 0 }),
      expect.objectContaining({ key: "month", totalTokens: 0, costUsd: 0 }),
    ]);
  });
});
