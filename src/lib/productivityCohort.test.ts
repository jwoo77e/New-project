import { describe, expect, it } from "vitest";
import { initialDashboardData } from "../data/aiCostData";
import {
  approvalMonthlyTotalsForMonth,
  initialAiToolApprovalData,
} from "../data/aiToolApprovalData";
import { chatGptUsageData } from "../data/chatGptUsageData";
import { initialClaudeTeamUsageData } from "../data/claudeTeamUsageData";
import { driveArtifactRepositoryData } from "../data/driveArtifactRepositoryData";
import { initialGensparkUsageData } from "../data/gensparkUsageData";
import { buildProductivityExecutiveModel } from "./productivityCohort";

describe("buildProductivityExecutiveModel", () => {
  const model = buildProductivityExecutiveModel({
    monthlyActuals: initialDashboardData.monthlyActuals,
    approvalData: initialAiToolApprovalData,
    chatGptData: chatGptUsageData,
    claudeTeamData: initialClaudeTeamUsageData,
    driveData: driveArtifactRepositoryData,
    gensparkData: initialGensparkUsageData,
  });

  it("keeps the last confirmed cost month separate from the latest usage month", () => {
    expect(model.lastClosedMonth).toBe("2026-06");
    expect(model.currentMonth).toBe("2026-07");
    expect(model.lagMonths).toBe(1);
    expect(model.cohorts.map((item) => item.status)).toEqual(["확정", "잠정"]);
  });

  it("uses current subscriptions only as the open-month minimum cost", () => {
    const julyApprovalTotals = approvalMonthlyTotalsForMonth(initialAiToolApprovalData, "2026-07");

    expect(model.cohorts[0].costKrw).toBe(3_486_961);
    expect(model.cohorts[1].costKrw).toBe(julyApprovalTotals.monthlyKrw);
    expect(model.currentFixedCostKrw).toBe(julyApprovalTotals.monthlyKrw);
  });

  it("aligns observable monthly usage with the same cost month", () => {
    expect(model.costUsageSeries.find((item) => item.month === "2026-06")).toMatchObject({
      chatGptConversations: 37,
      claudeConversations: 33,
      driveOutputSignals: 58,
    });
    expect(model.costUsageSeries.find((item) => item.month === "2026-07")).toMatchObject({
      costKrw: null,
      chatGptConversations: 0,
      claudeConversations: 225,
      driveOutputSignals: 771,
    });
    expect(model.activeUsers).toBe(19);
    expect(model.licensedUsers).toBe(20);
    expect(model.activationRate).toBe(95);
    expect(model.observableRepositoryOutputs).toBe(
      driveArtifactRepositoryData.activityAnalysis.totalOutputSignals +
        (initialGensparkUsageData.driveAnalysis?.totalFiles ?? 0),
    );
    expect(model.sourceFreshness.find((source) => source.source === "Claude Drive")).toMatchObject({
      status: "전체 폴더 집계",
    });
  });

  it("keeps intervening usage months when the latest source advances beyond the cost lag", () => {
    const augustModel = buildProductivityExecutiveModel({
      monthlyActuals: initialDashboardData.monthlyActuals,
      approvalData: initialAiToolApprovalData,
      chatGptData: chatGptUsageData,
      claudeTeamData: initialClaudeTeamUsageData,
      driveData: driveArtifactRepositoryData,
      gensparkData: {
        ...initialGensparkUsageData,
        driveAnalysis: {
          ...initialGensparkUsageData.driveAnalysis!,
          latestOutputDate: "2026-08-03",
          source: {
            ...initialGensparkUsageData.driveAnalysis!.source,
            period: "2025-12-17 ~ 2026-08-03",
          },
        },
      },
    });

    expect(augustModel.currentMonth).toBe("2026-08");
    expect(augustModel.costUsageSeries.slice(-3).map((item) => item.month)).toEqual([
      "2026-06",
      "2026-07",
      "2026-08",
    ]);
    expect(augustModel.costUsageSeries.find((item) => item.month === "2026-07")).toMatchObject({
      chatGptConversations: 0,
      claudeConversations: 225,
      driveOutputSignals: 771,
    });
  });

  it("uses deduplicated Drive prompts as daily Claude conversation activity", () => {
    expect(model.claudeConversations).toBe(258);
    expect(model.currentMonthClaudeConversations).toBe(225);
    expect(model.currentMonthDriveOutputs).toBe(771);
    expect(model.conversationActiveDays).toBe(29);
    expect(model.dailyDriveActivity.reduce((sum, item) => sum + item.claudeConversations, 0)).toBe(258);
    expect(
      model.dailyDriveActivity.reduce((sum, item) => sum + item.driveOutputSignals, 0) +
        driveArtifactRepositoryData.activityAnalysis.undatedOutputSignals,
    ).toBe(830);
  });

  it("builds separate adoption, activity, and output KPI stages", () => {
    expect(model.axKpis.adoption).toMatchObject({
      evidenceContributors: 3,
    });
    expect(model.axKpis.adoption.evidenceCoverageRate).toBeCloseTo((3 / 19) * 100, 5);

    expect(model.axKpis.activity).toMatchObject({
      observedDays: 24,
      activeDays: 23,
      topContributor: "김재우",
    });
    expect(model.axKpis.activity.activeDayRate).toBeCloseTo((23 / 24) * 100, 5);
    expect(model.axKpis.activity.conversationsPerActiveDay).toBeCloseTo(225 / 23, 5);
    expect(model.axKpis.activity.previousConversationsPerActiveDay).toBeCloseTo(33 / 6, 5);
    expect(model.axKpis.activity.dailyGrowthRate).toBeCloseTo(77.8656, 3);

    expect(model.axKpis.output).toMatchObject({
      observedDays: 24,
      outputDays: 23,
      peakDate: "2026-07-08",
      peakOutputs: 240,
    });
    expect(model.axKpis.output.outputsPerObservedDay).toBeCloseTo(771 / 24, 5);
    expect(model.axKpis.output.previousOutputsPerObservedDay).toBeCloseTo(58 / 7, 5);
    expect(model.axKpis.output.outputsPerConversation).toBeCloseTo(771 / 225, 5);
    expect(model.axKpis.output.yieldGrowthRate).toBeCloseTo(94.9655, 3);
    expect(model.axKpis.output.peakShare).toBeCloseTo((240 / 771) * 100, 5);
  });

  it("reconciles active Claude seats with the latest spend activity", () => {
    expect(initialClaudeTeamUsageData.source.verification.memberAccounts).toBe(19);
    expect(initialClaudeTeamUsageData.source.verification.activeMemberAccounts).toBe(19);
    expect(initialClaudeTeamUsageData.source.verification.approvedAccounts).toBe(20);
    expect(initialClaudeTeamUsageData.source.verification.approvedButNoUsage).toBe(1);
    expect(initialClaudeTeamUsageData.users).toHaveLength(20);
    expect(initialClaudeTeamUsageData.activeUsers).toBe(19);
    expect(initialClaudeTeamUsageData.spendUsers).toBe(19);
    expect(
      initialClaudeTeamUsageData.users.find((user) => user.email === "dhlee@riskzero.kr"),
    ).toMatchObject({
      displayName: "이동훈 부장",
      requests: 0,
      codeLines: 0,
      level: "Low",
    });
  });

  it("reconciles monthly, department, and category totals to the source total", () => {
    expect(initialDashboardData.monthlyActuals.reduce((sum, item) => sum + item.amount, 0)).toBe(
      initialDashboardData.sourceMeta.totalActual,
    );
    expect(initialDashboardData.departmentCosts.reduce((sum, item) => sum + item.total, 0)).toBe(
      initialDashboardData.sourceMeta.totalActual,
    );
    expect(initialDashboardData.categoryCosts.reduce((sum, item) => sum + item.amount, 0)).toBe(
      initialDashboardData.sourceMeta.totalActual,
    );
  });
});
