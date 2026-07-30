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
    requests: 20053,
    promptTokens: 2839117049,
    completionTokens: 18028441,
    totalTokens: 2857145490,
    claudeCodeRequests: 19751,
    claudeCodeTokens: 2825713827,
    netSpendUsd: 30.03,
    grossSpendUsd: 31.57,
    codeLines: 89458,
    products: ["Chat", "Claude Code", "Cowork"],
    models: ["claude-fable-5", "claude-haiku-4-5-20251001", "claude-opus-4-6", "claude-opus-4-8", "claude-opus-5", "claude-sonnet-5"],
    level: "High",
    note: "Code Lines 89,458줄로 최다",
  },
  {
    email: "woosung.jeon@riskzero.kr",
    displayName: "전우성 부장",
    requests: 14465,
    promptTokens: 4665132832,
    completionTokens: 12565954,
    totalTokens: 4677698786,
    claudeCodeRequests: 14452,
    claudeCodeTokens: 4677297520,
    netSpendUsd: 10.21,
    grossSpendUsd: 10.23,
    codeLines: 59635,
    products: ["Chat", "Claude Code"],
    models: ["claude-haiku-4-5-20251001", "claude-opus-4-8", "claude-opus-5", "claude-sonnet-4-6", "claude-sonnet-5"],
    level: "High",
    note: "Code Lines 59,635줄로 2위",
  },
  {
    email: "kys0392@riskzero.kr",
    displayName: "김영산 과장",
    requests: 9124,
    promptTokens: 1926593952,
    completionTokens: 9370911,
    totalTokens: 1935964863,
    claudeCodeRequests: 7957,
    claudeCodeTokens: 1652573603,
    netSpendUsd: 0,
    grossSpendUsd: 0.18,
    codeLines: 39634,
    products: ["Claude Code", "Cowork"],
    models: ["claude-haiku-4-5-20251001", "claude-opus-4-8", "claude-sonnet-4-6", "claude-sonnet-5"],
    level: "High",
    note: "Code Lines 39,634줄 활용",
  },
  {
    email: "hchbae1001@riskzero.kr",
    displayName: "배현철 사원",
    requests: 7756,
    promptTokens: 1264867283,
    completionTokens: 5288693,
    totalTokens: 1270155976,
    claudeCodeRequests: 6720,
    claudeCodeTokens: 1147810816,
    netSpendUsd: 2.43,
    grossSpendUsd: 3.82,
    codeLines: 34926,
    products: ["Chat", "Claude Code", "Cowork"],
    models: ["claude-fable-5", "claude-haiku-4-5-20251001", "claude-opus-4-8", "claude-opus-5", "claude-sonnet-4-6", "claude-sonnet-5"],
    level: "High",
    note: "Code Lines 34,926줄 활용",
  },
  {
    email: "hhlee0227@riskzero.kr",
    displayName: "이한호 대리",
    requests: 9893,
    promptTokens: 1827092837,
    completionTokens: 6555537,
    totalTokens: 1833648374,
    claudeCodeRequests: 9893,
    claudeCodeTokens: 1833648374,
    netSpendUsd: 0,
    grossSpendUsd: 0.01,
    codeLines: 33248,
    products: ["Claude Code"],
    models: ["claude-haiku-4-5-20251001", "claude-opus-4-8", "claude-sonnet-5"],
    level: "High",
    note: "Code Lines 33,248줄 활용",
  },
  {
    email: "jaewoo.kim@riskzero.kr",
    displayName: "김재우 부장",
    requests: 12296,
    promptTokens: 3733958762,
    completionTokens: 13136463,
    totalTokens: 3747095225,
    claudeCodeRequests: 1929,
    claudeCodeTokens: 328759437,
    netSpendUsd: 652.15,
    grossSpendUsd: 652.59,
    codeLines: 30198,
    products: ["Chat", "Claude Code", "Claude in Chrome", "Cowork", "Office Agents"],
    models: ["claude-fable-5", "claude-haiku-4-5-20251001", "claude-opus-4-8", "claude-opus-5", "claude-sonnet-5"],
    level: "High",
    note: "순지출 $652.15로 최다 · Code Lines 30,198줄",
  },
  {
    email: "jisub1221@riskzero.kr",
    displayName: "심지섭 대리",
    requests: 3459,
    promptTokens: 257623411,
    completionTokens: 1471255,
    totalTokens: 259094666,
    claudeCodeRequests: 3452,
    claudeCodeTokens: 258691955,
    netSpendUsd: 0,
    grossSpendUsd: 0.03,
    codeLines: 19370,
    products: ["Claude Code", "Cowork"],
    models: ["claude-haiku-4-5-20251001", "claude-sonnet-4-6", "claude-sonnet-5"],
    level: "High",
    note: "Code Lines 19,370줄 활용",
  },
  {
    email: "huizhen0227@riskzero.kr",
    displayName: "김혜진 과장",
    requests: 5906,
    promptTokens: 1113507661,
    completionTokens: 2838339,
    totalTokens: 1116346000,
    claudeCodeRequests: 5906,
    claudeCodeTokens: 1116346000,
    netSpendUsd: 0,
    grossSpendUsd: 0.04,
    codeLines: 14463,
    products: ["Claude Code"],
    models: ["claude-haiku-4-5-20251001", "claude-sonnet-4-6", "claude-sonnet-5"],
    level: "High",
    note: "Code Lines 14,463줄 활용",
  },
  {
    email: "staycurious@riskzero.kr",
    displayName: "김하나 과장",
    requests: 9230,
    promptTokens: 2464821546,
    completionTokens: 5873178,
    totalTokens: 2470694724,
    claudeCodeRequests: 9212,
    claudeCodeTokens: 2469367968,
    netSpendUsd: 20.08,
    grossSpendUsd: 20.08,
    codeLines: 12794,
    products: ["Chat", "Claude Code", "Cowork"],
    models: ["claude-haiku-4-5-20251001", "claude-opus-4-8", "claude-opus-5", "claude-sonnet-4-6", "claude-sonnet-5"],
    level: "High",
    note: "Code Lines 12,794줄과 Cowork 사용",
  },
  {
    email: "mygu@riskzero.kr",
    displayName: "구문영 사원",
    requests: 3138,
    promptTokens: 477684007,
    completionTokens: 3151199,
    totalTokens: 480835206,
    claudeCodeRequests: 2765,
    claudeCodeTokens: 403670920,
    netSpendUsd: 99.94,
    grossSpendUsd: 99.97,
    codeLines: 9126,
    products: ["Chat", "Claude Code", "Cowork"],
    models: ["claude-fable-5", "claude-haiku-4-5-20251001", "claude-opus-4-6", "claude-opus-4-8", "claude-opus-5", "claude-sonnet-4-6", "claude-sonnet-5"],
    level: "High",
    note: "순지출 $99.94 · Code Lines 9,126줄",
  },
  {
    email: "mjkim1122@riskzero.kr",
    displayName: "김민정 차장",
    requests: 2128,
    promptTokens: 244456830,
    completionTokens: 1177135,
    totalTokens: 245633965,
    claudeCodeRequests: 2128,
    claudeCodeTokens: 245633965,
    netSpendUsd: 0,
    grossSpendUsd: 0.04,
    codeLines: 4954,
    products: ["Claude Code"],
    models: ["claude-haiku-4-5-20251001", "claude-sonnet-4-6", "claude-sonnet-5"],
    level: "High",
    note: "Code Lines 4,954줄 활용",
  },
  {
    email: "crow326@riskzero.kr",
    displayName: "박정원 차장",
    requests: 2258,
    promptTokens: 515416969,
    completionTokens: 1296751,
    totalTokens: 516713720,
    claudeCodeRequests: 2141,
    claudeCodeTokens: 509537050,
    netSpendUsd: 0,
    grossSpendUsd: 0.2,
    codeLines: 4912,
    products: ["Chat", "Claude Code", "Cowork"],
    models: ["claude-fable-5", "claude-haiku-4-5-20251001", "claude-opus-4-7", "claude-opus-4-8", "claude-opus-5", "claude-sonnet-5"],
    level: "High",
    note: "Code Lines 4,912줄 활용",
  },
  {
    email: "jungyr98@riskzero.kr",
    displayName: "정유라 사원",
    requests: 4092,
    promptTokens: 404089581,
    completionTokens: 2518063,
    totalTokens: 406607644,
    claudeCodeRequests: 4092,
    claudeCodeTokens: 406607644,
    netSpendUsd: 0,
    grossSpendUsd: 0,
    codeLines: 3495,
    products: ["Claude Code"],
    models: ["claude-haiku-4-5-20251001", "claude-sonnet-4-6", "claude-sonnet-5"],
    level: "High",
    note: "Code Lines 3,495줄 활용",
  },
  {
    email: "rkgmf1230@riskzero.kr",
    displayName: "김가흘 대리",
    requests: 2213,
    promptTokens: 155979104,
    completionTokens: 978240,
    totalTokens: 156957344,
    claudeCodeRequests: 2158,
    claudeCodeTokens: 153587600,
    netSpendUsd: 0,
    grossSpendUsd: 0.01,
    codeLines: 2161,
    products: ["Claude Code", "Cowork"],
    models: ["claude-haiku-4-5-20251001", "claude-opus-4-8", "claude-sonnet-4-6", "claude-sonnet-5"],
    level: "High",
    note: "Code Lines 2,161줄 활용",
  },
  {
    email: "sjlim@riskzero.kr",
    displayName: "임성진 부장",
    requests: 336,
    promptTokens: 33382975,
    completionTokens: 370717,
    totalTokens: 33753692,
    claudeCodeRequests: 95,
    claudeCodeTokens: 2727522,
    netSpendUsd: 0,
    grossSpendUsd: 0.01,
    codeLines: 1485,
    products: ["Chat", "Claude Code", "Cowork", "Office Agents"],
    models: ["claude-fable-5", "claude-haiku-4-5-20251001", "claude-opus-4-8", "claude-opus-5", "claude-sonnet-4-6", "claude-sonnet-5"],
    level: "Medium",
    note: "Code Lines 1,485줄 활용",
  },
  {
    email: "ykchj1011@riskzero.kr",
    displayName: "윤영관 과장",
    requests: 1495,
    promptTokens: 91304918,
    completionTokens: 392989,
    totalTokens: 91697907,
    claudeCodeRequests: 1474,
    claudeCodeTokens: 90812482,
    netSpendUsd: 0,
    grossSpendUsd: 0.03,
    codeLines: 864,
    products: ["Chat", "Claude Code", "Cowork"],
    models: ["claude-haiku-4-5-20251001", "claude-sonnet-5"],
    level: "Medium",
    note: "Code Lines 864줄 활용",
  },
  {
    email: "mjlee0828@riskzero.kr",
    displayName: "이민재 부장",
    requests: 75,
    promptTokens: 5338171,
    completionTokens: 42362,
    totalTokens: 5380533,
    claudeCodeRequests: 0,
    claudeCodeTokens: 0,
    netSpendUsd: 0,
    grossSpendUsd: 0,
    codeLines: 0,
    products: ["Chat"],
    models: ["claude-sonnet-5"],
    level: "Low",
    note: "Spend report 요청 75건 · Export 대화 4건 확인",
  },
  {
    email: "jhpark@riskzero.kr",
    displayName: "박재현 상무",
    requests: 41,
    promptTokens: 3349005,
    completionTokens: 67444,
    totalTokens: 3416449,
    claudeCodeRequests: 0,
    claudeCodeTokens: 0,
    netSpendUsd: 0,
    grossSpendUsd: 0.03,
    codeLines: 0,
    products: ["Chat"],
    models: ["claude-haiku-4-5-20251001", "claude-sonnet-5"],
    level: "Low",
    note: "Spend report 요청 41건 · Export 대화 3건 확인",
  },
  {
    email: "sieghaft@riskzero.kr",
    displayName: "김성진 부장",
    requests: 10,
    promptTokens: 681518,
    completionTokens: 12763,
    totalTokens: 694281,
    claudeCodeRequests: 0,
    claudeCodeTokens: 0,
    netSpendUsd: 0,
    grossSpendUsd: 0.01,
    codeLines: 0,
    products: ["Chat"],
    models: ["claude-sonnet-4-6"],
    level: "Low",
    note: "Spend report 요청 10건 · Export 대화 3건 확인",
  },
];

