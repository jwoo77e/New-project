import { describe, expect, it } from "vitest";
import { chatGptUsageData } from "../data/chatGptUsageData";
import { claudeExportUsageData } from "../data/claudeExportUsageData";
import { driveArtifactRepositoryData } from "../data/driveArtifactRepositoryData";
import { buildIntegratedConversationAnalysis } from "./integratedConversationAnalysis";

describe("buildIntegratedConversationAnalysis", () => {
  it("reconciles conversation, message, file, month, and topic totals", () => {
    const analysis = buildIntegratedConversationAnalysis({
      chatGpt: chatGptUsageData,
      claudeExport: claudeExportUsageData,
      driveActivity: driveArtifactRepositoryData.activityAnalysis,
    });

    expect(analysis.period).toBe("2025-02 ~ 2026-08");
    expect(analysis.conversationSignals).toBe(2047);
    expect(analysis.knownMessages).toBe(35743);
    expect(analysis.linkedFileSignals).toBe(2174);
    expect(analysis.sources.reduce((sum, source) => sum + source.conversations, 0)).toBe(
      analysis.conversationSignals,
    );
    expect(analysis.topicUsage.reduce((sum, topic) => sum + topic.conversations, 0)).toBe(
      analysis.conversationSignals,
    );
    expect(analysis.topicUsage[0]).toMatchObject({
      topic: "산업안전·제품/제안",
      conversations: 806,
    });
    expect(analysis.topicUsage.find((topic) => topic.topic.startsWith("Drive"))).toMatchObject({
      conversations: 327,
    });
    expect(analysis.monthlyUsage.find((month) => month.month === "2026-06")).toMatchObject({
      chatGpt: 37,
      claudeExport: 35,
      claudeDrive: 33,
      total: 105,
    });
    expect(analysis.monthlyUsage.find((month) => month.month === "2026-08")).toMatchObject({
      chatGpt: 0,
      claudeExport: 6,
      claudeDrive: 69,
      total: 75,
    });
  });

  it("keeps the dashboard usable when the Claude export is unavailable", () => {
    const analysis = buildIntegratedConversationAnalysis({
      chatGpt: chatGptUsageData,
      claudeExport: null,
      driveActivity: driveArtifactRepositoryData.activityAnalysis,
    });

    expect(analysis.conversationSignals).toBe(1879);
    expect(analysis.knownMessages).toBe(32881);
    expect(analysis.sources.find((source) => source.key === "claudeExport")).toMatchObject({
      conversations: 0,
      messages: 0,
      period: "수집 대기",
    });
  });
});
