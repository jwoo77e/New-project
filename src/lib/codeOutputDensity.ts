export type CodeOutputDensityDirection = "up" | "down" | "flat" | "baseline";

export type CodeOutputDensitySample = {
  key: string;
  label: string;
  codeLines: number;
  totalTokens: number;
  periodAligned: boolean;
};

export type CodeOutputDensityPoint = CodeOutputDensitySample & {
  linesPerMillionTokens: number;
};

export type CodeOutputDensityTrend = {
  points: CodeOutputDensityPoint[];
  currentPoint: CodeOutputDensityPoint | null;
  previousPoint: CodeOutputDensityPoint | null;
  changeRate: number | null;
  direction: CodeOutputDensityDirection;
  excludedKeys: string[];
};

const TOKENS_PER_DENSITY_UNIT = 1_000_000;

export function calculateCodeOutputDensity(codeLines: number, totalTokens: number) {
  if (!Number.isFinite(codeLines) || codeLines < 0) return null;
  if (!Number.isFinite(totalTokens) || totalTokens <= 0) return null;
  return (codeLines / totalTokens) * TOKENS_PER_DENSITY_UNIT;
}

export function buildCodeOutputDensityTrend(
  samples: CodeOutputDensitySample[],
  selectedKey: string,
): CodeOutputDensityTrend {
  const points = samples.flatMap((sample) => {
    const density = calculateCodeOutputDensity(sample.codeLines, sample.totalTokens);
    if (!sample.periodAligned || density == null) return [];
    return [{ ...sample, linesPerMillionTokens: density }];
  });
  const currentIndex = points.findIndex((point) => point.key === selectedKey);
  const currentPoint = currentIndex >= 0 ? points[currentIndex] : null;
  const previousPoint = currentIndex > 0 ? points[currentIndex - 1] : null;
  const excludedKeys = samples
    .filter(
      (sample) =>
        !sample.periodAligned ||
        calculateCodeOutputDensity(sample.codeLines, sample.totalTokens) == null,
    )
    .map((sample) => sample.key);

  if (!currentPoint || !previousPoint) {
    return {
      points,
      currentPoint,
      previousPoint,
      changeRate: null,
      direction: "baseline",
      excludedKeys,
    };
  }

  if (previousPoint.linesPerMillionTokens === 0) {
    return {
      points,
      currentPoint,
      previousPoint,
      changeRate: null,
      direction: currentPoint.linesPerMillionTokens > 0 ? "up" : "flat",
      excludedKeys,
    };
  }

  const changeRate =
    ((currentPoint.linesPerMillionTokens - previousPoint.linesPerMillionTokens) /
      previousPoint.linesPerMillionTokens) *
    100;
  const direction = changeRate > 10 ? "up" : changeRate < -10 ? "down" : "flat";

  return {
    points,
    currentPoint,
    previousPoint,
    changeRate,
    direction,
    excludedKeys,
  };
}

function previousDate(date: string) {
  const timestamp = Date.parse(`${date}T00:00:00Z`);
  if (!Number.isFinite(timestamp)) return null;
  return new Date(timestamp - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function inferCodeLineSourcePeriod(fileName: string, month: string) {
  const rangeMatch = fileName.match(
    /claude_code_team_(\d{4})_(\d{2})_(\d{2})_to_(\d{4})_(\d{2})_(\d{2})\.csv$/,
  );
  if (rangeMatch) {
    return {
      startDate: `${rangeMatch[1]}-${rangeMatch[2]}-${rangeMatch[3]}`,
      endDate: `${rangeMatch[4]}-${rangeMatch[5]}-${rangeMatch[6]}`,
    };
  }

  const snapshotMatch = fileName.match(/(\d{4})-(\d{2})-(\d{2})-claude_code\.csv$/);
  if (!snapshotMatch) return null;
  const snapshotDate = `${snapshotMatch[1]}-${snapshotMatch[2]}-${snapshotMatch[3]}`;
  const endDate = previousDate(snapshotDate);
  if (!endDate) return null;
  return { startDate: `${month}-01`, endDate };
}

export function isMonthlyCodePeriodAligned({
  codeFileName,
  month,
  spendEndDate,
  spendStartDate,
}: {
  codeFileName: string;
  month: string;
  spendEndDate: string;
  spendStartDate: string;
}) {
  const codePeriod = inferCodeLineSourcePeriod(codeFileName, month);
  return codePeriod?.startDate === spendStartDate && codePeriod.endDate === spendEndDate;
}