const accountsUsing = (key: string, type: "products" | "models") =>
  claudeTeamUsers.filter((user) => user[type].includes(key)).map((user) => user.email);

export const initialClaudeTeamUsageData: ClaudeTeamUsageData = {
  source: {
    name: "Claude Team Plan 사용 현황",
    period: "Members 2026-07-20 · Spend 2026-07-01~29 · Lines 2026-07-01~31",
    generatedAt: "2026-07-30",
    membersFile: "members-e59c75bc-469e-466f-bef9-c311748c1df8-2026-07-20.csv",
    spendFile: "spend-report-e59c75bc-469e-466f-bef9-c311748c1df8-2026-07-01-to-2026-07-29.csv",
    codeLinesFile: "claude_code_team_2026_07_01_to_2026_07_31.csv",
    note: "Claude 멤버 목록(7월 20일), Spend report(7월 1-29일), Claude Code lines export(7월 1-31일)를 email 기준으로 결합하고 결재 등록 Team 계정 19개와 대조",
    verification: {
      spendRecords: 124,
      codeLineAccounts: 16,
      matchedAccounts: 16,
      approvedAccounts: 19,
      memberAccounts: 19,
      activeMemberAccounts: 19,
      rawOnlyAccounts: 0,
      approvedButNoUsage: 0,
      note: "멤버 CSV 19개 계정은 모두 Active이며 Spend report에서도 19개 계정의 요청이 확인됩니다. Code Lines는 17개 계정이 포함됐고 이 중 16개 계정이 1줄 이상 사용했습니다.",
    },
  },
  licensedUsers: 19,
  activeUsers: 19,
  spendUsers: 19,
  codeUsers: 16,
  totalRequests: 107968,
  totalPromptTokens: 22024398411,
  totalCompletionTokens: 85136434,
  totalTokens: 22109534845,
  totalNetSpendUsd: 814.84,
  totalGrossSpendUsd: 818.85,
  totalCodeLines: 360723,
  productUsage: [
    { product: "Cowork", requests: 12578, tokens: 3805595820, spendUsd: 638.82, userCount: 11, users: accountsUsing("Cowork", "products") },
    { product: "Claude Code", requests: 94125, tokens: 18122786683, spendUsd: 165.62, userCount: 16, users: accountsUsing("Claude Code", "products") },
    { product: "Office Agents", requests: 66, tokens: 5999821, spendUsd: 9.7, userCount: 2, users: accountsUsing("Office Agents", "products") },
    { product: "Chat", requests: 1139, tokens: 173227388, spendUsd: 0.66, userCount: 12, users: accountsUsing("Chat", "products") },
    { product: "Claude in Chrome", requests: 60, tokens: 1925133, spendUsd: 0.04, userCount: 1, users: accountsUsing("Claude in Chrome", "products") },
  ],
  modelUsage: [
    { model: "claude-fable-5", requests: 6034, tokens: 1418386346, spendUsd: 589.67, userCount: 6, users: accountsUsing("claude-fable-5", "models") },
    { model: "claude-opus-4-8", requests: 26802, tokens: 5618452259, spendUsd: 188.67, userCount: 11, users: accountsUsing("claude-opus-4-8", "models") },
    { model: "claude-sonnet-5", requests: 56482, tokens: 13071514132, spendUsd: 27.98, userCount: 18, users: accountsUsing("claude-sonnet-5", "models") },
    { model: "claude-opus-5", requests: 7785, tokens: 1529498654, spendUsd: 8.22, userCount: 8, users: accountsUsing("claude-opus-5", "models") },
    { model: "claude-haiku-4-5-20251001", requests: 6447, tokens: 80920175, spendUsd: 0.3, userCount: 17, users: accountsUsing("claude-haiku-4-5-20251001", "models") },
    { model: "claude-sonnet-4-6", requests: 4369, tokens: 388975119, spendUsd: 0, userCount: 12, users: accountsUsing("claude-sonnet-4-6", "models") },
    { model: "claude-opus-4-6", requests: 25, tokens: 653597, spendUsd: 0, userCount: 2, users: accountsUsing("claude-opus-4-6", "models") },
    { model: "claude-opus-4-7", requests: 24, tokens: 1134563, spendUsd: 0, userCount: 1, users: accountsUsing("claude-opus-4-7", "models") },
  ],
  users: claudeTeamUsers,
  insights: [
    "7월 20일 Claude 멤버 CSV 기준 19명 전원이 Active로 확인되어 활성률은 100%입니다.",
    "7월 1-29일 Spend report에서 19개 계정의 요청 107,968건과 $814.84 순지출이 확인됩니다.",
    "7월 1-31일 Claude Code lines export 기준 코드 라인은 총 360,723줄이고, 16명이 1줄 이상 사용했습니다.",
    "Spend는 Cowork $638.82(78.4%)에 집중되고, Code Lines는 정재요 차장 89,458줄, 전우성 부장 59,635줄 순입니다.",
    "Spend report와 Code lines export 기간이 달라 비용·토큰은 7월 1-29일, 코드 라인은 7월 전체 기준으로 해석합니다.",
    "기존 미사용으로 보였던 이민재 부장 계정은 Spend 요청 75건과 Claude Export 대화 4건이 확인되어 사용 계정으로 전환됐습니다.",
  ],
};
