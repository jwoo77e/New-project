import { describe, expect, it } from "vitest";
import { executiveWorkforceInsightData } from "./executiveWorkforceInsightData";

describe("executiveWorkforceInsightData", () => {
  it("reconciles Team Plan coverage, conversions, and pure new seats", () => {
    expect(executiveWorkforceInsightData.eligibleEmployees).toBe(41);
    expect(executiveWorkforceInsightData.teamPlanUsers).toBe(22);
    expect(executiveWorkforceInsightData.teamPlanStandardUsers).toBe(16);
    expect(executiveWorkforceInsightData.teamPlanPremiumUsers).toBe(6);
    expect(executiveWorkforceInsightData.teamPlanCoverageRate).toBeCloseTo((22 / 41) * 100, 5);
    expect(executiveWorkforceInsightData.personalConversionAccounts).toHaveLength(2);
    expect(executiveWorkforceInsightData.sharedConversionAccounts).toHaveLength(2);
    expect(executiveWorkforceInsightData.conversionSeats).toBe(4);
    expect(executiveWorkforceInsightData.pureAdditionalSeats).toBe(15);
    expect(executiveWorkforceInsightData.totalTeamPlanActions).toBe(19);
    expect(
      executiveWorkforceInsightData.teamPlanUsers
        + executiveWorkforceInsightData.conversionSeats
        + executiveWorkforceInsightData.pureAdditionalSeats,
    ).toBe(executiveWorkforceInsightData.eligibleEmployees);
  });

  it("calculates the Standard conversion scenario from current approval costs", () => {
    expect(executiveWorkforceInsightData.currentConversionCostKrw).toBe(1_143_450);
    expect(executiveWorkforceInsightData.proposedConversionCostKrw).toBe(148_500);
    expect(executiveWorkforceInsightData.pureAdditionalCostKrw).toBe(556_875);
    expect(executiveWorkforceInsightData.proposedTeamPlanActionCostKrw).toBe(705_375);
    expect(executiveWorkforceInsightData.netMonthlyChangeKrw).toBe(-438_075);
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

  it("defines role-based utilization measures without Drive tracking", () => {
    expect(executiveWorkforceInsightData.lowUsageReason).toBe(
      "업무량 감소 및 Chat을 통한 검색·질의 중심 사용으로 토큰 활용이 미진함",
    );
    expect(executiveWorkforceInsightData.evaluationFramework.developer.measures).toEqual([
      "토큰 사용량",
      "생성 Code Lines",
    ]);
    expect(executiveWorkforceInsightData.evaluationFramework.nonDeveloper.measures).toEqual([
      "토큰 사용량",
      "생성 결과물",
    ]);
    expect(JSON.stringify(executiveWorkforceInsightData)).not.toContain("Drive");
  });
});
