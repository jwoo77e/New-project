import { describe, expect, it } from "vitest";
import {
  buildDriveArtifactTrendSnapshot,
  isDriveArtifactTrendSnapshot,
} from "./collect-drive-artifact-trend.mjs";

describe("collect-drive-artifact-trend", () => {
  it("groups recursively discovered files by KST creation date", () => {
    const snapshot = buildDriveArtifactTrendSnapshot({
      collectedAt: new Date("2026-07-27T12:00:00.000Z"),
      repositoryScans: [
        {
          owner: "김재우",
          folderId: "jaewoo",
          folderUrl: "https://drive.google.com/jaewoo",
          folderCount: 2,
          maxDepth: 2,
          files: [
            {
              id: "1",
              name: "root.md",
              createdTime: "2026-07-26T16:00:00.000Z",
              depth: 0,
            },
            {
              id: "2",
              name: "nested.md",
              createdTime: "2026-07-27T14:59:59.000Z",
              depth: 2,
            },
          ],
        },
        {
          owner: "이형배",
          folderId: "hyungbae",
          folderUrl: "https://drive.google.com/hyungbae",
          folderCount: 1,
          maxDepth: 1,
          files: [
            {
              id: "3",
              name: "legacy.md",
              createdTime: "1980-01-01T00:00:00.000Z",
              depth: 1,
            },
          ],
        },
      ],
    });

    expect(snapshot.source.period).toBe("2026-07-27 ~ 2026-07-27");
    expect(snapshot.repositories[0].inventory.dailyCounts).toEqual([
      { date: "2026-07-27", count: 2 },
    ]);
    expect(snapshot.repositories[1].inventory.metadataDateAnomalyCount).toBe(1);
    expect(snapshot.totals).toEqual({
      files: 3,
      directFiles: 1,
      nestedFiles: 2,
      folders: 3,
      metadataDateAnomalies: 1,
    });
    expect(isDriveArtifactTrendSnapshot(snapshot)).toBe(true);
  });

  it("rejects snapshots whose daily counts do not reconcile", () => {
    const invalidSnapshot = {
      version: 1,
      source: {
        status: "정상",
      },
      repositories: [
        {
          owner: "김재우",
          inventory: {
            fileCount: 2,
            metadataDateAnomalyCount: 0,
            dailyCounts: [{ date: "2026-07-27", count: 1 }],
          },
        },
      ],
      totals: { files: 2 },
    };

    expect(isDriveArtifactTrendSnapshot(invalidSnapshot)).toBe(false);
  });
});
