export type DriveArtifactTrendSnapshot = {
  version: 1;
  source: {
    name: string;
    status: "정상";
    collectedAt: string;
    generatedAt: string;
    period: string;
    schedule: string;
    note: string;
  };
  repositories: Array<{
    owner: string;
    folderId: string;
    folderUrl: string;
    artifacts: [];
    inventory: {
      fileCount: number;
      directFileCount: number;
      nestedFileCount: number;
      folderCount: number;
      maxDepth: number;
      metadataDateAnomalyCount: number;
      dailyCounts: Array<{ date: string; count: number }>;
    };
  }>;
  totals: {
    files: number;
    directFiles: number;
    nestedFiles: number;
    folders: number;
    metadataDateAnomalies: number;
  };
};

export function isDriveArtifactTrendSnapshot(value: unknown): value is DriveArtifactTrendSnapshot {
  if (!value || typeof value !== "object") return false;
  const snapshot = value as Partial<DriveArtifactTrendSnapshot>;
  if (snapshot.version !== 1 || snapshot.source?.status !== "정상") return false;
  if (!snapshot.source.period || !snapshot.source.generatedAt) return false;
  if (!Array.isArray(snapshot.repositories) || snapshot.repositories.length === 0) return false;
  if (!snapshot.totals || !Number.isFinite(snapshot.totals.files)) return false;

  let repositoryFiles = 0;
  for (const repository of snapshot.repositories) {
    if (!repository?.owner || !repository.inventory) return false;
    const inventory = repository.inventory;
    if (!Array.isArray(inventory.dailyCounts)) return false;
    if (
      !Number.isFinite(inventory.fileCount) ||
      !Number.isFinite(inventory.metadataDateAnomalyCount)
    ) {
      return false;
    }
    const datedFiles = inventory.dailyCounts.reduce((sum, item) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date) || !Number.isFinite(item.count)) {
        return Number.NaN;
      }
      return sum + item.count;
    }, 0);
    if (!Number.isFinite(datedFiles)) return false;
    if (datedFiles + inventory.metadataDateAnomalyCount !== inventory.fileCount) return false;
    repositoryFiles += inventory.fileCount;
  }

  return repositoryFiles === snapshot.totals.files;
}

export function selectPreferredDriveArtifactTrendSnapshot(
  current: DriveArtifactTrendSnapshot | null,
  candidate: DriveArtifactTrendSnapshot,
) {
  if (!current) return candidate;
  return Date.parse(candidate.source.generatedAt) > Date.parse(current.source.generatedAt)
    ? candidate
    : current;
}
