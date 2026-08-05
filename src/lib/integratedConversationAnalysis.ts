import type { ChatGptUsageData } from "../data/chatGptUsageData";
import type { ChatGptExportAnalysis } from "../data/gensparkUsageData";
import type { DriveArtifactActivityAnalysis } from "../data/driveArtifactRepositoryData";

export type IntegratedConversationSource = {
  key: "chatgpt" | "claudeExport" | "claudeDrive";
  label: string;
  conversations: number;
  messages: number | null;
  period: string;
  color: string;
  note: string;
};

export type IntegratedConversationMonth = {
  month: string;
  label: string;
  chatGpt: number;
  claudeExport: number;
  claudeDrive: number;
  total: number;
};

export type IntegratedConversationTopic = {
  topic: string;
  conversations: number;
  share: number;
  color: string;
  note: string;
};

export type IntegratedConversationAnalysis = {
  period: string;
  conversationSignals: number;
  knownMessages: number;
  linkedFileSignals: number;
  sources: IntegratedConversationSource[];
  monthlyUsage: IntegratedConversationMonth[];
  topicUsage: IntegratedConversationTopic[];
};

type TopicDefinition = {
  topic: string;
  chatGptTopics: string[];
  claudeTopics: string[];
  color: string;
  note: string;
};

const topicDefinitions: TopicDefinition[] = [
  {
    topic: "산업안전·제품/제안",
    chatGptTopics: ["RiskZero·안전/제안"],
    claudeTopics: ["RiskZero 제품·산업안전/AI 인프라"],
    color: "#2f8f46",
    note: "산업안전, 공공 제안, RiskZero 제품과 AI 인프라 업무",
  },
  {
    topic: "개발·인프라/데이터",
    chatGptTopics: ["개발·인프라/데이터"],
    claudeTopics: ["개발/아키텍처·DB"],
    color: "#0f8b8d",
    note: "개발, 아키텍처, 데이터베이스와 인프라 문제 해결",
  },
  {
    topic: "문서·보고/생산성",
    chatGptTopics: ["문서·보고/업무 생산성"],
    claudeTopics: ["문서·보고·업무 생산성"],
    color: "#c58612",
    note: "보고서, 제안서, 번역과 문서 변환 업무",
  },
  {
    topic: "AI 도구·비용/운영",
    chatGptTopics: ["AI 도구·비용/운영"],
    claudeTopics: ["AI 비용·계정/도구 운영"],
    color: "#9a6b36",
    note: "AI 비용, 계정, 요금제와 도구 운영",
  },
  {
    topic: "리서치·정책/시장",
    chatGptTopics: ["리서치·정책/시장"],
    claudeTopics: [],
    color: "#e85d4f",
    note: "시장, 정책과 외부 자료 조사",
  },
  {
    topic: "개인·생활/비업무",
    chatGptTopics: ["개인·생활/비업무"],
    claudeTopics: ["개인/게임·생활 질의"],
    color: "#7d6ca7",
    note: "업무성과 지표에서 분리해 해석할 개인성 대화",
  },
  {
    topic: "미분류/짧은 대화",
    chatGptTopics: ["미분류/짧은 대화"],
    claudeTopics: ["미분류/짧은 대화"],
    color: "#5f6f8c",
    note: "목적을 확정하기 어려워 추가 태깅이 필요한 대화",
  },
];

function sumTopicConversations(
  topics: Array<{ topic: string; conversations: number }>,
  names: string[],
) {
  return topics
    .filter((topic) => names.includes(topic.topic))
    .reduce((sum, topic) => sum + topic.conversations, 0);
}

function monthLabel(month: string) {
  const [year, monthNumber] = month.split("-");
  return `${year.slice(2)}.${monthNumber}`;
}

