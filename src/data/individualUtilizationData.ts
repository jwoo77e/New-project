import snapshotJson from "./individualUtilizationSnapshot.json";
import monthlySpendSnapshotJson from "./individualMonthlySpendSnapshot.json";
import weeklyUsageSnapshotJson from "./individualWeeklyUsageSnapshot.json";

export type IndividualPeriodMode = "month" | "week";
export type IndividualEvaluationLevel = "leading" | "active" | "growing" | "early" | "unobserved";
export type IndividualMeasurementStatus =
  | "measured"
  | "shared-account-unmeasured"
  | "source-uncollected";

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
  measurementStatus: IndividualMeasurementStatus;
  displayAccount: string | null;
  usageScopeOverride: string | null;
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

export type IndividualMonthlySpendUser = {
  requests: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  netSpendUsd: number;
};

export type IndividualMonthlySpendPeriod = {
  month: string;
  fileName: string;
  period: string;
  rowCount: number | null;
  coverage: "partial" | "complete";
  sourceCommit?: string;
  totals: IndividualMonthlySpendUser;
  users: Record<string, IndividualMonthlySpendUser>;
};

export type IndividualWeeklyUsageMetrics = IndividualMonthlySpendUser & {
  codeLines: number;
};

export type IndividualWeeklyUsageUser = IndividualWeeklyUsageMetrics & {
  products: string[];
  models: string[];
};

export type IndividualWeeklyUsagePeriod = {
  key: string;
  label: string;
  startDate: string;
  endDate: string;
  coverage: "complete" | "partial";
  source: {
    previousSpendFile: string;
    currentSpendFile: string;
    previousSpendRows: number;
    currentSpendRows: number;
    previousCodeFile: string;
    currentCodeFile: string;
    method: string;
  };
  totals: IndividualWeeklyUsageMetrics & { activeUsers: number };
  users: Record<string, IndividualWeeklyUsageUser>;
  notes: string[];
};

type RawIndividualMonthlySpendSnapshot = {
  generatedAt: string;
  months: IndividualMonthlySpendPeriod[];
  missingMonths: string[];
  notes: string[];
};

type RawIndividualWeeklyUsageSnapshot = {
  generatedAt: string;
  periods: IndividualWeeklyUsagePeriod[];
};

const snapshot = snapshotJson as unknown as RawIndividualSnapshot;
const monthlySpendSnapshot = monthlySpendSnapshotJson as unknown as RawIndividualMonthlySpendSnapshot;
const weeklyUsageSnapshot = weeklyUsageSnapshotJson as unknown as RawIndividualWeeklyUsageSnapshot;
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
const rawMonthlySpendByMonth = new Map(
  monthlySpendSnapshot.months.map((item) => [item.month, item] as const),
);
const monthlySpend = Object.fromEntries(
  months.map((month) => [month, rawMonthlySpendByMonth.get(month) ?? null]),
) as Record<string, IndividualMonthlySpendPeriod | null>;
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
const measuredUsageScopeOverrides: Record<string, string> = {
  "sjpark@riskzero.kr": "chatGPT 공통 계정 사용 · Claude Team Plan Standard",
  "songinna@riskzero.kr": "chatGPT 공통 계정 사용 · Claude Team Plan Standard",
};

