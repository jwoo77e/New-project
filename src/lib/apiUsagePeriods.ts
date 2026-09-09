import type { ApiDailyUsage } from "../data/apiUsageData";

export type ApiUsagePeriodKey = "recent7" | "week" | "month";

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

export function buildApiUsagePeriodSummaries(dailyUsage: ApiDailyUsage[]): ApiUsagePeriodSummary[] {
  const sorted = [...dailyUsage].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sorted[sorted.length - 1];

  if (!latest) {
    return [
      emptySummary("recent7", "최근 7일"),
      emptySummary("week", "이번 주"),
      emptySummary("month", "이번 달"),
    ];
  }

  const latestDate = parseDateKey(latest.date);
  const weekStart = new Date(latestDate);
  const mondayOffset = (weekStart.getUTCDay() + 6) % 7;
  weekStart.setUTCDate(weekStart.getUTCDate() - mondayOffset);
  const monthStart = new Date(Date.UTC(latestDate.getUTCFullYear(), latestDate.getUTCMonth(), 1));

  return [
    summarize("recent7", "최근 7일", sorted.slice(-7), false),
    summarize(
      "week",
      "이번 주",
      sorted.filter((item) => item.date >= toDateKey(weekStart)),
      latestDate.getUTCDay() !== 0,
    ),
    summarize(
      "month",
      "이번 달",
      sorted.filter((item) => item.date >= toDateKey(monthStart)),
      latestDate.getUTCDate() !== daysInMonth(latestDate),
    ),
  ];
}

function summarize(
  key: ApiUsagePeriodKey,
  label: string,
  dailyUsage: ApiDailyUsage[],
  isPartial: boolean,
): ApiUsagePeriodSummary {
  const first = dailyUsage[0];
  const last = dailyUsage[dailyUsage.length - 1];

  return {
    key,
    label,
    rangeLabel: first && last ? `${shortDate(first.date)} ~ ${shortDate(last.date)}` : "수집 데이터 없음",
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

function emptySummary(key: ApiUsagePeriodKey, label: string): ApiUsagePeriodSummary {
  return summarize(key, label, [], true);
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
