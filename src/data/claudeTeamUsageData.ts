import snapshotJson from "./individualUtilizationSnapshot.json";

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

type UsageBreakdown = Record<string, { requests: number; tokens: number; netSpendUsd: number }>;

type RawUser = {
  email: string;
  displayName: string;
  requests: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  netSpendUsd: number;
  grossSpendUsd: number;
  products: string[];
  models: string[];
  productUsage: UsageBreakdown;
  modelUsage: UsageBreakdown;
  monthlyCodeLines: Record<string, number>;
};

type RawSnapshot = {
  source: {
    generatedAt: string;
    spend: { fileName: string; period: string; rowCount: number };
    codeLines: Array<{ month: string; fileName: string; rowCount: number; totalLines: number }>;
  };
  totals: {
    requests: number;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    netSpendUsd: number;
    grossSpendUsd: number;
  };
  users: RawUser[];
};

const snapshot = snapshotJson as unknown as RawSnapshot;
const currentMonth = "2026-08";
const currentCodeSource = snapshot.source.codeLines.find((source) => source.month === currentMonth);

function usageLevel(user: RawUser, codeLines: number): ClaudeTeamUsageLevel {
  if (user.totalTokens >= 100_000_000 || codeLines >= 5_000) return "High";
  if (user.totalTokens >= 10_000_000 || codeLines > 0) return "Medium";
  return "Low";
}

function usageNote(user: RawUser, codeLines: number) {
  const tokenLabel = user.totalTokens >= 1_000_000_000
    ? `${(user.totalTokens / 1_000_000_000).toFixed(1)}B`
    : `${(user.totalTokens / 1_000_000).toFixed(1)}M`;
  if (codeLines > 0) return `토큰 ${tokenLabel} · Code Lines ${codeLines.toLocaleString("ko-KR")}줄`;
  return `토큰 ${tokenLabel} · Code Lines 사용 없음`;
}

const measuredUsers: ClaudeTeamUserUsage[] = snapshot.users.map((user) => {
  const codeLines = user.monthlyCodeLines[currentMonth] ?? 0;
  const claudeCode = user.productUsage["Claude Code"];
  return {
    email: user.email,
    displayName: user.displayName,
    requests: user.requests,
    promptTokens: user.promptTokens,
    completionTokens: user.completionTokens,
    totalTokens: user.totalTokens,
    claudeCodeRequests: claudeCode?.requests ?? 0,
    claudeCodeTokens: claudeCode?.tokens ?? 0,
    netSpendUsd: user.netSpendUsd,
    grossSpendUsd: user.grossSpendUsd,
    codeLines,
    products: user.products,
    models: user.models,
    level: usageLevel(user, codeLines),
    note: usageNote(user, codeLines),
  };
});

const unmeasuredUsers: ClaudeTeamUserUsage[] = [
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
    note: "Team Plan 활성 · 이번 Spend/Code Lines 사용 신호 없음",
  },
];

const claudeTeamUsers = [...measuredUsers, ...unmeasuredUsers];

function aggregateBreakdown(type: "productUsage" | "modelUsage") {
  const aggregate = new Map<string, { requests: number; tokens: number; spendUsd: number; users: string[] }>();
  snapshot.users.forEach((user) => {
    Object.entries(user[type]).forEach(([name, usage]) => {
      const current = aggregate.get(name) ?? { requests: 0, tokens: 0, spendUsd: 0, users: [] };
      current.requests += usage.requests;
      current.tokens += usage.tokens;
      current.spendUsd += usage.netSpendUsd;
      current.users.push(user.email);
      aggregate.set(name, current);
    });
  });
  return Array.from(aggregate.entries())
    .map(([name, usage]) => ({
      name,
      ...usage,
      spendUsd: Number(usage.spendUsd.toFixed(6)),
      userCount: usage.users.length,
    }))
    .sort((a, b) => b.tokens - a.tokens);
}

