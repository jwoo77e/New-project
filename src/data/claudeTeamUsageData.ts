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

const claudeTeamUsers: ClaudeTeamUserUsage[] = [
  {
    email: "wody@riskzero.kr",
    displayName: "정재요 차장",
    requests: 8829,
    promptTokens: 1140371724,
    completionTokens: 7951762,
    totalTokens: 1148323486,
    netSpendUsd: 10.72,
    grossSpendUsd: 11.99,
    codeLines: 32503,
    products: ["Chat", "Claude Code", "Cowork"],
    models: ["claude-fable-5", "claude-haiku-4-5-20251001", "claude-opus-4-6", "claude-opus-4-8", "claude-sonnet-5"],
    level: "High",
    note: "Code Lines 32,503줄로 최다",
  },
  {
    email: "hhlee0227@riskzero.kr",
    displayName: "이한호 대리",
    requests: 7554,
    promptTokens: 1391471645,
    completionTokens: 5178228,
    totalTokens: 1396649873,
    netSpendUsd: 0,
    grossSpendUsd: 0.01,
    codeLines: 29268,
    products: ["Claude Code"],
    models: ["claude-haiku-4-5-20251001", "claude-opus-4-8", "claude-sonnet-5"],
    level: "High",
    note: "Code Lines 29,268줄로 2위",
  },
  {
    email: "kys0392@riskzero.kr",
    displayName: "김영산 과장",
    requests: 5704,
    promptTokens: 997678667,
    completionTokens: 5969427,
    totalTokens: 1003648094,
    netSpendUsd: 0,
    grossSpendUsd: 0.07,
    codeLines: 26980,
    products: ["Claude Code", "Cowork"],
    models: ["claude-haiku-4-5-20251001", "claude-opus-4-8", "claude-sonnet-4-6", "claude-sonnet-5"],
    level: "High",
    note: "Spend는 낮지만 Code Lines 26,980줄 활용",
  },
  {
    email: "hchbae1001@riskzero.kr",
    displayName: "배현철 사원",
    requests: 5091,
    promptTokens: 920922550,
    completionTokens: 2919615,
    totalTokens: 923842165,
    netSpendUsd: 2.43,
    grossSpendUsd: 3.58,
    codeLines: 25995,
    products: ["Chat", "Claude Code", "Cowork"],
    models: ["claude-fable-5", "claude-haiku-4-5-20251001", "claude-opus-4-8", "claude-sonnet-4-6", "claude-sonnet-5"],
    level: "High",
    note: "Code Lines 25,995줄 활용",
  },
  {
    email: "woosung.jeon@riskzero.kr",
    displayName: "전우성 부장",
    requests: 5025,
    promptTokens: 1403603144,
    completionTokens: 4398360,
    totalTokens: 1408001504,
    netSpendUsd: 3.99,
    grossSpendUsd: 4.01,
    codeLines: 21985,
    products: ["Chat", "Claude Code"],
    models: ["claude-haiku-4-5-20251001", "claude-opus-4-8", "claude-sonnet-4-6", "claude-sonnet-5"],
    level: "High",
    note: "Chat과 Claude Code를 병행해 21,985줄 활용",
  },
  {
    email: "jaewoo.kim@riskzero.kr",
    displayName: "김재우 부장",
    requests: 7859,
    promptTokens: 2276610229,
    completionTokens: 8165975,
    totalTokens: 2284776204,
    netSpendUsd: 652.15,
    grossSpendUsd: 652.41,
    codeLines: 18156,
    products: ["Chat", "Claude Code", "Claude in Chrome", "Cowork", "Office Agents"],
    models: ["claude-fable-5", "claude-haiku-4-5-20251001", "claude-opus-4-8"],
    level: "High",
    note: "Cowork·Office Agents 중심 Spend $652.15",
  },
  {
    email: "jisub1221@riskzero.kr",
    displayName: "심지섭 대리",
    requests: 2725,
    promptTokens: 200387274,
    completionTokens: 1095163,
    totalTokens: 201482437,
    netSpendUsd: 0,
    grossSpendUsd: 0.03,
    codeLines: 14374,
    products: ["Claude Code", "Cowork"],
    models: ["claude-haiku-4-5-20251001", "claude-sonnet-4-6", "claude-sonnet-5"],
    level: "High",
    note: "Code Lines 14,374줄 활용",
  },
  {
    email: "huizhen0227@riskzero.kr",
    displayName: "김혜진 과장",
    requests: 4896,
    promptTokens: 935259577,
    completionTokens: 2321233,
    totalTokens: 937580810,
    netSpendUsd: 0,
    grossSpendUsd: 0.04,
    codeLines: 12386,
    products: ["Claude Code"],
    models: ["claude-haiku-4-5-20251001", "claude-sonnet-4-6", "claude-sonnet-5"],
    level: "High",
    note: "Spend는 낮지만 Code Lines 12,386줄 활용",
  },
  {
    email: "staycurious@riskzero.kr",
    displayName: "김하나 과장",
    requests: 6224,
    promptTokens: 1739231377,
    completionTokens: 3913037,
    totalTokens: 1743144414,
    netSpendUsd: 20.08,
    grossSpendUsd: 20.08,
    codeLines: 7927,
    products: ["Chat", "Claude Code", "Cowork"],
    models: ["claude-haiku-4-5-20251001", "claude-sonnet-4-6", "claude-sonnet-5"],
    level: "High",
    note: "Code Lines 7,927줄과 Cowork 사용 확인",
  },
  {
    email: "crow326@riskzero.kr",
    displayName: "박정원 차장",
    requests: 1792,
    promptTokens: 498798011,
    completionTokens: 1120935,
    totalTokens: 499918946,
    netSpendUsd: 0,
    grossSpendUsd: 0.2,
    codeLines: 4868,
    products: ["Chat", "Claude Code", "Cowork"],
    models: ["claude-fable-5", "claude-haiku-4-5-20251001", "claude-opus-4-7", "claude-opus-4-8", "claude-sonnet-5"],
    level: "High",
    note: "Code Lines 4,868줄 활용",
  },
  {
    email: "mjkim1122@riskzero.kr",
    displayName: "김민정 차장",
    requests: 1468,
    promptTokens: 170990592,
    completionTokens: 787952,
    totalTokens: 171778544,
    netSpendUsd: 0,
    grossSpendUsd: 0.04,
    codeLines: 4440,
    products: ["Claude Code"],
    models: ["claude-haiku-4-5-20251001", "claude-sonnet-4-6", "claude-sonnet-5"],
    level: "High",
    note: "Code Lines 4,440줄 활용",
  },
  {
    email: "mygu@riskzero.kr",
    displayName: "구문영 사원",
    requests: 2034,
    promptTokens: 304120664,
    completionTokens: 2133909,
    totalTokens: 306254573,
    netSpendUsd: 50.09,
    grossSpendUsd: 50.11,
    codeLines: 2210,
    products: ["Chat", "Claude Code", "Cowork"],
    models: ["claude-fable-5", "claude-haiku-4-5-20251001", "claude-opus-4-8", "claude-sonnet-4-6"],
    level: "High",
    note: "Cowork Spend $50.09와 Code Lines를 병행",
  },
  {
    email: "jungyr98@riskzero.kr",
    displayName: "정유라 사원",
    requests: 1636,
    promptTokens: 105309836,
    completionTokens: 897616,
    totalTokens: 106207452,
    netSpendUsd: 0,
    grossSpendUsd: 0,
    codeLines: 1229,
    products: ["Claude Code"],
    models: ["claude-haiku-4-5-20251001", "claude-sonnet-4-6", "claude-sonnet-5"],
    level: "Medium",
    note: "Code Lines 1,229줄 활용",
  },
  {
    email: "rkgmf1230@riskzero.kr",
    displayName: "김가흘 대리",
    requests: 1508,
    promptTokens: 97440483,
    completionTokens: 706517,
    totalTokens: 98147000,
    netSpendUsd: 0,
    grossSpendUsd: 0.01,
    codeLines: 1040,
    products: ["Claude Code", "Cowork"],
    models: ["claude-haiku-4-5-20251001", "claude-opus-4-8", "claude-sonnet-4-6", "claude-sonnet-5"],
    level: "Medium",
    note: "Code Lines 1,040줄 활용",
  },
  {
    email: "ykchj1011@riskzero.kr",
    displayName: "윤영관 과장",
    requests: 936,
    promptTokens: 76018141,
    completionTokens: 281214,
    totalTokens: 76299355,
    netSpendUsd: 0,
    grossSpendUsd: 0,
    codeLines: 832,
    products: ["Chat", "Claude Code", "Cowork"],
    models: ["claude-haiku-4-5-20251001", "claude-sonnet-5"],
    level: "Medium",
    note: "Code Lines 832줄 활용",
  },
  {
    email: "sjlim@riskzero.kr",
    displayName: "임성진 부장",
    requests: 128,
    promptTokens: 8997600,
    completionTokens: 107441,
    totalTokens: 9105041,
    netSpendUsd: 0,
    grossSpendUsd: 0.01,
    codeLines: 551,
    products: ["Chat", "Claude Code", "Cowork"],
    models: ["claude-fable-5", "claude-haiku-4-5-20251001", "claude-opus-4-8", "claude-sonnet-4-6", "claude-sonnet-5"],
    level: "Medium",
    note: "Code Lines 551줄 활용",
  },
  {
    email: "jhpark@riskzero.kr",
    displayName: "박재현 상무",
    requests: 7,
    promptTokens: 361415,
    completionTokens: 8265,
    totalTokens: 369680,
    netSpendUsd: 0,
    grossSpendUsd: 0.03,
    codeLines: 0,
    products: ["Chat"],
    models: ["claude-haiku-4-5-20251001", "claude-sonnet-5"],
    level: "Low",
    note: "Spend report 요청 7건, Code Lines 0줄",
  },
  {
    email: "sieghaft@riskzero.kr",
    displayName: "김성진 부장",
    requests: 10,
    promptTokens: 681518,
    completionTokens: 12763,
    totalTokens: 694281,
    netSpendUsd: 0,
    grossSpendUsd: 0.01,
    codeLines: 0,
    products: ["Chat"],
    models: ["claude-sonnet-4-6"],
    level: "Low",
    note: "Spend report 요청 10건, Code Lines 0줄",
  },
];

