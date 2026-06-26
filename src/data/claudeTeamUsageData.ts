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
  "source": {
    "name": "Claude Team Plan 사용 현황",
    "period": "Spend 2026-06-01~25 · Lines 2026-06-01~30",
    "generatedAt": "2026-06-26",
    "spendFile": "spend-report-e59c75bc-469e-466f-bef9-c311748c1df8-2026-06-01-to-2026-06-25.csv",
    "codeLinesFile": "claude_code_team_2026_06_01_to_2026_06_30.csv",
    "note": "Claude Spend report(6월 1-25일)와 Claude Code lines export(6월 1-30일)를 user email 기준으로 결합"
  },
  "licensedUsers": 14,
  "activeUsers": 14,
  "spendUsers": 14,
  "codeUsers": 13,
  "totalRequests": 66606,
  "totalPromptTokens": 11809732219,
  "totalCompletionTokens": 51764891,
  "totalTokens": 11861497110,
  "totalNetSpendUsd": 77.57,
  "totalGrossSpendUsd": 80.87,
  "totalCodeLines": 276191,
  "productUsage": [
    {
      "product": "Claude Code",
      "requests": 63424,
      "tokens": 11117317355,
      "spendUsd": 77.57,
      "userCount": 14,
      "users": [
        "hchbae1001@riskzero.kr",
        "hhlee0227@riskzero.kr",
        "huizhen0227@riskzero.kr",
        "jaewoo.kim@riskzero.kr",
        "jungyr98@riskzero.kr",
        "kys0392@riskzero.kr",
        "mjkim1122@riskzero.kr",
        "mygu@riskzero.kr",
        "rkgmf1230@riskzero.kr",
        "sieghaft@riskzero.kr",
        "sjlim@riskzero.kr",
        "staycurious@riskzero.kr",
        "wody@riskzero.kr",
        "woosung.jeon@riskzero.kr"
      ]
    },
    {
      "product": "Cowork",
      "requests": 2585,
      "tokens": 626638140,
      "spendUsd": 0,
      "userCount": 7,
      "users": [
        "hchbae1001@riskzero.kr",
        "jaewoo.kim@riskzero.kr",
        "kys0392@riskzero.kr",
        "mygu@riskzero.kr",
        "sjlim@riskzero.kr",
        "staycurious@riskzero.kr",
        "wody@riskzero.kr"
      ]
    },
    {
      "product": "Chat",
      "requests": 567,
      "tokens": 115802841,
      "spendUsd": 0,
      "userCount": 8,
      "users": [
        "hchbae1001@riskzero.kr",
        "hhlee0227@riskzero.kr",
        "jaewoo.kim@riskzero.kr",
        "mygu@riskzero.kr",
        "sieghaft@riskzero.kr",
        "sjlim@riskzero.kr",
        "wody@riskzero.kr",
        "woosung.jeon@riskzero.kr"
      ]
    },
    {
      "product": "Office Agents",
      "requests": 28,
      "tokens": 1723665,
      "spendUsd": 0,
      "userCount": 1,
      "users": [
        "sjlim@riskzero.kr"
      ]
    },
    {
      "product": "Claude in Chrome",
      "requests": 2,
      "tokens": 15109,
      "spendUsd": 0,
      "userCount": 1,
      "users": [
        "jaewoo.kim@riskzero.kr"
      ]
    }
  ],
  "modelUsage": [
    {
      "model": "claude-fable-5",
      "requests": 2893,
      "tokens": 574235647,
      "spendUsd": 28.55,
      "userCount": 5,
      "users": [
        "hhlee0227@riskzero.kr",
        "jungyr98@riskzero.kr",
        "kys0392@riskzero.kr",
        "mygu@riskzero.kr",
        "wody@riskzero.kr"
      ]
    },
    {
      "model": "claude-opus-4-8",
      "requests": 29424,
      "tokens": 8065990661,
      "spendUsd": 26.45,
      "userCount": 10,
      "users": [
        "hchbae1001@riskzero.kr",
        "hhlee0227@riskzero.kr",
        "jaewoo.kim@riskzero.kr",
        "kys0392@riskzero.kr",
        "mygu@riskzero.kr",
        "sieghaft@riskzero.kr",
        "sjlim@riskzero.kr",
        "staycurious@riskzero.kr",
        "wody@riskzero.kr",
        "woosung.jeon@riskzero.kr"
      ]
    },
    {
      "model": "claude-sonnet-4-6",
      "requests": 25917,
      "tokens": 2538434834,
      "spendUsd": 22.28,
      "userCount": 13,
      "users": [
        "hchbae1001@riskzero.kr",
        "hhlee0227@riskzero.kr",
        "huizhen0227@riskzero.kr",
        "jaewoo.kim@riskzero.kr",
        "jungyr98@riskzero.kr",
        "kys0392@riskzero.kr",
        "mjkim1122@riskzero.kr",
        "mygu@riskzero.kr",
        "rkgmf1230@riskzero.kr",
        "sieghaft@riskzero.kr",
        "staycurious@riskzero.kr",
        "wody@riskzero.kr",
        "woosung.jeon@riskzero.kr"
      ]
    },
    {
      "model": "claude-haiku-4-5-20251001",
      "requests": 7041,
      "tokens": 225508707,
      "spendUsd": 0.29,
      "userCount": 14,
      "users": [
        "hchbae1001@riskzero.kr",
        "hhlee0227@riskzero.kr",
        "huizhen0227@riskzero.kr",
        "jaewoo.kim@riskzero.kr",
        "jungyr98@riskzero.kr",
        "kys0392@riskzero.kr",
        "mjkim1122@riskzero.kr",
        "mygu@riskzero.kr",
        "rkgmf1230@riskzero.kr",
        "sieghaft@riskzero.kr",
        "sjlim@riskzero.kr",
        "staycurious@riskzero.kr",
        "wody@riskzero.kr",
        "woosung.jeon@riskzero.kr"
      ]
    },
    {
      "model": "claude-opus-4-7",
      "requests": 1268,
      "tokens": 455168092,
      "spendUsd": 0,
      "userCount": 4,
      "users": [
        "hhlee0227@riskzero.kr",
        "mygu@riskzero.kr",
        "sieghaft@riskzero.kr",
        "wody@riskzero.kr"
      ]
    },
    {
      "model": "claude-opus-4-6",
      "requests": 63,
      "tokens": 2159169,
      "spendUsd": 0,
      "userCount": 1,
      "users": [
        "hchbae1001@riskzero.kr"
      ]
    }
  ],
  "users": [
    {
      "email": "hhlee0227@riskzero.kr",
      "displayName": "이한호 대리",
      "requests": 6228,
      "promptTokens": 1124613460,
      "completionTokens": 5075671,
      "totalTokens": 1129689131,
      "netSpendUsd": 47.05,
      "grossSpendUsd": 47.06,
      "codeLines": 15953,
      "products": [
        "Chat",
        "Claude Code"
      ],
      "models": [
        "claude-fable-5",
        "claude-haiku-4-5-20251001",
        "claude-opus-4-7",
        "claude-opus-4-8",
        "claude-sonnet-4-6"
      ],
      "level": "High",
      "note": "6월 1-25일 net spend 발생 사용자"
    },
    {
      "email": "woosung.jeon@riskzero.kr",
      "displayName": "전우성 부장",
      "requests": 7840,
      "promptTokens": 948867038,
      "completionTokens": 6324318,
      "totalTokens": 955191356,
      "netSpendUsd": 18.65,
      "grossSpendUsd": 18.72,
      "codeLines": 26375,
      "products": [
        "Chat",
        "Claude Code"
      ],
      "models": [
        "claude-haiku-4-5-20251001",
        "claude-opus-4-8",
        "claude-sonnet-4-6"
      ],
      "level": "High",
      "note": "6월 1-25일 net spend 발생 사용자"
    },
    {
      "email": "wody@riskzero.kr",
      "displayName": "정재요 차장",
      "requests": 20596,
      "promptTokens": 3785478594,
      "completionTokens": 18682032,
      "totalTokens": 3804160626,
      "netSpendUsd": 10.56,
      "grossSpendUsd": 11.5,
      "codeLines": 73909,
      "products": [
        "Chat",
        "Claude Code",
        "Cowork"
      ],
      "models": [
        "claude-fable-5",
        "claude-haiku-4-5-20251001",
        "claude-opus-4-7",
        "claude-opus-4-8",
        "claude-sonnet-4-6"
      ],
      "level": "High",
      "note": "6월 1-25일 net spend 발생 사용자"
    },
    {
      "email": "hchbae1001@riskzero.kr",
      "displayName": "배현철 사원",
      "requests": 11737,
      "promptTokens": 3728378497,
      "completionTokens": 8818736,
      "totalTokens": 3737197233,
      "netSpendUsd": 1.31,
      "grossSpendUsd": 3.09,
      "codeLines": 104786,
      "products": [
        "Chat",
        "Claude Code",
        "Cowork"
      ],
      "models": [
        "claude-haiku-4-5-20251001",
        "claude-opus-4-6",
        "claude-opus-4-8",
        "claude-sonnet-4-6"
      ],
      "level": "High",
      "note": "Claude Code lines 10만 줄 이상, 코드 활용 최상위"
    },
    {
      "email": "kys0392@riskzero.kr",
      "displayName": "김영산 과장",
      "requests": 2840,
      "promptTokens": 208701861,
      "completionTokens": 1809974,
      "totalTokens": 210511835,
      "netSpendUsd": 0,
      "grossSpendUsd": 0.15,
      "codeLines": 17345,
      "products": [
        "Claude Code",
        "Cowork"
      ],
      "models": [
        "claude-fable-5",
        "claude-haiku-4-5-20251001",
        "claude-opus-4-8",
        "claude-sonnet-4-6"
      ],
      "level": "High",
      "note": "net spend는 낮지만 토큰/코드 활용량 높음"
    },
    {
      "email": "huizhen0227@riskzero.kr",
      "displayName": "김혜진 과장",
      "requests": 3574,
      "promptTokens": 367984546,
      "completionTokens": 2135911,
      "totalTokens": 370120457,
      "netSpendUsd": 0,
      "grossSpendUsd": 0,
      "codeLines": 12455,
      "products": [
        "Claude Code"
      ],
      "models": [
        "claude-haiku-4-5-20251001",
        "claude-sonnet-4-6"
      ],
      "level": "High",
      "note": "net spend는 낮지만 토큰/코드 활용량 높음"
    },
    {
      "email": "rkgmf1230@riskzero.kr",
      "displayName": "김가흘 대리",
      "requests": 2726,
      "promptTokens": 189176997,
      "completionTokens": 1342126,
      "totalTokens": 190519123,
      "netSpendUsd": 0,
      "grossSpendUsd": 0.02,
      "codeLines": 9954,
      "products": [
        "Claude Code"
      ],
      "models": [
        "claude-haiku-4-5-20251001",
        "claude-sonnet-4-6"
      ],
      "level": "High",
      "note": "net spend는 낮지만 토큰/코드 활용량 높음"
    },
    {
      "email": "mjkim1122@riskzero.kr",
      "displayName": "김민정 차장",
      "requests": 1892,
      "promptTokens": 121786255,
      "completionTokens": 757596,
      "totalTokens": 122543851,
      "netSpendUsd": 0,
      "grossSpendUsd": 0,
      "codeLines": 3850,
      "products": [
        "Claude Code"
      ],
      "models": [
        "claude-haiku-4-5-20251001",
        "claude-sonnet-4-6"
      ],
      "level": "High",
      "note": "net spend는 낮지만 토큰/코드 활용량 높음"
    },
    {
      "email": "jaewoo.kim@riskzero.kr",
      "displayName": "김재우 부장",
      "requests": 2177,
      "promptTokens": 543781529,
      "completionTokens": 2344291,
      "totalTokens": 546125820,
      "netSpendUsd": 0,
      "grossSpendUsd": 0.24,
      "codeLines": 3382,
      "products": [
        "Chat",
        "Claude Code",
        "Claude in Chrome",
        "Cowork"
      ],
      "models": [
        "claude-haiku-4-5-20251001",
        "claude-opus-4-8",
        "claude-sonnet-4-6"
      ],
      "level": "High",
      "note": "net spend는 낮지만 토큰/코드 활용량 높음"
    },
    {
      "email": "jungyr98@riskzero.kr",
      "displayName": "정유라 사원",
      "requests": 3600,
      "promptTokens": 246195152,
      "completionTokens": 2019195,
      "totalTokens": 248214347,
      "netSpendUsd": 0,
      "grossSpendUsd": 0,
      "codeLines": 2425,
      "products": [
        "Claude Code"
      ],
      "models": [
        "claude-fable-5",
        "claude-haiku-4-5-20251001",
        "claude-sonnet-4-6"
      ],
      "level": "High",
      "note": "net spend는 낮지만 토큰/코드 활용량 높음"
    },
    {
      "email": "staycurious@riskzero.kr",
      "displayName": "김하나 과장",
      "requests": 1501,
      "promptTokens": 132079693,
      "completionTokens": 893180,
      "totalTokens": 132972873,
      "netSpendUsd": 0,
      "grossSpendUsd": 0,
      "codeLines": 2333,
      "products": [
        "Claude Code",
        "Cowork"
      ],
      "models": [
        "claude-haiku-4-5-20251001",
        "claude-opus-4-8",
        "claude-sonnet-4-6"
      ],
      "level": "High",
      "note": "net spend는 낮지만 토큰/코드 활용량 높음"
    },
    {
      "email": "sieghaft@riskzero.kr",
      "displayName": "김성진 부장",
      "requests": 976,
      "promptTokens": 329642389,
      "completionTokens": 745973,
      "totalTokens": 330388362,
      "netSpendUsd": 0,
      "grossSpendUsd": 0.03,
      "codeLines": 2000,
      "products": [
        "Chat",
        "Claude Code"
      ],
      "models": [
        "claude-haiku-4-5-20251001",
        "claude-opus-4-7",
        "claude-opus-4-8",
        "claude-sonnet-4-6"
      ],
      "level": "High",
      "note": "net spend는 낮지만 토큰/코드 활용량 높음"
    },
    {
      "email": "mygu@riskzero.kr",
      "displayName": "구문영 사원",
      "requests": 790,
      "promptTokens": 76704256,
      "completionTokens": 663914,
      "totalTokens": 77368170,
      "netSpendUsd": 0,
      "grossSpendUsd": 0.06,
      "codeLines": 1424,
      "products": [
        "Chat",
        "Claude Code",
        "Cowork"
      ],
      "models": [
        "claude-fable-5",
        "claude-haiku-4-5-20251001",
        "claude-opus-4-7",
        "claude-opus-4-8",
        "claude-sonnet-4-6"
      ],
      "level": "Medium",
      "note": "spend report 사용 기록과 Code lines 확인"
    },
    {
      "email": "sjlim@riskzero.kr",
      "displayName": "임성진 부장",
      "requests": 129,
      "promptTokens": 6341952,
      "completionTokens": 151974,
      "totalTokens": 6493926,
      "netSpendUsd": 0,
      "grossSpendUsd": 0,
      "codeLines": 0,
      "products": [
        "Chat",
        "Claude Code",
        "Cowork",
        "Office Agents"
      ],
      "models": [
        "claude-haiku-4-5-20251001",
        "claude-opus-4-8"
      ],
      "level": "Medium",
      "note": "spend report 사용 기록 확인, Code lines 0줄"
    }
  ],
  "insights": [
    "6월 1-25일 Claude Spend report 기준 활성 사용자는 14명이며 총 66,606건의 요청이 확인됩니다.",
    "6월 1-30일 Claude Code lines export 기준 코드 라인은 총 276,191줄이고, 13명이 1줄 이상 사용했습니다.",
    "코드 라인은 hchbae1001@riskzero.kr 104,786줄, wody@riskzero.kr 73,909줄 순으로 높습니다.",
    "Spend report와 Code lines export 기간이 달라 비용은 6월 1-25일, 코드 라인은 6월 전체 기준으로 해석합니다."
  ]
};