const productUsage = aggregateBreakdown("productUsage").map(({ name, ...usage }) => ({
  product: name,
  ...usage,
}));
const modelUsage = aggregateBreakdown("modelUsage").map(({ name, ...usage }) => ({
  model: name,
  ...usage,
}));
const topTokenUser = [...measuredUsers].sort((a, b) => b.totalTokens - a.totalTokens)[0];
const topCodeUser = [...measuredUsers].sort((a, b) => b.codeLines - a.codeLines)[0];
const licensedUsers = claudeTeamUsers.length;
const spendUsers = measuredUsers.filter((user) => user.requests > 0).length;
const codeUsers = measuredUsers.filter((user) => user.codeLines > 0).length;

export const initialClaudeTeamUsageData: ClaudeTeamUsageData = {
  source: {
    name: "Claude Team Plan 사용 현황",
    period: "1주차 2026-08-01~05 · 2주차 2026-08-06~12",
    generatedAt: "2026-08-13",
    membersFile: "members-e59c75bc-469e-466f-bef9-c311748c1df8-2026-07-20.csv",
    spendFile: snapshot.source.spend.fileName,
    codeLinesFile: currentCodeSource?.fileName ?? "2026-08-13-claude_code.csv",
    note: "8월 Spend는 1주차와 2주차 기간값을 합산하고, Claude Code Lines는 최신 월 누적 스냅샷을 사용해 Team Plan 등록 22개 계정과 대조했습니다.",
    verification: {
      spendRecords: snapshot.source.spend.rowCount,
      codeLineAccounts: currentCodeSource?.rowCount ?? 0,
      matchedAccounts: measuredUsers.filter((user) => user.requests > 0 && user.codeLines > 0).length,
      approvedAccounts: licensedUsers,
      memberAccounts: licensedUsers,
      activeMemberAccounts: licensedUsers,
      rawOnlyAccounts: 0,
      approvedButNoUsage: unmeasuredUsers.length,
      note: `Team Plan 등록 ${licensedUsers}개 계정은 활성 상태이며, 8월 1~12일 원천에서 ${spendUsers}개 계정의 Spend와 ${codeUsers}개 계정의 Code Lines가 확인됩니다.`,
    },
  },
  licensedUsers,
  activeUsers: licensedUsers,
  spendUsers,
  codeUsers,
  totalRequests: snapshot.totals.requests,
  totalPromptTokens: snapshot.totals.promptTokens,
  totalCompletionTokens: snapshot.totals.completionTokens,
  totalTokens: snapshot.totals.totalTokens,
  totalNetSpendUsd: snapshot.totals.netSpendUsd,
  totalGrossSpendUsd: snapshot.totals.grossSpendUsd,
  totalCodeLines: currentCodeSource?.totalLines ?? 0,
  productUsage,
  modelUsage,
  users: claudeTeamUsers,
  insights: [
    `Team Plan ${licensedUsers}개 계정은 활성 상태이며, 8월 1~12일 원천에서 ${spendUsers}개 계정의 사용 신호가 확인됩니다.`,
    `8월 1~12일 누적 요청은 ${snapshot.totals.requests.toLocaleString("ko-KR")}건, 토큰은 ${(snapshot.totals.totalTokens / 1_000_000_000).toFixed(2)}B입니다.`,
    `8월 누적 Claude Code Lines는 ${currentCodeSource?.totalLines.toLocaleString("ko-KR") ?? "0"}줄이며 ${codeUsers}개 계정에서 확인됩니다.`,
    `토큰 사용량은 ${topTokenUser.displayName} ${(topTokenUser.totalTokens / 1_000_000_000).toFixed(2)}B, Code Lines는 ${topCodeUser.displayName} ${topCodeUser.codeLines.toLocaleString("ko-KR")}줄이 가장 많습니다.`,
    "월별 Spend는 1주차와 2주차 기간값을 합산하고, Code Lines는 최신 월 누적값과 스냅샷 간 주차 순증을 사용합니다.",
  ],
};
