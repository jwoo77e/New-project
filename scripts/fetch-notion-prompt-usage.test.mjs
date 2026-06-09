import { describe, expect, it } from "vitest";
import {
  buildNotionPromptUsageSnapshot,
  countGeneratedOutputs,
  parseSourcePages,
} from "./fetch-notion-prompt-usage.mjs";

describe("Notion prompt usage aggregation", () => {
  it("counts generated outputs from output-like properties", () => {
    const count = countGeneratedOutputs({
      title: "Codex 프롬프트 DB 테스트 업로드 실행",
      propertiesText: [
        {
          name: "생성 산출물",
          text: "대시보드 코드, 커밋 로그, 배포 확인",
        },
      ],
      blockText: "",
    });

    expect(count).toBe(3);
  });

  it("builds a serializable dashboard snapshot", () => {
    const snapshot = buildNotionPromptUsageSnapshot({
      collectedAt: new Date("2026-06-10T23:00:00.000Z"),
      sources: [
        {
          accountLabel: "김재우 프롬프트 DB",
          sourcePage: "Codex 프롬프트 DB",
          tool: "Codex",
          sourceUrl: "https://app.notion.com/p/37a32dfb494c802ea9dfea58a48dde04",
          promptRecords: 3,
          generatedOutputs: 5,
          outputBasis: "테스트",
          includedRecords: ["A", "B", "C"],
          note: "테스트",
        },
      ],
      templateRecordsExcluded: 1,
    });

    expect(snapshot.source.status).toBe("정상");
    expect(snapshot.source.period).toBe("2026-06-11");
    expect(snapshot.source.refreshSchedule).toBe("매일 08:00 KST");
    expect(snapshot.totalPromptRecords).toBe(3);
    expect(snapshot.totalGeneratedOutputs).toBe(5);
    expect(snapshot.templateRecordsExcluded).toBe(1);
  });

  it("normalizes configured Notion source page URLs", () => {
    const sources = parseSourcePages({
      NOTION_PROMPT_SOURCE_PAGES: JSON.stringify([
        {
          sourcePage: "테스트 DB",
          tool: "Codex",
          url: "https://app.notion.com/p/DB-37a32dfb494c802ea9dfea58a48dde04?source=copy_link",
        },
      ]),
    });

    expect(sources).toHaveLength(1);
    expect(sources[0].id).toBe("37a32dfb-494c-802e-a9df-ea58a48dde04");
    expect(sources[0].sourcePage).toBe("테스트 DB");
  });
});
