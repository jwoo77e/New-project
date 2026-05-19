export type ClaudeTeamUsageLevel = "High" | "Medium" | "Low";

export type ClaudeTeamUserUsage = {
  email: string;
  requests: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  netSpendUsd: number;
  grossSpendUsd: number;
  codeLines: number;
  products: string[];
  models: string[];
  level: ClaudeTeamUsageLevel;
  note: string;
};

export type ClaudeTeamProductUsage = {
  product: string;
  requests: number;
  tokens: number;
  spendUsd: number;
  userCount: number;
  users: string[];
};

export type ClaudeTeamModelUsage = {
  model: string;
  requests: number;
  tokens: number;
  spendUsd: number;
  userCount: number;
  users: string[];
};

export type ClaudeTeamUsageData = {
  source: {
    name: string;
    period: string;
    generatedAt: string;
    spendFile: string;
    codeLinesFile: string;
    note: string;
  };
  licensedUsers: number;
  activeUsers: number;
  spendUsers: number;
  codeUsers: number;
  totalRequests: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalTokens: number;
  totalNetSpendUsd: number;
  totalGrossSpendUsd: number;
  totalCodeLines: number;
  productUsage: ClaudeTeamProductUsage[];
  modelUsage: ClaudeTeamModelUsage[];
  users: ClaudeTeamUserUsage[];
  insights: string[];
};

export const initialClaudeTeamUsageData: ClaudeTeamUsageData = {
  source: {
    name: "Claude Team Plan 사용 현황",
    period: "2026-05-01 ~ 2026-05-18",
    generatedAt: "2026-05-19",
    spendFile: "spend-report-e59c75bc-469e-466f-bef9-c311748c1df8-2026-05-01-to-2026-05-18.csv",
    codeLinesFile: "claude_code_team_2026_05_01_to_2026_05_31.csv",
    note: "Claude Spend report와 Claude Code Team lines export를 user email 기준으로 결합",
  },
  licensedUsers: 9,
  activeUsers: 9,
  spendUsers: 3,
  codeUsers: 9,
  totalRequests: 644,
  totalPromptTokens: 123490077,
  totalCompletionTokens: 793813,
  totalTokens: 124283890,
  totalNetSpendUsd: 104.08,
  totalGrossSpendUsd: 104.08,
  totalCodeLines: 54768,
  productUsage: [
    {
      product: "Claude Code",
      requests: 643,
      tokens: 124136736,
      spendUsd: 103.85,
      userCount: 3,
      users: ["wody@riskzero.kr", "hhlee0227@riskzero.kr", "woosung.jeon@riskzero.kr"],
    },
    {
      product: "Chat",
      requests: 1,
      tokens: 147154,
      spendUsd: 0.23,
      userCount: 1,
      users: ["wody@riskzero.kr"],
    },
  ],
  modelUsage: [
    {
      model: "claude_opus_4_7",
      requests: 598,
      tokens: 120005528,
      spendUsd: 101.77,
      userCount: 2,
      users: ["wody@riskzero.kr", "hhlee0227@riskzero.kr"],
    },
    {
      model: "claude_sonnet_4_6",
      requests: 32,
      tokens: 3457016,
      spendUsd: 2.1,
      userCount: 2,
      users: ["woosung.jeon@riskzero.kr", "wody@riskzero.kr"],
    },
    {
      model: "claude_haiku_4_5_20251001",
      requests: 14,
      tokens: 821346,
      spendUsd: 0.21,
      userCount: 1,
      users: ["wody@riskzero.kr"],
    },
  ],
  users: [
    {
      email: "wody@riskzero.kr",
      requests: 602,
      promptTokens: 116765448,
      completionTokens: 734197,
      totalTokens: 117499645,
      netSpendUsd: 99.87,
      grossSpendUsd: 99.87,
      codeLines: 25992,
      products: ["Claude Code", "Chat"],
      models: ["claude_opus_4_7", "claude_sonnet_4_6", "claude_haiku_4_5_20251001"],
      level: "High",
      note: "Spend와 Claude Code lines 모두 최상위",
    },
    {
      email: "jungyr98@riskzero.kr",
      requests: 0,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      netSpendUsd: 0,
      grossSpendUsd: 0,
      codeLines: 12997,
      products: [],
      models: [],
      level: "High",
      note: "Spend export에는 없지만 Claude Code lines 사용량 높음",
    },
    {
      email: "woosung.jeon@riskzero.kr",
      requests: 31,
      promptTokens: 3266588,
      completionTokens: 43274,
      totalTokens: 3309862,
      netSpendUsd: 1.87,
      grossSpendUsd: 1.87,
      codeLines: 8366,
      products: ["Claude Code"],
      models: ["claude_sonnet_4_6"],
      level: "Medium",
      note: "Claude Code 사용과 spend 모두 확인",
    },
    {
      email: "hhlee0227@riskzero.kr",
      requests: 11,
      promptTokens: 3458041,
      completionTokens: 16342,
      totalTokens: 3474383,
      netSpendUsd: 2.34,
      grossSpendUsd: 2.34,
      codeLines: 4275,
      products: ["Claude Code"],
      models: ["claude_opus_4_7"],
      level: "Medium",
      note: "Opus 기반 Claude Code 사용 확인",
    },
    {
      email: "hchbae1001@riskzero.kr",
      requests: 0,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      netSpendUsd: 0,
      grossSpendUsd: 0,
      codeLines: 1960,
      products: [],
      models: [],
      level: "Low",
      note: "Claude Code lines만 확인",
    },
    {
      email: "sjlim@riskzero.kr",
      requests: 0,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      netSpendUsd: 0,
      grossSpendUsd: 0,
      codeLines: 830,
      products: [],
      models: [],
      level: "Low",
      note: "초기 활용 단계",
    },
    {
      email: "mjkim1122@riskzero.kr",
      requests: 0,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      netSpendUsd: 0,
      grossSpendUsd: 0,
      codeLines: 181,
      products: [],
      models: [],
      level: "Low",
      note: "초기 활용 단계",
    },
    {
      email: "huizhen0227@riskzero.kr",
      requests: 0,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      netSpendUsd: 0,
      grossSpendUsd: 0,
      codeLines: 97,
      products: [],
      models: [],
      level: "Low",
      note: "초기 활용 단계",
    },
    {
      email: "mygu@riskzero.kr",
      requests: 0,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      netSpendUsd: 0,
      grossSpendUsd: 0,
      codeLines: 70,
      products: [],
      models: [],
      level: "Low",
      note: "초기 활용 단계",
    },
  ],
  insights: [
    "Claude Team 계정 9명 모두 Claude Code lines 사용 기록이 있어 좌석 활성화는 양호합니다.",
    "Spend report 기준 비용은 wody@riskzero.kr에 집중되어 있으며 전체 spend의 96% 수준입니다.",
    "Claude Code가 요청 643건, spend $103.85로 대부분을 차지해 Team plan의 핵심 활용처는 개발 생산성입니다.",
    "lines export에는 잡히지만 spend report에는 없는 사용자가 6명 있어, 비용만 보면 실제 활용자를 과소평가합니다.",
  ],
};
