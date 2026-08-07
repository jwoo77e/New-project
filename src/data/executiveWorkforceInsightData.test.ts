import { describe, expect, it } from "vitest";
import { executiveWorkforceInsightData } from "./executiveWorkforceInsightData";

describe("executiveWorkforceInsightData", () => {
  it("reconciles the workforce coverage and full-coverage investment", () => {
    expect(executiveWorkforceInsightData.eligibleEmployees).toBe(41);
    expect(executiveWorkforceInsightData.dedicatedToolUsers).toBe(24);
    expect(executiveWorkforceInsightData.trackedUsers).toHaveLength(24);
    expect(executiveWorkforceInsightData.dedicatedToolCoverageRate).toBeCloseTo((24 / 41) * 100, 5);
    expect(executiveWorkforceInsightData.uncoveredEmployees).toBe(17);
    expect(executiveWorkforceInsightData.incrementalMonthlyKrw).toBe(680_000);
  });

  it("uses the July token thresholds without mixing in artifact-only users", () => {
    expect(executiveWorkforceInsightData.tokenMeasuredUsers).toBe(19);
    expect(executiveWorkforceInsightData.powerUsers).toHaveLength(8);
    expect(executiveWorkforceInsightData.regularUsers).toHaveLength(6);
    expect(executiveWorkforceInsightData.lowUsageUsers).toHaveLength(5);
    expect(executiveWorkforceInsightData.artifactTrackedUsers).toHaveLength(5);
    expect(
      executiveWorkforceInsightData.usageSegments.reduce((sum, segment) => sum + segment.count, 0),
    ).toBe(24);
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
});
