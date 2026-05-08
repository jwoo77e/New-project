export type ApiProviderName = "OpenAI" | "Gemini" | "Claude";
export type ApiProviderStatus = "정상" | "주의" | "연동대기";
export type ApiKeyStatusValue = "정상" | "교체권장" | "확인필요";

export type ApiProviderUsage = {
  provider: ApiProviderName;
  label: string;
  color: string;
  requests: number;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  avgLatencyMs: number;
  errorRate: number;
  quotaUsedRate: number;
  activeKeys: number;
  lastSynced: string;
  status: ApiProviderStatus;
  note: string;
};

export type ApiDailyUsage = {
  date: string;
  label: string;
  openaiRequests: number;
  geminiRequests: number;
  claudeRequests: number;
  openaiTokens: number;
  geminiTokens: number;
  claudeTokens: number;
  totalTokens: number;
  openaiCostUsd: number;
  geminiCostUsd: number;
  claudeCostUsd: number;
  costUsd: number;
};

export type ApiModelUsage = {
  provider: ApiProviderName;
  model: string;
  requests: number;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  avgLatencyMs: number;
  errorRate: number;
};

export type ApiKeyHealth = {
  provider: ApiProviderName;
  name: string;
  scope: string;
  lastUsed: string;
  requests: number;
  status: ApiKeyStatusValue;
  note: string;
};

export type GeminiWorkspaceUserUsageLevel = "High" | "Medium" | "Low" | "Zero";

export type GeminiWorkspaceUserUsage = {
  email: string;
  events: number;
  activeDays: number;
  lastUsed: string;
  apps: string[];
  topAction: string;
  level: GeminiWorkspaceUserUsageLevel;
  score: number;
};

export type GeminiWorkspaceDailyUsage = {
  date: string;
  label: string;
  events: number;
  activeUsers: number;
};

export type GeminiWorkspaceAppUsage = {
  app: string;
  events: number;
  activeUsers: number;
};

export type GeminiWorkspaceUsageData = {
  source: {
    name: string;
    period: string;
    generatedAt: string;
    mode: string;
    status: ApiProviderStatus;
    note: string;
  };
  licensedUsers: number;
  activeUsers: number;
  activationRate: number;
  totalEvents: number;
  totalActiveDays: number;
  avgActiveDays: number;
  highUsers: number;
  mediumUsers: number;
  lowUsers: number;
  zeroUsers: number;
  dailyUsage: GeminiWorkspaceDailyUsage[];
  appUsage: GeminiWorkspaceAppUsage[];
  users: GeminiWorkspaceUserUsage[];
};

export type ApiUsageData = {
  source: {
    name: string;
    period: string;
    generatedAt: string;
    mode: string;
  };
  providers: ApiProviderUsage[];
  dailyUsage: ApiDailyUsage[];
  models: ApiModelUsage[];
  keyHealth: ApiKeyHealth[];
  workspaceUsage?: GeminiWorkspaceUsageData;
};

