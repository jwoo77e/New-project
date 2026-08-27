import { describe, expect, it } from "vitest";
import { executiveWorkforceInsightData } from "./executiveWorkforceInsightData";

describe("executiveWorkforceInsightData", () => {
  it("reconciles complete employee Team Plan coverage and the separate executive seat", () => {
    expect(executiveWorkforceInsightData.eligibleEmployees).toBe(40);
    expect(executiveWorkforceInsightData.departedEmployees).toBe(1);
    expect(executiveWorkforceInsightData.teamPlanUsers).toBe(40);
    expect(executiveWorkforceInsightData.teamPlanStandardUsers).toBe(29);
    expect(executiveWorkforceInsightData.teamPlanPremiumUsers).toBe(11);
    expect(executiveWorkforceInsightData.executiveTeamPlanSeats).toBe(1);
    expect(executiveWorkforceInsightData.teamPlanCoverageRate).toBe(100);
    expect(executiveWorkforceInsightData.personalConversionAccounts).toHaveLength(0);
    expect(executiveWorkforceInsightData.sharedConversionAccounts).toHaveLength(0);
    expect(executiveWorkforceInsightData.conversionSeats).toBe(0);
    expect(executiveWorkforceInsightData.pureAdditionalSeats).toBe(0);
    expect(executiveWorkforceInsightData.totalTeamPlanActions).toBe(0);
    expect(
      executiveWorkforceInsightData.teamPlanUsers
        + executiveWorkforceInsightData.conversionSeats
        + executiveWorkforceInsightData.pureAdditionalSeats,
    ).toBe(executiveWorkforceInsightData.eligibleEmployees);
  });

  it("does not add a second conversion scenario after rollout completion", () => {
    expect(executiveWorkforceInsightData.currentConversionCostKrw).toBe(0);
    expect(executiveWorkforceInsightData.teamPlanPremiumKrw).toBe(185_625);
    expect(executiveWorkforceInsightData.teamPlanStandardKrw).toBe(37_125);
    expect(executiveWorkforceInsightData.proposedConversionCostKrw).toBe(0);
    expect(executiveWorkforceInsightData.pureAdditionalCostKrw).toBe(0);
    expect(executiveWorkforceInsightData.proposedTeamPlanActionCostKrw).toBe(0);
    expect(executiveWorkforceInsightData.netMonthlyChangeKrw).toBe(0);
    expect(executiveWorkforceInsightData.projectedMonthlyKrw).toBeCloseTo(6_126_651.15, 2);
  });

  it("measures token coverage against all 41 Team Plan seats", () => {
    expect(executiveWorkforceInsightData.tokenMeasuredUsers).toBe(22);
    expect(executiveWorkforceInsightData.tokenMeasurementTarget).toBe(41);
    expect(executiveWorkforceInsightData.tokenPendingUsers).toHaveLength(19);
    expect(executiveWorkforceInsightData.tokenPendingUsers.map((user) => user.name)).toEqual(
      expect.arrayContaining(["대표님", "김대일 상무", "이형배 상무"]),
    );
    expect(executiveWorkforceInsightData.tokenMeasurementCoverageRate).toBeCloseTo((22 / 41) * 100, 5);
    expect(executiveWorkforceInsightData.tokenActivityClassifiedUsers).toBe(19);
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
      "질의 및 검색에 사용",
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
