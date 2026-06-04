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
    period: "2026-05-01 ~ 2026-05-31",
    generatedAt: "2026-06-05",
    spendFile: "spend-report-e59c75bc-469e-466f-bef9-c311748c1df8-2026-05-01-to-2026-05-31.csv",
    codeLinesFile: "claude_code_team_2026_05_01_to_2026_05_31.csv",
    note: "Claude Spend report와 Claude Code Team lines export를 user email 기준으로 결합",
  },
  licensedUsers: 10,
  activeUsers: 10,
  spendUsers: 5,
  codeUsers: 9,
  totalRequests: 1143,
  totalPromptTokens: 220160266,
  totalCompletionTokens: 1291154,
  totalTokens: 221451420,
  totalNetSpendUsd: 175.43,
  totalGrossSpendUsd: 175.43,
  totalCodeLines: 54768,
  productUsage: [
    {
      product: "Claude Code",
      requests: 1005,
      tokens: 166071520,
      spendUsd: 140.64,
      userCount: 4,
      users: ["wody@riskzero.kr", "hhlee0227@riskzero.kr", "woosung.jeon@riskzero.kr", "mygu@riskzero.kr"],
    },
    {
      product: "Cowork",
      requests: 136,
      tokens: 55197545,
      spendUsd: 34.52,
      userCount: 3,
      users: ["mygu@riskzero.kr", "rkgmf1230@riskzero.kr", "wody@riskzero.kr"],
    },
    {
      product: "Chat",
      requests: 2,
      tokens: 182355,
      spendUsd: 0.27,
      userCount: 2,
      users: ["wody@riskzero.kr", "hhlee0227@riskzero.kr"],
    },
  ],
  modelUsage: [
    {
      model: "claude_opus_4_7",
      requests: 981,
      tokens: 207442081,
      spendUsd: 166.45,
      userCount: 5,
      users: ["wody@riskzero.kr", "hhlee0227@riskzero.kr", "mygu@riskzero.kr", "rkgmf1230@riskzero.kr", "woosung.jeon@riskzero.kr"],
    },
    {
      model: "claude_sonnet_4_6",
      requests: 115,
      tokens: 12045352,
      spendUsd: 8.49,
      userCount: 3,
      users: ["woosung.jeon@riskzero.kr", "wody@riskzero.kr", "hhlee0227@riskzero.kr"],
    },
    {
      model: "claude_haiku_4_5_20251001",
      requests: 47,
      tokens: 1963987,
      spendUsd: 0.49,
      userCount: 3,
      users: ["woosung.jeon@riskzero.kr", "wody@riskzero.kr", "hhlee0227@riskzero.kr"],
    },
  ],
  users: [
    {
      email: "wody@riskzero.kr",
      requests: 603,
      promptTokens: 116807028,
      completionTokens: 734586,
      totalTokens: 117541614,
      netSpendUsd: 99.93,
      grossSpendUsd: 99.93,
      codeLines: 25992,
      products: ["Claude Code", "Chat", "Cowork"],
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
      requests: 144,
      promptTokens: 12877108,
      completionTokens: 128056,
      totalTokens: 13005164,
      netSpendUsd: 8.5,
      grossSpendUsd: 8.5,
      codeLines: 8366,
      products: ["Claude Code"],
      models: ["claude_sonnet_4_6", "claude_haiku_4_5_20251001"],
      level: "Medium",
      note: "Claude Code 사용과 spend 모두 확인",
    },
    {
      email: "hhlee0227@riskzero.kr",
      requests: 254,
      promptTokens: 34197885,
      completionTokens: 246968,
      totalTokens: 34444853,
      netSpendUsd: 30.01,
      grossSpendUsd: 30.01,
      codeLines: 4275,
      products: ["Claude Code", "Chat"],
      models: ["claude_opus_4_7", "claude_sonnet_4_6", "claude_haiku_4_5_20251001"],
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
      requests: 88,
      promptTokens: 37116545,
      completionTokens: 96469,
      totalTokens: 37213014,
      netSpendUsd: 24.05,
      grossSpendUsd: 24.05,
      codeLines: 70,
      products: ["Cowork", "Claude Code"],
      models: ["claude_opus_4_7"],
      level: "Medium",
      note: "Cowork spend가 확인되어 업무 협업 활용 확대",
    },
    {
      email: "rkgmf1230@riskzero.kr",
      requests: 54,
      promptTokens: 19161700,
      completionTokens: 85075,
      totalTokens: 19246775,
      netSpendUsd: 12.94,
      grossSpendUsd: 12.94,
      codeLines: 0,
      products: ["Cowork"],
      models: ["claude_opus_4_7"],
      level: "Medium",
      note: "Spend report에는 있으나 Claude Code lines export에는 없음",
    },
  ],
  insights: [
    "Claude Team 결합 기준 활성 계정은 10명이며, 이 중 9명은 Claude Code lines 사용 기록이 있습니다.",
    "Spend report 기준 비용은 wody@riskzero.kr이 $99.93로 가장 높고, 전체 spend의 57% 수준입니다.",
    "Claude Code가 요청 1,005건, spend $140.64로 대부분을 차지해 Team plan의 핵심 활용처는 개발 생산성입니다.",
    "lines export에는 잡히지만 spend report에는 없는 사용자가 5명, spend만 잡힌 사용자가 1명 있어 두 원천을 함께 봐야 합니다.",
  ],
};
