import snapshotJson from "./individualUtilizationSnapshot.json";

export type IndividualPeriodMode = "month" | "week";
export type IndividualEvaluationLevel = "leading" | "active" | "growing" | "early" | "unobserved";

type ActivitySignal = {
  conversations: number;
  humanPrompts: number;
  assistantResponses: number;
  activeDays: number;
};

type UsageBreakdown = Record<
  string,
  {
    requests: number;
    tokens: number;
    netSpendUsd: number;
  }
>;

type RawIndividualUser = {
  email: string;
  displayName: string;
  requests: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  netSpendUsd: number;
  grossSpendUsd: number;
  uncachedInputTokens: number;
  cacheReadTokens: number;
  cacheWrite5mTokens: number;
  cacheWrite1hTokens: number;
  webSearchCount: number;
  products: string[];
  models: string[];
  productUsage: UsageBreakdown;
  modelUsage: UsageBreakdown;
  monthlyCodeLines: Record<string, number>;
  monthlyActivity: Record<string, ActivitySignal>;
  weeklyActivity: Record<string, ActivitySignal>;
};

type RawIndividualSnapshot = {
  source: {
    generatedAt: string;
    spend: {
      fileName: string;
      period: string;
      rowCount: number;
      grain: string;
    };
    codeLines: Array<{
      month: string;
      fileName: string;
      rowCount: number;
      totalLines: number;
    }>;
    conversations: {
      fileName: string;
      usersFileName: string;
      period: string;
      conversationCount: number;
      messageCount: number;
      grain: string;
    } | null;
    notes: string[];
  };
  totals: {
    users: number;
    requests: number;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    netSpendUsd: number;
    grossSpendUsd: number;
    codeLines: number;
    conversations: number;
    humanPrompts: number;
    assistantResponses: number;
  };
  users: RawIndividualUser[];
};

export type IndividualPeriodEvaluation = {
  key: string;
  activityScore: number;
  productivityScore: number | null;
  activityLevel: IndividualEvaluationLevel;
  productivityLevel: IndividualEvaluationLevel;
  conversations: number;
  humanPrompts: number;
  assistantResponses: number;
  activeDays: number;
  codeLines: number | null;
  codeActivityDetailsMissing: boolean;
  evidence: string;
};

export type IndividualUtilizationUser = RawIndividualUser & {
  totalCodeLines: number;
  totalConversations: number;
  totalHumanPrompts: number;
  totalAssistantResponses: number;
  totalActiveDays: number;
  activeWeeks: number;
  activeCodeMonths: number;
  overallActivityScore: number;
  overallProductivityScore: number;
  overallActivityLevel: IndividualEvaluationLevel;
  overallProductivityLevel: IndividualEvaluationLevel;
  topProduct: string;
  topModel: string;
  monthEvaluations: Record<string, IndividualPeriodEvaluation>;
  weekEvaluations: Record<string, IndividualPeriodEvaluation>;
};

export type IndividualTrendPoint = {
  key: string;
  label: string;
  activeUsers: number;
  conversations: number;
  humanPrompts: number;
  assistantResponses: number;
  codeLines: number | null;
};

const snapshot = snapshotJson as unknown as RawIndividualSnapshot;
const emptyActivity: ActivitySignal = {
  conversations: 0,
  humanPrompts: 0,
  assistantResponses: 0,
  activeDays: 0,
};

function percentile(value: number, values: number[]) {
  if (value <= 0 || values.length === 0) return 0;
  const positiveValues = values.filter((item) => item > 0).sort((a, b) => a - b);
  if (positiveValues.length <= 1) return positiveValues.length === 1 ? 100 : 0;
  const lower = positiveValues.filter((item) => item < value).length;
  const equal = positiveValues.filter((item) => item === value).length;
  return ((lower + Math.max(equal - 1, 0) / 2) / (positiveValues.length - 1)) * 100;
}

function scoreLevel(score: number, observed = true): IndividualEvaluationLevel {
  if (!observed) return "unobserved";
  if (score >= 75) return "leading";
  if (score >= 50) return "active";
  if (score >= 25) return "growing";
  return "early";
}

function topBreakdown(breakdown: UsageBreakdown) {
  return Object.entries(breakdown).sort(
    ([nameA, a], [nameB, b]) => b.tokens - a.tokens || b.requests - a.requests || nameA.localeCompare(nameB),
  )[0]?.[0] ?? "사용 이력 없음";
}

function sumActivity(activity: Record<string, ActivitySignal>) {
  return Object.values(activity).reduce(
    (total, item) => ({
      conversations: total.conversations + item.conversations,
      humanPrompts: total.humanPrompts + item.humanPrompts,
      assistantResponses: total.assistantResponses + item.assistantResponses,
      activeDays: total.activeDays + item.activeDays,
    }),
    { ...emptyActivity },
  );
}

function monthLabel(month: string) {
  const [, monthNumber] = month.split("-");
  return `${Number(monthNumber)}월`;
}

