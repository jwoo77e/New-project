import { describe, expect, it } from "vitest";
import { initialAiToolApprovalData } from "./aiToolApprovalData";

describe("initialAiToolApprovalData", () => {
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

  it("reconciles the updated plan mix and monthly totals", () => {
    expect(
      initialAiToolApprovalData.toolSummary.find(
        (item) => item.key === "Claude Team Plan Premium",
      ),
    ).toMatchObject({
      count: 5,
      monthlyUsd: 625,
      monthlyKrw: 928_125,
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
    expect(initialAiToolApprovalData.totalMonthlyUsd).toBe(2_795.71);
    expect(initialAiToolApprovalData.totalMonthlyKrw).toBe(4_151_629.35);
  });

  it("keeps category and payment totals aligned with the updated total", () => {
    expect(
      initialAiToolApprovalData.categorySummary.find((item) => item.key === "Claude"),
    ).toMatchObject({
      count: 25,
      monthlyUsd: 1_965,
      monthlyKrw: 2_918_025,
    });
    expect(initialAiToolApprovalData.aiDedicatedCardAccounts).toBe(36);
    expect(initialAiToolApprovalData.aiDedicatedCardKrw).toBe(
      initialAiToolApprovalData.totalMonthlyKrw,
    );
  });
});
