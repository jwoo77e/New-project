export type ClaudeTeamUsageLevel = "High" | "Medium" | "Low";

export type ClaudeTeamUserUsage = {
  email: string;
  displayName: string;
  requests: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  claudeCodeRequests: number;
  claudeCodeTokens: number;
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
  memberAccounts: number;
  activeMemberAccounts: number;
  rawOnlyAccounts: number;
  approvedButNoUsage: number;
  note: string;
};

export type ClaudeTeamUsageData = {
  source: {
    name: string;
    period: string;
    generatedAt: string;
    membersFile: string;
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

const claudeTeamUsers: ClaudeTeamUserUsage[] = [
  {
    email: "wody@riskzero.kr",
    displayName: "정재요 차장",
    requests: 560,
    promptTokens: 134930953,
    completionTokens: 331132,
    totalTokens: 135262085,
    claudeCodeRequests: 560,
    claudeCodeTokens: 135262085,
    netSpendUsd: 0,
    grossSpendUsd: 0,
    codeLines: 13495,
    products: ["Claude Code"],
    models: ["claude-haiku-4-5-20251001", "claude-fable-5", "claude-opus-5"],
    level: "High",
    note: "8월 Code Lines 13,495줄로 최다",
  },
  {
    email: "woosung.jeon@riskzero.kr",
    displayName: "전우성 부장",
    requests: 1345,
    promptTokens: 468190034,
    completionTokens: 1244112,
    totalTokens: 469434146,
    claudeCodeRequests: 1345,
    claudeCodeTokens: 469434146,
    netSpendUsd: 0,
    grossSpendUsd: 0,
    codeLines: 11673,
    products: ["Claude Code"],
    models: ["claude-haiku-4-5-20251001", "claude-opus-5"],
    level: "High",
    note: "토큰 469.4M으로 최다 · Code Lines 11,673줄",
  },
  {
    email: "kys0392@riskzero.kr",
    displayName: "김영산 과장",
    requests: 905,
    promptTokens: 305656191,
    completionTokens: 985375,
    totalTokens: 306641566,
    claudeCodeRequests: 819,
    claudeCodeTokens: 302604509,
    netSpendUsd: 0,
    grossSpendUsd: 0.19,
    codeLines: 6098,
    products: ["Claude Code", "Cowork"],
    models: ["claude-haiku-4-5-20251001", "claude-sonnet-5"],
    level: "High",
    note: "Code Lines 6,098줄 · Cowork 사용",
  },
  {
    email: "hchbae1001@riskzero.kr",
    displayName: "배현철 사원",
    requests: 157,
    promptTokens: 10566525,
    completionTokens: 103611,
    totalTokens: 10670136,
    claudeCodeRequests: 100,
    claudeCodeTokens: 5093033,
    netSpendUsd: 0,
    grossSpendUsd: 0,
    codeLines: 216,
    products: ["Chat", "Claude Code", "Cowork"],
    models: ["claude-opus-5", "claude-fable-5", "claude-haiku-4-5-20251001", "claude-opus-4-8", "claude-sonnet-5"],
    level: "Medium",
    note: "8월 Export 대화 2건 · Code Lines 216줄",
  },
  {
    email: "hhlee0227@riskzero.kr",
    displayName: "이한호 대리",
    requests: 474,
    promptTokens: 57148091,
    completionTokens: 241054,
    totalTokens: 57389145,
    claudeCodeRequests: 474,
    claudeCodeTokens: 57389145,
    netSpendUsd: 0,
    grossSpendUsd: 0,
    codeLines: 934,
    products: ["Claude Code"],
    models: ["claude-haiku-4-5-20251001", "claude-sonnet-5"],
    level: "Medium",
    note: "Code Lines 934줄 활용",
  },
  {
    email: "jaewoo.kim@riskzero.kr",
    displayName: "김재우 부장",
    requests: 1307,
    promptTokens: 409318069,
    completionTokens: 2918787,
    totalTokens: 412236856,
    claudeCodeRequests: 397,
    claudeCodeTokens: 53173587,
    netSpendUsd: 0,
    grossSpendUsd: 0.02,
    codeLines: 5324,
    products: ["Claude Code", "Claude in Chrome", "Cowork"],
    models: ["claude-haiku-4-5-20251001", "claude-opus-5", "claude-fable-5", "claude-opus-4-8"],
    level: "High",
    note: "토큰 412.2M · Code Lines 5,324줄",
  },
  {
    email: "jisub1221@riskzero.kr",
    displayName: "심지섭 대리",
    requests: 0,
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    claudeCodeRequests: 0,
    claudeCodeTokens: 0,
    netSpendUsd: 0,
    grossSpendUsd: 0,
    codeLines: 0,
    products: [],
    models: [],
    level: "Low",
    note: "8월 Spend/Code Lines 원천 사용 미확인",
  },
  {
    email: "huizhen0227@riskzero.kr",
    displayName: "김혜진 과장",
    requests: 875,
    promptTokens: 377503118,
    completionTokens: 471586,
    totalTokens: 377974704,
    claudeCodeRequests: 875,
    claudeCodeTokens: 377974704,
    netSpendUsd: 0,
    grossSpendUsd: 0,
    codeLines: 3923,
    products: ["Claude Code"],
    models: ["claude-haiku-4-5-20251001", "claude-sonnet-5"],
    level: "High",
    note: "토큰 378.0M · Code Lines 3,923줄",
  },
  {
    email: "staycurious@riskzero.kr",
    displayName: "김하나 과장",
    requests: 393,
    promptTokens: 86751301,
    completionTokens: 248093,
    totalTokens: 86999394,
    claudeCodeRequests: 393,
    claudeCodeTokens: 86999394,
    netSpendUsd: 0,
    grossSpendUsd: 0.03,
    codeLines: 1315,
    products: ["Claude Code"],
    models: ["claude-haiku-4-5-20251001", "claude-opus-5"],
    level: "Medium",
    note: "Code Lines 1,315줄 활용",
  },
  {
    email: "mygu@riskzero.kr",
    displayName: "구문영 사원",
    requests: 119,
    promptTokens: 13037285,
    completionTokens: 106820,
    totalTokens: 13144105,
    claudeCodeRequests: 119,
    claudeCodeTokens: 13144105,
    netSpendUsd: 0,
    grossSpendUsd: 0,
    codeLines: 0,
    products: ["Claude Code"],
    models: ["claude-haiku-4-5-20251001", "claude-opus-5"],
    level: "Medium",
    note: "Spend report 요청 119건 · Code Lines 0줄",
  },
  {
    email: "mjkim1122@riskzero.kr",
    displayName: "김민정 차장",
    requests: 108,
    promptTokens: 21281268,
    completionTokens: 71526,
    totalTokens: 21352794,
    claudeCodeRequests: 108,
    claudeCodeTokens: 21352794,
    netSpendUsd: 0,
    grossSpendUsd: 0,
    codeLines: 308,
    products: ["Claude Code"],
    models: ["claude-haiku-4-5-20251001", "claude-sonnet-5"],
    level: "Medium",
    note: "Code Lines 308줄 활용",
  },
  {
    email: "crow326@riskzero.kr",
    displayName: "박정원 차장",
    requests: 134,
    promptTokens: 1522805,
    completionTokens: 11884,
    totalTokens: 1534689,
    claudeCodeRequests: 123,
    claudeCodeTokens: 744063,
    netSpendUsd: 0,
    grossSpendUsd: 0,
    codeLines: 0,
    products: ["Chat", "Claude Code"],
    models: ["claude-opus-5", "claude-haiku-4-5-20251001", "claude-sonnet-5"],
    level: "Medium",
    note: "8월 Export 대화 2건 · Spend 요청 134건",
  },
  {
    email: "jungyr98@riskzero.kr",
    displayName: "정유라 사원",
    requests: 12,
    promptTokens: 720499,
    completionTokens: 6434,
    totalTokens: 726933,
    claudeCodeRequests: 12,
    claudeCodeTokens: 726933,
    netSpendUsd: 0,
    grossSpendUsd: 0,
    codeLines: 0,
    products: ["Claude Code"],
    models: ["claude-haiku-4-5-20251001", "claude-sonnet-5"],
    level: "Low",
    note: "Spend report 요청 12건 · Code Lines 0줄",
  },
  {
    email: "rkgmf1230@riskzero.kr",
    displayName: "김가흘 대리",
    requests: 0,
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    claudeCodeRequests: 0,
    claudeCodeTokens: 0,
    netSpendUsd: 0,
    grossSpendUsd: 0,
    codeLines: 168,
    products: [],
    models: [],
    level: "Medium",
    note: "Code Lines 168줄 · Spend 기간 내 요청 미확인",
  },
  {
    email: "sjlim@riskzero.kr",
    displayName: "임성진 부장",
    requests: 0,
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    claudeCodeRequests: 0,
    claudeCodeTokens: 0,
    netSpendUsd: 0,
    grossSpendUsd: 0,
    codeLines: 1421,
    products: [],
    models: [],
    level: "Medium",
    note: "Code Lines 1,421줄 · Spend 기간 내 요청 미확인",
  },
  {
    email: "ykchj1011@riskzero.kr",
    displayName: "윤영관 과장",
    requests: 0,
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    claudeCodeRequests: 0,
    claudeCodeTokens: 0,
    netSpendUsd: 0,
    grossSpendUsd: 0,
    codeLines: 0,
    products: [],
    models: [],
    level: "Low",
    note: "8월 Spend/Code Lines 원천 사용 미확인",
  },
  {
    email: "mjlee0828@riskzero.kr",
    displayName: "이민재 부장",
    requests: 173,
    promptTokens: 10770493,
    completionTokens: 124708,
    totalTokens: 10895201,
    claudeCodeRequests: 100,
    claudeCodeTokens: 4250615,
    netSpendUsd: 0,
    grossSpendUsd: 0.02,
    codeLines: 5,
    products: ["Claude Code", "Cowork"],
    models: ["claude-haiku-4-5-20251001", "claude-sonnet-5"],
    level: "Medium",
    note: "8월 Export 대화 1건 · Spend 요청 173건",
  },
  {
    email: "jhpark@riskzero.kr",
    displayName: "박재현 상무",
    requests: 0,
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    claudeCodeRequests: 0,
    claudeCodeTokens: 0,
    netSpendUsd: 0,
    grossSpendUsd: 0,
    codeLines: 0,
    products: [],
    models: [],
    level: "Low",
    note: "8월 Export 대화 1건 · Team CSV 사용 미확인",
  },
  {
    email: "sieghaft@riskzero.kr",
    displayName: "김성진 부장",
    requests: 6,
    promptTokens: 3200973,
    completionTokens: 1559,
    totalTokens: 3202532,
    claudeCodeRequests: 6,
    claudeCodeTokens: 3202532,
    netSpendUsd: 0,
    grossSpendUsd: 0,
    codeLines: 0,
    products: ["Claude Code"],
    models: ["claude-opus-4-7"],
    level: "Low",
    note: "Spend report 요청 6건 · Code Lines 0줄",
  },
  {
    email: "dhlee@riskzero.kr",
    displayName: "이동훈 부장",
    requests: 0,
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    claudeCodeRequests: 0,
    claudeCodeTokens: 0,
    netSpendUsd: 0,
    grossSpendUsd: 0,
    codeLines: 0,
    products: [],
    models: [],
    level: "Low",
    note: "8월 Spend/Code Lines 원천 사용 미확인",
  },
];

const accountsUsing = (key: string, type: "products" | "models") =>
  claudeTeamUsers.filter((user) => user[type].includes(key)).map((user) => user.email);

export const initialClaudeTeamUsageData: ClaudeTeamUsageData = {
  source: {
    name: "Claude Team Plan 사용 현황",
    period: "Members 2026-07-20 · Spend 2026-08-01~03 · Lines 2026-08 누적",
    generatedAt: "2026-08-05",
    membersFile: "members-e59c75bc-469e-466f-bef9-c311748c1df8-2026-07-20.csv",
    spendFile: "spend-report-e59c75bc-469e-466f-bef9-c311748c1df8-2026-08-01-to-2026-08-03.csv",
    codeLinesFile: "claude_code_team_2026_08_01_to_2026_08_31.csv",
    note: "Claude 멤버 목록(7월 20일), Spend report(8월 1-3일), Claude Code lines 8월 누적 export를 email 기준으로 결합하고 결재 등록 Team 계정 20개와 대조",
    verification: {
      spendRecords: 43,
      codeLineAccounts: 15,
      matchedAccounts: 13,
      approvedAccounts: 20,
      memberAccounts: 19,
      activeMemberAccounts: 19,
      rawOnlyAccounts: 0,
      approvedButNoUsage: 4,
      note: "결재 등록 20개 중 8월 Team CSV에서 16개 계정의 사용 신호가 확인됩니다. 박재현 상무는 Export 대화 1건이 있으나 이번 Spend/Code Lines CSV에는 없고, 멤버 활성 19명은 7월 20일 명부 기준입니다.",
    },
  },
  licensedUsers: 20,
  activeUsers: 19,
  spendUsers: 14,
  codeUsers: 12,
  totalRequests: 6568,
  totalPromptTokens: 1900597605,
  totalCompletionTokens: 6866681,
  totalTokens: 1907464286,
  totalNetSpendUsd: 0,
  totalGrossSpendUsd: 0.26,
  totalCodeLines: 44880,
  productUsage: [
    { product: "Claude Code", requests: 5431, tokens: 1531351645, spendUsd: 0, userCount: 14, users: accountsUsing("Claude Code", "products") },
    { product: "Cowork", requests: 1116, tokens: 373796256, spendUsd: 0, userCount: 4, users: accountsUsing("Cowork", "products") },
    { product: "Chat", requests: 15, tokens: 2044725, spendUsd: 0, userCount: 2, users: accountsUsing("Chat", "products") },
    { product: "Claude in Chrome", requests: 6, tokens: 271660, spendUsd: 0, userCount: 1, users: accountsUsing("Claude in Chrome", "products") },
  ],
  modelUsage: [
    { model: "claude-sonnet-5", requests: 2284, tokens: 777785970, spendUsd: 0, userCount: 8, users: accountsUsing("claude-sonnet-5", "models") },
    { model: "claude-opus-5", requests: 2298, tokens: 637488993, spendUsd: 0, userCount: 7, users: accountsUsing("claude-opus-5", "models") },
    { model: "claude-opus-4-8", requests: 879, tokens: 345636611, spendUsd: 0, userCount: 2, users: accountsUsing("claude-opus-4-8", "models") },
    { model: "claude-fable-5", requests: 520, tokens: 142572837, spendUsd: 0, userCount: 3, users: accountsUsing("claude-fable-5", "models") },
    { model: "claude-opus-4-7", requests: 6, tokens: 3202532, spendUsd: 0, userCount: 1, users: accountsUsing("claude-opus-4-7", "models") },
    { model: "claude-haiku-4-5-20251001", requests: 581, tokens: 777343, spendUsd: 0, userCount: 13, users: accountsUsing("claude-haiku-4-5-20251001", "models") },
  ],
  users: claudeTeamUsers,
  insights: [
    "결재 등록 Claude Team 좌석은 20개이며 7월 20일 멤버 CSV 기준 19명이 Active로 확인되어 명부 기준 활성률은 95%입니다.",
    "8월 1-3일 Spend report에서 14개 계정의 요청 6,568건과 1.91B 토큰이 확인됩니다. 보고서상 순지출은 $0.00, 총지출은 $0.26입니다.",
    "8월 누적 Claude Code lines export 기준 코드 라인은 총 44,880줄이고, 15개 수록 계정 중 12명이 1줄 이상 사용했습니다.",
    "토큰은 Claude Code 1.53B(80.3%), Cowork 373.8M(19.6%) 순이며 전우성 부장이 469.4M으로 가장 많습니다.",
    "Code Lines는 정재요 차장 13,495줄, 전우성 부장 11,673줄 순으로 두 계정이 전체의 56.1%를 차지합니다.",
    "Spend와 Code Lines의 집계 종료일이 다르므로, 코드 라인은 있지만 Spend 분모가 없는 계정은 생산성 효율을 산정하지 않고 표본 부족으로 표시합니다.",
    "8월 4일까지 Claude Export에서 신규 대화 6건이 확인됐고, 박재현 상무·이민재 부장·박정원 차장·배현철 사원의 대화 활동이 포함됩니다.",
  ],
};