function weekLabel(weekStart: string) {
  const start = new Date(`${weekStart}T00:00:00+09:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return `${start.getMonth() + 1}/${start.getDate()}-${end.getMonth() + 1}/${end.getDate()}`;
}

const months = snapshot.source.codeLines.map((item) => item.month).sort();
const weeks = Array.from(new Set(snapshot.users.flatMap((user) => Object.keys(user.weeklyActivity)))).sort();
const allRequests = snapshot.users.map((user) => user.requests);
const allTokens = snapshot.users.map((user) => user.totalTokens);
const allCompletionTokens = snapshot.users.map((user) => user.completionTokens);
const allConversations = snapshot.users.map((user) => sumActivity(user.weeklyActivity).conversations);
const allPrompts = snapshot.users.map((user) => sumActivity(user.weeklyActivity).humanPrompts);
const allActiveDays = snapshot.users.map((user) => sumActivity(user.weeklyActivity).activeDays);
const allCodeLines = snapshot.users.map((user) =>
  Object.values(user.monthlyCodeLines).reduce((sum, value) => sum + value, 0),
);

const users: IndividualUtilizationUser[] = snapshot.users.map((user) => {
  const totalActivity = sumActivity(user.weeklyActivity);
  const totalCodeLines = Object.values(user.monthlyCodeLines).reduce((sum, value) => sum + value, 0);
  const activeCodeMonths = months.filter((month) => (user.monthlyCodeLines[month] ?? 0) > 0).length;
  const activeWeeks = weeks.filter((week) => {
    const signal = user.weeklyActivity[week] ?? emptyActivity;
    return signal.humanPrompts > 0 || signal.conversations > 0;
  }).length;
  const breadthScore = Math.min(user.products.length / 5, 1) * 100;
  const continuityScore = months.length ? (activeCodeMonths / months.length) * 100 : 0;
  const overallActivityScore = Math.round(
    percentile(user.requests, allRequests) * 0.25 +
      percentile(user.totalTokens, allTokens) * 0.2 +
      percentile(totalActivity.conversations, allConversations) * 0.2 +
      percentile(totalActivity.humanPrompts, allPrompts) * 0.2 +
      breadthScore * 0.1 +
      Math.min(activeWeeks / Math.max(weeks.length, 1), 1) * 100 * 0.05,
  );
  const overallProductivityScore = Math.round(
    percentile(totalCodeLines, allCodeLines) * 0.65 +
      percentile(user.completionTokens, allCompletionTokens) * 0.15 +
      continuityScore * 0.1 +
      percentile(totalActivity.activeDays, allActiveDays) * 0.1,
  );

  const monthEvaluations = Object.fromEntries(
    months.map((month) => {
      const activity = user.monthlyActivity[month] ?? emptyActivity;
      const monthCodeLines = user.monthlyCodeLines[month] ?? 0;
      const monthConversations = snapshot.users.map((item) => (item.monthlyActivity[month] ?? emptyActivity).conversations);
      const monthPrompts = snapshot.users.map((item) => (item.monthlyActivity[month] ?? emptyActivity).humanPrompts);
      const monthResponses = snapshot.users.map((item) => (item.monthlyActivity[month] ?? emptyActivity).assistantResponses);
      const monthActiveDays = snapshot.users.map((item) => (item.monthlyActivity[month] ?? emptyActivity).activeDays);
      const monthLines = snapshot.users.map((item) => item.monthlyCodeLines[month] ?? 0);
      const chatActivityObserved = activity.humanPrompts > 0 || activity.conversations > 0 || activity.activeDays > 0;
      const codeActivityObserved = monthCodeLines > 0;
      const observed = chatActivityObserved || codeActivityObserved;
      const codePercentile = percentile(monthCodeLines, monthLines);
      const chatWeightedActivity =
        percentile(activity.conversations, monthConversations) * 0.25 +
          percentile(activity.humanPrompts, monthPrompts) * 0.35 +
          percentile(activity.activeDays, monthActiveDays) * 0.15;
      const activityScore = Math.round(
        chatActivityObserved
          ? chatWeightedActivity + codePercentile * 0.25
          : codeActivityObserved
            ? codePercentile
            : 0,
      );
      const productivityScore = Math.round(
        chatActivityObserved
          ? codePercentile * 0.75 +
              percentile(activity.humanPrompts, monthPrompts) * 0.1 +
              percentile(activity.assistantResponses, monthResponses) * 0.1 +
              percentile(activity.activeDays, monthActiveDays) * 0.05
          : codeActivityObserved
            ? codePercentile
            : 0,
      );
      const chatEvidence = chatActivityObserved
        ? `대화 ${activity.conversations}건 · 대화 프롬프트 ${activity.humanPrompts}건`
        : "대화 활동 없음";
      const codeCoverage = codeActivityObserved ? " · Claude Code 프롬프트·활성일 미수집" : "";
      const evidence = `${chatEvidence}${codeCoverage} · Code ${monthCodeLines.toLocaleString("ko-KR")}줄`;

      return [
        month,
        {
          key: month,
          activityScore,
          productivityScore,
          activityLevel: scoreLevel(activityScore, observed),
          productivityLevel: scoreLevel(productivityScore, observed),
          ...activity,
          codeLines: monthCodeLines,
          codeActivityDetailsMissing: codeActivityObserved,
          evidence,
        } satisfies IndividualPeriodEvaluation,
      ];
    }),
  );

  const weekEvaluations = Object.fromEntries(
    weeks.map((week) => {
      const activity = user.weeklyActivity[week] ?? emptyActivity;
      const weekConversations = snapshot.users.map((item) => (item.weeklyActivity[week] ?? emptyActivity).conversations);
      const weekPrompts = snapshot.users.map((item) => (item.weeklyActivity[week] ?? emptyActivity).humanPrompts);
      const weekActiveDays = snapshot.users.map((item) => (item.weeklyActivity[week] ?? emptyActivity).activeDays);
      const observed = activity.humanPrompts > 0 || activity.conversations > 0;
      const activityScore = Math.round(
        percentile(activity.conversations, weekConversations) * 0.3 +
          percentile(activity.humanPrompts, weekPrompts) * 0.45 +
          percentile(activity.activeDays, weekActiveDays) * 0.25,
      );
      const evidence = `대화 ${activity.conversations}건 · 프롬프트 ${activity.humanPrompts}건 · 활성 ${activity.activeDays}일`;

      return [
        week,
        {
          key: week,
          activityScore,
          productivityScore: null,
          activityLevel: scoreLevel(activityScore, observed),
          productivityLevel: "unobserved",
          ...activity,
          codeLines: null,
          codeActivityDetailsMissing: true,
          evidence,
        } satisfies IndividualPeriodEvaluation,
      ];
    }),
  );

  return {
    ...user,
    totalCodeLines,
    totalConversations: totalActivity.conversations,
    totalHumanPrompts: totalActivity.humanPrompts,
    totalAssistantResponses: totalActivity.assistantResponses,
    totalActiveDays: totalActivity.activeDays,
    activeWeeks,
    activeCodeMonths,
    overallActivityScore,
    overallProductivityScore,
    overallActivityLevel: scoreLevel(overallActivityScore),
    overallProductivityLevel: scoreLevel(overallProductivityScore, totalCodeLines > 0 || totalActivity.humanPrompts > 0),
    topProduct: topBreakdown(user.productUsage),
    topModel: topBreakdown(user.modelUsage),
    monthEvaluations,
    weekEvaluations,
  };
});

const monthlyTrend: IndividualTrendPoint[] = months.map((month) => {
  const activity = users.reduce(
    (total, user) => {
      const signal = user.monthlyActivity[month] ?? emptyActivity;
      total.conversations += signal.conversations;
      total.humanPrompts += signal.humanPrompts;
      total.assistantResponses += signal.assistantResponses;
      if (signal.humanPrompts > 0 || signal.conversations > 0 || (user.monthlyCodeLines[month] ?? 0) > 0) {
        total.activeUsers += 1;
      }
      return total;
    },
    { activeUsers: 0, conversations: 0, humanPrompts: 0, assistantResponses: 0 },
  );
  return {
    key: month,
    label: monthLabel(month),
    ...activity,
    codeLines: snapshot.source.codeLines.find((item) => item.month === month)?.totalLines ?? 0,
  };
});

const weeklyTrend: IndividualTrendPoint[] = weeks.map((week) => {
  const activity = users.reduce(
    (total, user) => {
      const signal = user.weeklyActivity[week] ?? emptyActivity;
      total.conversations += signal.conversations;
      total.humanPrompts += signal.humanPrompts;
      total.assistantResponses += signal.assistantResponses;
      if (signal.humanPrompts > 0 || signal.conversations > 0) total.activeUsers += 1;
      return total;
    },
    { activeUsers: 0, conversations: 0, humanPrompts: 0, assistantResponses: 0 },
  );
  return {
    key: week,
    label: weekLabel(week),
    ...activity,
    codeLines: null,
  };
});

export const individualUtilizationData = {
  source: snapshot.source,
  totals: snapshot.totals,
  months,
  weeks,
  users,
  monthlyTrend,
  weeklyTrend,
  methodology: {
    activity: "요청·토큰·대화·프롬프트·활성일·사용 제품 범위를 동료 집단 내 백분위로 합성",
    productivity: "월별은 Code Lines 75% 중심이며, 대화 활동이 없는 Code 사용자는 미수집값을 0으로 감점하지 않고 Code Lines 백분위로 평가",
    monthly: "대화 Export의 프롬프트·활성일과 월별 Code Lines를 결합",
    weekly: "대화 원천의 주별 대화·프롬프트·활성일만 반영하며 Code Lines는 주간으로 나누지 않음",
    caveat: "Claude Code CSV에는 프롬프트 수와 활성 날짜가 없어 해당 값은 미수집으로 표시합니다. 생산성은 확정 성과가 아닌 비교용 신호입니다.",
  },
} as const;