const measuredUsers: IndividualUtilizationUser[] = snapshot.users.map((user) => {
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
    measurementStatus: "measured",
    displayAccount: user.email,
    usageScopeOverride: measuredUsageScopeOverrides[user.email] ?? null,
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

const unmeasuredUserSeeds: Array<{
  email: string;
  displayName: string;
  measurementStatus: Exclude<IndividualMeasurementStatus, "measured">;
  displayAccount: string | null;
  usageScopeOverride: string;
  products: string[];
  topProduct: string;
  topModel: string;
  evidence: string;
}> = [
  {
    email: "shared-account:lim-seongbeom",
    displayName: "임성범 부장",
    measurementStatus: "shared-account-unmeasured",
    displayAccount: null,
    usageScopeOverride: "Claude 및 Genspark 공통 계정 사용",
    products: ["Claude", "Genspark"],
    topProduct: "공통 계정 사용",
    topModel: "공통 계정 사용",
    evidence: "공통 계정 사용으로 개인별 측정 미수집",
  },
  {
    email: "shared-account:jo-jooyeon",
    displayName: "조주연 부장",
    measurementStatus: "shared-account-unmeasured",
    displayAccount: null,
    usageScopeOverride: "Claude, Genspark 및 Gamma 공통 계정 사용",
    products: ["Claude", "Genspark", "Gamma"],
    topProduct: "공통 계정 사용",
    topModel: "공통 계정 사용",
    evidence: "공통 계정 사용으로 개인별 측정 미수집",
  },
  {
    email: "shared-account:lee-hyeongbae",
    displayName: "이형배 상무",
    measurementStatus: "shared-account-unmeasured",
    displayAccount: null,
    usageScopeOverride: "Claude 공통 계정 사용",
    products: ["Claude"],
    topProduct: "공통 계정 사용",
    topModel: "공통 계정 사용",
    evidence: "공통 계정 사용으로 개인별 측정 미수집",
  },
  {
    email: "shared-account:kim-daeil",
    displayName: "김대일 상무",
    measurementStatus: "shared-account-unmeasured",
    displayAccount: null,
    usageScopeOverride: "Claude 가입 계정 사용",
    products: ["Claude"],
    topProduct: "공통 계정 사용",
    topModel: "공통 계정 사용",
    evidence: "가입 계정 사용으로 개인별 측정 미수집",
  },
  {
    email: "shared-account:park-yeonseok",
    displayName: "박연석 전무",
    measurementStatus: "shared-account-unmeasured",
    displayAccount: null,
    usageScopeOverride: "Claude 가입 계정 사용",
    products: ["Claude"],
    topProduct: "공통 계정 사용",
    topModel: "공통 계정 사용",
    evidence: "가입 계정 사용으로 개인별 측정 미수집",
  },
  {
    email: "dhlee@riskzero.kr",
    displayName: "이동훈 부장",
    measurementStatus: "source-uncollected",
    displayAccount: "dhlee@riskzero.kr",
    usageScopeOverride: "Claude Team Plan Standard · 사용량 원천 미수집",
    products: ["Claude"],
    topProduct: "Claude Team Plan Standard",
    topModel: "미수집",
    evidence: "가입 계정이나 Spend·Code Lines 원천 사용량 미수집",
  },
  {
    email: "sjpark@riskzero.kr",
    displayName: "박수진 과장",
    measurementStatus: "source-uncollected",
    displayAccount: "sjpark@riskzero.kr",
    usageScopeOverride: "chatGPT 공통 계정 사용 · Claude Team Plan Standard · 사용량 원천 미수집",
    products: ["ChatGPT", "Claude"],
    topProduct: "chatGPT 공통 계정 · Claude Team Plan Standard",
    topModel: "미수집",
    evidence: "Claude Team 가입 계정이나 Spend·Code Lines 원천 사용량 미수집",
  },
  {
    email: "songinna@riskzero.kr",
    displayName: "송인나 대리",
    measurementStatus: "source-uncollected",
    displayAccount: "songinna@riskzero.kr",
    usageScopeOverride: "chatGPT 공통 계정 사용 · Claude Team Plan Standard · 사용량 원천 미수집",
    products: ["ChatGPT", "Claude"],
    topProduct: "chatGPT 공통 계정 · Claude Team Plan Standard",
    topModel: "미수집",
    evidence: "Claude Team 가입 계정이나 Spend·Code Lines 원천 사용량 미수집",
  },
  ...([
    ["choi-jongyun", "최종윤 이사"],
    ["yoon-jongho", "윤종호 부장"],
    ["lee-changseop", "이창섭 부장"],
    ["jo-uksang", "조욱상 이사"],
    ["lee-byeonghyeon", "이병현 이사"],
    ["kang-hoon", "강훈 부장"],
    ["lee-jinuk", "이진욱 부장"],
    ["park-myeongsu", "박명수 과장"],
    ["kim-doyul", "김도율 차장"],
    ["kim-jinhee", "김진희 과장"],
    ["ko-wonsang", "고원상 대리"],
    ["choi-yongho", "최용호 대리"],
    ["kang-jaemin", "강재민 사원"],
    ["park-byeongmin", "박병민 이사"],
  ] as const).map(([id, displayName]) => {
    const usesClaudeCommonAccount =
      id === "kim-doyul" || id === "choi-jongyun" || id === "park-byeongmin";
    return {
      email: `chatgpt-account:${id}`,
      displayName,
      measurementStatus: "source-uncollected" as const,
      displayAccount: null,
      usageScopeOverride: usesClaudeCommonAccount
        ? "chatGPT 공통 계정 사용 · Claude 공통 계정 사용"
        : "chatGPT 공통 계정 사용",
      products: usesClaudeCommonAccount ? ["ChatGPT", "Claude"] : ["ChatGPT"],
      topProduct: usesClaudeCommonAccount ? "chatGPT · Claude 공통 계정" : "chatGPT 공통 계정",
      topModel: "미수집",
      evidence: "공통 계정 사용 · 세부 사용량 원천 미수집",
    };
  }),
];

const measuredEmails = new Set(measuredUsers.map((user) => user.email));
const unmeasuredUsers: IndividualUtilizationUser[] = unmeasuredUserSeeds
  .filter((seed) => !measuredEmails.has(seed.email))
  .map(({ evidence, ...seed }) => ({
  ...seed,
  requests: 0,
  promptTokens: 0,
  completionTokens: 0,
  totalTokens: 0,
  netSpendUsd: 0,
  grossSpendUsd: 0,
  uncachedInputTokens: 0,
  cacheReadTokens: 0,
  cacheWrite5mTokens: 0,
  cacheWrite1hTokens: 0,
  webSearchCount: 0,
  models: [],
  productUsage: {},
  modelUsage: {},
  monthlyCodeLines: {},
  monthlyActivity: {},
  weeklyActivity: {},
  totalCodeLines: 0,
  totalConversations: 0,
  totalHumanPrompts: 0,
  totalAssistantResponses: 0,
  totalActiveDays: 0,
  activeWeeks: 0,
  activeCodeMonths: 0,
  overallActivityScore: 0,
  overallProductivityScore: 0,
  overallActivityLevel: "unobserved",
  overallProductivityLevel: "unobserved",
  monthEvaluations: Object.fromEntries(
    months.map((month) => [
      month,
      {
        key: month,
        activityScore: 0,
        productivityScore: null,
        activityLevel: "unobserved",
        productivityLevel: "unobserved",
        conversations: 0,
        humanPrompts: 0,
        assistantResponses: 0,
        activeDays: 0,
        codeLines: null,
        codeActivityDetailsMissing: false,
        evidence,
      } satisfies IndividualPeriodEvaluation,
    ]),
  ),
  weekEvaluations: Object.fromEntries(
    weeks.map((week) => [
      week,
      {
        key: week,
        activityScore: 0,
        productivityScore: null,
        activityLevel: "unobserved",
        productivityLevel: "unobserved",
        conversations: 0,
        humanPrompts: 0,
        assistantResponses: 0,
        activeDays: 0,
        codeLines: null,
        codeActivityDetailsMissing: false,
        evidence,
      } satisfies IndividualPeriodEvaluation,
    ]),
  ),
  }));

const users = [...measuredUsers, ...unmeasuredUsers];

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

const weeklyUsage = Object.fromEntries(
  weeklyUsageSnapshot.periods.map((period) => [period.key, period] as const),
) as Record<string, IndividualWeeklyUsagePeriod>;
const usageWeeks = weeklyUsageSnapshot.periods.map((period) => period.key);
const weeklyUsageTrend = weeklyUsageSnapshot.periods.map((period) => ({
  key: period.key,
  label: period.label,
  activeUsers: period.totals.activeUsers,
  requests: period.totals.requests,
  totalTokens: period.totals.totalTokens,
  codeLines: period.totals.codeLines,
}));

export const individualUtilizationData = {
  source: snapshot.source,
  monthlySpendSource: monthlySpendSnapshot,
  totals: snapshot.totals,
  months,
  monthlySpend,
  weeks,
  usageWeeks,
  weeklyUsage,
  weeklyUsageSource: weeklyUsageSnapshot,
  users,
  monthlyTrend,
  weeklyTrend,
  weeklyUsageTrend,
  methodology: {
    activity: "요청·토큰·대화·프롬프트·활성일·사용 제품 범위는 AI 활동 흐름을 확인하는 운영 참고정보로만 사용",
    productivity: "Code Lines 중심 비교값은 개발 활동 신호일 뿐 품질·승인·배포·업무성과를 의미하지 않으며 개인 고과에 직접 사용하지 않음",
    monthly: "대화 Export의 프롬프트·활성일과 월별 Code Lines를 결합",
    weekly: "동일 조건으로 7일 간격 수집한 Spend·Code Lines 누적 스냅샷의 차이를 주차별 요청·토큰·Code Lines로 반영",
    caveat: "Claude Code CSV에는 프롬프트 수와 활성 날짜가 없고 공용·타 AI 계정의 개인 귀속도 불완전합니다. 누락은 0점이 아닌 측정 불가로 표시합니다.",
    evaluationGate: "직무군, 최종 승인, 실제 사용, 품질·재작업, 시간 절감, 재사용 정보가 연결된 산출물만 인사평가 근거 후보로 전환",
  },
} as const;
