import {describe, expect, it} from "vitest";
import type {IndividualWeeklyUsagePeriod} from "./individualUtilizationData";
import {buildWeeklyMonthlyUsage} from "./weeklyMonthlyUsage";

function week(startDate: string, endDate: string): IndividualWeeklyUsagePeriod {
  return {
    key: startDate, label: endDate, startDate, endDate, coverage: "complete",
    source: {
      previousSpendFile: null, currentSpendFile: `${startDate}.csv`, previousSpendRows: 0, currentSpendRows: 1,
      previousCodeFile: null, currentCodeFile: "code.csv", spendMethod: "period_total", codeMethod: "period_total",
    },
    totals: {activeUsers: 1, requests: 2, promptTokens: 90, completionTokens: 10, totalTokens: 100, netSpendUsd: 0.1, codeLines: 5},
    users: {"user@example.com": {requests: 2, promptTokens: 90, completionTokens: 10, totalTokens: 100, netSpendUsd: 0.1,
      codeLines: 5, products: ["Claude Code"], models: ["model"]}},
    notes: [],
  };
}

describe("weekly month-to-date aggregation", () => {
  it("extends automatically as a new week arrives and yields to monthly reports", () => {
    const weeks = [week("2026-10-01", "2026-10-07"), week("2026-10-08", "2026-10-14")];
    expect(buildWeeklyMonthlyUsage(weeks, [])["2026-10"]).toMatchObject({
      period: "2026-10-01 ~ 2026-10-14", coverage: "partial",
      totals: {requests: 4, totalTokens: 200, netSpendUsd: 0.2},
      users: {"user@example.com": {codeLines: 10, coverage: "complete"}},
    });
    weeks.push(week("2026-10-15", "2026-10-21"));
    expect(buildWeeklyMonthlyUsage(weeks, [])["2026-10"]).toMatchObject({
      period: "2026-10-01 ~ 2026-10-21", totals: {totalTokens: 300, netSpendUsd: 0.3},
    });
    expect(buildWeeklyMonthlyUsage(weeks, ["2026-10"])).toEqual({});
  });

  it("keeps gaps and missing code sources partial instead of inventing observations", () => {
    const first = week("2026-10-01", "2026-10-07");
    const third = week("2026-10-15", "2026-10-21");
    expect(buildWeeklyMonthlyUsage([first, third], [])["2026-10"].users["user@example.com"])
      .toMatchObject({totalTokens: 200, coverage: "partial"});
    const second = week("2026-10-08", "2026-10-14");
    second.source.codeMethod = "not_collected";
    expect(buildWeeklyMonthlyUsage([first, second], [])["2026-10"].users["user@example.com"])
      .toMatchObject({totalTokens: 200, codeLines: null, coverage: "partial"});
  });

  it("adds zero for an absent account in a complete export but preserves incomplete source coverage", () => {
    const first = week("2026-10-01", "2026-10-07");
    const second = week("2026-10-08", "2026-10-14");
    second.users = {};
    for (const periods of [[first, second], [{...first, users: {}}, {...second, users: first.users}]]) {
      const month = buildWeeklyMonthlyUsage(periods, [])["2026-10"];
      expect(month.users["user@example.com"]).toMatchObject({
        totalTokens: 100, codeLines: 5, netSpendUsd: 0.1, coverage: "complete",
        sourcePeriod: "2026-10-01 ~ 2026-10-14",
      });
    }
    second.coverage = "partial";
    expect(buildWeeklyMonthlyUsage([first, second], [])["2026-10"].users["user@example.com"])
      .toMatchObject({totalTokens: 100, coverage: "partial"});
    second.source.codeMethod = "not_collected";
    expect(buildWeeklyMonthlyUsage([first, second], [])["2026-10"].users["user@example.com"])
      .toMatchObject({totalTokens: 100, codeLines: null, coverage: "partial"});
  });

  it("does not double-count overlapping exports or prorate a cross-month week", () => {
    expect(buildWeeklyMonthlyUsage([week("2026-10-01", "2026-10-07"), week("2026-10-07", "2026-10-14")], []))
      .toEqual({});
    expect(buildWeeklyMonthlyUsage([week("2026-09-28", "2026-10-04")], [])).toEqual({});
  });
});
