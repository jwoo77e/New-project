import { describe, expect, it } from "vitest";
import {
  buildMonthlyTokenUsageTrend,
  buildWeeklyTokenUsageTrend,
  inclusiveDays,
  type TokenUsageSample,
} from "./tokenUsageTrend";

describe("tokenUsageTrend", () => {
  it("calculates inclusive source coverage days", () => {
    expect(inclusiveDays("2026-08-01", "2026-08-12")).toBe(12);
    expect(inclusiveDays("2026-08-12", "2026-08-01")).toBe(0);
  });

  it("projects a partial month to the calendar month end", () => {
    const trend = buildMonthlyTokenUsageTrend([
      {
        key: "2026-08",
        label: "8월",
        totalTokens: 12_000,
        startDate: "2026-08-01",
        endDate: "2026-08-12",
        coverage: "partial",
      },
    ]);

    expect(trend.points[0]).toMatchObject({
      observedDays: 12,
      targetDays: 31,
      comparableTokens: 31_000,
    });
    expect(trend.forecastTokens).toBe(31_000);
    expect(trend.forecastLabel).toBe("월말 예상");
    expect(trend.direction).toBe("up");
  });

  it("uses a damped trend for the next complete month", () => {
    const samples: TokenUsageSample[] = [
      {
        key: "2026-06",
        label: "6월",
        totalTokens: 100,
        startDate: "2026-06-01",
        endDate: "2026-06-30",
        coverage: "complete",
      },
      {
        key: "2026-07",
        label: "7월",
        totalTokens: 200,
        startDate: "2026-07-01",
        endDate: "2026-07-31",
        coverage: "complete",
      },
    ];

    const trend = buildMonthlyTokenUsageTrend(samples);
    expect(trend.forecastTokens).toBe(250);
    expect(trend.forecastLabel).toBe("다음 달 예상");
    expect(trend.direction).toBe("up");
  });

  it("normalizes unequal weekly periods to seven days before forecasting", () => {
    const trend = buildWeeklyTokenUsageTrend([
      {
        key: "2026-08-W1",
        label: "8월 1주차",
        totalTokens: 500,
        startDate: "2026-08-01",
        endDate: "2026-08-05",
        coverage: "complete",
      },
      {
        key: "2026-08-W2",
        label: "8월 2주차",
        totalTokens: 1_400,
        startDate: "2026-08-06",
        endDate: "2026-08-12",
        coverage: "complete",
      },
    ]);

    expect(trend.points.map((point) => point.comparableTokens)).toEqual([700, 1_400]);
    expect(trend.forecastTokens).toBe(1_750);
    expect(trend.forecastLabel).toBe("다음 주 예상");
  });

  it("returns an empty forecast when no valid samples exist", () => {
    const trend = buildWeeklyTokenUsageTrend([]);
    expect(trend.points).toEqual([]);
    expect(trend.forecastTokens).toBeNull();
  });
});
