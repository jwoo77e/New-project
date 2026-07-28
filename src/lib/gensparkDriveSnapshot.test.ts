import { describe, expect, it } from "vitest";
import {
  isGensparkDriveSnapshot,
  selectPreferredGensparkDriveSnapshot,
  type GensparkDriveSnapshot,
} from "./gensparkDriveSnapshot";

function snapshot(generatedAt: string): GensparkDriveSnapshot {
  return {
    version: 1,
    source: {
      name: "Genspark Drive",
      folderUrl: "https://drive.google.com/drive/folders/test",
      collectedAt: "2026-07-28 22:00 KST",
      generatedAt,
      period: "2026-07-01 ~ 2026-07-28",
      accountLabel: "Genspark",
      status: "정상",
      schedule: "매일 22:00 KST",
      mode: "재귀 조회",
      note: "검증",
    },
    totalFiles: 3,
    individualArtifacts: 3,
    archiveFiles: 0,
    newArtifacts: 1,
    projectCount: 2,
    folderCount: 1,
    rootFileCount: 1,
    totalSizeLabel: "1.0 MB",
    latestOutputDate: "2026-07-28",
    directFileSignal: "재귀 조회",
    typeBreakdown: [
      { name: "PPTX", tasks: 2, share: 66.7, note: "슬라이드", color: "#123456" },
      { name: "DOCX", tasks: 1, share: 33.3, note: "문서", color: "#654321" },
    ],
    projectBreakdown: [
      { name: "AI Slides", tasks: 2, share: 66.7, note: "슬라이드", color: "#123456" },
      { name: "루트 파일", tasks: 1, share: 33.3, note: "루트", color: "#654321" },
    ],
    representativeFiles: [],
    insights: ["검증"],
    inventory: {
      scannedFiles: 4,
      scannedFolders: 2,
      nestedFolders: 1,
      maxDepth: 1,
      summaryFileId: "summary",
      summaryFileName: "genspark_sessions_요약.md",
      individualArtifacts: 3,
      archiveFiles: 0,
      newArtifacts: 1,
      totalSizeBytes: 1024,
    },
  };
}

describe("Genspark Drive snapshot", () => {
  it("validates reconciled type and project totals", () => {
    expect(isGensparkDriveSnapshot(snapshot("2026-07-28T13:00:00.000Z"))).toBe(true);
  });

  it("rejects partial or unreconciled snapshots", () => {
    const invalid = snapshot("2026-07-28T13:00:00.000Z");
    invalid.typeBreakdown[0].tasks = 1;
    expect(isGensparkDriveSnapshot(invalid)).toBe(false);
  });

  it("keeps the newest verified snapshot", () => {
    const older = snapshot("2026-07-27T13:00:00.000Z");
    const newer = snapshot("2026-07-28T13:00:00.000Z");
    expect(selectPreferredGensparkDriveSnapshot(older, newer)).toBe(newer);
    expect(selectPreferredGensparkDriveSnapshot(newer, older)).toBe(newer);
  });
});
