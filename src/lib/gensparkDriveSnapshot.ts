import type { GensparkDriveAnalysis } from "../data/gensparkUsageData";

export type GensparkDriveSnapshot = GensparkDriveAnalysis & {
  version: 1;
  individualArtifacts: number;
  archiveFiles: number;
  newArtifacts: number;
  source: GensparkDriveAnalysis["source"] & {
    generatedAt: string;
    status: "정상";
    schedule: string;
    mode: string;
  };
  inventory: {
    scannedFiles: number;
    scannedFolders: number;
    nestedFolders: number;
    maxDepth: number;
    summaryFileId: string;
    summaryFileName: string;
    individualArtifacts: number;
    archiveFiles: number;
    newArtifacts: number;
    totalSizeBytes: number;
  };
};

export function isGensparkDriveSnapshot(value: unknown): value is GensparkDriveSnapshot {
  if (!value || typeof value !== "object") return false;
  const snapshot = value as Partial<GensparkDriveSnapshot>;
  if (snapshot.version !== 1 || snapshot.source?.status !== "정상") return false;
  if (!snapshot.source.generatedAt || !snapshot.source.period || !snapshot.source.schedule) {
    return false;
  }
  if (!Number.isFinite(snapshot.totalFiles) || (snapshot.totalFiles ?? 0) <= 0) return false;
  if (
    !Number.isFinite(snapshot.individualArtifacts) ||
    (snapshot.individualArtifacts ?? 0) <= 0 ||
    !Number.isFinite(snapshot.archiveFiles) ||
    snapshot.individualArtifacts! + snapshot.archiveFiles! !== snapshot.totalFiles
  ) {
    return false;
  }
  if (!Array.isArray(snapshot.typeBreakdown) || snapshot.typeBreakdown.length === 0) return false;
  if (!Array.isArray(snapshot.projectBreakdown) || snapshot.projectBreakdown.length === 0) {
    return false;
  }
  if (!Array.isArray(snapshot.representativeFiles) || !Array.isArray(snapshot.insights)) {
    return false;
  }
  if (
    !Number.isFinite(snapshot.inventory?.scannedFiles) ||
    (snapshot.inventory?.scannedFiles ?? 0) <= 0 ||
    !Number.isFinite(snapshot.inventory?.scannedFolders)
  ) {
    return false;
  }

  const typeTotal = snapshot.typeBreakdown.reduce((sum, item) => sum + item.tasks, 0);
  const projectTotal = snapshot.projectBreakdown.reduce((sum, item) => sum + item.tasks, 0);
  return typeTotal === snapshot.totalFiles && projectTotal === snapshot.totalFiles;
}

export function selectPreferredGensparkDriveSnapshot(
  current: GensparkDriveSnapshot | null,
  candidate: GensparkDriveSnapshot,
) {
  if (!current) return candidate;
  return Date.parse(candidate.source.generatedAt) > Date.parse(current.source.generatedAt)
    ? candidate
    : current;
}
