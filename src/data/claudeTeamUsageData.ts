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
    period: "Spend 2026-06-01~15 · Lines 2026-06-01~30",
    generatedAt: "2026-06-16",
    spendFile: "spend-report-e59c75bc-469e-466f-bef9-c311748c1df8-2026-06-01-to-2026-06-15.csv",
    codeLinesFile: "claude_code_team_2026_06_01_to_2026_06_30.csv",
    note: "Claude Spend report(6월 1-15일)와 Claude Code lines export(6월 1-30일)를 user email 기준으로 결합",
  },
  licensedUsers: 14,
  activeUsers: 13,
  spendUsers: 13,
  codeUsers: 11,
  totalRequests: 30616,
  totalPromptTokens: 4871536448,
  totalCompletionTokens: 23626152,
  totalTokens: 4895162600,
  totalNetSpendUsd: 35.62,
  totalGrossSpendUsd: 36.56,
  totalCodeLines: 137392,
  productUsage: [
    {
      product: "Claude Code",
      requests: 30026,
      tokens: 4798651339,
      spendUsd: 35.62,
      userCount: 11,
      users: [
        "hchbae1001@riskzero.kr",
        "hhlee0227@riskzero.kr",
        "huizhen0227@riskzero.kr",
        "jungyr98@riskzero.kr",
        "kys0392@riskzero.kr",
        "mjkim1122@riskzero.kr",
        "mygu@riskzero.kr",
        "rkgmf1230@riskzero.kr",
        "sieghaft@riskzero.kr",
        "wody@riskzero.kr",
        "woosung.jeon@riskzero.kr",
      ],
    },
    {
      product: "Chat",
      requests: 206,
      tokens: 50525270,
      spendUsd: 0,
      userCount: 6,
      users: [
        "hchbae1001@riskzero.kr",
        "hhlee0227@riskzero.kr",
        "mygu@riskzero.kr",
        "sieghaft@riskzero.kr",
        "wody@riskzero.kr",
        "woosung.jeon@riskzero.kr",
      ],
    },
    {
      product: "Cowork",
      requests: 356,
      tokens: 44262326,
      spendUsd: 0,
      userCount: 3,
      users: ["mygu@riskzero.kr", "staycurious@riskzero.kr", "wody@riskzero.kr"],
    },
    {
      product: "Office Agents",
      requests: 28,
      tokens: 1723665,
      spendUsd: 0,
      userCount: 1,
      users: ["sjlim@riskzero.kr"],
    },
  ],
  modelUsage: [
    {
      model: "claude-fable-5",
      requests: 2893,
      tokens: 574235647,
      spendUsd: 28.55,
      userCount: 5,
      users: [
        "hhlee0227@riskzero.kr",
        "jungyr98@riskzero.kr",
        "kys0392@riskzero.kr",
        "mygu@riskzero.kr",
        "wody@riskzero.kr",
      ],
    },
    {
      model: "claude-sonnet-4-6",
      requests: 13160,
      tokens: 1503002033,
      spendUsd: 5.57,
      userCount: 12,
      users: [
        "hchbae1001@riskzero.kr",
        "hhlee0227@riskzero.kr",
        "huizhen0227@riskzero.kr",
        "jungyr98@riskzero.kr",
        "kys0392@riskzero.kr",
        "mjkim1122@riskzero.kr",
        "mygu@riskzero.kr",
        "rkgmf1230@riskzero.kr",
        "sieghaft@riskzero.kr",
        "staycurious@riskzero.kr",
        "wody@riskzero.kr",
        "woosung.jeon@riskzero.kr",
      ],
    },
    {
      model: "claude-opus-4-8",
      requests: 10175,
      tokens: 2266846394,
      spendUsd: 1.5,
      userCount: 7,
      users: [
        "hchbae1001@riskzero.kr",
        "hhlee0227@riskzero.kr",
        "kys0392@riskzero.kr",
        "mygu@riskzero.kr",
        "sieghaft@riskzero.kr",
        "sjlim@riskzero.kr",
        "wody@riskzero.kr",
      ],
    },
    {
      model: "claude-opus-4-7",
      requests: 1252,
      tokens: 446755294,
      spendUsd: 0,
      userCount: 4,
      users: ["hhlee0227@riskzero.kr", "mygu@riskzero.kr", "sieghaft@riskzero.kr", "wody@riskzero.kr"],
    },
    {
      model: "claude-haiku-4-5-20251001",
      requests: 3136,
      tokens: 104323232,
      spendUsd: 0,
      userCount: 12,
      users: [
        "hchbae1001@riskzero.kr",
        "hhlee0227@riskzero.kr",
        "huizhen0227@riskzero.kr",
        "jungyr98@riskzero.kr",
        "kys0392@riskzero.kr",
        "mjkim1122@riskzero.kr",
        "mygu@riskzero.kr",
        "rkgmf1230@riskzero.kr",
        "sieghaft@riskzero.kr",
        "staycurious@riskzero.kr",
        "wody@riskzero.kr",
        "woosung.jeon@riskzero.kr",
      ],
    },
  ],
  users: [
    {
      email: "hhlee0227@riskzero.kr",
      requests: 2974,
      promptTokens: 592863839,
      completionTokens: 2333321,
      totalTokens: 595197160,
      netSpendUsd: 22.1,
      grossSpendUsd: 22.11,
      codeLines: 7024,
      products: ["Chat", "Claude Code"],
      models: [
        "claude-fable-5",
        "claude-haiku-4-5-20251001",
        "claude-opus-4-7",
        "claude-opus-4-8",
        "claude-sonnet-4-6",
      ],
      level: "High",
      note: "6월 상반기 net spend 상위 사용자",
    },
    {
      email: "wody@riskzero.kr",
      requests: 13022,
      promptTokens: 2533300497,
      completionTokens: 12115125,
      totalTokens: 2545415622,
      netSpendUsd: 10.56,
      grossSpendUsd: 11.27,
      codeLines: 49446,
      products: ["Chat", "Claude Code", "Cowork"],
      models: [
        "claude-fable-5",
        "claude-haiku-4-5-20251001",
        "claude-opus-4-7",
        "claude-opus-4-8",
        "claude-sonnet-4-6",
      ],
      level: "High",
      note: "6월 상반기 net spend 상위 사용자",
    },
    {
      email: "woosung.jeon@riskzero.kr",
      requests: 4190,
      promptTokens: 611694040,
      completionTokens: 3014247,
      totalTokens: 614708287,
      netSpendUsd: 1.65,
      grossSpendUsd: 1.67,
      codeLines: 9103,
      products: ["Chat", "Claude Code"],
      models: ["claude-haiku-4-5-20251001", "claude-sonnet-4-6"],
      level: "High",
      note: "net spend는 낮지만 토큰/요청 사용량 높음",
    },
    {
      email: "hchbae1001@riskzero.kr",
      requests: 478,
      promptTokens: 48712589,
      completionTokens: 612353,
      totalTokens: 49324942,
      netSpendUsd: 1.31,
      grossSpendUsd: 1.42,
      codeLines: 43284,
      products: ["Chat", "Claude Code"],
      models: ["claude-haiku-4-5-20251001", "claude-opus-4-8", "claude-sonnet-4-6"],
      level: "High",
      note: "6월 상반기 spend report에서 Claude Code 사용과 Premium 전환 후 코드 라인 43,284줄 확인",
    },
    {
      email: "sieghaft@riskzero.kr",
      requests: 949,
      promptTokens: 322078995,
      completionTokens: 720125,
      totalTokens: 322799120,
      netSpendUsd: 0,
      grossSpendUsd: 0.01,
      codeLines: 2000,
      products: ["Chat", "Claude Code"],
      models: [
        "claude-haiku-4-5-20251001",
        "claude-opus-4-7",
        "claude-opus-4-8",
        "claude-sonnet-4-6",
      ],
      level: "High",
      note: "net spend는 낮지만 토큰/요청 사용량 높음",
    },
    {
      email: "huizhen0227@riskzero.kr",
      requests: 2544,
      promptTokens: 280819515,
      completionTokens: 1367943,
      totalTokens: 282187458,
      netSpendUsd: 0,
      grossSpendUsd: 0,
      codeLines: 11180,
      products: ["Claude Code"],
      models: ["claude-haiku-4-5-20251001", "claude-sonnet-4-6"],
      level: "High",
      note: "net spend는 낮지만 토큰/요청 사용량 높음",
    },
    {
      email: "jungyr98@riskzero.kr",
      requests: 2521,
      promptTokens: 182791310,
      completionTokens: 1447613,
      totalTokens: 184238923,
      netSpendUsd: 0,
      grossSpendUsd: 0,
      codeLines: 1920,
      products: ["Claude Code"],
      models: ["claude-fable-5", "claude-haiku-4-5-20251001", "claude-sonnet-4-6"],
      level: "High",
      note: "net spend는 낮지만 토큰/요청 사용량 높음",
    },
    {
      email: "rkgmf1230@riskzero.kr",
      requests: 1501,
      promptTokens: 117150186,
      completionTokens: 684954,
      totalTokens: 117835140,
      netSpendUsd: 0,
      grossSpendUsd: 0.02,
      codeLines: 8738,
      products: ["Claude Code"],
      models: ["claude-haiku-4-5-20251001", "claude-sonnet-4-6"],
      level: "High",
      note: "net spend는 낮지만 토큰/요청 사용량 높음",
    },
    {
      email: "mygu@riskzero.kr",
      requests: 744,
      promptTokens: 74524065,
      completionTokens: 630627,
      totalTokens: 75154692,
      netSpendUsd: 0,
      grossSpendUsd: 0,
      codeLines: 1424,
      products: ["Chat", "Claude Code", "Cowork"],
      models: [
        "claude-fable-5",
        "claude-haiku-4-5-20251001",
        "claude-opus-4-7",
        "claude-opus-4-8",
        "claude-sonnet-4-6",
      ],
      level: "Medium",
      note: "spend report 사용 기록 확인, net spend는 0달러",
    },
    {
      email: "mjkim1122@riskzero.kr",
      requests: 888,
      promptTokens: 65721509,
      completionTokens: 272443,
      totalTokens: 65993952,
      netSpendUsd: 0,
      grossSpendUsd: 0,
      codeLines: 1065,
      products: ["Claude Code"],
      models: ["claude-haiku-4-5-20251001", "claude-sonnet-4-6"],
      level: "Medium",
      note: "spend report 사용 기록 확인, net spend는 0달러",
    },
    {
      email: "kys0392@riskzero.kr",
      requests: 616,
      promptTokens: 30323372,
      completionTokens: 306992,
      totalTokens: 30630364,
      netSpendUsd: 0,
      grossSpendUsd: 0.06,
      codeLines: 2208,
      products: ["Claude Code"],
      models: [
        "claude-fable-5",
        "claude-haiku-4-5-20251001",
        "claude-opus-4-8",
        "claude-sonnet-4-6",
      ],
      level: "Medium",
      note: "spend report 사용 기록 확인, net spend는 0달러",
    },
    {
      email: "staycurious@riskzero.kr",
      requests: 161,
      promptTokens: 9846357,
      completionTokens: 106918,
      totalTokens: 9953275,
      netSpendUsd: 0,
      grossSpendUsd: 0,
      codeLines: 0,
      products: ["Cowork"],
      models: ["claude-haiku-4-5-20251001", "claude-sonnet-4-6"],
      level: "Low",
      note: "spend report 사용 기록 확인, net spend는 0달러",
    },
    {
      email: "sjlim@riskzero.kr",
      requests: 28,
      promptTokens: 1710174,
      completionTokens: 13491,
      totalTokens: 1723665,
      netSpendUsd: 0,
      grossSpendUsd: 0,
      codeLines: 0,
      products: ["Office Agents"],
      models: ["claude-opus-4-8"],
      level: "Low",
      note: "spend report 사용 기록 확인, net spend는 0달러",
    },
  ],
  insights: [
    "6월 1-15일 Claude Spend report 기준 활성 사용자는 13명이며 총 30,616건의 요청이 확인됩니다.",
    "6월 1-30일 Claude Code lines export 기준 코드 라인은 총 137,392줄이고, 11명이 1줄 이상 사용했습니다.",
    "코드 라인은 wody@riskzero.kr 49,446줄, hchbae1001@riskzero.kr 43,284줄 순으로 높습니다.",
    "Spend report와 Code lines export 기간이 달라 비용은 6월 상반기, 코드 라인은 6월 전체 기준으로 해석합니다.",
  ],
};
