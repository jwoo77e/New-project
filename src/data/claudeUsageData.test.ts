import { describe, expect, it } from "vitest";
import { claudeExportUsageData } from "./claudeExportUsageData";
import { initialClaudeTeamUsageData } from "./claudeTeamUsageData";
import { initialGensparkUsageData } from "./gensparkUsageData";

const sumBy = <T>(items: T[], select: (item: T) => number) =>
  items.reduce((sum, item) => sum + select(item), 0);

describe("Claude usage snapshots", () => {
  it("reconciles account totals with the Team CSV summaries", () => {
    const data = initialClaudeTeamUsageData;

    expect(data.users).toHaveLength(data.licensedUsers);
    expect(data.spendUsers).toBe(data.users.filter((user) => user.requests > 0).length);
    expect(data.codeUsers).toBe(data.users.filter((user) => user.codeLines > 0).length);
    expect(sumBy(data.users, (user) => user.requests)).toBe(data.totalRequests);
    expect(sumBy(data.users, (user) => user.promptTokens)).toBe(data.totalPromptTokens);
    expect(sumBy(data.users, (user) => user.completionTokens)).toBe(data.totalCompletionTokens);
    expect(sumBy(data.users, (user) => user.totalTokens)).toBe(data.totalTokens);
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
