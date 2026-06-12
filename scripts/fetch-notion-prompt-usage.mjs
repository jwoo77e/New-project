import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = process.cwd();
const defaultSnapshotFileName = "notion-prompt-usage-snapshot.local.json";
const defaultAccountLabel = "김재우 프롬프트 DB";
const defaultSourcePages = [
  {
    accountLabel: defaultAccountLabel,
    sourcePage: "클로드 프롬프트 DB",
    tool: "Claude/Cowork",
    id: "37a32dfb494c806e9622cdadc1fa672e",
    sourceUrl: "https://app.notion.com/p/37a32dfb494c806e9622cdadc1fa672e",
  },
  {
    accountLabel: defaultAccountLabel,
    sourcePage: "Codex 프롬프트 DB",
    tool: "Codex",
    id: "37a32dfb494c802ea9dfea58a48dde04",
    sourceUrl: "https://app.notion.com/p/37a32dfb494c802ea9dfea58a48dde04",
  },
];

const fallbackSourceUsage = [
  {
    accountLabel: defaultAccountLabel,
    sourcePage: "클로드 프롬프트 DB",
    tool: "Claude/Cowork",
    sourceUrl: "https://app.notion.com/p/37a32dfb494c806e9622cdadc1fa672e",
    promptRecords: 2,
    generatedOutputs: 2,
    outputBasis: "이전 수동 분석 스냅샷 기준",
    includedRecords: [
      "2026-06-09 · Iris (IRIS 크롤러 정기실행)",
      "2026-06-09 · Aitrendv1 (2026 AI 트렌드·산업안전 적용)",
    ],
    note: "Notion API 연결 전까지 표시되는 마지막 확인값",
  },
  {
    accountLabel: defaultAccountLabel,
    sourcePage: "Codex 프롬프트 DB",
    tool: "Codex",
    sourceUrl: "https://app.notion.com/p/37a32dfb494c802ea9dfea58a48dde04",
    promptRecords: 3,
    generatedOutputs: 5,
    outputBasis: "이전 수동 분석 스냅샷 기준, 템플릿 행 제외",
    includedRecords: [
      "2026-06-09 Codex 프롬프트 DB 구축",
      "2026-06-09 Codex 프롬프트 DB 일일 저장 자동화 설정",
      "2026-06-09 Codex 프롬프트 DB 테스트 업로드 실행",
    ],
    note: "Notion API 연결 전까지 표시되는 마지막 확인값",
  },
];

export async function loadNotionPromptEnv({ targetRootDir = rootDir } = {}) {
  const localEnv = await readLocalEnv(path.join(targetRootDir, ".env.local"));
  const mergedEnv = {
    ...process.env,
    ...localEnv,
  };

  hydrateProcessEnv(localEnv);
  return mergedEnv;
}

export async function collectNotionPromptUsage({
  env = process.env,
  targetRootDir = rootDir,
  collectedAt = new Date(),
  mode = "Notion API 수집",
} = {}) {
  const token = env.NOTION_API_KEY || env.NOTION_TOKEN || "";
  const sources = parseSourcePages(env);

  if (!token) {
    return buildNotionPromptUsageSnapshot({
      collectedAt,
      status: "주의",
      note: "NOTION_API_KEY 또는 NOTION_TOKEN이 없어 이전 수동 분석값을 표시합니다.",
      sources: fallbackSourceUsage,
      templateRecordsExcluded: 1,
      mode,
    });
  }

  const notion = createNotionClient({
    token,
    notionVersion: env.NOTION_VERSION || "2022-06-28",
    dataSourceVersion: env.NOTION_DATA_SOURCE_VERSION || "2025-09-03",
  });

  const collectedSources = [];
  let templateRecordsExcluded = 0;

  for (const source of sources) {
    try {
      const sourceUsage = await collectPromptSourceUsage(notion, source, {
        maxDepth: parsePositiveInt(env.NOTION_PROMPT_MAX_DEPTH, 6),
        debug: env.NOTION_PROMPT_DEBUG === "1",
      });
      collectedSources.push(sourceUsage);
      templateRecordsExcluded += sourceUsage.templateRecordsExcluded;
    } catch (error) {
      collectedSources.push({
        ...emptySourceUsage(source),
        outputBasis: "Notion API 수집 실패",
        note: shortenError(error instanceof Error ? error.message : String(error)),
      });
    }
  }

  const hasLiveRows = collectedSources.some((source) => source.promptRecords > 0 || source.generatedOutputs > 0);

  if (!hasLiveRows && env.NOTION_PROMPT_FALLBACK !== "false") {
    return buildNotionPromptUsageSnapshot({
      collectedAt,
      status: "주의",
      note: "Notion API 연결은 되었지만 하위 페이지에서 집계 가능한 live 기록이 0건이라 이전 수동 분석값을 표시합니다.",
      sources: fallbackSourceUsage,
      templateRecordsExcluded: 1,
      mode,
    });
  }

  return buildNotionPromptUsageSnapshot({
    collectedAt,
    status: "정상",
    note: "Notion API로 김재우 프롬프트 DB 하위 2페이지를 자동 집계했습니다.",
    sources: collectedSources.map(({ templateRecordsExcluded: _excluded, ...source }) => source),
    templateRecordsExcluded,
    mode,
  });
}

