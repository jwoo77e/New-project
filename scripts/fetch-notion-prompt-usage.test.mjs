import { describe, expect, it } from "vitest";
import {
  buildNotionPromptUsageSnapshot,
  countGeneratedOutputs,
  discoverPromptRecordsFromRoot,
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

  it("collects rows when the configured root ID is a Notion data source", async () => {
    const state = createCollectorState();
    const records = await discoverPromptRecordsFromRoot(
      {
        async queryDataSource() {
          return [
            {
              object: "page",
              id: "11111111-1111-1111-1111-111111111111",
              properties: {
                Name: { type: "title", title: [{ plain_text: "Codex 자동 저장 테스트" }] },
                "생성 산출물": { type: "rich_text", rich_text: [{ plain_text: "스냅샷 JSON, 대시보드 카드" }] },
              },
            },
          ];
        },
        async retrieveDatabase() {
          throw new Error("not a database");
        },
        async queryDatabase() {
          throw new Error("not a legacy database");
        },
        async listBlockChildren() {
          return [];
        },
        async blockText() {
          return "프롬프트\nNotion 자동 수집 테스트";
        },
      },
      "37a32dfb494c802ea9dfea58a48dde04",
      state,
    );

    expect(records).toHaveLength(1);
    expect(records[0].title).toBe("Codex 자동 저장 테스트");
    expect(countGeneratedOutputs(records[0])).toBe(2);
    expect(state.sourceHints).toEqual(["data_source", "block_children"]);
  });

  it("collects rows when the configured root ID is a database with data sources", async () => {
    const state = createCollectorState();
    const records = await discoverPromptRecordsFromRoot(
      {
        async queryDataSource(dataSourceId) {
          if (String(dataSourceId).startsWith("22222222")) {
            return [
              {
                object: "page",
                id: "33333333-3333-3333-3333-333333333333",
                properties: {
                  Name: { type: "title", title: [{ plain_text: "Claude 자동화 기록" }] },
                  Output: { type: "rich_text", rich_text: [{ plain_text: "회의록, 보고서" }] },
                },
              },
            ];
          }
          throw new Error("not a data source");
        },
        async retrieveDatabase() {
          return {
            data_sources: [{ id: "22222222-2222-2222-2222-222222222222" }],
          };
        },
        async queryDatabase() {
          throw new Error("legacy database skipped");
        },
        async listBlockChildren() {
          return [];
        },
        async blockText() {
          return "";
        },
      },
      "37a32dfb494c806e9622cdadc1fa672e",
      state,
    );

    expect(records).toHaveLength(1);
    expect(records[0].title).toBe("Claude 자동화 기록");
    expect(countGeneratedOutputs(records[0])).toBe(2);
    expect(state.sourceHints).toEqual(["database:data_sources", "data_source", "block_children"]);
  });
});

function createCollectorState() {
  return {
    maxDepth: 6,
    visitedBlocks: new Set(),
    visitedRecords: new Set(),
    visitedDatabases: new Set(),
    visitedDataSources: new Set(),
    sourceHints: [],
  };
}
