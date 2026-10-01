import { describe, expect, it } from "vitest";
import { initialDashboardData } from "./aiCostData";
import { appendSeptemberCardSpend } from "./septemberCardSpend";
import report from "./septemberCardSpendSnapshot.json";

describe("September card purchase reconciliation", () => {
  it("reconciles all 86 source rows using purchase amounts instead of approval amounts", () => {
    expect(report.transactions).toHaveLength(86);
    expect(new Set(report.transactions.map((row) => row.sourceRow)).size).toBe(86);
    expect(report.transactions.every((row) => row.date.startsWith("2026-09-"))).toBe(true);
    expect(report.transactions.reduce((sum, row) => sum + row.approvalAmount, 0)).toBe(10_888_700);
    expect(report.transactions.reduce((sum, row) => sum + row.amount, 0)).toBe(8_832_236);
    expect(report.transactions.filter((row) => row.amount > 0)).toHaveLength(80);
    expect(initialDashboardData.monthlyActuals[8]).toEqual({
      month: "2026-09", label: "9월", amount: 8_832_236, transactions: 80,
    });
    expect(initialDashboardData.sourceMeta).toMatchObject({ totalActual: 53_124_635, recordCount: 273 });
  });

  it("uses September usage dates and neither adds pending approvals nor subtracts cancellations twice", () => {
    const pending = report.transactions.filter((row) => row.purchaseStatus === "미매입" && row.status === "정상");
    const canceled = report.transactions.filter((row) => row.status !== "정상");
    const nextMonthPurchases = report.transactions.filter((row) => row.purchaseDate?.startsWith("2026-10"));
    expect(pending).toHaveLength(4);
    expect(pending.reduce((sum, row) => sum + row.approvalAmount, 0)).toBe(75_612);
    expect(canceled).toHaveLength(2);
    expect([...pending, ...canceled].every((row) => row.amount === 0)).toBe(true);
    expect(canceled.reduce((sum, row) => sum + row.salesCancellationAmount, 0)).toBe(2_108_938);
    expect(nextMonthPurchases).toHaveLength(2);
    expect(nextMonthPurchases.reduce((sum, row) => sum + row.amount, 0)).toBe(50_000);
  });

  it("preserves January through August and reconciles category and unassigned department totals", () => {
    expect(initialDashboardData.monthlyActuals.slice(0, 8).map((row) => row.amount)).toEqual([
      2_640_896, 4_908_535, 7_249_647, 3_987_709, 9_055_396, 3_486_961, 5_613_605, 7_349_650,
    ]);
    expect(Object.fromEntries(initialDashboardData.categoryCosts.map((row) => [row.name, row.amount]))).toEqual({
      "Claude/Anthropic": 14_175_862 + 4_745_521,
      "ChatGPT/OpenAI": 8_523_522 + 3_199_008,
      "Google/Gemini": 13_736_142 + 462_530,
      Genspark: 6_864_283 + 311_681,
      Gamma: 376_477 + 35_421,
      "미분류": 551_305 + 78_075,
      Perplexity: 33_126,
      Ollama: 31_682,
    });
    expect(initialDashboardData.departmentCosts.find((row) => row.sourceName === "부서 미지정")).toMatchObject({
      total: 8_832_236, transactions: 80, monthly: { "2026-09": 8_832_236 },
    });
    expect(initialDashboardData.categoryCosts.reduce((sum, row) => sum + row.amount, 0)).toBe(53_124_635);
    expect(initialDashboardData.departmentCosts.reduce((sum, row) => sum + row.total, 0)).toBe(53_124_635);
    expect(initialDashboardData.forecastAdjustments.some((row) => row.month === "2026-09")).toBe(false);
    expect(() => appendSeptemberCardSpend(initialDashboardData)).toThrow("한 번만");
  });
});
