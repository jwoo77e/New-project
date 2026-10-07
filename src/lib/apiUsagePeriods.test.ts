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
    const summaries = buildApiUsagePeriodSummaries(daily, new Date("2026-09-10T03:00:00Z"));

    expect(summaries.map((summary) => summary.key)).toEqual(["recent7", "week", "month", "previousMonth"]);
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
      expect.objectContaining({ key: "previousMonth", totalTokens: 0, costUsd: 0, isPartial: true }),
    ]);
  });

  it("includes the whole previous calendar month and excludes adjacent months", () => {
    const september = Array.from({ length: 30 }, (_, i) => usage(`2026-09-${String(i + 1).padStart(2, "0")}`, 100, 0.1));
    const daily = [usage("2026-10-01", 9_999, 10), ...september.reverse(), usage("2026-08-31", 9_999, 10)];
    const summary = buildApiUsagePeriodSummaries(daily, new Date("2026-10-07T03:00:00Z"))[3];
    expect(summary).toMatchObject({
      key: "previousMonth", label: "지난달", rangeLabel: "9월 1일 ~ 9월 30일",
      requests: 180, totalTokens: 3_000, costUsd: 3, isPartial: false,
    });
    expect(summary.dailyUsage.map(row => row.date)).toEqual([...september].reverse().map(row => row.date));
  });

  it("marks missing days as partial without relabeling stale data as this month", () => {
    const daily = [usage("2026-09-01", 100, 1), usage("2026-09-30", 200, 2)];
    const summaries = buildApiUsagePeriodSummaries(daily, new Date("2026-10-07T03:00:00Z"));
    expect(summaries[2]).toMatchObject({ rangeLabel: "10월 1일 ~ 10월 7일", dailyUsage: [], isPartial: true });
    expect(summaries[3]).toMatchObject({ totalTokens: 300, costUsd: 3, isPartial: true });
    expect(summaries[0].dailyUsage).toEqual([]);
  });

  it("handles year rollover, leap February, and the Korean midnight boundary", () => {
    expect(buildApiUsagePeriodSummaries([], new Date("2026-01-01T00:00:00Z"))[3].rangeLabel)
      .toBe("12월 1일 ~ 12월 31일");
    expect(buildApiUsagePeriodSummaries([], new Date("2024-03-01T00:00:00Z"))[3].rangeLabel)
      .toBe("2월 1일 ~ 2월 29일");
    const summary = buildApiUsagePeriodSummaries([usage("2026-09-30", 100, 1)], new Date("2026-09-30T15:00:00Z"))[3];
    expect(summary).toMatchObject({ rangeLabel: "9월 1일 ~ 9월 30일", totalTokens: 100, isPartial: true });
  });
});
