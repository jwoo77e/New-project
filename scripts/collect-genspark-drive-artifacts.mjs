import { existsSync } from "node:fs";
import { createSign } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultFolderId = "1MFJpVf9QfLNbzwLIE27N3b9yua9uYsa2";
const defaultFolderUrl = `https://drive.google.com/drive/folders/${defaultFolderId}`;

const typeColors = {
  AI채팅: "#0f8b8d",
  AI슬라이드: "#2f8f46",
  AI문서: "#c58612",
  AI이미지: "#e85d4f",
  "AI회의록/통화": "#7d6ca7",
  AI시트: "#5f6f8c",
  "대시보드/CRM": "#9a6b36",
};

const purposeColors = {
  "스마트 안전관리 제안/영업": "#0f8b8d",
  "사업계획·조직 운영": "#2f8f46",
  "회의록·통화 정리": "#7d6ca7",
  "이미지·시각자료 편집": "#e85d4f",
  "데이터·시트 산출": "#5f6f8c",
  "대시보드·CRM": "#c58612",
  "기타 산출물": "#6b8f71",
};

export async function collectGensparkDriveArtifacts({
  folderUrl = defaultFolderUrl,
  outputPath = path.join(rootDir, "public", "genspark-drive-artifacts-snapshot.local.json"),
  collectedAt = new Date(),
  env = process.env,
} = {}) {
  const folderId = extractDriveFolderId(folderUrl);
  const accessToken = await getGoogleAccessToken(env, {
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
  const files = await listDriveFolderFiles({ folderId, accessToken });
  const summaryFile = files.find((file) => file.name.includes("genspark_sessions_요약"));
  const summaryText = summaryFile ? await fetchDriveTextFile({ file: summaryFile, accessToken }) : "";
  const snapshot = buildGensparkDriveSnapshot({
    files,
    folderUrl,
    summaryText,
    collectedAt,
  });

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`);
  return snapshot;
}

export function buildGensparkDriveSnapshot({ files, folderUrl = defaultFolderUrl, summaryText = "", collectedAt = new Date() }) {
  const sessionSummary = parseGensparkSessionSummary(summaryText);
  const analyzedFiles = files
    .filter((file) => file.mimeType !== "application/vnd.google-apps.folder")
    .map((file) => ({
      id: file.id,
      title: file.name,
      url: file.webViewLink,
      mimeType: file.mimeType,
      sizeBytes: Number(file.size ?? 0),
      createdAt: file.createdTime ?? "",
      modifiedAt: file.modifiedTime ?? "",
      fileType: inferFileType(file),
      purpose: inferUsagePurpose(file.name, file.mimeType),
    }));

  const totalSizeBytes = analyzedFiles.reduce((sum, file) => sum + file.sizeBytes, 0);
  const latestModifiedAt = analyzedFiles.reduce((latest, file) => (file.modifiedAt > latest ? file.modifiedAt : latest), "");

  return {
    source: {
      name: "Genspark Drive 산출물 저장소",
      folderUrl,
      collectedAt: formatKoreanTimestamp(collectedAt),
      mode: summaryText ? "Drive 목록 + 세션 요약 파일 분석" : "Drive 목록 메타데이터 분석",
      note: "Drive 원본 파일은 읽기 전용으로 조회하고 파일명, MIME, 크기, 세션 요약 파일을 기준으로 사용 목적을 분류합니다.",
    },
    totals: {
      files: analyzedFiles.length,
      totalSizeBytes,
      sessions: sessionSummary.totalSessions,
      finishedSessions: sessionSummary.statusBreakdown.find((item) => item.label === "FINISHED")?.count ?? 0,
      failedSessions: sessionSummary.statusBreakdown.find((item) => item.label === "FAILURE")?.count ?? 0,
    },
    folder: {
      id: extractDriveFolderId(folderUrl),
      latestModifiedAt,
    },
    sessionSummary,
    fileTypeBreakdown: buildBreakdown(analyzedFiles.map((file) => file.fileType)),
    purposeBreakdown: buildBreakdown(analyzedFiles.map((file) => file.purpose)),
    representativeFiles: pickRepresentativeFiles(analyzedFiles),
    insights: buildInsights({ analyzedFiles, sessionSummary }),
  };
}

export function parseGensparkSessionSummary(text) {
  const totalSessions = Number(text.match(/총 세션 수:\s*([0-9,]+)건/)?.[1]?.replace(/,/g, "") ?? 0);
  const period = text.match(/기간:\s*([0-9-]+\s*~\s*[0-9-]+)/)?.[1] ?? "";

  return {
    accountLabel: text.match(/계정:\s*(.+)/)?.[1]?.trim() ?? "Genspark account",
    extractedAt: text.match(/추출일:\s*([0-9-]+)/)?.[1] ?? "",
    period,
    totalSessions,
    typeBreakdown: parseMarkdownCountTable(text, "유형별").map((item) => ({
      ...item,
      color: typeColors[item.label] ?? "#5f6f8c",
    })),
    statusBreakdown: parseMarkdownCountTable(text, "상태별"),
    monthlyBreakdown: parseMarkdownCountTable(text, "월별"),
  };
}

function parseMarkdownCountTable(text, heading) {
  const start = text.indexOf(`## ${heading}`);
  if (start === -1) return [];
  const next = text.indexOf("\n## ", start + 1);
  const section = text.slice(start, next === -1 ? undefined : next);
  return section
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|") && !line.includes("---") && !line.includes("건수"))
    .map((line) => line.split("|").map((cell) => cell.trim()).filter(Boolean))
    .filter((cells) => cells.length >= 2)
    .map(([label, count]) => ({
      label,
      count: Number(count.replace(/,/g, "")),
    }))
    .filter((item) => item.label && Number.isFinite(item.count));
}

export function inferUsagePurpose(name, mimeType = "") {
  const normalized = `${name} ${mimeType}`.toLowerCase();
  if (/dashboard|crm|대시보드|영업대시보드/.test(normalized)) return "대시보드·CRM";
  if (/회의록|회의|통화|논의|meeting|call/.test(normalized)) return "회의록·통화 정리";
  if (/sheet|xlsx|csv|산정|장비|account_activities|워크북|시트/.test(normalized)) return "데이터·시트 산출";
  if (/png|image|표지|목차|tobe|기능|아이콘|로고|디자인|목업|이미지/.test(normalized)) return "이미지·시각자료 편집";
  if (/business_plan|strategic|organization|r&r|사업계획|운영체계|조직|대표보고/.test(normalized)) return "사업계획·조직 운영";
  if (/proposal|safety|riskzero|zeroguard|zeroby|construction|smart|ai_|lh_|sh|bkr|khnp|안전|제안|사고예측|관제|건설|중대재해/.test(normalized)) {
    return "스마트 안전관리 제안/영업";
  }
  return "기타 산출물";
}

function inferFileType(file) {
  const mimeType = file.mimeType ?? "";
  const ext = path.extname(file.name).toLowerCase().replace(".", "");
  if (mimeType.includes("presentation") || ext === "pptx") return "PPTX";
  if (mimeType.includes("wordprocessing") || ext === "docx") return "DOCX";
  if (mimeType.includes("spreadsheet") || ext === "xlsx" || ext === "csv") return ext === "csv" ? "CSV" : "XLSX";
  if (mimeType.includes("pdf") || ext === "pdf") return "PDF";
  if (mimeType.includes("image") || ["png", "jpg", "jpeg"].includes(ext)) return "Image";
  if (mimeType.includes("zip") || ext === "zip") return "ZIP";
  if (mimeType.includes("html") || ext === "html") return "HTML";
  if (mimeType.includes("markdown") || ext === "md") return "Markdown";
  return ext ? ext.toUpperCase() : "Other";
}

function buildBreakdown(labels) {
  const counts = new Map();
  for (const label of labels) counts.set(label, (counts.get(label) ?? 0) + 1);
  const total = labels.length || 1;
  return [...counts.entries()]
    .map(([label, count]) => ({
      label,
      count,
      share: Math.round((count / total) * 1000) / 10,
      color: purposeColors[label] ?? "#5f6f8c",
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function pickRepresentativeFiles(files) {
  const priorityPatterns = [
    /genspark_sessions_요약/i,
    /Genspark 세션 목록/i,
    /riskzero|zeroguard|제로가드/i,
    /smart_safety|스마트.*안전|AI.*안전/i,
    /dashboard|대시보드/i,
    /proposal|제안/i,
    /회의록|통화/i,
  ];
  return [...files]
    .sort((a, b) => {
      const aPriority = priorityPatterns.findIndex((pattern) => pattern.test(a.title));
      const bPriority = priorityPatterns.findIndex((pattern) => pattern.test(b.title));
      const safeA = aPriority === -1 ? 999 : aPriority;
      const safeB = bPriority === -1 ? 999 : bPriority;
      return safeA - safeB || b.sizeBytes - a.sizeBytes || a.title.localeCompare(b.title);
    })
    .slice(0, 12);
}

function buildInsights({ analyzedFiles, sessionSummary }) {
  const topPurpose = buildBreakdown(analyzedFiles.map((file) => file.purpose))[0];
  const fileTypes = buildBreakdown(analyzedFiles.map((file) => file.fileType));
  const topFileTypes = fileTypes.slice(0, 3).map((item) => `${item.label} ${item.count}개`).join(", ");
  const topSessionType = sessionSummary.typeBreakdown[0];
  return [
    `Drive 폴더 직접 포함 파일 ${analyzedFiles.length}개를 파일명·MIME·크기 기준으로 분류했으며 상위 파일 유형은 ${topFileTypes}입니다.`,
    sessionSummary.totalSessions > 0
      ? `세션 요약 파일 기준 Genspark 사용 이력은 ${sessionSummary.totalSessions}건이고 최다 유형은 ${topSessionType?.label ?? "미확인"} ${topSessionType?.count ?? 0}건입니다.`
      : "세션 요약 파일을 찾지 못해 Drive 파일 산출물 기준으로만 분석했습니다.",
    topPurpose
      ? `산출물 사용 목적은 ${topPurpose.label}이 ${topPurpose.count}개로 가장 많아 영업·제안·안전관리 자료 생산 비중이 큽니다.`
      : "사용 목적 분류 대상 파일이 없습니다.",
  ];
}

async function listDriveFolderFiles({ folderId, accessToken }) {
  const files = [];
  let pageToken = "";

  do {
    const url = new URL("https://www.googleapis.com/drive/v3/files");
    url.searchParams.set("q", `'${folderId}' in parents and trashed = false`);
    url.searchParams.set("pageSize", "1000");
    url.searchParams.set("supportsAllDrives", "true");
    url.searchParams.set("includeItemsFromAllDrives", "true");
    url.searchParams.set("fields", "nextPageToken,files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink)");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const result = await getJson(url, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });
    if (!result.ok) {
      throw new Error(`Drive 폴더 조회 실패: ${result.error}`);
    }

    files.push(...(result.data.files ?? []));
    pageToken = result.data.nextPageToken ?? "";
  } while (pageToken);

  return files;
}

async function fetchDriveTextFile({ file, accessToken }) {
  if (file.mimeType === "application/vnd.google-apps.spreadsheet") {
    return fetchDriveUrlText({
      url: `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=text/csv`,
      accessToken,
    });
  }

  return fetchDriveUrlText({
    url: `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&supportsAllDrives=true`,
    accessToken,
  });
}

async function fetchDriveUrlText({ url, accessToken }) {
  const response = await fetch(url, {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Drive 파일 텍스트 조회 실패: ${response.status} ${await response.text()}`);
  }
  return response.text();
}

function extractDriveFolderId(folderUrl) {
  const match = folderUrl.match(/\/folders\/([A-Za-z0-9_-]+)/) ?? folderUrl.match(/^([A-Za-z0-9_-]{20,})$/);
  if (!match) {
    throw new Error(`Drive 폴더 ID를 찾을 수 없습니다: ${folderUrl}`);
  }
  return match[1];
}

async function getGoogleAccessToken(env, { scopes }) {
  const serviceAccount = await readGoogleServiceAccount(env);
  const tokenUri = serviceAccount.token_uri ?? "https://oauth2.googleapis.com/token";
  const nowSeconds = Math.floor(Date.now() / 1000);
  const claims = {
    iss: serviceAccount.client_email,
    scope: scopes.join(" "),
    aud: tokenUri,
    iat: nowSeconds,
    exp: nowSeconds + 3600,
  };
  const assertionBody = [
    base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" })),
    base64Url(JSON.stringify(claims)),
  ].join(".");
  const signature = createSign("RSA-SHA256").update(assertionBody).sign(serviceAccount.private_key, "base64url");
  const tokenResult = await getJson(tokenUri, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${assertionBody}.${signature}`,
    }),
  });

  if (!tokenResult.ok) {
    throw new Error(`Google 서비스 계정 토큰 발급 실패: ${tokenResult.error}`);
  }

  return tokenResult.data.access_token;
}

async function getJson(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    if (!response.ok) {
      return {
        ok: false,
        error: data.error?.message ?? `${response.status} ${response.statusText}`,
      };
    }
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function readGoogleServiceAccount(env) {
  if (env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    return parseServiceAccountJson(env.GOOGLE_SERVICE_ACCOUNT_JSON, "GOOGLE_SERVICE_ACCOUNT_JSON");
  }

  if (env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64) {
    try {
      return parseServiceAccountJson(Buffer.from(env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64, "base64").toString("utf8"), "GOOGLE_SERVICE_ACCOUNT_JSON_BASE64");
    } catch {
      return parseServiceAccountJson(env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64, "GOOGLE_SERVICE_ACCOUNT_JSON_BASE64");
    }
  }

  if (env.GOOGLE_APPLICATION_CREDENTIALS) {
    const credentialsPath = path.resolve(rootDir, env.GOOGLE_APPLICATION_CREDENTIALS);
    if (!existsSync(credentialsPath)) {
      throw new Error(`GOOGLE_APPLICATION_CREDENTIALS 파일을 찾을 수 없습니다: ${credentialsPath}`);
    }
    return parseServiceAccountJson(await readFile(credentialsPath, "utf8"), "GOOGLE_APPLICATION_CREDENTIALS");
  }

  throw new Error("Drive 직접 다운로드에는 GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 또는 GOOGLE_APPLICATION_CREDENTIALS가 필요합니다.");
}

function parseServiceAccountJson(text, sourceName) {
  const serviceAccount = JSON.parse(text);
  if (!serviceAccount.client_email || !serviceAccount.private_key) {
    throw new Error(`${sourceName}에 client_email/private_key가 없습니다.`);
  }
  return serviceAccount;
}

function base64Url(value) {
  return Buffer.from(value).toString("base64url");
}

async function readLocalEnv(envPath) {
  if (!existsSync(envPath)) return {};
  const text = await readFile(envPath, "utf8");
  const entries = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;
    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    entries[key] = rawValue.replace(/^['"]|['"]$/g, "");
  }
  return entries;
}

function formatKoreanTimestamp(date) {
  const formatter = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${formatter.format(date).replace(/\. /g, "-").replace(/\./g, "").replace(" ", " ")} KST`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const env = {
    ...process.env,
    ...(await readLocalEnv(path.join(rootDir, ".env.local"))),
  };
  const snapshot = await collectGensparkDriveArtifacts({
    folderUrl: args.folderUrl,
    outputPath: args.outputPath,
    env,
  });
  console.log(
    `Genspark Drive snapshot written: ${snapshot.totals.files} file(s), ${snapshot.totals.sessions} session(s), ${snapshot.purposeBreakdown.length} purpose group(s)`,
  );
}

function parseArgs(argv) {
  const args = {
    outputPath: path.join(rootDir, "public", "genspark-drive-artifacts-snapshot.local.json"),
    folderUrl: defaultFolderUrl,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];
    if (arg === "--output") {
      args.outputPath = next;
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
