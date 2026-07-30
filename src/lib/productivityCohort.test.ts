import { describe, expect, it } from "vitest";
import { initialDashboardData } from "../data/aiCostData";
import { initialAiToolApprovalData } from "../data/aiToolApprovalData";
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
    expect(model.cohorts[0].costKrw).toBe(3_486_961);
    expect(model.cohorts[1].costKrw).toBe(initialAiToolApprovalData.totalMonthlyKrw);
    expect(model.currentFixedCostKrw).toBe(initialAiToolApprovalData.totalMonthlyKrw);
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
      claudeConversations: 223,
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

  it("uses deduplicated Drive prompts as daily Claude conversation activity", () => {
    expect(model.claudeConversations).toBe(256);
    expect(model.currentMonthClaudeConversations).toBe(223);
    expect(model.currentMonthDriveOutputs).toBe(771);
    expect(model.conversationActiveDays).toBe(28);
    expect(model.dailyDriveActivity.reduce((sum, item) => sum + item.claudeConversations, 0)).toBe(256);
    expect(
      model.dailyDriveActivity.reduce((sum, item) => sum + item.driveOutputSignals, 0) +
        driveArtifactRepositoryData.activityAnalysis.undatedOutputSignals,
    ).toBe(830);
  });

  it("builds separate adoption, activity, and output KPI stages", () => {
    expect(model.axKpis.adoption).toMatchObject({
      evidenceContributors: 2,
    });
    expect(model.axKpis.adoption.evidenceCoverageRate).toBeCloseTo((2 / 19) * 100, 5);

    expect(model.axKpis.activity).toMatchObject({
      observedDays: 23,
      activeDays: 22,
      topContributor: "김재우",
    });
    expect(model.axKpis.activity.activeDayRate).toBeCloseTo((22 / 23) * 100, 5);
    expect(model.axKpis.activity.conversationsPerActiveDay).toBeCloseTo(223 / 22, 5);
    expect(model.axKpis.activity.previousConversationsPerActiveDay).toBeCloseTo(33 / 6, 5);
    expect(model.axKpis.activity.dailyGrowthRate).toBeCloseTo(84.2975, 3);

    expect(model.axKpis.output).toMatchObject({
      observedDays: 23,
      outputDays: 23,
      peakDate: "2026-07-08",
      peakOutputs: 240,
    });
    expect(model.axKpis.output.outputsPerObservedDay).toBeCloseTo(771 / 23, 5);
    expect(model.axKpis.output.previousOutputsPerObservedDay).toBeCloseTo(58 / 7, 5);
    expect(model.axKpis.output.outputsPerConversation).toBeCloseTo(771 / 223, 5);
    expect(model.axKpis.output.yieldGrowthRate).toBeCloseTo(96.714, 3);
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