export function buildIntegratedConversationAnalysis({
  chatGpt,
  claudeExport,
  driveActivity,
}: {
  chatGpt: ChatGptUsageData;
  claudeExport: ChatGptExportAnalysis | null | undefined;
  driveActivity: DriveArtifactActivityAnalysis;
}): IntegratedConversationAnalysis {
  const claudeConversations = claudeExport?.totalConversations ?? 0;
  const conversationSignals =
    chatGpt.totalConversations + claudeConversations + driveActivity.totalConversations;
  const knownMessages = chatGpt.totalMessages + (claudeExport?.totalMessages ?? 0);
  const linkedFileSignals =
    chatGpt.conversationAssetFiles +
    (claudeExport?.totalAttachments ?? 0) +
    driveActivity.totalOutputSignals;

  const sources: IntegratedConversationSource[] = [
    {
      key: "chatgpt",
      label: "ChatGPT Export",
      conversations: chatGpt.totalConversations,
      messages: chatGpt.totalMessages,
      period: chatGpt.source.period,
      color: "#2f8f46",
      note: "대화·메시지 JSON 기준",
    },
    {
      key: "claudeExport",
      label: "Claude Team Export",
      conversations: claudeConversations,
      messages: claudeExport?.totalMessages ?? 0,
      period: claudeExport?.source.period ?? "수집 대기",
      color: "#0f8b8d",
      note: "Team 대화 원천 데이터 기준",
    },
    {
      key: "claudeDrive",
      label: "Claude Drive",
      conversations: driveActivity.totalConversations,
      messages: null,
      period: driveActivity.period,
      color: "#c58612",
      note: "프롬프트·응답 문서의 세션 식별자 기준 추정",
    },
  ];

  const monthly = new Map<string, IntegratedConversationMonth>();
  const ensureMonth = (month: string) => {
    const current = monthly.get(month);
    if (current) return current;
    const next = {
      month,
      label: monthLabel(month),
      chatGpt: 0,
      claudeExport: 0,
      claudeDrive: 0,
      total: 0,
    };
    monthly.set(month, next);
    return next;
  };

  chatGpt.monthlyUsage.forEach((row) => {
    ensureMonth(row.month).chatGpt += row.conversations;
  });
  claudeExport?.monthlyUsage.forEach((row) => {
    ensureMonth(row.month).claudeExport += row.conversations;
  });
  driveActivity.dailyCounts.forEach((row) => {
    ensureMonth(row.date.slice(0, 7)).claudeDrive += row.conversations;
  });

  const monthlyUsage = Array.from(monthly.values())
    .sort((left, right) => left.month.localeCompare(right.month))
    .map((row) => ({
      ...row,
      total: row.chatGpt + row.claudeExport + row.claudeDrive,
    }));

  const topicUsage = topicDefinitions.map((definition) => {
    const conversations =
      sumTopicConversations(chatGpt.topicInsights, definition.chatGptTopics) +
      sumTopicConversations(claudeExport?.usageTopics ?? [], definition.claudeTopics);
    return {
      topic: definition.topic,
      conversations,
      share: conversationSignals > 0 ? (conversations / conversationSignals) * 100 : 0,
      color: definition.color,
      note: definition.note,
    };
  });

  if (driveActivity.totalConversations > 0) {
    topicUsage.push({
      topic: "Drive 대화·프롬프트(주제 미분류)",
      conversations: driveActivity.totalConversations,
      share: (driveActivity.totalConversations / conversationSignals) * 100,
      color: "#a86f24",
      note: "Drive 세션은 원문 주제 태깅 전이므로 통합 총량에만 포함",
    });
  }

  return {
    period:
      monthlyUsage.length > 0
        ? `${monthlyUsage[0].month} ~ ${monthlyUsage[monthlyUsage.length - 1].month}`
        : "수집 대기",
    conversationSignals,
    knownMessages,
    linkedFileSignals,
    sources,
    monthlyUsage,
    topicUsage: topicUsage.sort((left, right) => right.conversations - left.conversations),
  };
}
