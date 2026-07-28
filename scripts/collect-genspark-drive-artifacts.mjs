import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  formatKoreanTimestamp,
  getGoogleAccessToken,
  getJson,
  readLocalEnv,
} from "./collect-drive-zip-artifacts.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const folderMimeType = "application/vnd.google-apps.folder";
const defaultFolderId = "1MFJpVf9QfLNbzwLIE27N3b9yua9uYsa2";
const defaultFolderUrl = `https://drive.google.com/drive/folders/${defaultFolderId}`;
const defaultOutputPath = path.join(
  rootDir,
  "public",
  "genspark-drive-artifacts-snapshot.json",
);

const palette = [
  "#2f8f46",
  "#0f8b8d",
  "#c58612",
  "#7d6ca7",
  "#5f6f8c",
  "#e85d4f",
  "#9a6b36",
  "#6b8f71",
];

const typeNotes = {
  PPTX: "제안서, 발표자료, 비교 분석 보고서",
  PNG: "슬라이드·제안서용 시각자료",
  DOCX: "제안서, 보고서, 회의록, 운영 문서",
  ZIP: "대용량 폴더 내보내기 아카이브",
  XLSX: "사업금액·기능점수·데이터 산출",
  PDF: "제안서와 검토 보고서",
  HTML: "영업 대시보드·웹 산출물",
  CSV: "세션·데이터 목록",
  MARKDOWN: "수집·사용 현황 요약",
};

