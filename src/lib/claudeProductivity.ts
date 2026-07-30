import type { ClaudeTeamUserUsage } from "../data/claudeTeamUsageData";

export type ClaudeProductivityLevel =
  | "top"
  | "efficient"
  | "high-output"
  | "balanced"
  | "insufficient"
  | "no-code";

export type ClaudeProductivitySignal = {
  email: string;
  level: ClaudeProductivityLevel;
  label: string;
  score: number | null;
  linesPerMillionTokens: number;
  linesPerThousandRequests: number;
  detail: string;
};

const labels: Record<ClaudeProductivityLevel, string> = {
  top: "생산성 신호 상위",
  efficient: "고효율 활용",
  "high-output": "높은 산출량",
  balanced: "균형 활용",
  insufficient: "표본 부족",
  "no-code": "코드 산출 없음",
};

export function buildClaudeProductivitySignals(users: ClaudeTeamUserUsage[]) {
  const codeUsers = users.filter(
    (user) => user.codeLines > 0 && user.claudeCodeRequests > 0 && user.claudeCodeTokens > 0,
  );
  const volumePercentiles = descendingPercentiles(codeUsers, (user) => user.codeLines);
  const tokenEfficiencyPercentiles = descendingPercentiles(
    codeUsers,
    (user) => user.codeLines / (user.claudeCodeTokens / 1_000_000),
  );
  const requestEfficiencyPercentiles = descendingPercentiles(
    codeUsers,
    (user) => user.codeLines / (user.claudeCodeRequests / 1_000),
  );
  const medianCodeLines = median(codeUsers.map((user) => user.codeLines));

  return new Map(
    users.map((user) => {
      const signal = buildSignal({
        user,
        medianCodeLines,
        volumePercentile: volumePercentiles.get(user.email) ?? 0,
        tokenEfficiencyPercentile: tokenEfficiencyPercentiles.get(user.email) ?? 0,
        requestEfficiencyPercentile: requestEfficiencyPercentiles.get(user.email) ?? 0,
      });
      return [user.email, signal];
    }),
  );
}

function buildSignal({
  user,
  medianCodeLines,
  volumePercentile,
  tokenEfficiencyPercentile,
  requestEfficiencyPercentile,
}: {
  user: ClaudeTeamUserUsage;
  medianCodeLines: number;
  volumePercentile: number;
  tokenEfficiencyPercentile: number;
  requestEfficiencyPercentile: number;
}): ClaudeProductivitySignal {
  if (user.codeLines <= 0 || user.claudeCodeRequests <= 0 || user.claudeCodeTokens <= 0) {
    return {
      email: user.email,
      level: "no-code",
      label: labels["no-code"],
      score: null,
      linesPerMillionTokens: 0,
      linesPerThousandRequests: 0,
      detail: "집계 기간 Claude Code 수락 코드 라인이 없습니다.",
    };
  }

  const linesPerMillionTokens = user.codeLines / (user.claudeCodeTokens / 1_000_000);
  const linesPerThousandRequests = user.codeLines / (user.claudeCodeRequests / 1_000);
  const score =
    volumePercentile * 0.5 + tokenEfficiencyPercentile * 0.3 + requestEfficiencyPercentile * 0.2;

  let level: ClaudeProductivityLevel = "balanced";
  if (user.claudeCodeRequests < 500 || user.codeLines < 2_000) {
    level = "insufficient";
  } else if (score >= 75 && user.codeLines >= medianCodeLines) {
    level = "top";
  } else if (tokenEfficiencyPercentile >= 75 && user.codeLines >= medianCodeLines) {
    level = "efficient";
  } else if (volumePercentile >= 75) {
    level = "high-output";
  }

  return {
    email: user.email,
    level,
    label: labels[level],
    score: round(score),
    linesPerMillionTokens: round(linesPerMillionTokens),
    linesPerThousandRequests: round(linesPerThousandRequests),
    detail: `생산성 신호 ${round(score)}점 · 수락 코드 ${user.codeLines.toLocaleString("ko-KR")}줄 · Claude Code 100만 토큰당 ${round(linesPerMillionTokens).toLocaleString("ko-KR")}줄`,
  };
}

function descendingPercentiles(
  users: ClaudeTeamUserUsage[],
  select: (user: ClaudeTeamUserUsage) => number,
) {
  const sorted = [...users].sort(
    (a, b) => select(b) - select(a) || a.email.localeCompare(b.email),
  );
  const denominator = Math.max(sorted.length - 1, 1);
  return new Map(
    sorted.map((user, index) => [
      user.email,
      sorted.length === 1 ? 100 : ((sorted.length - 1 - index) / denominator) * 100,
    ]),
  );
}

function median(values: number[]) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}