export function buildNotionPromptUsageSnapshot({
  collectedAt = new Date(),
  status = "정상",
  note = "",
  sources = [],
  templateRecordsExcluded = 0,
  mode = "Notion API 수집",
} = {}) {
  const totalPromptRecords = sources.reduce((sum, source) => sum + numberValue(source.promptRecords), 0);
  const totalGeneratedOutputs = sources.reduce((sum, source) => sum + numberValue(source.generatedOutputs), 0);
  const period = formatDateKst(collectedAt);

  return {
    source: {
      name: "Notion 프롬프트 DB 자동 분석",
      collectedAt: collectedAt.toISOString(),
      period,
      accountLabel: defaultAccountLabel,
      status,
      note,
      mode,
      refreshSchedule: "매일 08:00 KST",
    },
    totalPromptRecords,
    totalGeneratedOutputs,
    templateRecordsExcluded,
    sources,
    insights: buildInsights({ sources, totalPromptRecords, totalGeneratedOutputs, status, note }),
  };
}

export async function writeNotionPromptUsageSnapshot(snapshot, env = process.env) {
  const outputPaths = getOutputPaths(env);

  for (const outputPath of outputPaths) {
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`);
  }

  return outputPaths;
}

export function parseSourcePages(env = process.env) {
  if (env.NOTION_PROMPT_SOURCE_PAGES) {
    try {
      const parsed = JSON.parse(env.NOTION_PROMPT_SOURCE_PAGES);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(normalizeSourcePage).filter((source) => source.id);
      }
    } catch {
      // Fall through to comma-separated parsing.
    }

    const pages = env.NOTION_PROMPT_SOURCE_PAGES.split(",")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry, index) =>
        normalizeSourcePage({
          ...defaultSourcePages[index],
          id: entry,
        }),
      )
      .filter((source) => source.id);

    if (pages.length > 0) return pages;
  }

  return defaultSourcePages.map(normalizeSourcePage);
}

export function countGeneratedOutputs({ title = "", propertiesText = [], blockText = "" } = {}) {
  const propertyCount = propertiesText
    .filter((item) => outputSignalPattern.test(item.name))
    .reduce((sum, item) => sum + countOutputItems(item.text), 0);

  if (propertyCount > 0) return propertyCount;

  const sectionLines = extractOutputSectionLines(blockText);
  const sectionCount = countOutputItems(sectionLines.join("\n"));
  if (sectionCount > 0) return sectionCount;

  const combined = `${title}\n${blockText}`;
  return outputSignalPattern.test(combined) ? 1 : 0;
}

const outputSignalPattern = /생성\s*(파일|산출물|결과)|산출물|결과물|output|artifact|deliverable/i;
const templatePattern = /템플릿|template/i;
const emptyOutputPattern = /^(없음|무|n\/a|na|null|none|-|미생성|없습니다)$/i;

async function collectPromptSourceUsage(notion, source, { maxDepth, debug = false }) {
  const state = {
    maxDepth,
    visitedBlocks: new Set(),
    visitedRecords: new Set(),
    visitedDatabases: new Set(),
    visitedDataSources: new Set(),
    sourceHints: [],
    warnings: [],
    debug,
  };
  const records = await discoverPromptRecordsFromRoot(notion, source.id, state);

  if (state.debug) {
    console.error(
      JSON.stringify({
        sourcePage: source.sourcePage,
        discoveredRecords: records.length,
        sourceHints: state.sourceHints,
        warnings: state.warnings.slice(0, 5),
      }),
    );
  }

  const includedRecords = [];
  let promptRecords = 0;
  let generatedOutputs = 0;
  let templateRecordsExcluded = 0;

  for (const record of records) {
    if (isTemplateRecord(record)) {
      templateRecordsExcluded += 1;
      continue;
    }

    promptRecords += 1;
    generatedOutputs += countGeneratedOutputs(record);
    includedRecords.push(record.title);
  }

  return {
    accountLabel: source.accountLabel,
    sourcePage: source.sourcePage,
    tool: source.tool,
    sourceUrl: source.sourceUrl,
    promptRecords,
    generatedOutputs,
    outputBasis:
      state.sourceHints.length > 0
        ? `Notion API ${[...new Set(state.sourceHints)].join("/")}의 생성 산출물 속성과 본문 기준`
        : "Notion API 하위 페이지/DB 행의 생성 산출물 속성과 본문 기준",
    includedRecords: includedRecords.slice(0, 12),
    note:
      includedRecords.length > 12
        ? `${includedRecords.length.toLocaleString("en-US")}건 중 최근 12건 표시`
        : "Notion API 자동 집계",
    templateRecordsExcluded,
  };
}

export async function discoverPromptRecordsFromRoot(notion, sourceId, state) {
  const records = [];

  records.push(...(await tryCollectDataSourceRecords(notion, sourceId, state)));
  records.push(...(await tryCollectDatabaseRecords(notion, sourceId, state)));
  records.push(...(await tryDiscoverBlockRecords(notion, sourceId, state)));

  return records;
}

async function discoverPromptRecords(notion, blockId, state, depth = 0) {
  if (depth > state.maxDepth || state.visitedBlocks.has(blockId)) return [];
  state.visitedBlocks.add(blockId);

  const blocks = await notion.listBlockChildren(blockId);
  if (state.debug && depth === 0) {
    console.error(
      JSON.stringify({
        blockId,
        depth,
        blockCount: blocks.length,
        blockTypes: blocks.slice(0, 5).map((block) => block.type),
      }),
    );
  }
  const records = [];

  for (const block of blocks) {
    if (block.type === "child_database") {
      records.push(...(await tryCollectDatabaseRecords(notion, block.id, state)));
      continue;
    }

    if (block.type === "child_page") {
      const record = await tryCollectPageRecord(notion, block.id, block.child_page?.title || "제목 없음", state);
      if (record) records.push(record);
      if (block.has_children) {
        records.push(...(await discoverPromptRecords(notion, block.id, state, depth + 1)));
      }
      continue;
    }

    if (block.has_children) {
      records.push(...(await discoverPromptRecords(notion, block.id, state, depth + 1)));
    }
  }

  return records;
}

async function collectDatabaseRecords(notion, databaseId, state) {
  const pages = await notion.queryDatabase(databaseId);
  const records = [];

  for (const page of pages) {
    const title = pageTitle(page) || "제목 없음";
    const record = await tryCollectPageRecord(notion, page.id, title, state, page.properties || {});
    if (record) records.push(record);
  }

  return records;
}

async function tryCollectDatabaseRecords(notion, databaseId, state) {
  const normalizedId = normalizeNotionId(databaseId);
  if (!normalizedId || state.visitedDatabases.has(normalizedId)) return [];
  state.visitedDatabases.add(normalizedId);

  const records = [];

  try {
    const database = await notion.retrieveDatabase(normalizedId);
    const dataSources = Array.isArray(database?.data_sources) ? database.data_sources : [];

    if (dataSources.length > 0) {
      state.sourceHints.push("database:data_sources");
      for (const dataSource of dataSources) {
        records.push(...(await tryCollectDataSourceRecords(notion, dataSource.id, state)));
      }
      return records;
    }
  } catch {
    // Some IDs are pages or data sources, not databases. Try the legacy query path next.
  }

  try {
    const records = await collectDatabaseRecords(notion, normalizedId, state);
    state.sourceHints.push("database");
    return records;
  } catch {
    return records;
  }
}

async function collectDataSourceRecords(notion, dataSourceId, state) {
  const pages = await notion.queryDataSource(dataSourceId);
  const records = [];

  for (const item of pages) {
    if (item.object === "page") {
      const title = pageTitle(item) || "제목 없음";
      const record = await tryCollectPageRecord(notion, item.id, title, state, item.properties || {});
      if (record) records.push(record);
      continue;
    }

    if (item.object === "database") {
      records.push(...(await tryCollectDatabaseRecords(notion, item.id, state)));
      continue;
    }

    if (item.object === "data_source") {
      records.push(...(await tryCollectDataSourceRecords(notion, item.id, state)));
    }
  }

  return records;
}

async function tryCollectDataSourceRecords(notion, dataSourceId, state) {
  const normalizedId = normalizeNotionId(dataSourceId);
  if (!normalizedId || state.visitedDataSources.has(normalizedId)) return [];
  state.visitedDataSources.add(normalizedId);

  try {
    const records = await collectDataSourceRecords(notion, normalizedId, state);
    state.sourceHints.push("data_source");
    return records;
  } catch {
    return [];
  }
}

async function tryDiscoverBlockRecords(notion, blockId, state) {
  try {
    const records = await discoverPromptRecords(notion, blockId, state);
    state.sourceHints.push("block_children");
    return records;
  } catch (error) {
    state.warnings?.push(`block_children: ${shortenError(error instanceof Error ? error.message : String(error))}`);
    return [];
  }
}

async function collectPageRecord(notion, pageId, title, state, properties = null) {
  if (state.visitedRecords.has(pageId)) return null;
  state.visitedRecords.add(pageId);

  const propertyEntries = properties
    ? Object.entries(properties).map(([name, property]) => ({
        name,
        text: propertyToPlainText(property),
      }))
    : [];
  const blockText = await notion.blockText(pageId, { maxDepth: state.maxDepth });

  return {
    id: pageId,
    title,
    propertiesText: propertyEntries,
    blockText,
  };
}

async function tryCollectPageRecord(notion, pageId, title, state, properties = null) {
  try {
    return await collectPageRecord(notion, pageId, title, state, properties);
  } catch (error) {
    state.warnings?.push(`${title}: ${shortenError(error instanceof Error ? error.message : String(error))}`);
    return {
      id: pageId,
      title,
      propertiesText: properties
        ? Object.entries(properties).map(([name, property]) => ({
            name,
            text: propertyToPlainText(property),
          }))
        : [],
      blockText: "",
    };
  }
}

function createNotionClient({ token, notionVersion, dataSourceVersion }) {
  async function request(endpoint, { method = "GET", body, version = notionVersion } = {}) {
    let response;

    try {
      response = await fetchWithRetry(`https://api.notion.com/v1${endpoint}`, {
        method,
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
          "notion-version": version,
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (error) {
      if (process.env.NOTION_PROMPT_DEBUG === "1") {
        console.error(
          JSON.stringify({
            endpoint,
            method,
            error: error instanceof Error ? error.message : String(error),
            cause: error instanceof Error && error.cause ? String(error.cause) : null,
          }),
        );
      }
      throw error;
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Notion API ${response.status}: ${shortenError(text || response.statusText)}`);
    }

    return response.json();
  }

  async function fetchWithRetry(url, options, attempts = 2) {
    let lastError;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        return await fetch(url, options);
      } catch (error) {
        lastError = error;
        if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
      }
    }

    throw lastError;
  }

  async function listPaginated(endpoint, body = null, options = {}) {
    const results = [];
    let cursor = null;

    do {
      const separator = endpoint.includes("?") ? "&" : "?";
      const data =
        body === null
          ? await request(`${endpoint}${separator}page_size=100${cursor ? `&start_cursor=${cursor}` : ""}`, options)
          : await request(endpoint, {
              ...options,
              method: "POST",
              body: {
                ...body,
                page_size: 100,
                ...(cursor ? { start_cursor: cursor } : {}),
              },
            });

      results.push(...(Array.isArray(data.results) ? data.results : []));
      cursor = data.has_more ? data.next_cursor : null;
    } while (cursor);

    return results;
  }

  async function blockText(blockId, { maxDepth = 6 } = {}, depth = 0, visited = new Set()) {
    if (depth > maxDepth || visited.has(blockId)) return "";
    visited.add(blockId);

    const blocks = await listBlockChildren(blockId);
    const lines = [];

    for (const block of blocks) {
      const text = blockPlainText(block);
      if (text) lines.push(text);

      if (block.has_children && block.type !== "child_database") {
        try {
          const childText = await blockText(block.id, { maxDepth }, depth + 1, visited);
          if (childText) lines.push(childText);
        } catch {
          // Keep the parent page usable even when an embedded child block is not readable.
        }
      }
    }

    return lines.join("\n");
  }

  const listBlockChildren = (blockId) => listPaginated(`/blocks/${normalizeNotionId(blockId)}/children`);

  return {
    listBlockChildren,
    queryDatabase: (databaseId) => listPaginated(`/databases/${normalizeNotionId(databaseId)}/query`, {}),
    queryDataSource: (dataSourceId) =>
      listPaginated(`/data_sources/${normalizeNotionId(dataSourceId)}/query`, {}, { version: dataSourceVersion }),
    retrieveDatabase: (databaseId) => request(`/databases/${normalizeNotionId(databaseId)}`, { version: dataSourceVersion }),
    retrieveDataSource: (dataSourceId) =>
      request(`/data_sources/${normalizeNotionId(dataSourceId)}`, { version: dataSourceVersion }),
    blockText,
  };
}

function propertyToPlainText(property) {
  if (!property || typeof property !== "object") return "";

  switch (property.type) {
    case "title":
    case "rich_text":
      return richTextPlain(property[property.type]);
    case "select":
    case "status":
      return property[property.type]?.name || "";
    case "multi_select":
      return (property.multi_select || []).map((item) => item.name).join(", ");
    case "date":
      return [property.date?.start, property.date?.end].filter(Boolean).join(" - ");
    case "files":
      return (property.files || []).map((file) => file.name || file.external?.url || file.file?.url || "").join(", ");
    case "url":
    case "email":
    case "phone_number":
      return property[property.type] || "";
    case "number":
      return typeof property.number === "number" ? String(property.number) : "";
    case "checkbox":
      return property.checkbox ? "true" : "false";
    case "people":
      return (property.people || []).map((person) => person.name || person.id).join(", ");
    case "relation":
      return (property.relation || []).map((relation) => relation.id).join(", ");
    case "formula":
      return propertyToPlainText(property.formula);
    case "rollup":
      return propertyToPlainText(property.rollup);
    case "created_time":
    case "last_edited_time":
      return property[property.type] || "";
    case "created_by":
    case "last_edited_by":
      return property[property.type]?.name || property[property.type]?.id || "";
    case "unique_id":
      return `${property.unique_id?.prefix || ""}${property.unique_id?.number ?? ""}`;
    default:
      return "";
  }
}

function blockPlainText(block) {
  if (!block || typeof block !== "object") return "";
  const value = block[block.type];

  if (block.type === "child_page") return value?.title || "";
  if (block.type === "child_database") return value?.title || "";
  if (Array.isArray(value?.rich_text)) return richTextPlain(value.rich_text);
  if (Array.isArray(value?.caption)) return richTextPlain(value.caption);
  if (block.type === "to_do") return `${value?.checked ? "[x]" : "[ ]"} ${richTextPlain(value?.rich_text || [])}`;
  if (block.type === "image" || block.type === "file" || block.type === "pdf" || block.type === "video") {
    return value?.name || value?.external?.url || value?.file?.url || "";
  }

  return "";
}

function pageTitle(page) {
  const titleProperty = Object.values(page.properties || {}).find((property) => property.type === "title");
  return titleProperty ? richTextPlain(titleProperty.title) : "";
}

function richTextPlain(items = []) {
  return items.map((item) => item.plain_text || item.text?.content || "").join("").trim();
}

function extractOutputSectionLines(text) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const sectionLines = [];
  let inOutputSection = false;

  for (const line of lines) {
    if (outputSignalPattern.test(line)) {
      inOutputSection = true;
      sectionLines.push(line);
      continue;
    }

    if (inOutputSection && /^(프롬프트|질문|메모|참고|일정|상태|링크|prompt|note|status)\b/i.test(line)) {
      break;
    }

    if (inOutputSection) sectionLines.push(line);
  }

  return sectionLines;
}

function countOutputItems(text) {
  const normalized = String(text || "")
    .replace(/\u00a0/g, " ")
    .split(/\r?\n|[,;]| · |\|/)
    .map((item) => item.replace(/^[-*•\d.)\s]+/, "").trim())
    .filter(Boolean)
    .filter((item) => !emptyOutputPattern.test(item))
    .filter((item) => !/^(생성\s*(파일|산출물|결과)|산출물|결과물|output|artifact|deliverable)$/i.test(item));

  return normalized.length;
}

function buildInsights({ sources, totalPromptRecords, totalGeneratedOutputs, status, note }) {
  const sourceSummary = sources
    .map((source) => `${source.sourcePage} ${source.promptRecords}건/${source.generatedOutputs}개`)
    .join(", ");

  return [
    `Notion 계정 기준으로 ${defaultAccountLabel} 아래 ${sources.length.toLocaleString("en-US")}개 원천 페이지를 매일 08:00 KST에 자동 집계합니다.`,
    `현재 프롬프트 기록은 총 ${totalPromptRecords.toLocaleString("en-US")}건, 생성 산출물은 총 ${totalGeneratedOutputs.toLocaleString("en-US")}개입니다.`,
    sourceSummary ? `페이지별 집계는 ${sourceSummary}입니다.` : `현재 집계 가능한 Notion 원천 페이지가 없습니다.`,
    status === "정상" ? "실제 첨부 파일 수는 지표에서 제외하고, 생성 산출물 기록만 반영합니다." : note,
  ].filter(Boolean);
}

function emptySourceUsage(source) {
  return {
    accountLabel: source.accountLabel,
    sourcePage: source.sourcePage,
    tool: source.tool,
    sourceUrl: source.sourceUrl,
    promptRecords: 0,
    generatedOutputs: 0,
    outputBasis: "Notion API 하위 페이지/DB 행 기준",
    includedRecords: [],
    note: "집계 대상 없음",
    templateRecordsExcluded: 0,
  };
}

function normalizeSourcePage(source = {}) {
  const id = normalizeNotionId(source.id || source.pageId || source.url || source.sourceUrl || "");
  return {
    accountLabel: source.accountLabel || defaultAccountLabel,
    sourcePage: source.sourcePage || source.name || "Notion 프롬프트 DB",
    tool: source.tool || "AI",
    id,
    sourceUrl: source.sourceUrl || source.url || (id ? `https://app.notion.com/p/${id.replaceAll("-", "")}` : ""),
  };
}

function normalizeNotionId(value) {
  const text = String(value || "");
  const segments = text.split(/[/?#&=]/).filter(Boolean);

  for (const segment of segments.reverse()) {
    const compact = segment.replaceAll("-", "");
    if (compact.length < 32) continue;

    const tail = compact.slice(-32);
    if (/^[0-9a-f]{32}$/i.test(tail)) {
      return formatNotionId(tail);
    }
  }

  const compact = text.replaceAll("-", "");
  const candidates = [];
  for (let index = 0; index <= compact.length - 32; index += 1) {
    const candidate = compact.slice(index, index + 32);
    if (/^[0-9a-f]{32}$/i.test(candidate)) candidates.push(candidate);
  }

  const raw = candidates.at(-1);
  if (!raw) return "";
  return formatNotionId(raw);
}

function formatNotionId(value) {
  const raw = value.toLowerCase();
  return `${raw.slice(0, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}-${raw.slice(16, 20)}-${raw.slice(20)}`;
}

function isTemplateRecord(record) {
  return templatePattern.test(record.title) || record.propertiesText.some((item) => templatePattern.test(`${item.name} ${item.text}`));
}

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value || ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function numberValue(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function formatDateKst(date) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function shortenError(message) {
  return String(message || "").replace(/\s+/g, " ").slice(0, 220);
}

async function readLocalEnv(filePath) {
  if (!existsSync(filePath)) return {};

  const text = await readFile(filePath, "utf8");
  const entries = {};

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const index = trimmed.indexOf("=");
    if (index < 0) continue;

    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
    entries[key] = value;
  }

  return entries;
}

function hydrateProcessEnv(entries) {
  for (const [key, value] of Object.entries(entries)) {
    if (!(key in process.env) || process.env[key] !== value) {
      process.env[key] = value;
    }
  }
}

function getOutputPaths(env) {
  const paths = [path.join(rootDir, "public", defaultSnapshotFileName)];

  if (existsSync(path.join(rootDir, "dist"))) {
    paths.push(path.join(rootDir, "dist", defaultSnapshotFileName));
  }

  if (env.NOTION_PROMPT_USAGE_OUTPUT_PATH) {
    paths.push(path.resolve(rootDir, env.NOTION_PROMPT_USAGE_OUTPUT_PATH));
  }

  return [...new Set(paths)];
}

async function runCli() {
  const env = await loadNotionPromptEnv({ targetRootDir: rootDir });
  const snapshot = await collectNotionPromptUsage({
    env,
    targetRootDir: rootDir,
    collectedAt: new Date(),
  });
  const outputPaths = await writeNotionPromptUsageSnapshot(snapshot, env);

  console.log(`Wrote ${outputPaths.map((outputPath) => path.relative(rootDir, outputPath)).join(", ")}`);
  console.log(
    `Notion prompt usage: ${snapshot.source.status} · ${snapshot.totalPromptRecords.toLocaleString("en-US")} prompts · ${snapshot.totalGeneratedOutputs.toLocaleString("en-US")} outputs · ${snapshot.source.note}`,
  );
}

const isCli = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isCli) {
  runCli().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
