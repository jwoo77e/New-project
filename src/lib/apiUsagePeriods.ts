import type { ApiDailyUsage } from "../data/apiUsageData";

export type ApiUsagePeriodKey = "recent7" | "week" | "month" | "previousMonth";

export type ApiUsagePeriodSummary = {
  key: ApiUsagePeriodKey;
  label: string;
  rangeLabel: string;
  dailyUsage: ApiDailyUsage[];
  requests: number;
  totalTokens: number;
  costUsd: number;
  isPartial: boolean;
};

const requestKeys = ["openaiRequests", "geminiRequests", "claudeRequests"] as const;

export function buildApiUsagePeriodSummaries(
  dailyUsage: ApiDailyUsage[],
  now = new Date(),
): ApiUsagePeriodSummary[] {
  const sorted = [...dailyUsage].sort((a, b) => a.date.localeCompare(b.date));
  // Calendar labels follow the current Korean date, even when a snapshot is stale.
  const todayKey = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(now);
  const today = parseDateKey(todayKey);
  const recentStart = new Date(today);
  recentStart.setUTCDate(recentStart.getUTCDate() - 6);
  const weekStart = new Date(today);
  const mondayOffset = (weekStart.getUTCDay() + 6) % 7;
  weekStart.setUTCDate(weekStart.getUTCDate() - mondayOffset);
  const monthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  const previousMonthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1));
  const previousMonthEnd = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 0));

  function range(key: ApiUsagePeriodKey, label: string, start: Date, end: Date, ongoing = false) {
    const startKey = toDateKey(start);
    const endKey = toDateKey(end);
    const rows = sorted.filter((item) => item.date >= startKey && item.date <= endKey);
    const expectedDays = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
    const isPartial = ongoing || new Set(rows.map((row) => row.date)).size < expectedDays;
    return summarize(key, label, rows, isPartial, `${shortDate(startKey)} ~ ${shortDate(endKey)}`);
  }

  return [
    range("recent7", "최근 7일", recentStart, today),
    range("week", "이번 주", weekStart, today, today.getUTCDay() !== 0),
    range("month", "이번 달", monthStart, today, today.getUTCDate() !== daysInMonth(today)),
    range("previousMonth", "지난달", previousMonthStart, previousMonthEnd),
  ];
}

function summarize(
  key: ApiUsagePeriodKey,
  label: string,
  dailyUsage: ApiDailyUsage[],
  isPartial: boolean,
  rangeLabel: string,
): ApiUsagePeriodSummary {
  return {
    key,
    label,
    rangeLabel,
    dailyUsage,
    requests: dailyUsage.reduce(
      (sum, item) => sum + requestKeys.reduce((requestSum, requestKey) => requestSum + item[requestKey], 0),
      0,
    ),
    totalTokens: dailyUsage.reduce((sum, item) => sum + item.totalTokens, 0),
    costUsd: roundMoney(dailyUsage.reduce((sum, item) => sum + item.costUsd, 0)),
    isPartial,
  };
}

function parseDateKey(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function toDateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

function shortDate(value: string) {
  const [, month, day] = value.split("-");
  return `${Number(month)}월 ${Number(day)}일`;
}

function daysInMonth(value: Date) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth() + 1, 0)).getUTCDate();
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
