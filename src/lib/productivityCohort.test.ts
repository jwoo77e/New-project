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
import type { DriveArtifactTrendSnapshot } from "./driveArtifactTrendSnapshot";
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
    expect(model.currentMonth).toBe("2026-08");
    expect(model.lagMonths).toBe(2);
    expect(model.cohorts.map((item) => item.status)).toEqual(["확정", "비용 대기", "잠정"]);
  });

  it("uses current subscriptions only as the open-month minimum cost", () => {
    const augustApprovalTotals = approvalMonthlyTotalsForMonth(initialAiToolApprovalData, "2026-08");

    expect(model.cohorts[0].costKrw).toBe(3_486_961);
    expect(model.cohorts[1].costKrw).toBeNull();
    expect(model.cohorts[2].costKrw).toBe(augustApprovalTotals.monthlyKrw);
    expect(model.currentFixedCostKrw).toBe(augustApprovalTotals.monthlyKrw);
  });

  it("aligns observable monthly usage with the same cost month", () => {
    expect(model.costUsageSeries.find((item) => item.month === "2026-06")).toMatchObject({
      chatGptConversations: 37,
      claudeDriveConversations: 33,
      claudeExportConversations: 35,
      claudeConversations: 68,
      conversationSignals: 105,
      driveOutputSignals: 58,
    });
    expect(model.costUsageSeries.find((item) => item.month === "2026-07")).toMatchObject({
      costKrw: 4_478_151.15,
      costStatus: "최소",
      chatGptConversations: 0,
      claudeDriveConversations: 225,
      claudeExportConversations: 91,
      claudeConversations: 316,
      conversationSignals: 316,
      driveOutputSignals: 771,
      driveStoredFiles: null,
    });
    expect(model.costUsageSeries.find((item) => item.month === "2026-08")).toMatchObject({
      costKrw: 6_141_501.15,
      costStatus: "최소",
      claudeDriveConversations: 69,
      claudeExportConversations: 6,
      claudeConversations: 75,
      conversationSignals: 75,
    });
    expect(model.activeUsers).toBe(20);
    expect(model.licensedUsers).toBe(20);
    expect(model.activationRate).toBe(100);
    expect(model.observableRepositoryOutputs).toBe(
      driveArtifactRepositoryData.activityAnalysis.totalOutputSignals +
        (initialGensparkUsageData.driveAnalysis?.totalFiles ?? 0),
    );
    expect(model.sourceFreshness.find((source) => source.source === "Claude Drive")).toMatchObject({
      status: "전체 폴더 집계",
    });
    expect(model.sourceFreshness.find((source) => source.source === "Claude Export")).toMatchObject({
      status: "부분 집계",
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
      claudeDriveConversations: 225,
      claudeExportConversations: 91,
      claudeConversations: 316,
      driveOutputSignals: 771,
    });
    expect(augustModel.classifiedActivityMonth).toBe("2026-08");
    expect(augustModel.classifiedOutputMonth).toBe("2026-07");
    expect(augustModel.currentMonthClaudeConversations).toBe(69);
    expect(augustModel.currentMonthClaudeExportConversations).toBe(6);
    expect(augustModel.currentMonthClaudeCombinedConversations).toBe(75);
  });

  it("uses the daily Drive trend for current-month stored files and keeps conversation sources distinct", () => {
    const augustDriveTrend: DriveArtifactTrendSnapshot = {
      version: 1,
      source: {
        name: "Claude Drive 날짜별 저장 파일 증감",
        status: "정상",
        collectedAt: "2026-08-04 21:07 KST",
        generatedAt: "2026-08-04T12:07:28.999Z",
        period: "2026-06-23 ~ 2026-08-04",
        schedule: "매일 21:00 KST",
        note: "테스트 스냅샷",
      },
      repositories: [
        {
          owner: "김재우",
          folderId: "kim",
          folderUrl: "https://drive.google.com/kim",
          artifacts: [],
          inventory: {
            fileCount: 134,
            directFileCount: 0,
            nestedFileCount: 134,
            folderCount: 1,
            maxDepth: 1,
            metadataDateAnomalyCount: 0,
            dailyCounts: [
              { date: "2026-08-01", count: 43 },
              { date: "2026-08-02", count: 24 },
              { date: "2026-08-03", count: 30 },
              { date: "2026-08-04", count: 37 },
            ],
          },
        },
        {
          owner: "이형배",
          folderId: "lee",
          folderUrl: "https://drive.google.com/lee",
          artifacts: [],
          inventory: {
            fileCount: 158,
            directFileCount: 0,
            nestedFileCount: 158,
            folderCount: 1,
            maxDepth: 1,
            metadataDateAnomalyCount: 0,
            dailyCounts: [
              { date: "2026-08-01", count: 39 },
              { date: "2026-08-02", count: 37 },
              { date: "2026-08-04", count: 82 },
            ],
          },
        },
      ],
      totals: {
        files: 292,
        directFiles: 0,
        nestedFiles: 292,
        folders: 2,
        metadataDateAnomalies: 0,
      },
    };
    const augustModel = buildProductivityExecutiveModel({
      monthlyActuals: initialDashboardData.monthlyActuals,
      approvalData: initialAiToolApprovalData,
      chatGptData: chatGptUsageData,
      claudeTeamData: initialClaudeTeamUsageData,
      driveData: driveArtifactRepositoryData,
      driveTrendData: augustDriveTrend,
      gensparkData: initialGensparkUsageData,
    });

    expect(augustModel.currentMonth).toBe("2026-08");
    expect(augustModel.classifiedActivityMonth).toBe("2026-08");
    expect(augustModel.currentMonthDriveStoredFiles).toBe(292);
    expect(augustModel.costUsageSeries.find((item) => item.month === "2026-08")).toMatchObject({
      costKrw: 6_141_501.15,
      costStatus: "최소",
      claudeDriveConversations: 69,
      claudeExportConversations: 6,
      claudeConversations: 75,
      conversationSignals: 75,
      driveStoredFiles: 292,
    });
  });

  it("uses deduplicated Drive prompts as daily Claude conversation activity", () => {
    expect(model.claudeConversations).toBe(327);
    expect(model.currentMonthClaudeConversations).toBe(69);
    expect(model.currentMonthClaudeExportConversations).toBe(6);
    expect(model.currentMonthClaudeCombinedConversations).toBe(75);
    expect(model.currentMonthDriveOutputs).toBe(771);
    expect(model.conversationActiveDays).toBe(33);
    expect(model.dailyDriveActivity.reduce((sum, item) => sum + item.claudeConversations, 0)).toBe(327);
    expect(
      model.dailyDriveActivity.reduce((sum, item) => sum + item.driveOutputSignals, 0) +
        driveArtifactRepositoryData.activityAnalysis.undatedOutputSignals,
    ).toBe(830);
  });

  it("keeps inferred conversations separate from content-verified prompt records", () => {
    expect(driveArtifactRepositoryData.activityAnalysis.promptEvidence).toMatchObject({
      totalRecords: 58,
      promptOnlyRecords: 5,
      promptResponseRecords: 53,
      responseOnlyRecords: 5,
    });
    expect(
      driveArtifactRepositoryData.activityAnalysis.byOwner.reduce(
        (sum, owner) => sum + owner.promptRecords,
        0,
      ),
    ).toBe(58);
    expect(model.drivePromptRecords).toBe(58);
    expect(model.drivePromptOnlyRecords).toBe(5);
    expect(model.drivePromptResponseRecords).toBe(53);
    expect(model.driveResponseOnlyRecords).toBe(5);
    expect(model.claudeConversations).not.toBe(model.drivePromptRecords);
  });

  it("builds separate adoption, activity, and output KPI stages", () => {
    expect(model.axKpis.adoption).toMatchObject({
      evidenceContributors: 3,
    });
    expect(model.axKpis.adoption.evidenceCoverageRate).toBeCloseTo((3 / 20) * 100, 5);

    expect(model.axKpis.activity).toMatchObject({
      observedDays: 4,
      activeDays: 4,
      topContributor: "김재우",
    });
    expect(model.axKpis.activity.activeDayRate).toBe(100);
    expect(model.axKpis.activity.conversationsPerActiveDay).toBeCloseTo(69 / 4, 5);
    expect(model.axKpis.activity.previousConversationsPerActiveDay).toBeCloseTo(225 / 23, 5);
    expect(model.axKpis.activity.dailyGrowthRate).toBeCloseTo(76.3333, 3);

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
    expect(initialClaudeTeamUsageData.source.verification.memberAccounts).toBe(20);
    expect(initialClaudeTeamUsageData.source.verification.activeMemberAccounts).toBe(20);
    expect(initialClaudeTeamUsageData.source.verification.approvedAccounts).toBe(20);
    expect(initialClaudeTeamUsageData.source.verification.approvedButNoUsage).toBe(4);
    expect(initialClaudeTeamUsageData.users).toHaveLength(20);
    expect(initialClaudeTeamUsageData.activeUsers).toBe(20);
    expect(initialClaudeTeamUsageData.spendUsers).toBe(14);
    expect(initialClaudeTeamUsageData.codeUsers).toBe(12);
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
