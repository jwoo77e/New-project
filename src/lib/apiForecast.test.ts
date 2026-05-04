import { describe, expect, it } from "vitest";
import { buildApiUsageRunRateForecast } from "./apiForecast";
import type { ApiDailyUsage } from "../data/apiUsageData";

const options = {
  monthDays: 30.4,
  usdToKrwRate: 1400,
};

function day(index: number, overrides: Partial<ApiDailyUsage>): ApiDailyUsage {
  return {
    date: `2026-05-${String(index + 1).padStart(2, "0")}`,
    label: `5/${index + 1}`,
    openaiRequests: 100,
    geminiRequests: 0,
    claudeRequests: 0,
    openaiTokens: 1000,
    geminiTokens: 0,
    claudeTokens: 0,
    totalTokens: 1000,
    openaiCostUsd: 2,
    geminiCostUsd: 0,
    claudeCostUsd: 0,
    costUsd: 2,
    ...overrides,
  };
}

describe("buildApiUsageRunRateForecast", () => {
  it("separates a one-day Claude cost spike from recurring monthly API forecast", () => {
    const dailyUsage = Array.from({ length: 7 }, (_, index) =>
      day(index, {
        claudeCostUsd: index === 3 ? 300 : 0,
        claudeTokens: index === 3 ? 1800000 : 0,
        totalTokens: index === 3 ? 1801000 : 1000,
        costUsd: index === 3 ? 302 : 2,
      }),
    );

    const forecast = buildApiUsageRunRateForecast(dailyUsage, options);
    const claude = forecast.providers.find((provider) => provider.provider === "Claude");
    const openai = forecast.providers.find((provider) => provider.provider === "OpenAI");

    expect(claude?.monthlyCostUsd).toBe(0);
    expect(claude?.oneTimeCostUsd).toBe(300);
    expect(claude?.costOutlierDays).toBe(1);
    expect(forecast.oneTimeCostUsd).toBe(300);
    expect(openai?.monthlyCostUsd).toBeCloseTo(60.8, 5);
    expect(forecast.monthlyCostUsd).toBeCloseTo(60.8, 5);
    expect(forecast.monthlyCostKrw).toBe(85120);
  });

  it("keeps a consistent Claude run rate when costs recur across multiple days", () => {
    const claudeCosts = [90, 100, 95, 105, 100, 98, 102];
    const dailyUsage = claudeCosts.map((claudeCostUsd, index) =>
      day(index, {
        openaiCostUsd: 0,
        openaiTokens: 0,
        openaiRequests: 0,
        claudeCostUsd,
        claudeTokens: 500000,
        totalTokens: 500000,
        costUsd: claudeCostUsd,
      }),
    );

    const forecast = buildApiUsageRunRateForecast(dailyUsage, options);
    const claude = forecast.providers.find((provider) => provider.provider === "Claude");

    expect(claude?.costOutlierDays).toBe(0);
    expect(claude?.oneTimeCostUsd).toBe(0);
    expect(claude?.monthlyCostUsd).toBeCloseTo((claudeCosts.reduce((sum, value) => sum + value, 0) / 7) * 30.4, 5);
  });

  it("detects a high-cost day even when a provider has only two paid days", () => {
    const dailyUsage = Array.from({ length: 7 }, (_, index) =>
      day(index, {
        openaiCostUsd: 0,
        openaiTokens: 0,
        openaiRequests: 0,
        claudeCostUsd: index === 1 ? 2 : index === 4 ? 300 : 0,
        claudeTokens: index === 1 ? 10000 : index === 4 ? 1200000 : 0,
        totalTokens: index === 1 ? 10000 : index === 4 ? 1200000 : 0,
        costUsd: index === 1 ? 2 : index === 4 ? 300 : 0,
      }),
    );

    const forecast = buildApiUsageRunRateForecast(dailyUsage, options);
    const claude = forecast.providers.find((provider) => provider.provider === "Claude");

    expect(claude?.costOutlierDays).toBe(1);
    expect(claude?.oneTimeCostUsd).toBe(300);
    expect(claude?.monthlyCostUsd).toBeCloseTo((2 / 7) * options.monthDays, 5);
  });

  it("does not multiply a short Gemini billing burst into every forecast month", () => {
    const geminiCosts = [0, 0, 0, 0, 159.79, 374.04, 410.91];
    const dailyUsage = geminiCosts.map((geminiCostUsd, index) =>
      day(index, {
        openaiCostUsd: 0,
        openaiTokens: 0,
        openaiRequests: 0,
        geminiCostUsd,
        geminiTokens: index >= 4 ? 420000 : 0,
        geminiRequests: index >= 4 ? 80 : 0,
        totalTokens: index >= 4 ? 420000 : 0,
        costUsd: geminiCostUsd,
      }),
    );

    const forecast = buildApiUsageRunRateForecast(dailyUsage, options);
    const gemini = forecast.providers.find((provider) => provider.provider === "Gemini");

    expect(gemini?.monthlyCostUsd).toBe(0);
    expect(gemini?.oneTimeCostUsd).toBeCloseTo(944.74, 5);
    expect(gemini?.costOutlierDays).toBe(3);
    expect(forecast.monthlyCostUsd).toBe(0);
  });

  it("forecasts provider token and request usage with one-off spikes capped separately", () => {
    const dailyUsage = Array.from({ length: 7 }, (_, index) =>
      day(index, {
        openaiRequests: index === 2 ? 12000 : 100,
        openaiTokens: index === 2 ? 2000000 : 10000,
        totalTokens: index === 2 ? 2000000 : 10000,
      }),
    );

    const forecast = buildApiUsageRunRateForecast(dailyUsage, options);
    const naiveMonthlyTokens =
      (dailyUsage.reduce((sum, item) => sum + item.totalTokens, 0) / dailyUsage.length) * options.monthDays;
    const naiveMonthlyRequests =
      (dailyUsage.reduce((sum, item) => sum + item.openaiRequests, 0) / dailyUsage.length) * options.monthDays;

    expect(forecast.tokenOutlierDays).toBe(1);
    expect(forecast.requestOutlierDays).toBe(1);
    expect(forecast.monthlyTokens).toBeLessThan(Math.round(naiveMonthlyTokens));
    expect(forecast.monthlyRequests).toBeLessThan(Math.round(naiveMonthlyRequests));
  });
});
