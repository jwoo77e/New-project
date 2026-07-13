export type ClaudeTeamUsageLevel = "High" | "Medium" | "Low";

export type ClaudeTeamUserUsage = {
  email: string;
  displayName: string;
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

export type ClaudeTeamSourceVerification = {
  spendRecords: number;
  codeLineAccounts: number;
  matchedAccounts: number;
  approvedAccounts: number;
  rawOnlyAccounts: number;
  approvedButInactive: number;
  note: string;
};

export type ClaudeTeamUsageData = {
  source: {
    name: string;
    period: string;
    generatedAt: string;
    spendFile: string;
    codeLinesFile: string;
    note: string;
    verification: ClaudeTeamSourceVerification;
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
    period: "Spend 2026-07-01~12 · Lines 2026-07-01~31",
    generatedAt: "2026-07-13",
    spendFile: "spend-report-e59c75bc-469e-466f-bef9-c311748c1df8-2026-07-01-to-2026-07-12.csv",
    codeLinesFile: "claude_code_team_2026_07_01_to_2026_07_31.csv",
    note: "Claude Spend report(7월 1-12일)와 Claude Code lines export(7월 1-31일)를 user email 기준으로 결합하고, AI 도구 결재 현황의 Team 계정 15개와 대조",
    verification: {
      spendRecords: 88,
      codeLineAccounts: 16,
      matchedAccounts: 16,
      approvedAccounts: 15,
      rawOnlyAccounts: 3,
      approvedButInactive: 1,
      note: "Spend 17개 계정과 Code Lines 16개 계정 중 16개가 교차 확인되었습니다. 결재 등록 외 원천 계정 3개와 7월 미활성 결재 계정 1개는 별도 확인이 필요합니다.",
    },
  },
  licensedUsers: 15,
  activeUsers: 17,
  spendUsers: 17,
  codeUsers: 16,
  totalRequests: 40959,
  totalPromptTokens: 7643092569,
  totalCompletionTokens: 30889059,
  totalTokens: 7673981628,
  totalNetSpendUsd: 474.61,
  totalGrossSpendUsd: 477.21,
  totalCodeLines: 150813,
  productUsage: [
    {
      product: "Cowork",
      requests: 5413,
      tokens: 1525509330,
      spendUsd: 397.68,
      userCount: 7,
      users: [
        "crow326@riskzero.kr",
        "hchbae1001@riskzero.kr",
        "jaewoo.kim@riskzero.kr",
        "kys0392@riskzero.kr",
        "mygu@riskzero.kr",
        "sjlim@riskzero.kr",
        "wody@riskzero.kr",
      ],
    },
    {
      product: "Claude Code",
      requests: 34891,
      tokens: 6035671461,
      spendUsd: 66.57,
      userCount: 16,
      users: [
        "crow326@riskzero.kr",
        "hchbae1001@riskzero.kr",
        "hhlee0227@riskzero.kr",
        "huizhen0227@riskzero.kr",
        "jaewoo.kim@riskzero.kr",
        "jisub1221@riskzero.kr",
        "jungyr98@riskzero.kr",
        "kys0392@riskzero.kr",
        "mjkim1122@riskzero.kr",
        "mygu@riskzero.kr",
        "rkgmf1230@riskzero.kr",
        "sjlim@riskzero.kr",
        "staycurious@riskzero.kr",
        "wody@riskzero.kr",
        "woosung.jeon@riskzero.kr",
        "ykchj1011@riskzero.kr",
      ],
    },
    {
      product: "Office Agents",
      requests: 57,
      tokens: 5652156,
      spendUsd: 9.7,
      userCount: 1,
      users: ["jaewoo.kim@riskzero.kr"],
    },
    {
      product: "Chat",
      requests: 583,
      tokens: 106818973,
      spendUsd: 0.66,
      userCount: 9,
      users: [
        "crow326@riskzero.kr",
        "hchbae1001@riskzero.kr",
        "jhpark@riskzero.kr",
        "mygu@riskzero.kr",
        "sjlim@riskzero.kr",
        "staycurious@riskzero.kr",
        "wody@riskzero.kr",
        "woosung.jeon@riskzero.kr",
        "ykchj1011@riskzero.kr",
      ],
    },
    {
      product: "Claude in Chrome",
      requests: 15,
      tokens: 329708,
      spendUsd: 0,
      userCount: 1,
      users: ["jaewoo.kim@riskzero.kr"],
    },
  ],
  modelUsage: [
    {
      model: "claude-fable-5",
      requests: 3084,
      tokens: 838465733,
      spendUsd: 324.06,
      userCount: 5,
      users: [
        "hchbae1001@riskzero.kr",
        "jaewoo.kim@riskzero.kr",
        "mygu@riskzero.kr",
        "sjlim@riskzero.kr",
        "wody@riskzero.kr",
      ],
    },
    {
      model: "claude-opus-4-8",
      requests: 11596,
      tokens: 2361308070,
      spendUsd: 146.18,
      userCount: 7,
      users: [
        "hchbae1001@riskzero.kr",
        "hhlee0227@riskzero.kr",
        "jaewoo.kim@riskzero.kr",
        "mygu@riskzero.kr",
        "sjlim@riskzero.kr",
        "wody@riskzero.kr",
        "woosung.jeon@riskzero.kr",
      ],
    },
    {
      model: "claude-sonnet-5",
      requests: 20235,
      tokens: 4106105609,
      spendUsd: 4.12,
      userCount: 14,
      users: [
        "crow326@riskzero.kr",
        "hchbae1001@riskzero.kr",
        "hhlee0227@riskzero.kr",
        "huizhen0227@riskzero.kr",
        "jhpark@riskzero.kr",
        "jungyr98@riskzero.kr",
        "kys0392@riskzero.kr",
        "mjkim1122@riskzero.kr",
        "rkgmf1230@riskzero.kr",
        "sjlim@riskzero.kr",
        "staycurious@riskzero.kr",
        "wody@riskzero.kr",
        "woosung.jeon@riskzero.kr",
        "ykchj1011@riskzero.kr",
      ],
    },
    {
      model: "claude-haiku-4-5-20251001",
      requests: 2845,
      tokens: 68413531,
      spendUsd: 0.25,
      userCount: 17,
      users: [
        "crow326@riskzero.kr",
        "hchbae1001@riskzero.kr",
        "hhlee0227@riskzero.kr",
        "huizhen0227@riskzero.kr",
        "jaewoo.kim@riskzero.kr",
        "jhpark@riskzero.kr",
        "jisub1221@riskzero.kr",
        "jungyr98@riskzero.kr",
        "kys0392@riskzero.kr",
        "mjkim1122@riskzero.kr",
        "mygu@riskzero.kr",
        "rkgmf1230@riskzero.kr",
        "sjlim@riskzero.kr",
        "staycurious@riskzero.kr",
        "wody@riskzero.kr",
        "woosung.jeon@riskzero.kr",
        "ykchj1011@riskzero.kr",
      ],
    },
    {
      model: "claude-sonnet-4-6",
      requests: 3182,
      tokens: 298905703,
      spendUsd: 0,
      userCount: 11,
      users: [
        "hchbae1001@riskzero.kr",
        "huizhen0227@riskzero.kr",
        "jisub1221@riskzero.kr",
        "jungyr98@riskzero.kr",
        "kys0392@riskzero.kr",
        "mjkim1122@riskzero.kr",
        "mygu@riskzero.kr",
        "rkgmf1230@riskzero.kr",
        "sjlim@riskzero.kr",
        "staycurious@riskzero.kr",
        "woosung.jeon@riskzero.kr",
      ],
    },
    {
      model: "claude-opus-4-7",
      requests: 17,
      tokens: 782982,
      spendUsd: 0,
      userCount: 1,
      users: ["crow326@riskzero.kr"],
    },
  ],
  users: [
    {
      email: "hchbae1001@riskzero.kr",
      displayName: "배현철 사원",
      requests: 4300,
      promptTokens: 837595842,
      completionTokens: 2327576,
      totalTokens: 839923418,
      netSpendUsd: 2.43,
      grossSpendUsd: 3.29,
      codeLines: 25413,
      products: ["Chat", "Claude Code", "Cowork"],
      models: ["claude-fable-5", "claude-haiku-4-5-20251001", "claude-opus-4-8", "claude-sonnet-4-6", "claude-sonnet-5"],
      level: "High",
      note: "7월 Code Lines 2.5만 줄로 최다",
    },
    {
      email: "wody@riskzero.kr",
      displayName: "정재요 차장",
      requests: 5914,
      promptTokens: 728046859,
      completionTokens: 5196586,
      totalTokens: 733243445,
      netSpendUsd: 10.72,
      grossSpendUsd: 11.97,
      codeLines: 22848,
      products: ["Chat", "Claude Code", "Cowork"],
      models: ["claude-fable-5", "claude-haiku-4-5-20251001", "claude-opus-4-8", "claude-sonnet-5"],
      level: "High",
      note: "7월 Code Lines 2.3만 줄로 2위",
    },
    {
      email: "hhlee0227@riskzero.kr",
      displayName: "이한호 대리",
      requests: 3712,
      promptTokens: 609902991,
      completionTokens: 2762787,
      totalTokens: 612665778,
      netSpendUsd: 0,
      grossSpendUsd: 0.01,
      codeLines: 19803,
      products: ["Claude Code"],
      models: ["claude-haiku-4-5-20251001", "claude-opus-4-8", "claude-sonnet-5"],
      level: "High",
      note: "7월 Code Lines 2.0만 줄로 3위",
    },
    {
      email: "kys0392@riskzero.kr",
      displayName: "김영산 과장",
      requests: 3260,
      promptTokens: 480610245,
      completionTokens: 3432316,
      totalTokens: 484042561,
      netSpendUsd: 0,
      grossSpendUsd: 0.07,
      codeLines: 19492,
      products: ["Claude Code", "Cowork"],
      models: ["claude-haiku-4-5-20251001", "claude-sonnet-4-6", "claude-sonnet-5"],
      level: "High",
      note: "Spend는 낮지만 Code Lines 1.9만 줄",
    },
    {
      email: "jaewoo.kim@riskzero.kr",
      displayName: "김재우 부장",
      requests: 4958,
      promptTokens: 1400079184,
      completionTokens: 5204454,
      totalTokens: 1405283638,
      netSpendUsd: 407.38,
      grossSpendUsd: 407.58,
      codeLines: 12489,
      products: ["Claude Code", "Claude in Chrome", "Cowork", "Office Agents"],
      models: ["claude-fable-5", "claude-haiku-4-5-20251001", "claude-opus-4-8"],
      level: "High",
      note: "Cowork·Office Agents 중심 Spend $407.38",
    },
    {
      email: "jisub1221@riskzero.kr",
      displayName: "미확인",
      requests: 1981,
      promptTokens: 165046273,
      completionTokens: 862253,
      totalTokens: 165908526,
      netSpendUsd: 0,
      grossSpendUsd: 0,
      codeLines: 12168,
      products: ["Claude Code"],
      models: ["claude-haiku-4-5-20251001", "claude-sonnet-4-6"],
      level: "High",
      note: "Code Lines 1.2만 줄, 결재 목록 이름 매핑 필요",
    },
    {
      email: "woosung.jeon@riskzero.kr",
      displayName: "전우성 부장",
      requests: 3044,
      promptTokens: 758228020,
      completionTokens: 2596340,
      totalTokens: 760824360,
      netSpendUsd: 3.99,
      grossSpendUsd: 4.01,
      codeLines: 11371,
      products: ["Chat", "Claude Code"],
      models: ["claude-haiku-4-5-20251001", "claude-opus-4-8", "claude-sonnet-4-6", "claude-sonnet-5"],
      level: "High",
      note: "Code Lines 1.1만 줄과 Chat·Code 병행",
    },
    {
      email: "huizhen0227@riskzero.kr",
      displayName: "김혜진 과장",
      requests: 2562,
      promptTokens: 617062355,
      completionTokens: 1183090,
      totalTokens: 618245445,
      netSpendUsd: 0,
      grossSpendUsd: 0,
      codeLines: 7659,
      products: ["Claude Code"],
      models: ["claude-haiku-4-5-20251001", "claude-sonnet-4-6", "claude-sonnet-5"],
      level: "High",
      note: "Spend는 낮지만 토큰·Code Lines 활용 높음",
    },
    {
      email: "staycurious@riskzero.kr",
      displayName: "김하나 과장",
      requests: 3448,
      promptTokens: 865717035,
      completionTokens: 2045307,
      totalTokens: 867762342,
      netSpendUsd: 0,
      grossSpendUsd: 0,
      codeLines: 5439,
      products: ["Chat", "Claude Code"],
      models: ["claude-haiku-4-5-20251001", "claude-sonnet-4-6", "claude-sonnet-5"],
      level: "High",
      note: "5천 줄 이상 Code Lines 활용",
    },
    {
      email: "crow326@riskzero.kr",
      displayName: "미확인",
      requests: 1593,
      promptTokens: 494222268,
      completionTokens: 1034370,
      totalTokens: 495256638,
      netSpendUsd: 0,
      grossSpendUsd: 0.14,
      codeLines: 4866,
      products: ["Chat", "Claude Code", "Cowork"],
      models: ["claude-haiku-4-5-20251001", "claude-opus-4-7", "claude-sonnet-5"],
      level: "High",
      note: "Code Lines 4.9천 줄, 결재 목록 대조 필요",
    },
    {
      email: "mjkim1122@riskzero.kr",
      displayName: "김민정 차장",
      requests: 1164,
      promptTokens: 150338053,
      completionTokens: 628848,
      totalTokens: 150966901,
      netSpendUsd: 0,
      grossSpendUsd: 0.01,
      codeLines: 4333,
      products: ["Claude Code"],
      models: ["claude-haiku-4-5-20251001", "claude-sonnet-4-6", "claude-sonnet-5"],
      level: "High",
      note: "4천 줄 이상 Code Lines 활용",
    },
    {
      email: "mygu@riskzero.kr",
      displayName: "구문영 사원",
      requests: 1884,
      promptTokens: 295862848,
      completionTokens: 1995281,
      totalTokens: 297858129,
      netSpendUsd: 50.09,
      grossSpendUsd: 50.11,
      codeLines: 2175,
      products: ["Chat", "Claude Code", "Cowork"],
      models: ["claude-fable-5", "claude-haiku-4-5-20251001", "claude-opus-4-8", "claude-sonnet-4-6"],
      level: "High",
      note: "Cowork Spend $50.09와 Code Lines 병행",
    },
    {
      email: "jungyr98@riskzero.kr",
      displayName: "정유라 사원",
      requests: 1559,
      promptTokens: 102272830,
      completionTokens: 869923,
      totalTokens: 103142753,
      netSpendUsd: 0,
      grossSpendUsd: 0,
      codeLines: 1214,
      products: ["Claude Code"],
      models: ["claude-haiku-4-5-20251001", "claude-sonnet-4-6", "claude-sonnet-5"],
      level: "Medium",
      note: "1천 줄 이상 Code Lines 활용",
    },
    {
      email: "ykchj1011@riskzero.kr",
      displayName: "미확인",
      requests: 460,
      promptTokens: 64016765,
      completionTokens: 198131,
      totalTokens: 64214896,
      netSpendUsd: 0,
      grossSpendUsd: 0,
      codeLines: 682,
      products: ["Chat", "Claude Code"],
      models: ["claude-haiku-4-5-20251001", "claude-sonnet-5"],
      level: "Medium",
      note: "Code Lines 682줄, 결재 목록 이름 매핑 필요",
    },
    {
      email: "sjlim@riskzero.kr",
      displayName: "임성진 부장",
      requests: 75,
      promptTokens: 7175353,
      completionTokens: 77937,
      totalTokens: 7253290,
      netSpendUsd: 0,
      grossSpendUsd: 0.01,
      codeLines: 467,
      products: ["Chat", "Claude Code", "Cowork"],
      models: ["claude-fable-5", "claude-haiku-4-5-20251001", "claude-opus-4-8", "claude-sonnet-4-6", "claude-sonnet-5"],
      level: "Medium",
      note: "Spend report와 Code Lines 467줄 확인",
    },
    {
      email: "rkgmf1230@riskzero.kr",
      displayName: "김가흘 대리",
      requests: 1042,
      promptTokens: 66798589,
      completionTokens: 472275,
      totalTokens: 67270864,
      netSpendUsd: 0,
      grossSpendUsd: 0,
      codeLines: 394,
      products: ["Claude Code"],
      models: ["claude-haiku-4-5-20251001", "claude-sonnet-4-6", "claude-sonnet-5"],
      level: "Low",
      note: "Code Lines 394줄",
    },
    {
      email: "jhpark@riskzero.kr",
      displayName: "박재현 상무",
      requests: 3,
      promptTokens: 117059,
      completionTokens: 1585,
      totalTokens: 118644,
      netSpendUsd: 0,
      grossSpendUsd: 0.01,
      codeLines: 0,
      products: ["Chat"],
      models: ["claude-haiku-4-5-20251001", "claude-sonnet-5"],
      level: "Low",
      note: "Spend report 요청 3건, Code Lines 0줄",
    },
  ],
  insights: [
    "7월 1-12일 Claude Spend report 기준 활성 사용자는 17명이며 총 40,959건의 요청과 $474.61 순지출이 확인됩니다.",
    "7월 1-31일 Claude Code lines export 기준 코드 라인은 총 150,813줄이고, 16명이 1줄 이상 사용했습니다.",
    "Spend는 Cowork $397.68(83.8%)에 집중되고, Code Lines는 hchbae1001@riskzero.kr 25,413줄, wody@riskzero.kr 22,848줄 순으로 높습니다.",
    "Spend report와 Code lines export 기간이 달라 비용·토큰은 7월 1-12일, 코드 라인은 7월 전체 기준으로 해석합니다.",
    "결재 등록 Team 계정 15개와 원천 계정을 대조해 결재 목록 외 3개 계정 및 7월 미활성 결재 계정 1개를 확인했습니다.",
  ],
};