export async function collectGensparkDriveArtifacts({
  folderUrl = defaultFolderUrl,
  collectedAt = new Date(),
  env = process.env,
} = {}) {
  const folderId = extractDriveFolderId(folderUrl);
  const accessToken = await getGoogleAccessToken(env, {
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
  const scan = await scanGensparkDriveFolder({
    folderId,
    folderUrl,
    accessToken,
  });
  const summaryFile = [...scan.files]
    .filter((file) => /genspark_sessions_요약/i.test(file.name))
    .sort((left, right) =>
      (right.modifiedTime ?? "").localeCompare(left.modifiedTime ?? ""),
    )[0];
  const summaryText = summaryFile
    ? await fetchDriveTextFile({ file: summaryFile, accessToken })
    : "";

  return buildGensparkDriveSnapshot({
    scan,
    folderUrl,
    summaryText,
    summaryFile,
    collectedAt,
  });
}

export async function scanGensparkDriveFolder({
  folderId,
  folderUrl = defaultFolderUrl,
  accessToken,
}) {
  const queue = [{ id: folderId, path: "/", depth: 0, topProject: "루트 파일" }];
  const seenFolderIds = new Set();
  const files = [];
  let folderCount = 0;
  let maxDepth = 0;

  while (queue.length > 0) {
    const folder = queue.shift();
    if (!folder || seenFolderIds.has(folder.id)) continue;
    seenFolderIds.add(folder.id);

    const children = await listDriveFolderChildren({
      folderId: folder.id,
      folderPath: folder.path,
      accessToken,
    });

    for (const child of children) {
      if (child.mimeType === folderMimeType) {
        folderCount += 1;
        maxDepth = Math.max(maxDepth, folder.depth + 1);
        queue.push({
          id: child.id,
          path: folder.path === "/" ? `/${child.name}` : `${folder.path}/${child.name}`,
          depth: folder.depth + 1,
          topProject: folder.depth === 0 ? child.name : folder.topProject,
        });
        continue;
      }

      files.push({
        ...child,
        depth: folder.depth,
        folderPath: folder.path,
        topProject: folder.topProject,
      });
    }
  }

  return {
    folderId,
    folderUrl,
    files,
    folderCount,
    maxDepth,
    scannedFolders: seenFolderIds.size,
  };
}

export function buildGensparkDriveSnapshot({
  scan,
  folderUrl = defaultFolderUrl,
  summaryText = "",
  summaryFile = null,
  collectedAt = new Date(),
}) {
  const summary = parseGensparkDriveSummary(summaryText);
  const artifactFiles = scan.files
    .filter((file) => !/genspark_sessions_요약/i.test(file.name))
    .map(analyzeFile);
  const dates = artifactFiles
    .map((file) => inferArtifactDate(file.title, file.modifiedAt))
    .filter(Boolean)
    .sort();
  const summaryTotal = summary.totalFiles > 0 ? summary.totalFiles : artifactFiles.length;
  const typeBreakdown =
    summary.typeBreakdown.length > 0
      ? toUsageBreakdown(summary.typeBreakdown, summaryTotal, (name) => ({
          name: name.toUpperCase(),
          note: typeNotes[name.toUpperCase()] ?? "기타 Genspark 산출물",
        }))
      : buildFileTypeBreakdown(artifactFiles);
  const projectBreakdown =
    summary.projectBreakdown.length > 0
      ? toUsageBreakdown(summary.projectBreakdown, summaryTotal, (name) => ({
          name: normalizeProjectName(name),
          note: projectNote(name),
        }))
      : buildProjectBreakdown(artifactFiles);
  const rootProject = summary.projectBreakdown.find((item) => item.name.trim() === "/");
  const latestOutputDate =
    summary.latestOutputDate || dates.at(-1) || toKstDateKey(collectedAt.toISOString());
  const periodStart = dates[0] || latestOutputDate;
  const totalSizeBytes =
    summary.totalSizeMb > 0
      ? Math.round(summary.totalSizeMb * 1024 * 1024)
      : artifactFiles.reduce((sum, file) => sum + file.sizeBytes, 0);
  const representativeFiles = pickRepresentativeFiles(artifactFiles);

  const snapshot = {
    version: 1,
    source: {
      name: "Genspark AI Drive 산출물 분석",
      folderUrl,
      collectedAt: formatKoreanTimestamp(collectedAt),
      generatedAt: collectedAt.toISOString(),
      period: `${periodStart} ~ ${latestOutputDate}`,
      accountLabel: "Genspark AI Drive · riskzero.marketing@gmail.com",
      status: "정상",
      schedule: "매일 22:00 KST",
      mode: summaryText
        ? "Drive 전체 하위 폴더 재귀 조회 + 최신 요약 분석"
        : "Drive 전체 하위 폴더 재귀 조회",
      note:
        "Genspark Drive 루트와 모든 하위 폴더를 읽기 전용으로 재귀 조회하고 최신 요약 파일의 유형·프로젝트 집계와 실제 Drive 파일 메타데이터를 함께 검증합니다.",
    },
    totalFiles: summaryTotal,
    individualArtifacts: summary.individualArtifacts || summaryTotal,
    archiveFiles: summary.archiveFiles,
    newArtifacts: summary.newArtifacts,
    projectCount: projectBreakdown.length,
    folderCount:
      summary.projectBreakdown.length > 0
        ? summary.projectBreakdown.filter((item) => item.name.trim() !== "/").length
        : scan.folderCount,
    rootFileCount: rootProject?.count ?? artifactFiles.filter((file) => file.depth === 0).length,
    totalSizeLabel: formatFileSize(totalSizeBytes),
    latestOutputDate,
    directFileSignal: `루트 포함 ${scan.scannedFolders}개 폴더를 재귀 조회해 Drive 파일 ${scan.files.length}개를 확인하고 최신 요약 ${summaryFile?.name ?? "미확인"}을 대조`,
    typeBreakdown,
    projectBreakdown,
    representativeFiles,
    insights: buildInsights({
      summary,
      summaryTotal,
      typeBreakdown,
      projectBreakdown,
      latestOutputDate,
      scan,
    }),
    inventory: {
      scannedFiles: scan.files.length,
      scannedFolders: scan.scannedFolders,
      nestedFolders: scan.folderCount,
      maxDepth: scan.maxDepth,
      summaryFileId: summaryFile?.id ?? "",
      summaryFileName: summaryFile?.name ?? "",
      individualArtifacts: summary.individualArtifacts,
      archiveFiles: summary.archiveFiles,
      newArtifacts: summary.newArtifacts,
      totalSizeBytes,
    },
  };

  if (!isGensparkDriveSnapshot(snapshot)) {
    throw new Error("Genspark Drive 스냅샷 검증에 실패했습니다.");
  }
  return snapshot;
}

export function parseGensparkDriveSummary(text) {
  const overview = parseMarkdownKeyValueTable(text, "개요");
  const typeRows = parseMarkdownTable(text, "유형별 개수");
  const projectRows = parseMarkdownTable(text, "프로젝트/폴더별 산출물");
  const newRows = parseMarkdownTable(text, "이번 동기화 신규 산출물");
  const totalFiles = parseCount(overview.get("총 파일 수"));

  return {
    totalFiles,
    individualArtifacts: parseCount(
      overview.get("개별 산출물(zip 제외)") ?? overview.get("개별 산출물"),
    ),
    archiveFiles: parseCount(
      overview.get("대용량 아카이브(zip)") ?? overview.get("대용량 아카이브"),
    ),
    totalSizeMb: parseNumber(overview.get("총 용량")),
    newArtifacts: parseCount(
      overview.get("이번 신규 동기화(개별)") ?? overview.get("이번 신규 동기화"),
    ),
    typeBreakdown: typeRows
      .map((cells) => ({ name: cells[0], count: parseCount(cells[1]) }))
      .filter((item) => item.name && item.count > 0),
    projectBreakdown: projectRows
      .map((cells) => ({ name: cells[0], count: parseCount(cells[1]) }))
      .filter((item) => item.name && item.count > 0),
    latestOutputDate: newRows
      .map((cells) => cells[1])
      .filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date))
      .sort()
      .at(-1) ?? "",
  };
}

