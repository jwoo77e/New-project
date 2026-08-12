import { describe, expect, it } from "vitest";
import { executiveWorkforceInsightData } from "./executiveWorkforceInsightData";

describe("executiveWorkforceInsightData", () => {
  it("reconciles Team Plan coverage, conversions, and pure new seats", () => {
    expect(executiveWorkforceInsightData.eligibleEmployees).toBe(41);
    expect(executiveWorkforceInsightData.teamPlanUsers).toBe(22);
    expect(executiveWorkforceInsightData.teamPlanStandardUsers).toBe(16);
    expect(executiveWorkforceInsightData.teamPlanPremiumUsers).toBe(6);
    expect(executiveWorkforceInsightData.teamPlanCoverageRate).toBeCloseTo((22 / 41) * 100, 5);
    expect(executiveWorkforceInsightData.personalConversionAccounts).toHaveLength(4);
    expect(executiveWorkforceInsightData.personalConversionAccounts.map((account) => account.name)).toEqual([
      "박연석 전무",
      "김대일 상무",
      "조욱상 이사",
      "이병현 이사",
    ]);
    expect(executiveWorkforceInsightData.personalConversionAccounts.map((account) => account.currentPlan)).toEqual([
      "Claude Pro Max 20",
      "Claude Pro Max 20",
      "Claude Pro Max 5",
      "Claude Pro Max 5",
    ]);
    expect(executiveWorkforceInsightData.sharedConversionAccounts).toHaveLength(2);
    expect(executiveWorkforceInsightData.conversionSeats).toBe(6);
    expect(executiveWorkforceInsightData.pureAdditionalSeats).toBe(13);
    expect(executiveWorkforceInsightData.totalTeamPlanActions).toBe(19);
    expect(
      executiveWorkforceInsightData.teamPlanUsers
        + executiveWorkforceInsightData.conversionSeats
        + executiveWorkforceInsightData.pureAdditionalSeats,
    ).toBe(executiveWorkforceInsightData.eligibleEmployees);
  });

  it("calculates Premium conversions and Standard pure-new seats from current approval costs", () => {
    expect(executiveWorkforceInsightData.currentConversionCostKrw).toBe(1_470_150);
    expect(executiveWorkforceInsightData.teamPlanPremiumKrw).toBe(185_625);
    expect(executiveWorkforceInsightData.teamPlanStandardKrw).toBe(37_125);
    expect(executiveWorkforceInsightData.proposedConversionCostKrw).toBe(1_113_750);
    expect(executiveWorkforceInsightData.pureAdditionalCostKrw).toBe(482_625);
    expect(executiveWorkforceInsightData.proposedTeamPlanActionCostKrw).toBe(1_596_375);
    expect(executiveWorkforceInsightData.netMonthlyChangeKrw).toBe(126_225);
    expect(executiveWorkforceInsightData.projectedMonthlyKrw).toBeCloseTo(6_341_976.15, 2);
  });

  it("keeps July token measurement separate from pending source connections", () => {
    expect(executiveWorkforceInsightData.tokenMeasuredUsers).toBe(19);
    expect(executiveWorkforceInsightData.tokenMeasurementTarget).toBe(22);
    expect(executiveWorkforceInsightData.tokenPendingUsers.map((user) => user.name)).toEqual([
      "이동훈 부장",
      "박수진 과장",
      "송인나 대리",
    ]);
    expect(executiveWorkforceInsightData.powerUsers).toHaveLength(8);
    expect(executiveWorkforceInsightData.regularUsers).toHaveLength(6);
    expect(executiveWorkforceInsightData.lowUsageUsers).toHaveLength(5);
    expect(
      executiveWorkforceInsightData.usageSegments.reduce((sum, segment) => sum + segment.count, 0),
    ).toBe(19);
  });

  it("keeps the named high- and low-usage cohorts visible for management follow-up", () => {
    expect(executiveWorkforceInsightData.powerUsers).toEqual([
      "전우성 부장",
      "김재우 부장",
      "정재요 차장",
      "김하나 과장",
      "김영산 과장",
      "이한호 대리",
      "배현철 사원",
      "김혜진 과장",
    ]);
    expect(executiveWorkforceInsightData.lowUsageUsers).toEqual([
      "윤영관 과장",
      "임성진 부장",
      "이민재 부장",
      "박재현 상무",
      "김성진 부장",
    ]);
  });

  it("defines role-based AI activity estimation signals", () => {
    expect(executiveWorkforceInsightData.lowUsageReason).toBe(
      "업무량 감소, 질의 및 검색에 사용",
    );
    expect(executiveWorkforceInsightData.evaluationFramework.developer.measures).toEqual([
      "토큰",
      "Code Lines",
    ]);
    expect(executiveWorkforceInsightData.evaluationFramework.developer.description).toBe(
      "토큰과 Code Lines를 통해 활동량 추정",
    );
    expect(executiveWorkforceInsightData.evaluationFramework.nonDeveloper.measures).toEqual([
      "토큰",
      "생성 결과물 수",
    ]);
    expect(executiveWorkforceInsightData.evaluationFramework.nonDeveloper.description).toBe(
      "토큰과 생성 결과물의 수를 통해 활동량 추정",
    );
    expect(JSON.stringify(executiveWorkforceInsightData)).not.toContain("Drive");
  });
});
