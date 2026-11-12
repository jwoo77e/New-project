import { describe, expect, it } from "vitest";
import { dashboardThroughSeptember, initialDashboardData } from "./aiCostData";
import { appendOctoberCardSpend } from "./octoberCardSpend";
import report from "./octoberCardSpendSnapshot.json";

describe("October card purchase reconciliation", () => {
  it("publishes October as actual cost using all 239 purchased transactions", () => {
    expect(initialDashboardData.monthlyActuals.find(row => row.month === "2026-10")).toEqual({
      month: "2026-10", label: "10월", amount: 16_692_274, transactions: 239,
    });
    expect(initialDashboardData.sourceMeta).toMatchObject({
      period: "2026년 1월 - 10월", totalActual: 69_816_909, recordCount: 512,
    });
  });

  it("keeps conversion fees separate from the purchase-principal basis", () => {
    expect(report.transactions).toHaveLength(239);
    expect(new Set(report.transactions.map(row => row.sourceRow)).size).toBe(239);
    expect(report.transactions.every(row => row.date.startsWith("2026-10-") && row.purchaseDate && row.status === "정상")).toBe(true);
    expect(report.transactions.reduce((sum, row) => sum + row.amount, 0)).toBe(16_692_274);
    expect(report.transactions.reduce((sum, row) => sum + row.conversionFee, 0)).toBe(30_815);
    expect(report.conversionFeeIncluded).toBe(false);
    expect(report.basisCrosscheck).toMatchObject({matchedPurchasedRows: 53, allMatchedAmountsEqual: true});
  });

  it("preserves earlier months and reconciles category and unassigned-department totals", () => {
    expect(initialDashboardData.monthlyActuals.slice(0, 9)).toEqual(dashboardThroughSeptember.monthlyActuals);
    expect(initialDashboardData.forecastAdjustments).toEqual(dashboardThroughSeptember.forecastAdjustments);
    const previous = new Map(dashboardThroughSeptember.categoryCosts.map(row => [row.name, row.amount]));
    const added = Object.fromEntries(initialDashboardData.categoryCosts.map(row => [row.name, row.amount - (previous.get(row.name) ?? 0)]));
    expect(added).toEqual({
      "Claude/Anthropic": 11_163_001, "ChatGPT/OpenAI": 4_067_070, "Google/Gemini": 834_118,
      Genspark: 302_357, Gamma: 34_361, "미분류": 291_367, Perplexity: 0, Ollama: 0,
    });
    expect(initialDashboardData.departmentCosts.filter(row => row.sourceName === "부서 미지정")).toEqual([
      expect.objectContaining({total: 25_524_510, transactions: 319, monthly: {"2026-09": 8_832_236, "2026-10": 16_692_274}}),
    ]);
    expect(initialDashboardData.categoryCosts.reduce((sum, row) => sum + row.amount, 0)).toBe(69_816_909);
    expect(initialDashboardData.departmentCosts.reduce((sum, row) => sum + row.total, 0)).toBe(69_816_909);
    expect(() => appendOctoberCardSpend(initialDashboardData)).toThrow("한 번만");
  });
});