export function isGensparkDriveSnapshot(value) {
  if (!value || typeof value !== "object") return false;
  if (value.version !== 1 || value.source?.status !== "정상") return false;
  if (!value.source.generatedAt || !value.source.period) return false;
  if (!Number.isFinite(value.totalFiles) || value.totalFiles <= 0) return false;
  if (
    !Number.isFinite(value.individualArtifacts) ||
    value.individualArtifacts <= 0 ||
    !Number.isFinite(value.archiveFiles) ||
    value.individualArtifacts + value.archiveFiles !== value.totalFiles
  ) {
    return false;
  }
  if (!Array.isArray(value.typeBreakdown) || value.typeBreakdown.length === 0) return false;
  if (!Array.isArray(value.projectBreakdown) || value.projectBreakdown.length === 0) return false;
  if (!Array.isArray(value.representativeFiles)) return false;
  if (!Number.isFinite(value.inventory?.scannedFiles) || value.inventory.scannedFiles <= 0) {
    return false;
  }
  const typeTotal = value.typeBreakdown.reduce((sum, item) => sum + item.tasks, 0);
  const projectTotal = value.projectBreakdown.reduce((sum, item) => sum + item.tasks, 0);
  return typeTotal === value.totalFiles && projectTotal === value.totalFiles;
}

export async function writeGensparkDriveSnapshot(
  snapshot,
  { targetRootDir = rootDir, outputPath = null } = {},
) {
  if (!isGensparkDriveSnapshot(snapshot)) {
    throw new Error("Genspark Drive 스냅샷 검증에 실패했습니다.");
  }

  const outputPaths = outputPath
    ? [outputPath]
    : [path.join(targetRootDir, "public", "genspark-drive-artifacts-snapshot.json")];
  if (!outputPath && existsSync(path.join(targetRootDir, "dist"))) {
    outputPaths.push(
      path.join(targetRootDir, "dist", "genspark-drive-artifacts-snapshot.json"),
    );
  }

  for (const targetPath of outputPaths) {
    await mkdir(path.dirname(targetPath), { recursive: true });
    await writeFile(targetPath, `${JSON.stringify(snapshot, null, 2)}\n`);
  }
}

export async function loadGensparkDriveEnv({ targetRootDir = rootDir } = {}) {
  return {
    ...process.env,
    ...(await readLocalEnv(path.join(targetRootDir, ".env.local"))),
  };
}

async function listDriveFolderChildren({ folderId, accessToken, folderPath }) {
  const files = [];
  let pageToken = "";

  do {
    const url = new URL("https://www.googleapis.com/drive/v3/files");
    url.searchParams.set("q", `'${folderId}' in parents and trashed = false`);
    url.searchParams.set("pageSize", "1000");
    url.searchParams.set("supportsAllDrives", "true");
    url.searchParams.set("includeItemsFromAllDrives", "true");
    url.searchParams.set(
      "fields",
      "nextPageToken,files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink)",
    );
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const result = await getJson(url, {
      headers: { authorization: `Bearer ${accessToken}` },
    });
    if (!result.ok) {
      throw new Error(`Genspark Drive 재귀 조회 실패 (${folderPath}): ${result.error}`);
    }
    files.push(...(result.data.files ?? []));
    pageToken = result.data.nextPageToken ?? "";
  } while (pageToken);

  return files;
}

async function fetchDriveTextFile({ file, accessToken }) {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&supportsAllDrives=true`,
    { headers: { authorization: `Bearer ${accessToken}` } },
  );
  if (!response.ok) {
    throw new Error(`Genspark 요약 파일 조회 실패: ${response.status} ${await response.text()}`);
  }
  return response.text();
}

function parseMarkdownKeyValueTable(text, heading) {
  const rows = parseMarkdownTable(text, heading);
  return new Map(rows.map((cells) => [stripMarkdown(cells[0]), stripMarkdown(cells[1])]));
}

function parseMarkdownTable(text, heading) {
  const start = text.indexOf(`## ${heading}`);
  if (start === -1) return [];
  const next = text.indexOf("\n## ", start + 1);
  const section = text.slice(start, next === -1 ? undefined : next);
  return section
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|") && !line.includes("---"))
    .map((line) => line.split("|").slice(1, -1).map((cell) => stripMarkdown(cell)))
    .filter((cells, index) => index > 0 && cells.length >= 2);
}