const accountsUsing = (key: string, type: "products" | "models") =>
  claudeTeamUsers.filter((user) => user[type].includes(key)).map((user) => user.email);

export const initialClaudeTeamUsageData: ClaudeTeamUsageData = {
  source: {
    name: "Claude Team Plan 사용 현황",
    period: "Spend 2026-07-01~19 · Lines 2026-07-01~31",
    generatedAt: "2026-07-20",
    spendFile: "spend-report-e59c75bc-469e-466f-bef9-c311748c1df8-2026-07-01-to-2026-07-19.csv",
    codeLinesFile: "claude_code_team_2026_07_01_to_2026_07_31.csv",
    note: "Claude Spend report(7월 1-19일)와 Claude Code lines export(7월 1-31일)를 user email 기준으로 결합하고, AI 도구 결재 현황의 Team 계정 19개와 대조",
    verification: {
      spendRecords: 102,
      codeLineAccounts: 16,
      matchedAccounts: 16,
      approvedAccounts: 19,
      rawOnlyAccounts: 0,
      approvedButInactive: 1,
      note: "Spend 18개 계정과 Code Lines 16개 계정 중 16개가 교차 확인되었습니다. 원천 확인 계정은 모두 결재 등록되었고, 7월 미활성 결재 계정은 mjlee0828@riskzero.kr 1개입니다.",
    },
  },
  licensedUsers: 19,
  activeUsers: 18,
  spendUsers: 18,
  codeUsers: 16,
  totalRequests: 63426,
  totalPromptTokens: 12268254447,
  totalCompletionTokens: 47969412,
  totalTokens: 12316223859,
  totalNetSpendUsd: 739.46,
  totalGrossSpendUsd: 742.63,
  totalCodeLines: 204744,
  productUsage: [
    { product: "Cowork", requests: 8088, tokens: 2360378865, spendUsd: 638.82, userCount: 11, users: accountsUsing("Cowork", "products") },
    { product: "Claude Code", requests: 54545, tokens: 9824984070, spendUsd: 90.24, userCount: 16, users: accountsUsing("Claude Code", "products") },
    { product: "Office Agents", requests: 57, tokens: 5652156, spendUsd: 9.7, userCount: 1, users: accountsUsing("Office Agents", "products") },
    { product: "Chat", requests: 711, tokens: 124516278, spendUsd: 0.66, userCount: 11, users: accountsUsing("Chat", "products") },
    { product: "Claude in Chrome", requests: 25, tokens: 692490, spendUsd: 0.04, userCount: 1, users: accountsUsing("Claude in Chrome", "products") },
  ],
  modelUsage: [
    { model: "claude-fable-5", requests: 4346, tokens: 1110441053, spendUsd: 531.04, userCount: 6, users: accountsUsing("claude-fable-5", "models") },
    { model: "claude-opus-4-8", requests: 16937, tokens: 3475653407, spendUsd: 183.93, userCount: 10, users: accountsUsing("claude-opus-4-8", "models") },
    { model: "claude-sonnet-5", requests: 34204, tokens: 7323446411, spendUsd: 24.19, userCount: 15, users: accountsUsing("claude-sonnet-5", "models") },
    { model: "claude-haiku-4-5-20251001", requests: 4160, tokens: 73614374, spendUsd: 0.3, userCount: 17, users: accountsUsing("claude-haiku-4-5-20251001", "models") },
    { model: "claude-sonnet-4-6", requests: 3733, tokens: 331408084, spendUsd: 0, userCount: 12, users: accountsUsing("claude-sonnet-4-6", "models") },
    { model: "claude-opus-4-6", requests: 22, tokens: 525967, spendUsd: 0, userCount: 1, users: accountsUsing("claude-opus-4-6", "models") },
    { model: "claude-opus-4-7", requests: 24, tokens: 1134563, spendUsd: 0, userCount: 1, users: accountsUsing("claude-opus-4-7", "models") },
  ],
  users: claudeTeamUsers,
  insights: [
    "7월 1-19일 Claude Spend report 기준 활성 사용자는 18명이며 총 63,426건의 요청과 $739.46 순지출이 확인됩니다.",
    "7월 1-31일 Claude Code lines export 기준 코드 라인은 총 204,744줄이고, 16명이 1줄 이상 사용했습니다.",
    "Spend는 Cowork $638.82(86.4%)에 집중되고, Code Lines는 wody@riskzero.kr 32,503줄, hhlee0227@riskzero.kr 29,268줄 순으로 높습니다.",
    "Spend report와 Code lines export 기간이 달라 비용·토큰은 7월 1-19일, 코드 라인은 7월 전체 기준으로 해석합니다.",
    "결재 등록 Team 계정 19개와 원천 계정을 대조해 원천 확인 계정 전체의 결재 등록과 7월 미활성 결재 계정 1개를 확인했습니다.",
  ],
};
