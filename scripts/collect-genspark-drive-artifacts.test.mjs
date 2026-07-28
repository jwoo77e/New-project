import { describe, expect, it } from "vitest";
import {
  buildGensparkDriveSnapshot,
  inferUsagePurpose,
  parseGensparkDriveSummary,
} from "./collect-genspark-drive-artifacts.mjs";

const summaryMarkdown = `# Genspark AI 드라이브 정리 요약 (20260728)

## 개요

| 항목 | 값 |
|---|---|
| 총 파일 수 | 5 |
| 개별 산출물(zip 제외) | 4 |
| 대용량 아카이브(zip) | 1 |
| 총 용량 | 10.5 MB |
| **이번 신규 동기화(개별)** | **2** |

## 유형별 개수

| 유형 | 개수 |
|---|---|
| pptx | 3 |
| docx | 1 |
| zip | 1 |

## 프로젝트/폴더별 산출물

| 폴더 | 파일수 | 용량(MB) |
|---|---|---|
| /Genspark/AI Slides | 3 | 8.0 |
| /Genspark/AI Docs | 1 | 0.5 |
| / | 1 | 2.0 |

## 이번 동기화 신규 산출물 (2건)

| 파일명 | 수정일 | 유형 | 크기(MB) |
|---|---|---|---|
| proposal_20260727054208.pptx | 2026-07-27 | pptx | 0.28 |
| meeting.docx | 2026-07-27 | docx | 0.05 |
`;

describe("collect-genspark-drive-artifacts", () => {
  it("parses the latest Drive summary and reconciles totals", () => {
    const summary = parseGensparkDriveSummary(summaryMarkdown);

    expect(summary.totalFiles).toBe(5);
    expect(summary.individualArtifacts).toBe(4);
    expect(summary.archiveFiles).toBe(1);
    expect(summary.newArtifacts).toBe(2);
    expect(summary.typeBreakdown).toContainEqual({ name: "pptx", count: 3 });
    expect(summary.projectBreakdown).toContainEqual({
      name: "/Genspark/AI Slides",
      count: 3,
    });
    expect(summary.latestOutputDate).toBe("2026-07-27");
  });

  it("infers business usage purpose from Drive file names", () => {
    expect(inferUsagePurpose("riskzero_safety_proposal_v2_20260428011834.pptx")).toBe(
      "스마트 안전관리 제안/영업",
    );
    expect(inferUsagePurpose("RiskZero_영업대시보드_개선.html")).toBe(
      "대시보드·CRM",
    );
    expect(inferUsagePurpose("FP_산정_내역_Genspark_AI_Sheets.xlsx")).toBe(
      "데이터·시트 산출",
    );
    expect(inferUsagePurpose("20260610 혁신 과제 논의 회의록 생성 요청.pdf")).toBe(
      "회의록·통화 정리",
    );
  });

  it("builds a validated deployable snapshot from a complete recursive scan", () => {
    const snapshot = buildGensparkDriveSnapshot({
      collectedAt: new Date("2026-07-28T13:00:00Z"),
      summaryText: summaryMarkdown,
      summaryFile: {
        id: "summary",
        name: "genspark_sessions_요약_20260728.md",
      },
      scan: {
        folderId: "root",
        folderUrl: "https://drive.google.com/drive/folders/root",
        folderCount: 2,
        maxDepth: 2,
        scannedFolders: 3,
        files: [
          {
            id: "a",
            name: "riskzero_safety_proposal_v2_20260727011834.pptx",
            mimeType:
              "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            size: "1000",
            createdTime: "2026-07-28T02:34:38.526Z",
            modifiedTime: "2026-07-28T02:18:58.000Z",
            webViewLink: "https://example.com/a",
            depth: 1,
            folderPath: "/Genspark/AI Slides",
            topProject: "Genspark",
          },
          {
            id: "summary",
            name: "genspark_sessions_요약_20260728.md",
            mimeType: "text/markdown",
            size: "767",
            createdTime: "2026-07-28T01:14:45.726Z",
            modifiedTime: "2026-07-28T01:14:45.726Z",
            webViewLink: "https://example.com/summary",
            depth: 0,
            folderPath: "/",
            topProject: "루트 파일",
          },
        ],
      },
    });

    expect(snapshot.totalFiles).toBe(5);
    expect(snapshot.individualArtifacts).toBe(4);
    expect(snapshot.archiveFiles).toBe(1);
    expect(snapshot.typeBreakdown.reduce((sum, item) => sum + item.tasks, 0)).toBe(5);
    expect(snapshot.projectBreakdown.reduce((sum, item) => sum + item.tasks, 0)).toBe(5);
    expect(snapshot.latestOutputDate).toBe("2026-07-27");
    expect(snapshot.inventory).toMatchObject({
      scannedFiles: 2,
      scannedFolders: 3,
      newArtifacts: 2,
    });
  });
});