function stripMarkdown(value = "") {
  return value.replace(/\*\*/g, "").trim();
}

function parseCount(value = "") {
  const number = Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(number) ? Math.round(number) : 0;
}

function parseNumber(value = "") {
  const number = Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(number) ? number : 0;
}

function toUsageBreakdown(items, total, describe) {
  return items
    .map((item, index) => ({
      ...describe(item.name),
      tasks: item.count,
      share: Math.round((item.count / total) * 1000) / 10,
      color: palette[index % palette.length],
    }))
    .sort((left, right) => right.tasks - left.tasks || left.name.localeCompare(right.name));
}

function buildFileTypeBreakdown(files) {
  const counts = countBy(files.map((file) => file.fileType));
  return toUsageBreakdown(
    [...counts.entries()].map(([name, count]) => ({ name, count })),
    files.length || 1,
    (name) => ({
      name,
      note: typeNotes[name] ?? "기타 Genspark 산출물",
    }),
  );
}

function buildProjectBreakdown(files) {
  const counts = countBy(files.map((file) => file.topProject || "루트 파일"));
  return toUsageBreakdown(
    [...counts.entries()].map(([name, count]) => ({ name, count })),
    files.length || 1,
    (name) => ({ name, note: projectNote(name) }),
  );
}

function countBy(labels) {
  const counts = new Map();
  for (const label of labels) counts.set(label, (counts.get(label) ?? 0) + 1);
  return counts;
}

function analyzeFile(file) {
  return {
    id: file.id,
    title: file.name,
    url: file.webViewLink,
    mimeType: file.mimeType,
    sizeBytes: Number(file.size ?? 0),
    createdAt: file.createdTime ?? "",
    modifiedAt: file.modifiedTime ?? "",
    fileType: inferFileType(file),
    purpose: inferUsagePurpose(file.name, file.mimeType),
    depth: file.depth,
    folderPath: file.folderPath,
    topProject: file.topProject,
  };
}

function inferFileType(file) {
  const mimeType = file.mimeType ?? "";
  const ext = path.extname(file.name).toLowerCase().replace(".", "");
  if (mimeType.includes("presentation") || ext === "pptx") return "PPTX";
  if (mimeType.includes("wordprocessing") || ext === "docx") return "DOCX";
  if (mimeType.includes("spreadsheet") || ext === "xlsx" || ext === "csv") {
    return ext === "csv" ? "CSV" : "XLSX";
  }
  if (mimeType.includes("pdf") || ext === "pdf") return "PDF";
  if (mimeType.includes("image") || ["png", "jpg", "jpeg"].includes(ext)) return "PNG";
  if (mimeType.includes("zip") || ext === "zip") return "ZIP";
  if (mimeType.includes("html") || ext === "html") return "HTML";
  if (mimeType.includes("markdown") || ext === "md") return "MARKDOWN";
  return ext ? ext.toUpperCase() : "OTHER";
}

export function inferUsagePurpose(name, mimeType = "") {
  const normalized = `${name} ${mimeType}`.toLowerCase();
  if (/dashboard|crm|대시보드|영업대시보드/.test(normalized)) return "대시보드·CRM";
  if (/회의록|회의|통화|논의|meeting|call/.test(normalized)) return "회의록·통화 정리";
  if (/sheet|xlsx|csv|산정|장비|워크북|시트/.test(normalized)) return "데이터·시트 산출";
  if (/png|image|표지|목차|아이콘|로고|디자인|목업|이미지/.test(normalized)) {
    return "이미지·시각자료 편집";
  }
  if (/business_plan|strategic|organization|사업계획|운영체계|조직|대표보고/.test(normalized)) {
    return "사업계획·조직 운영";
  }
  if (/proposal|safety|riskzero|zeroguard|smart|안전|제안|사고예측|관제|건설|중대재해|posco/.test(normalized)) {
    return "스마트 안전관리 제안/영업";
  }
  return "기타 산출물";
}

function inferArtifactDate(title, modifiedAt) {
  const compact = title.match(/(?:^|[^0-9])(20\d{2})([01]\d)([0-3]\d)/);
  if (compact) return `${compact[1]}-${compact[2]}-${compact[3]}`;
  const separated = title.match(/(20\d{2})[-_.]([01]\d)[-_.]([0-3]\d)/);
  if (separated) return `${separated[1]}-${separated[2]}-${separated[3]}`;
  return toKstDateKey(modifiedAt);
}

