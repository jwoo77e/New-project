export type TokenUsageCoverage = "partial" | "complete";

export type TokenUsageSample = {
  key: string;
  label: string;
  totalTokens: number;
  startDate: string;
  endDate: string;
  coverage: TokenUsageCoverage;
};

export type TokenUsageTrendPoint = TokenUsageSample & {
  observedDays: number;
  targetDays: number;
  comparableTokens: number;
};

export type TokenUsageTrendDirection = "up" | "down" | "flat";
export type TokenUsageForecastKind = "period-end" | "next-period";

export type TokenUsageTrend = {
  points: TokenUsageTrendPoint[];
  forecastTokens: number | null;
  forecastLabel: string;
  forecastKind: TokenUsageForecastKind;
  direction: TokenUsageTrendDirection;
  confidence: "low" | "medium";
};

const DAY_MS = 24 * 60 * 60 * 1000;

function parseDate(date: string) {
  const timestamp = Date.parse(`${date}T00:00:00Z`);
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function inclusiveDays(startDate: string, endDate: string) {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (start == null || end == null || end < start) return 0;
  return Math.floor((end - start) / DAY_MS) + 1;
}

function daysInMonth(date: string) {
  const [year, month] = date.split("-").map(Number);
  if (!year || !month || month < 1 || month > 12) return 0;
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function cleanSamples(samples: TokenUsageSample[]) {
  return samples
    .filter(
      (sample) =>
        Number.isFinite(sample.totalTokens) &&
        sample.totalTokens >= 0 &&
        inclusiveDays(sample.startDate, sample.endDate) > 0,
    )
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

function boundedTrendForecast(points: TokenUsageTrendPoint[]) {
  const latest = points[points.length - 1]?.comparableTokens ?? 0;
  const previous = points[points.length - 2]?.comparableTokens;
  if (previous == null) return latest;

  const projected = latest + (latest - previous) * 0.5;
  return Math.min(Math.max(projected, 0), Math.max(latest * 2, 1));
}

function directionFor(forecast: number, baseline: number): TokenUsageTrendDirection {
  if (baseline <= 0) return forecast > 0 ? "up" : "flat";
  const changeRate = (forecast - baseline) / baseline;
  if (changeRate > 0.1) return "up";
  if (changeRate < -0.1) return "down";
  return "flat";
}

export function buildMonthlyTokenUsageTrend(samples: TokenUsageSample[]): TokenUsageTrend {
  const points = cleanSamples(samples).map((sample) => {
    const observedDays = inclusiveDays(sample.startDate, sample.endDate);
    const targetDays = daysInMonth(sample.startDate) || observedDays;
    const comparableTokens = sample.coverage === "partial"
      ? (sample.totalTokens / observedDays) * targetDays
      : sample.totalTokens;
    return {
      ...sample,
      observedDays,
      targetDays,
      comparableTokens: Math.round(comparableTokens),
    };
  });
  const latest = points[points.length - 1];
  const partialPeriod = latest?.coverage === "partial";
  const forecastTokens = latest == null
    ? null
    : Math.round(partialPeriod ? latest.comparableTokens : boundedTrendForecast(points));
  const baseline = partialPeriod ? latest?.totalTokens ?? 0 : latest?.comparableTokens ?? 0;

  return {
    points,
    forecastTokens,
    forecastLabel: partialPeriod ? "월말 예상" : "다음 달 예상",
    forecastKind: partialPeriod ? "period-end" : "next-period",
    direction: forecastTokens == null ? "flat" : directionFor(forecastTokens, baseline),
    confidence: points.length >= 4 ? "medium" : "low",
  };
}

export function buildWeeklyTokenUsageTrend(samples: TokenUsageSample[]): TokenUsageTrend {
  const points = cleanSamples(samples).map((sample) => {
    const observedDays = inclusiveDays(sample.startDate, sample.endDate);
    const targetDays = 7;
    return {
      ...sample,
      observedDays,
      targetDays,
      comparableTokens: Math.round((sample.totalTokens / observedDays) * targetDays),
    };
  });
  const forecastTokens = points.length > 0 ? Math.round(boundedTrendForecast(points)) : null;
  const baseline = points[points.length - 1]?.comparableTokens ?? 0;

  return {
    points,
    forecastTokens,
    forecastLabel: "다음 주 예상",
    forecastKind: "next-period",
    direction: forecastTokens == null ? "flat" : directionFor(forecastTokens, baseline),
    confidence: points.length >= 4 ? "medium" : "low",
  };
}