export const initialApiUsageData: ApiUsageData = {
  source: {
    name: "생성형 AI API 사용 현황",
    period: "최근 7일",
    generatedAt: "연동 전 샘플",
    mode: "OpenAI/Gemini/Claude 로컬 수집기 연결 대기",
  },
  providers: [
    {
      provider: "OpenAI",
      label: "OpenAI API",
      color: "#0f8b8d",
      requests: 18420,
      inputTokens: 12840000,
      outputTokens: 4360000,
      costUsd: 128.4,
      avgLatencyMs: 1450,
      errorRate: 0.4,
      quotaUsedRate: 62,
      activeKeys: 2,
      lastSynced: "연동 대기",
      status: "연동대기",
      note: "Organization Usage/Costs API 연결 대상",
    },
    {
      provider: "Gemini",
      label: "Gemini API",
      color: "#c58612",
      requests: 9630,
      inputTokens: 8840000,
      outputTokens: 2120000,
      costUsd: 71.5,
      avgLatencyMs: 920,
      errorRate: 1.1,
      quotaUsedRate: 48,
      activeKeys: 1,
      lastSynced: "연동 대기",
      status: "연동대기",
      note: "AI Studio/Cloud Billing 사용량 대조 필요",
    },
    {
      provider: "Claude",
      label: "Claude API",
      color: "#5f6f8c",
      requests: 5210,
      inputTokens: 6420000,
      outputTokens: 1980000,
      costUsd: 96.8,
      avgLatencyMs: 2100,
      errorRate: 0.7,
      quotaUsedRate: 54,
      activeKeys: 1,
      lastSynced: "연동 대기",
      status: "연동대기",
      note: "Admin Usage/Cost API 연결 대상",
    },
  ],
  dailyUsage: [
    {
      date: "2026-04-24",
      label: "4/24",
      openaiRequests: 2180,
      geminiRequests: 980,
      claudeRequests: 620,
      openaiTokens: 1650000,
      geminiTokens: 1050000,
      claudeTokens: 910000,
      totalTokens: 3610000,
      openaiCostUsd: 14.8,
      geminiCostUsd: 7.2,
      claudeCostUsd: 16.2,
      costUsd: 38.2,
    },
    {
      date: "2026-04-25",
      label: "4/25",
      openaiRequests: 2410,
      geminiRequests: 1160,
      claudeRequests: 690,
      openaiTokens: 1900000,
      geminiTokens: 1280000,
      claudeTokens: 980000,
      totalTokens: 4160000,
      openaiCostUsd: 16.4,
      geminiCostUsd: 8.1,
      claudeCostUsd: 19.2,
      costUsd: 43.7,
    },
    {
      date: "2026-04-26",
      label: "4/26",
      openaiRequests: 1960,
      geminiRequests: 920,
      claudeRequests: 510,
      openaiTokens: 1500000,
      geminiTokens: 970000,
      claudeTokens: 820000,
      totalTokens: 3290000,
      openaiCostUsd: 13.1,
      geminiCostUsd: 6.5,
      claudeCostUsd: 15.0,
      costUsd: 34.6,
    },
    {
      date: "2026-04-27",
      label: "4/27",
      openaiRequests: 2090,
      geminiRequests: 1040,
      claudeRequests: 560,
      openaiTokens: 1580000,
      geminiTokens: 1020000,
      claudeTokens: 870000,
      totalTokens: 3470000,
      openaiCostUsd: 13.7,
      geminiCostUsd: 6.9,
      claudeCostUsd: 15.8,
      costUsd: 36.4,
    },
    {
      date: "2026-04-28",
      label: "4/28",
      openaiRequests: 2860,
      geminiRequests: 1510,
      claudeRequests: 760,
      openaiTokens: 2280000,
      geminiTokens: 1510000,
      claudeTokens: 1130000,
      totalTokens: 4920000,
      openaiCostUsd: 20.2,
      geminiCostUsd: 9.8,
      claudeCostUsd: 24.1,
      costUsd: 54.1,
    },
    {
      date: "2026-04-29",
      label: "4/29",
      openaiRequests: 3290,
      geminiRequests: 1840,
      claudeRequests: 920,
      openaiTokens: 2590000,
      geminiTokens: 1780000,
      claudeTokens: 1260000,
      totalTokens: 5630000,
      openaiCostUsd: 23.8,
      geminiCostUsd: 11.0,
      claudeCostUsd: 28.7,
      costUsd: 63.5,
    },
    {
      date: "2026-04-30",
      label: "4/30",
      openaiRequests: 3630,
      geminiRequests: 2180,
      claudeRequests: 1150,
      openaiTokens: 3070000,
      geminiTokens: 2050000,
      claudeTokens: 1520000,
      totalTokens: 6640000,
      openaiCostUsd: 24.9,
      geminiCostUsd: 11.3,
      claudeCostUsd: 30.0,
      costUsd: 66.2,
    },
  ],
  models: [
    {
      provider: "OpenAI",
      model: "Reasoning",
      requests: 4820,
      inputTokens: 5120000,
      outputTokens: 1720000,
      costUsd: 78.6,
      avgLatencyMs: 2380,
      errorRate: 0.5,
    },
    {
      provider: "OpenAI",
      model: "Standard chat",
      requests: 10820,
      inputTokens: 6740000,
      outputTokens: 2140000,
      costUsd: 42.1,
      avgLatencyMs: 1120,
      errorRate: 0.3,
    },
    {
      provider: "OpenAI",
      model: "Embeddings",
      requests: 2780,
      inputTokens: 980000,
      outputTokens: 500000,
      costUsd: 7.7,
      avgLatencyMs: 460,
      errorRate: 0.2,
    },
    {
      provider: "Gemini",
      model: "Pro",
      requests: 2680,
      inputTokens: 3820000,
      outputTokens: 820000,
      costUsd: 49.2,
      avgLatencyMs: 1380,
      errorRate: 1.3,
    },
    {
      provider: "Gemini",
      model: "Flash",
      requests: 6950,
      inputTokens: 5020000,
      outputTokens: 1300000,
      costUsd: 22.3,
      avgLatencyMs: 740,
      errorRate: 1.0,
    },
    {
      provider: "Claude",
      model: "Sonnet",
      requests: 3440,
      inputTokens: 4920000,
      outputTokens: 1370000,
      costUsd: 75.4,
      avgLatencyMs: 2260,
      errorRate: 0.8,
    },
    {
      provider: "Claude",
      model: "Haiku",
      requests: 1770,
      inputTokens: 1500000,
      outputTokens: 610000,
      costUsd: 21.4,
      avgLatencyMs: 1180,
      errorRate: 0.5,
    },
  ],
  keyHealth: [
    {
      provider: "OpenAI",
      name: "openai-prod",
      scope: "organization usage, responses",
      lastUsed: "연동 대기",
      requests: 18420,
      status: "확인필요",
      note: "서버/로컬 환경변수에만 저장",
    },
    {
      provider: "Gemini",
      name: "gemini-prod",
      scope: "generative language",
      lastUsed: "연동 대기",
      requests: 9630,
      status: "확인필요",
      note: "API 제한 범위 확인 필요",
    },
    {
      provider: "Claude",
      name: "claude-admin",
      scope: "admin usage, messages",
      lastUsed: "연동 대기",
      requests: 5210,
      status: "확인필요",
      note: "Admin API 키 필요",
    },
  ],
  workspaceUsage: {
    source: {
      name: "Gemini Workspace 활용 현황",
      period: "최근 28일",
      generatedAt: "연동 전 샘플",
      mode: "Google Workspace Reports API 연결 대기",
      status: "연동대기",
      note: "GOOGLE_WORKSPACE_ADMIN_EMAIL과 Admin SDK Reports API 권한 설정 필요",
    },
    licensedUsers: 9,
    activeUsers: 6,
    activationRate: 66.7,
    totalEvents: 84,
    totalActiveDays: 38,
    avgActiveDays: 6.3,
    highUsers: 1,
    mediumUsers: 3,
    lowUsers: 2,
    zeroUsers: 3,
    dailyUsage: [
      { date: "2026-04-24", label: "4/24", events: 9, activeUsers: 4 },
      { date: "2026-04-25", label: "4/25", events: 11, activeUsers: 5 },
      { date: "2026-04-26", label: "4/26", events: 6, activeUsers: 3 },
      { date: "2026-04-27", label: "4/27", events: 8, activeUsers: 4 },
      { date: "2026-04-28", label: "4/28", events: 16, activeUsers: 6 },
      { date: "2026-04-29", label: "4/29", events: 18, activeUsers: 6 },
      { date: "2026-04-30", label: "4/30", events: 16, activeUsers: 5 },
    ],
    appUsage: [
      { app: "Gmail", events: 26, activeUsers: 5 },
      { app: "Docs", events: 22, activeUsers: 4 },
      { app: "Sheets", events: 16, activeUsers: 3 },
      { app: "Slides", events: 12, activeUsers: 3 },
      { app: "Gemini app", events: 8, activeUsers: 2 },
    ],
    users: [
      {
        email: "power.user@example.com",
        events: 36,
        activeDays: 15,
        lastUsed: "2026-04-30",
        apps: ["Gmail", "Docs", "Slides"],
        topAction: "help_me_write",
        level: "High",
        score: 100,
      },
      {
        email: "steady.user@example.com",
        events: 18,
        activeDays: 8,
        lastUsed: "2026-04-30",
        apps: ["Gmail", "Docs"],
        topAction: "summarize",
        level: "Medium",
        score: 88,
      },
      {
        email: "writer.user@example.com",
        events: 15,
        activeDays: 7,
        lastUsed: "2026-04-30",
        apps: ["Docs", "Slides"],
        topAction: "draft",
        level: "Medium",
        score: 88,
      },
      {
        email: "ops.user@example.com",
        events: 9,
        activeDays: 5,
        lastUsed: "2026-04-29",
        apps: ["Gmail", "Sheets"],
        topAction: "organize",
        level: "Medium",
        score: 64,
      },
      {
        email: "light.user@example.com",
        events: 4,
        activeDays: 2,
        lastUsed: "2026-04-28",
        apps: ["Sheets"],
        topAction: "organize",
        level: "Low",
        score: 28,
      },
      {
        email: "trial.user@example.com",
        events: 2,
        activeDays: 1,
        lastUsed: "2026-04-27",
        apps: ["Gemini app"],
        topAction: "prompt",
        level: "Low",
        score: 18,
      },
      {
        email: "zero.one@example.com",
        events: 0,
        activeDays: 0,
        lastUsed: "-",
        apps: [],
        topAction: "-",
        level: "Zero",
        score: 0,
      },
      {
        email: "zero.two@example.com",
        events: 0,
        activeDays: 0,
        lastUsed: "-",
        apps: [],
        topAction: "-",
        level: "Zero",
        score: 0,
      },
      {
        email: "zero.three@example.com",
        events: 0,
        activeDays: 0,
        lastUsed: "-",
        apps: [],
        topAction: "-",
        level: "Zero",
        score: 0,
      },
    ],
  },
};

export function isApiUsageData(value: unknown): value is ApiUsageData {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<ApiUsageData>;
  return (
    Boolean(candidate.source) &&
    Array.isArray(candidate.providers) &&
    Array.isArray(candidate.dailyUsage) &&
    Array.isArray(candidate.models) &&
    Array.isArray(candidate.keyHealth)
  );
}
