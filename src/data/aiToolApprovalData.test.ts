import { describe, expect, it } from "vitest";
import {
  approvalMonthlyTotalsForMonth,
  initialAiToolApprovalData,
} from "./aiToolApprovalData";

describe("initialAiToolApprovalData", () => {
  it("assigns the company-wide ChatGPT account to the 20x plan", () => {
    expect(
      initialAiToolApprovalData.records.find(
        (record) => record.account === "riskzeroriskzero@gmail.com",
      ),
    ).toMatchObject({
      owner: "전사",
      tool: "chatGPT Pro(20배)",
      monthlyUsd: 220,
      monthlyKrw: 326_700,
      paymentMethod: "AI 전용 카드",
    });
    expect(
      initialAiToolApprovalData.toolSummary.find(
        (item) => item.key === "chatGPT Pro(20배)",
      ),
    ).toMatchObject({
      count: 2,
      monthlyUsd: 440,
      monthlyKrw: 653_400,
    });
  });

  it("assigns Kim Hana and Jeon Woosung to Claude Team Premium", () => {
    for (const account of ["staycurious@riskzero.kr", "woosung.jeon@riskzero.kr"]) {
      expect(
        initialAiToolApprovalData.records.find((record) => record.account === account),
      ).toMatchObject({
        tool: "Claude Team Plan Premium",
        monthlyUsd: 125,
        monthlyKrw: 185_625,
      });
    }
  });

  it("assigns Gu Munyoung to Claude Team Premium", () => {
    expect(
      initialAiToolApprovalData.records.find(
        (record) => record.account === "mygu@riskzero.kr",
      ),
    ).toMatchObject({
      owner: "구문영 사원 / 플랫폼개발",
      tool: "Claude Team Plan Premium",
      monthlyUsd: 125,
      monthlyKrw: 185_625,
    });
  });

  it("assigns Lim Sungbeom to Claude Pro Max 20", () => {
    expect(
      initialAiToolApprovalData.records.find(
        (record) =>
          record.account === "riskzero.marketing@gmail.com" &&
          record.category === "Claude",
      ),
    ).toMatchObject({
      owner: "임성범 부장 / 전략사업팀",
      tool: "Claude Pro Max 20",
      monthlyUsd: 220,
      monthlyKrw: 326_700,
    });
  });

  it("assigns Lee Donghun to Claude Team Standard", () => {
    expect(
      initialAiToolApprovalData.records.find(
        (record) => record.account === "dhlee@riskzero.kr",
      ),
    ).toMatchObject({
      owner: "이동훈 부장 / 플랫폼개발",
      department: "플랫폼개발",
      tool: "Claude Team Plan Standard",
      monthlyUsd: 25,
      monthlyKrw: 37_125,
      paymentMethod: "AI 전용 카드",
    });
  });

  it("reconciles the updated plan mix and monthly totals", () => {
    expect(
      initialAiToolApprovalData.toolSummary.find(
        (item) => item.key === "Claude Team Plan Premium",
      ),
    ).toMatchObject({
      count: 6,
      monthlyUsd: 750,
      monthlyKrw: 1_113_750,
    });
    expect(
      initialAiToolApprovalData.toolSummary.find(
        (item) => item.key === "Claude Team Plan Standard",
      ),
    ).toMatchObject({
      count: 14,
      monthlyUsd: 350,
      monthlyKrw: 519_750,
    });
    expect(
      initialAiToolApprovalData.toolSummary.find(
        (item) => item.key === "Claude Pro Max 5",
      ),
    ).toMatchObject({
      count: 3,
      monthlyUsd: 330,
      monthlyKrw: 490_050,
    });
    expect(
      initialAiToolApprovalData.toolSummary.find(
        (item) => item.key === "Claude Pro Max 20",
      ),
    ).toMatchObject({
      count: 3,
      monthlyUsd: 660,
      monthlyKrw: 980_100,
    });
    expect(initialAiToolApprovalData.totalMonthlyUsd).toBe(3_015.59);
    expect(initialAiToolApprovalData.totalMonthlyKrw).toBe(5_978_151.15);
  });

  it("keeps category and payment totals aligned with the updated total", () => {
    expect(
      initialAiToolApprovalData.categorySummary.find((item) => item.key === "Claude"),
    ).toMatchObject({
      count: 26,
      monthlyUsd: 2_090,
      monthlyKrw: 3_103_650,
    });
    expect(initialAiToolApprovalData.aiDedicatedCardAccounts).toBe(36);
    expect(initialAiToolApprovalData.aiDedicatedCardKrw).toBe(4_478_151.15);
    expect(
      initialAiToolApprovalData.paymentSummary.find((item) => item.key === "계약 고정비"),
    ).toMatchObject({
      count: 1,
      monthlyUsd: 0,
      monthlyKrw: 1_500_000,
    });
  });

  it("adds the GH AI Agent API fixed service cost from August 2026", () => {
    expect(
      initialAiToolApprovalData.records.find((record) => record.category === "AI API"),
    ).toMatchObject({
      tool: "GH AI Agent AI API 서비스",
      owner: "GH AI Agent 개발 / 플랫폼개발팀",
      department: "플랫폼개발",
      monthlyUsd: 0,
      monthlyKrw: 1_500_000,
      billingCurrency: "KRW",
      startMonth: "2026-08",
      paymentMethod: "계약 고정비",
    });

    expect(approvalMonthlyTotalsForMonth(initialAiToolApprovalData, "2026-07")).toMatchObject({
      count: 36,
      monthlyUsd: 3_015.59,
      monthlyKrw: 4_478_151.15,
    });
    expect(approvalMonthlyTotalsForMonth(initialAiToolApprovalData, "2026-08")).toMatchObject({
      count: 37,
      monthlyUsd: 3_015.59,
      monthlyKrw: 5_978_151.15,
    });
  });

  it("removes the unused ai.marketing Gemini account from approvals", () => {
    expect(
      initialAiToolApprovalData.records.some(
        (record) =>
          record.account === "ai.marketing@riskzero.kr" ||
          record.linkedAccount === "ai.marketing@riskzero.kr",
      ),
    ).toBe(false);
    expect(
      initialAiToolApprovalData.toolSummary.find(
        (item) => item.key === "Gemini(Google Workspace)",
      ),
    ).toMatchObject({
      count: 5,
      monthlyUsd: 75.6,
      monthlyKrw: 112_266,
    });
  });
});
