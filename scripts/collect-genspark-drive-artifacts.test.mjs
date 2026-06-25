import { describe, expect, it } from "vitest";
import {
  buildGensparkDriveSnapshot,
  inferUsagePurpose,
  parseGensparkSessionSummary,
} from "./collect-genspark-drive-artifacts.mjs";

const summaryMarkdown = `# Genspark 세션 사용 내역 요약

- 계정: riskzero.marketing@gmail.com (리스크제로_마케팅, Pro)
- 추출일: 2026-06-25
- 총 세션 수: 230건
- 기간: 2025-12-17 ~ 2026-06-24

## 유형별

| 유형 | 건수 |
|---|---|
| AI채팅 | 78 |
| AI슬라이드 | 76 |
| AI문서 | 27 |

## 상태별

| 상태 | 건수 |
|---|---|
| FINISHED | 221 |
| FAILURE | 5 |
| PENDING_FOR_ASYNC | 4 |

## 월별

| 월 | 건수 |
|---|---|
| 2026-06 | 48 |
| 2026-05 | 31 |
`;

describe("collect-genspark-drive-artifacts", () => {
  it("parses the Genspark session summary markdown", () => {
    const summary = parseGensparkSessionSummary(summaryMarkdown);

    expect(summary.totalSessions).toBe(230);
    expect(summary.period).toBe("2025-12-17 ~ 2026-06-24");
    expect(summary.typeBreakdown[0]).toMatchObject({ label: "AI채팅", count: 78 });
    expect(summary.statusBreakdown).toContainEqual({ label: "FAILURE", count: 5 });
    expect(summary.monthlyBreakdown).toContainEqual({ label: "2026-06", count: 48 });
  });

  it("infers business usage purpose from Drive file names", () => {
    expect(inferUsagePurpose("riskzero_safety_proposal_v2_20260428011834.pptx")).toBe("스마트 안전관리 제안/영업");
    expect(inferUsagePurpose("RiskZero_영업대시보드_개선.html")).toBe("대시보드·CRM");
    expect(inferUsagePurpose("FP_산정_내역_Genspark_AI_Sheets.xlsx")).toBe("데이터·시트 산출");
    expect(inferUsagePurpose("20260610 혁신 과제 논의 회의록 생성 요청.pdf")).toBe("회의록·통화 정리");
  });

  it("builds a snapshot from Drive file metadata", () => {
    const snapshot = buildGensparkDriveSnapshot({
      collectedAt: new Date("2026-06-25T02:40:00Z"),
      summaryText: summaryMarkdown,
      files: [
        {
          id: "a",
          name: "riskzero_safety_proposal_v2_20260428011834.pptx",
          mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          size: "1000",
          createdTime: "2026-06-25T02:34:38.526Z",
          modifiedTime: "2026-06-25T02:18:58.000Z",
          webViewLink: "https://example.com/a",
        },
        {
          id: "b",
          name: "genspark_sessions_요약_20260625.md",
          mimeType: "text/markdown",
          size: "767",
          createdTime: "2026-06-25T01:14:45.726Z",
          modifiedTime: "2026-06-25T01:14:45.726Z",
          webViewLink: "https://example.com/b",
        },
      ],
    });

    expect(snapshot.totals.files).toBe(2);
    expect(snapshot.totals.sessions).toBe(230);
    expect(snapshot.totals.finishedSessions).toBe(221);
    expect(snapshot.fileTypeBreakdown.map((item) => item.label)).toEqual(["Markdown", "PPTX"]);
    expect(snapshot.purposeBreakdown.map((item) => item.label)).toContain("스마트 안전관리 제안/영업");
  });
});
