import { describe, expect, it } from "vitest";
import {
  buildCodeOutputDensityTrend,
  calculateCodeOutputDensity,
  inferCodeLineSourcePeriod,
  isMonthlyCodePeriodAligned,
} from "./codeOutputDensity";

describe("codeOutputDensity", () => {
  it("calculates Code Lines per one million tokens", () => {
    expect(calculateCodeOutputDensity(100_000, 1_000_000_000)).toBe(100);
    expect(calculateCodeOutputDensity(0, 500_000_000)).toBe(0);
    expect(calculateCodeOutputDensity(100, 0)).toBeNull();
  });

  it("builds a selected-period trend and ignores mismatched periods", () => {
    const trend = buildCodeOutputDensityTrend(
      [
        {
          key: "2026-05",
          label: "5월",
          codeLines: 20_000,
          totalTokens: 100_000_000,
          periodAligned: false,
        },
        {
          key: "2026-06",
          label: "6월",
          codeLines: 10_000,
          totalTokens: 100_000_000,
          periodAligned: true,
        },
        {
          key: "2026-07",
          label: "7월",
          codeLines: 15_000,
          totalTokens: 100_000_000,
          periodAligned: true,
        },
      ],
      "2026-07",
    );

    expect(trend.points.map((point) => point.key)).toEqual(["2026-06", "2026-07"]);
    expect(trend.currentPoint?.linesPerMillionTokens).toBe(150);
    expect(trend.previousPoint?.linesPerMillionTokens).toBe(100);
    expect(trend.changeRate).toBe(50);
    expect(trend.direction).toBe("up");
    expect(trend.excludedKeys).toEqual(["2026-05"]);
  });

  it("treats a single valid period as a baseline", () => {
    const trend = buildCodeOutputDensityTrend(
      [{
        key: "2026-08-W1",
        label: "8월 1주차",
        codeLines: 500,
        totalTokens: 10_000_000,
        periodAligned: true,
      }],
      "2026-08-W1",
    );

    expect(trend.currentPoint?.linesPerMillionTokens).toBe(50);
    expect(trend.previousPoint).toBeNull();
    expect(trend.direction).toBe("baseline");
  });

  it("infers full-month and cumulative snapshot Code Lines periods", () => {
    expect(
      inferCodeLineSourcePeriod("claude_code_team_2026_06_01_to_2026_06_30.csv", "2026-06"),
    ).toEqual({ startDate: "2026-06-01", endDate: "2026-06-30" });
    expect(inferCodeLineSourcePeriod("2026-08-13-claude_code.csv", "2026-08")).toEqual({
      startDate: "2026-08-01",
      endDate: "2026-08-12",
    });
  });

  it("rejects May's mismatched Spend and Code Lines periods", () => {
    expect(
      isMonthlyCodePeriodAligned({
        codeFileName: "claude_code_team_2026_05_01_to_2026_05_31.csv",
        month: "2026-05",
        spendStartDate: "2026-05-14",
        spendEndDate: "2026-05-31",
      }),
    ).toBe(false);
    expect(
      isMonthlyCodePeriodAligned({
        codeFileName: "2026-08-13-claude_code.csv",
        month: "2026-08",
        spendStartDate: "2026-08-01",
        spendEndDate: "2026-08-12",
      }),
    ).toBe(true);
  });
});
