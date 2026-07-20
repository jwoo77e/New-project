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
  });

  it("aligns observable monthly usage with the same cost month", () => {
    expect(model.costUsageSeries.find((item) => item.month === "2026-06")?.chatGptConversations).toBe(37);
    expect(model.activeUsers).toBe(19);
    expect(model.licensedUsers).toBe(19);
    expect(model.activationRate).toBe(100);
    expect(model.observableRepositoryOutputs).toBe(
      driveArtifactRepositoryData.totals.outputs + (initialGensparkUsageData.driveAnalysis?.totalFiles ?? 0),
    );
  });

  it("separates active Claude seats from accounts with spend activity", () => {
    expect(initialClaudeTeamUsageData.source.verification.memberAccounts).toBe(19);
    expect(initialClaudeTeamUsageData.source.verification.activeMemberAccounts).toBe(19);
    expect(initialClaudeTeamUsageData.users).toHaveLength(19);
    expect(initialClaudeTeamUsageData.activeUsers).toBe(19);
    expect(initialClaudeTeamUsageData.spendUsers).toBe(18);
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
