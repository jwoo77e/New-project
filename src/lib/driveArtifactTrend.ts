import type { DriveArtifact, DriveArtifactRepositoryData } from "../data/driveArtifactRepositoryData";

export type DriveArtifactTrendInput = {
  source: Pick<DriveArtifactRepositoryData["source"], "period">;
  repositories: Array<{
    owner: string;
    artifacts: Array<Pick<DriveArtifact, "createdAt" | "kind">>;
    inventory?: {
      metadataDateAnomalyCount: number;
      dailyCounts: Array<{ date: string; count: number }>;
    };
  }>;
};

export type DriveArtifactDailyTrendPoint = {
  date: string;
  label: string;
  total: number;
  prompts: number;
  outputs: number;
  cumulative: number;
  ownerCounts: Record<string, number>;
};

export type DriveArtifactDailyTrend = {
  owners: string[];
  points: DriveArtifactDailyTrendPoint[];
  openingFiles: number;
  activeDays: number;
  peakDay: DriveArtifactDailyTrendPoint | null;
  latestDay: DriveArtifactDailyTrendPoint | null;
};

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function toKstDateKey(value: string) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return value.slice(0, 10);
  return new Date(timestamp + KST_OFFSET_MS).toISOString().slice(0, 10);
}

function addUtcDays(dateKey: string, days: number) {
  const timestamp = Date.parse(`${dateKey}T00:00:00Z`);
  return new Date(timestamp + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function shortDateLabel(dateKey: string) {
  return `${Number(dateKey.slice(5, 7))}/${Number(dateKey.slice(8, 10))}`;
}

export function buildDriveArtifactDailyTrend(data: DriveArtifactTrendInput): DriveArtifactDailyTrend {
  const owners = data.repositories.map((repository) => repository.owner);
  const periodDates = data.source.period.match(/\d{4}-\d{2}-\d{2}/g) ?? [];
  const usesInventory = data.repositories.every((repository) => repository.inventory);
  const inventoryCounts = usesInventory
    ? data.repositories.flatMap((repository) =>
        (repository.inventory?.dailyCounts ?? []).map((dailyCount) => ({
          ...dailyCount,
          owner: repository.owner,
        })),
      )
    : [];
  const openingFiles = usesInventory
    ? data.repositories.reduce(
        (sum, repository) => sum + (repository.inventory?.metadataDateAnomalyCount ?? 0),
        0,
      )
    : 0;
  const artifacts = usesInventory
    ? []
    : data.repositories.flatMap((repository) =>
        repository.artifacts.map((artifact) => ({
          ...artifact,
          owner: repository.owner,
          date: toKstDateKey(artifact.createdAt),
        })),
      );
  const artifactDates = artifacts.map((artifact) => artifact.date).filter(Boolean);
  const allDates = [...periodDates, ...artifactDates, ...inventoryCounts.map((dailyCount) => dailyCount.date)].sort();

  if (allDates.length === 0) {
    return { owners, points: [], openingFiles, activeDays: 0, peakDay: null, latestDay: null };
  }

  const startDate = allDates[0];
  const endDate = allDates[allDates.length - 1];
  const buckets = new Map<
    string,
    Omit<DriveArtifactDailyTrendPoint, "label" | "cumulative">
  >();

  for (let date = startDate; date <= endDate; date = addUtcDays(date, 1)) {
    buckets.set(date, {
      date,
      total: 0,
      prompts: 0,
      outputs: 0,
      ownerCounts: Object.fromEntries(owners.map((owner) => [owner, 0])),
    });
  }

  if (usesInventory) {
    for (const dailyCount of inventoryCounts) {
      const bucket = buckets.get(dailyCount.date);
      if (!bucket) continue;
      bucket.total += dailyCount.count;
      bucket.ownerCounts[dailyCount.owner] = (bucket.ownerCounts[dailyCount.owner] ?? 0) + dailyCount.count;
    }
  } else {
    for (const artifact of artifacts) {
      const bucket = buckets.get(artifact.date);
      if (!bucket) continue;
      bucket.total += 1;
      bucket.ownerCounts[artifact.owner] = (bucket.ownerCounts[artifact.owner] ?? 0) + 1;
      if (artifact.kind === "프롬프트" || artifact.kind === "프롬프트+응답") bucket.prompts += 1;
      if (artifact.kind !== "프롬프트") bucket.outputs += 1;
    }
  }

  let cumulative = openingFiles;
  const points = [...buckets.values()].map((bucket) => {
    cumulative += bucket.total;
    return {
      ...bucket,
      label: shortDateLabel(bucket.date),
      cumulative,
    };
  });
  const activePoints = points.filter((point) => point.total > 0);
  const peakDay = activePoints.reduce<DriveArtifactDailyTrendPoint | null>(
    (peak, point) => (!peak || point.total > peak.total ? point : peak),
    null,
  );

  return {
    owners,
    points,
    openingFiles,
    activeDays: activePoints.length,
    peakDay,
    latestDay: activePoints[activePoints.length - 1] ?? null,
  };
}