function toKstDateKey(value) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return "";
  return new Date(timestamp + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function normalizeProjectName(name) {
  if (name.trim() === "/") return "루트 파일";
  return name.replace(/^\/+/, "").replace(/\//g, " / ");
}

function projectNote(name) {
  const normalized = name.toLowerCase();
  if (/slides/.test(normalized)) return "AI Slides 제안서·발표자료";
  if (/docs/.test(normalized)) return "AI Docs 문서·회의록";
  if (/sheets/.test(normalized)) return "AI Sheets 데이터·시트";
  if (/사고예측|안전관리/.test(normalized)) return "사고예측·스마트안전 발표자료";
  if (/제안/.test(normalized)) return "대용량 제안서 산출";
  if (/zerobee/.test(normalized)) return "ZeroBee 관련 산출";
  if (name.trim() === "/") return "루트에 저장된 개별 산출물";
  return "Genspark 프로젝트 산출물";
}

function pickRepresentativeFiles(files) {
  return [...files]
    .sort((left, right) => {
      const leftDate = inferArtifactDate(left.title, left.modifiedAt);
      const rightDate = inferArtifactDate(right.title, right.modifiedAt);
      return (
        rightDate.localeCompare(leftDate) ||
        right.modifiedAt.localeCompare(left.modifiedAt) ||
        right.sizeBytes - left.sizeBytes
      );
    })
    .slice(0, 8)
    .map((file) => ({
      title: file.title,
      url: file.url,
      fileType: file.fileType,
      purpose: file.purpose,
      sizeLabel: formatFileSize(file.sizeBytes),
      modifiedAt: file.modifiedAt,
    }));
}

function buildInsights({
  summary,
  summaryTotal,
  typeBreakdown,
  projectBreakdown,
  latestOutputDate,
  scan,
}) {
  const topType = typeBreakdown[0];
  const topProject = projectBreakdown[0];
  return [
    `최신 Genspark Drive 요약 기준 전체 파일은 ${summaryTotal.toLocaleString("ko-KR")}개이며 개별 산출물 ${summary.individualArtifacts.toLocaleString("ko-KR")}개와 아카이브 ${summary.archiveFiles.toLocaleString("ko-KR")}개로 구분됩니다.`,
    topType
      ? `${topType.name}가 ${topType.tasks.toLocaleString("ko-KR")}개(${topType.share.toFixed(1)}%)로 가장 많아 제안·발표자료 생산이 중심입니다.`
      : "파일 유형 집계 대상이 없습니다.",
    topProject
      ? `${topProject.name}가 ${topProject.tasks.toLocaleString("ko-KR")}개로 가장 큰 산출 영역입니다.`
      : "프로젝트 집계 대상이 없습니다.",
    `자동 수집은 루트 포함 ${scan.scannedFolders.toLocaleString("ko-KR")}개 폴더와 Drive 항목 ${scan.files.length.toLocaleString("ko-KR")}개를 확인했으며, 이번 신규 산출물은 ${summary.newArtifacts.toLocaleString("ko-KR")}개입니다.`,
  ];
}

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${index >= 3 ? "약 " : ""}${value.toFixed(index >= 3 ? 1 : 1)} ${units[index]}`;
}

function extractDriveFolderId(folderUrl) {
  const match =
    folderUrl.match(/\/folders\/([A-Za-z0-9_-]+)/) ??
    folderUrl.match(/^([A-Za-z0-9_-]{20,})$/);
  if (!match) throw new Error(`Drive 폴더 ID를 찾을 수 없습니다: ${folderUrl}`);
  return match[1];
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const env = await loadGensparkDriveEnv({ targetRootDir: rootDir });
  const snapshot = await collectGensparkDriveArtifacts({
    folderUrl: args.folderUrl,
    env,
  });
  await writeGensparkDriveSnapshot(snapshot, { outputPath: args.outputPath });
  console.log(
    `Genspark Drive snapshot written: ${snapshot.totalFiles} output(s), ${snapshot.inventory.scannedFiles} scanned item(s), ${snapshot.inventory.scannedFolders} folder(s)`,
  );
}

function parseArgs(argv) {
  const args = {
    outputPath: defaultOutputPath,
    folderUrl: defaultFolderUrl,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];
    if (arg === "--output") {
      args.outputPath = path.resolve(rootDir, next);
      index += 1;
    } else if (arg === "--folder-url") {
      args.folderUrl = next;
      index += 1;
    }
  }
  return args;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
