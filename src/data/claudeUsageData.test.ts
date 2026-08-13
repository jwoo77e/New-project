import { describe, expect, it } from "vitest";
import { claudeExportUsageData } from "./claudeExportUsageData";
import { initialClaudeTeamUsageData } from "./claudeTeamUsageData";
import { initialGensparkUsageData } from "./gensparkUsageData";

const sumBy = <T>(items: T[], select: (item: T) => number) =>
  items.reduce((sum, item) => sum + select(item), 0);

describe("Claude usage snapshots", () => {
  it("captures the provided August source windows", () => {
    expect(initialClaudeTeamUsageData.source).toMatchObject({
      generatedAt: "2026-08-13",
      spendFile: "2026-08-06-spend-report.csv + 2026-08-13-spend-report.csv",
      codeLinesFile: "2026-08-13-claude_code.csv",
    });
    expect(initialClaudeTeamUsageData.source.verification.spendRecords).toBe(119);
    expect(initialClaudeTeamUsageData.licensedUsers).toBe(22);
    expect(initialClaudeTeamUsageData.activeUsers).toBe(22);
    expect(initialClaudeTeamUsageData.totalRequests).toBe(50524);
    expect(initialClaudeTeamUsageData.totalTokens).toBe(12554215370);
    expect(initialClaudeTeamUsageData.totalGrossSpendUsd).toBeCloseTo(35.32, 2);
    expect(initialClaudeTeamUsageData.totalCodeLines).toBe(166729);

    expect(claudeExportUsageData.source).toMatchObject({
      collectedAt: "2026-08-05",
      period: "2026-05-11 ~ 2026-08-04",
    });
    expect(claudeExportUsageData.totalConversations).toBe(168);
    expect(claudeExportUsageData.totalMessages).toBe(2862);
    expect(
      claudeExportUsageData.monthlyUsage[claudeExportUsageData.monthlyUsage.length - 1],
    ).toEqual({
      month: "2026-08",
      conversations: 6,
    });
  });

  it("reconciles account totals with the Team CSV summaries", () => {
    const data = initialClaudeTeamUsageData;

    expect(data.users).toHaveLength(data.licensedUsers);
    expect(data.spendUsers).toBe(data.users.filter((user) => user.requests > 0).length);
    expect(data.codeUsers).toBe(data.users.filter((user) => user.codeLines > 0).length);
    expect(sumBy(data.users, (user) => user.requests)).toBe(data.totalRequests);
    expect(sumBy(data.users, (user) => user.promptTokens)).toBe(data.totalPromptTokens);
    expect(sumBy(data.users, (user) => user.completionTokens)).toBe(data.totalCompletionTokens);
    expect(sumBy(data.users, (user) => user.totalTokens)).toBe(data.totalTokens);
    expect(sumBy(data.users, (user) => user.claudeCodeRequests)).toBe(
      data.productUsage.find((product) => product.product === "Claude Code")?.requests,
    );
    expect(sumBy(data.users, (user) => user.claudeCodeTokens)).toBe(
      data.productUsage.find((product) => product.product === "Claude Code")?.tokens,
    );
    expect(sumBy(data.users, (user) => user.codeLines)).toBe(data.totalCodeLines);
    expect(sumBy(data.users, (user) => user.netSpendUsd)).toBeCloseTo(data.totalNetSpendUsd, 2);
  });

  it("reconciles product and model summaries with Team totals", () => {
    const data = initialClaudeTeamUsageData;

    expect(sumBy(data.productUsage, (product) => product.requests)).toBe(data.totalRequests);
    expect(sumBy(data.productUsage, (product) => product.tokens)).toBe(data.totalTokens);
    expect(sumBy(data.productUsage, (product) => product.spendUsd)).toBeCloseTo(data.totalNetSpendUsd, 2);
    expect(sumBy(data.modelUsage, (model) => model.requests)).toBe(data.totalRequests);
    expect(sumBy(data.modelUsage, (model) => model.tokens)).toBe(data.totalTokens);
    expect(sumBy(data.modelUsage, (model) => model.spendUsd)).toBeCloseTo(data.totalNetSpendUsd, 2);
    data.productUsage.forEach((product) => expect(product.users).toHaveLength(product.userCount));
    data.modelUsage.forEach((model) => expect(model.users).toHaveLength(model.userCount));
  });

  it("reconciles Claude Export topics with the raw conversation totals", () => {
    const data = claudeExportUsageData;

    expect(sumBy(data.usageTopics, (topic) => topic.conversations)).toBe(data.totalConversations);
    expect(sumBy(data.usageTopics, (topic) => topic.messages)).toBe(data.totalMessages);
    expect(sumBy(data.usageTopics, (topic) => topic.attachments)).toBe(data.totalAttachments);
    expect(data.accountUsage).toHaveLength(data.userDirectory.activeAccounts);
  });

  it("reconciles the integrated analysis with Genspark and Claude records", () => {
    const data = initialGensparkUsageData;

    expect(data.insightAnalysis.totalRecords).toBe(data.totalTasks + claudeExportUsageData.totalConversations);
    expect(sumBy(data.insightAnalysis.topicInsights, (topic) => topic.tasks)).toBe(
      data.insightAnalysis.totalRecords,
    );
    expect(data.insightAnalysis.totalMessages).toBe(claudeExportUsageData.totalMessages);
  });
});
