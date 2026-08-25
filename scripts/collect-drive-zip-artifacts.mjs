import { existsSync, createReadStream, createWriteStream } from "node:fs";
import { createSign } from "node:crypto";
import { mkdtemp, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const textExtensions = new Set([".md", ".txt", ".csv", ".json", ".html"]);
const dataExtensions = new Set([".xlsx", ".xls", ".csv", ".json"]);

export function groupSplitArchiveFiles(files) {
  const groups = new Map();

  for (const file of files) {
    const name = file.name;
    const partMatch = name.match(/^(.*\.zip)\.part(\d+)$/i);
    const dotNumberMatch = name.match(/^(.*\.zip)\.(\d{3})$/i);
    const zPartMatch = name.match(/^(.*)\.z(\d{2})$/i);
    const plainZipMatch = name.match(/^(.*)\.zip$/i);

    if (partMatch) {
      const archiveName = partMatch[1];
      addArchivePart(groups, archiveName, file, Number(partMatch[2]), "zip.partNN");
      continue;
    }

    if (dotNumberMatch) {
      const archiveName = dotNumberMatch[1];
      addArchivePart(groups, archiveName, file, Number(dotNumberMatch[2]), "zip.NNN");
      continue;
    }

    if (zPartMatch) {
      const archiveName = `${zPartMatch[1]}.zip`;
      addArchivePart(groups, archiveName, file, Number(zPartMatch[2]), "zNN+zip");
      continue;
    }

    if (plainZipMatch) {
      const archiveName = name;
      addArchivePart(groups, archiveName, file, Number.MAX_SAFE_INTEGER, "plainZip");
    }
  }

  return [...groups.values()]
    .map((group) => {
      const sortedParts = [...group.parts].sort((a, b) => a.order - b.order || a.file.name.localeCompare(b.file.name));
      const numericOrders = sortedParts.filter((part) => Number.isFinite(part.order) && part.order !== Number.MAX_SAFE_INTEGER);
      const expectedOrders =
        numericOrders.length > 0
          ? Array.from(
              { length: numericOrders[numericOrders.length - 1].order - numericOrders[0].order + 1 },
              (_, index) => numericOrders[0].order + index,
            )
          : [];
      const actualOrders = new Set(numericOrders.map((part) => part.order));
      const missingParts = expectedOrders.filter((order) => !actualOrders.has(order));

      return {
        archiveName: group.archiveName,
        pattern: group.pattern,
        complete: missingParts.length === 0,
        missingParts,
        parts: sortedParts.map((part) => part.file),
      };
    })
    .sort((a, b) => a.archiveName.localeCompare(b.archiveName));
}

export async function collectDriveZipArtifacts({
  inputDir,
  outputPath = path.join(rootDir, "public", "drive-artifact-zip-snapshot.local.json"),
  owner = "Drive 사용자",
  folderUrl = "",
  collectedAt = new Date(),
  mode = "로컬 분할 zip 분석",
  env = process.env,
} = {}) {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "drive-zip-artifacts-"));
  const archives = [];
  let resolvedMode = mode;

  try {
    let sourceDir = inputDir;

    if (!sourceDir) {
      if (!folderUrl) {
        throw new Error("inputDir or folderUrl is required. Use --input-dir <folder-with-zip-parts> or --folder-url <drive-folder-url>.");
      }
      sourceDir = await downloadDriveFolderZipParts({
        env,
        folderUrl,
        outputDir: path.join(tempRoot, "drive-downloads"),
      });
      resolvedMode = "Google Drive 분할 zip 다운로드 분석";
    }

    const files = await listLocalFiles(sourceDir);
    const archiveGroups = groupSplitArchiveFiles(files);

    for (const group of archiveGroups) {
      if (!group.complete) {
        archives.push({
          owner,
          archiveName: group.archiveName,
          folderUrl,
          sourceParts: group.parts.map((part) => part.name),
          combinedSizeBytes: group.parts.reduce((sum, part) => sum + Number(part.size ?? 0), 0),
          extractedEntries: 0,
          extractedFiles: 0,
          extractedDirectories: 0,
          promptFiles: 0,
          responseFiles: 0,
          skillFiles: 0,
          dataFiles: 0,
          crcWarningFiles: [],
          cleanupStatus: "미완성 part 그룹이라 압축 해제를 건너뜀",
          verificationStatus: `누락 part: ${group.missingParts.join(", ")}`,
          taskGroups: [],
        });
        continue;
      }

      const archiveTempDir = await mkdtemp(path.join(tempRoot, "archive-"));
      const combinedZipPath = path.join(archiveTempDir, sanitizeFileName(group.archiveName));
      const extractDir = path.join(archiveTempDir, "extracted");
      await mkdir(extractDir, { recursive: true });

      try {
        await combineParts(group.parts, combinedZipPath);
        const entryNames = await listZipEntries(combinedZipPath);
        assertSafeZipEntries(entryNames);
        const testResult = await testZip(combinedZipPath);
        await extractZip(combinedZipPath, extractDir);

        const extractedFiles = await walkFiles(extractDir);
        const taskGroups = await buildTaskGroups(extractDir, extractedFiles);
        const crcWarningFiles = parseCrcWarningFiles(testResult.stderr || testResult.stdout);

        archives.push({
          owner,
          archiveName: group.archiveName,
          folderUrl,
          sourceParts: group.parts.map((part) => part.name),
          combinedSizeBytes: group.parts.reduce((sum, part) => sum + Number(part.size ?? 0), 0),
          extractedEntries: entryNames.length,
          extractedFiles: extractedFiles.length,
          extractedDirectories: entryNames.filter((entry) => entry.endsWith("/")).length,
          promptFiles: extractedFiles.filter((file) => isPromptPath(file.relativePath)).length,
          responseFiles: extractedFiles.filter((file) => isResponsePath(file.relativePath)).length,
          skillFiles: extractedFiles.filter((file) => file.relativePath.toLowerCase().endsWith("_skill.md")).length,
          dataFiles: extractedFiles.filter((file) => dataExtensions.has(path.extname(file.relativePath).toLowerCase())).length,
          crcWarningFiles,
          cleanupStatus: "결합 zip과 압축 해제 폴더는 분석 후 삭제됨",
          verificationStatus:
            crcWarningFiles.length > 0
              ? `CRC 경고 ${crcWarningFiles.length}개: ${crcWarningFiles.join(", ")}`
              : "zip 테스트와 압축 해제 정상",
          taskGroups,
        });
      } catch (error) {
        archives.push({
          owner,
          archiveName: group.archiveName,
          folderUrl,
          sourceParts: group.parts.map((part) => part.name),
          combinedSizeBytes: group.parts.reduce((sum, part) => sum + Number(part.size ?? 0), 0),
          extractedEntries: 0,
          extractedFiles: 0,
          extractedDirectories: 0,
          promptFiles: 0,
          responseFiles: 0,
          skillFiles: 0,
          dataFiles: 0,
          crcWarningFiles: [],
          cleanupStatus: "검증 실패 후 결합 zip과 압축 해제 폴더는 삭제됨",
          verificationStatus: error instanceof Error ? error.message : String(error),
          taskGroups: [],
        });
      }
    }
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }

  const snapshot = buildSnapshot({ owner, folderUrl, collectedAt, mode: archives.length > 0 ? resolvedMode : "분할 zip 없음", archives });
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`);
  return snapshot;
}

function addArchivePart(groups, archiveName, file, order, pattern) {
  const existing = groups.get(archiveName) ?? {
    archiveName,
    pattern,
    parts: [],
  };
  existing.parts.push({ file, order });
  if (existing.pattern === "plainZip" && pattern !== "plainZip") existing.pattern = pattern;
  groups.set(archiveName, existing);
}

async function listLocalFiles(inputDir) {
  const entries = await readdir(inputDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const filePath = path.join(inputDir, entry.name);
    const info = await stat(filePath);
    files.push({
      name: entry.name,
      path: filePath,
      size: info.size,
      modifiedAt: info.mtime.toISOString(),
    });
  }

  return files;
}

async function downloadDriveFolderZipParts({ env, folderUrl, outputDir }) {
  const folderId = extractDriveFolderId(folderUrl);
  const accessToken = await getGoogleAccessToken(env, {
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    subject: env.GOOGLE_DRIVE_IMPERSONATED_USER ?? "",
  });
  const driveFiles = await listDriveFolderFiles({ folderId, accessToken });
  const zipCandidates = driveFiles.filter((file) => isZipCandidate(file.name));
  await mkdir(outputDir, { recursive: true });

  for (const file of zipCandidates) {
    const targetPath = path.join(outputDir, sanitizeFileName(file.name));
    await downloadDriveFile({ fileId: file.id, accessToken, targetPath });
  }

  return outputDir;
}

function extractDriveFolderId(folderUrl) {
  const match = folderUrl.match(/\/folders\/([A-Za-z0-9_-]+)/) ?? folderUrl.match(/^([A-Za-z0-9_-]{20,})$/);
  if (!match) {
    throw new Error(`Drive 폴더 ID를 찾을 수 없습니다: ${folderUrl}`);
  }
  return match[1];
}

function isZipCandidate(name) {
  return /\.(zip|z\d{2}|zip\.\d{3}|zip\.part\d+)$/i.test(name);
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
    url.searchParams.set("fields", "nextPageToken,files(id,name,mimeType,size,modifiedTime,webViewLink)");
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

async function downloadDriveFile({ fileId, accessToken, targetPath }) {
  const url = new URL(`https://www.googleapis.com/drive/v3/files/${fileId}`);
  url.searchParams.set("alt", "media");
  url.searchParams.set("supportsAllDrives", "true");
  const response = await fetch(url, {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Drive 파일 다운로드 실패(${fileId}): ${response.status} ${await response.text()}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(targetPath, buffer);
}

async function combineParts(parts, outputPath) {
  const output = createWriteStream(outputPath);

  try {
    for (const part of parts) {
      await streamAppend(part.path, output);
    }
  } finally {
    output.end();
  }

  await new Promise((resolve, reject) => {
    output.on("finish", resolve);
    output.on("error", reject);
  });
}

function streamAppend(inputPath, output) {
  return new Promise((resolve, reject) => {
    const input = createReadStream(inputPath);
    input.on("error", reject);
    input.on("end", resolve);
    input.pipe(output, { end: false });
  });
}

async function listZipEntries(zipPath) {
  const result = await run("unzip", ["-Z", "-1", zipPath], { allowFailure: false });
  return result.stdout.split(/\r?\n/).filter(Boolean);
}

async function testZip(zipPath) {
  return run("unzip", ["-t", zipPath], { allowFailure: true });
}

async function extractZip(zipPath, extractDir) {
  const result = await run("unzip", ["-qq", zipPath, "-d", extractDir], { allowFailure: true });
  if (result.code !== 0 && !/bad CRC/i.test(`${result.stdout}\n${result.stderr}`)) {
    throw new Error(`unzip failed: ${result.stderr || result.stdout}`);
  }
}

function assertSafeZipEntries(entryNames) {
  const unsafeEntry = entryNames.find((entry) => {
    const normalized = path.normalize(entry);
    return path.isAbsolute(entry) || normalized.startsWith("..") || normalized.includes(`${path.sep}..${path.sep}`);
  });

  if (unsafeEntry) {
    throw new Error(`Unsafe zip entry blocked: ${unsafeEntry}`);
  }
}

async function walkFiles(baseDir, currentDir = baseDir) {
  const entries = await readdir(currentDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(baseDir, fullPath)));
      continue;
    }
    if (!entry.isFile()) continue;
    const info = await stat(fullPath);
    files.push({
      path: fullPath,
      relativePath: path.relative(baseDir, fullPath),
      size: info.size,
      extension: path.extname(entry.name).toLowerCase(),
    });
  }

  return files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

async function buildTaskGroups(extractDir, files) {
  const grouped = new Map();

  for (const file of files) {
    const [topLevel] = file.relativePath.split(path.sep);
    const folderName = file.relativePath.includes(path.sep) ? topLevel : "root";
    const current = grouped.get(folderName) ?? [];
    current.push(file);
    grouped.set(folderName, current);
  }

  const taskGroups = [];
  for (const [folderName, groupFiles] of grouped.entries()) {
    if (folderName === "root") continue;

    const textFiles = groupFiles.filter((file) => textExtensions.has(file.extension));
    const snippets = await Promise.all(textFiles.map((file) => readTextPreview(file.path)));
    const promptCount = groupFiles.filter((file) => isPromptPath(file.relativePath)).length;
    const responseCount = groupFiles.filter((file) => isResponsePath(file.relativePath)).length;
    const skillCount = groupFiles.filter((file) => file.relativePath.toLowerCase().endsWith("_skill.md")).length;
    const dataFiles = groupFiles.filter((file) => dataExtensions.has(file.extension)).map((file) => path.basename(file.relativePath));

    taskGroups.push({
      title: inferTitle(folderName, snippets),
      folderName,
      useCase: inferUseCase(folderName, snippets.join("\n")),
      fileCount: groupFiles.length,
      promptCount,
      responseCount,
      skillCount,
      dataFiles,
      summary: inferSummary(snippets),
      verification: buildVerification({ promptCount, responseCount, skillCount, dataFiles, snippets }),
    });
  }

  return taskGroups.sort((a, b) => {
    if (a.folderName === "root") return -1;
    if (b.folderName === "root") return 1;
    return a.title.localeCompare(b.title);
  });
}

async function readTextPreview(filePath) {
  const buffer = await readFile(filePath);
  return buffer.toString("utf8").slice(0, 2400);
}

function inferTitle(folderName, snippets) {
  const heading = snippets
    .join("\n")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.startsWith("# "));

  if (heading) {
    return heading.replace(/^#\s+/, "").replace(/^(\d{4}-\d{2}-\d{2})\s*·\s*/, "").replace(/\s*·\s*(프롬프트|응답)$/u, "");
  }

  return folderName === "root" ? "공통 자동화 지시서" : folderName.replace(/_[a-f0-9]{12}$/i, "");
}

function inferUseCase(folderName, text) {
  const haystack = `${folderName}\n${text}`.toLowerCase();
  if (/session|백필|업무보고/.test(haystack)) return "업무보고·지식관리";
  if (/ax|kpi|notion|전환/.test(haystack)) return "AX 운영·KPI";
  if (/iris|r&d|공고|연구과제/.test(haystack)) return "IRIS·공고 데이터";
  if (/naver|news|트렌드|trend|ai 기술/.test(haystack)) return "산업·AI 트렌드";
  return "초안·문서화";
}

function inferSummary(snippets) {
  const preferredLine = snippets
    .join("\n")
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^-\s*/, ""))
    .find(
      (line) =>
        line.length > 18 &&
        !line.startsWith("#") &&
        !line.startsWith("##") &&
        !/^name:/i.test(line) &&
        !/^description:/i.test(line),
    );

  return preferredLine ? preferredLine.slice(0, 180) : "zip 내부 텍스트 파일의 본문을 기준으로 자동 분류된 산출물입니다.";
}

function buildVerification({ promptCount, responseCount, skillCount, dataFiles, snippets }) {
  const parts = [`프롬프트 ${promptCount}개`, `응답 ${responseCount}개`];
  if (skillCount > 0) parts.push(`SKILL ${skillCount}개`);
  if (dataFiles.length > 0) parts.push(`데이터 ${dataFiles.length}개`);
  const hasFinalReport = snippets.some((snippet) => snippet.includes("최종 보고"));
  return `${parts.join(" · ")}${hasFinalReport ? " · 최종 보고 본문 확인" : ""}`;
}

function isPromptPath(relativePath) {
  return /프롬프트|prompt/i.test(relativePath);
}

function isResponsePath(relativePath) {
  return /응답|response/i.test(relativePath);
}

function parseCrcWarningFiles(output) {
  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /bad CRC/i.test(line))
    .map((line) => line.replace(/^testing:\s*/i, "").replace(/\s+bad CRC.*$/i, "").trim());
}

function buildSnapshot({ owner, folderUrl, collectedAt, mode, archives }) {
  const totals = archives.reduce(
    (acc, archive) => {
      acc.splitParts += archive.sourceParts.length;
      acc.archives += 1;
      acc.extractedFiles += archive.extractedFiles;
      acc.taskGroups += archive.taskGroups.length;
      acc.dataFiles += archive.dataFiles;
      acc.crcWarnings += archive.crcWarningFiles.length;
      return acc;
    },
    { splitParts: 0, archives: 0, extractedFiles: 0, taskGroups: 0, dataFiles: 0, crcWarnings: 0 },
  );

  return {
    source: {
      name: "Google Drive 분할 zip 산출물 분석",
      owner,
      folderUrl,
      generatedAt: formatKoreanTimestamp(collectedAt),
      mode,
      cleanupPolicy: "결합 zip과 압축 해제 폴더는 로컬 임시 디렉터리에서 삭제하고 원본 zip part만 보존",
    },
    totals,
    archives,
  };
}

function sanitizeFileName(value) {
  return value.replace(/[\\/:"*?<>|]+/g, "_");
}

function run(command, args, { allowFailure = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      const result = { code: code ?? 0, stdout, stderr };
      if (!allowFailure && result.code !== 0) {
        reject(new Error(`${command} ${args.join(" ")} failed: ${stderr || stdout}`));
        return;
      }
      resolve(result);
    });
  });
}

export async function getGoogleAccessToken(env, { scopes, subject = "" }) {
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
  if (subject) claims.sub = subject;
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

export async function getJson(url, options = {}) {
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
  if (env.GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON) {
    return parseServiceAccountJson(
      env.GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON,
      "GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON",
    );
  }

  if (env.GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON_BASE64) {
    try {
      return parseServiceAccountJson(
        Buffer.from(env.GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON_BASE64, "base64").toString("utf8"),
        "GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON_BASE64",
      );
    } catch {
      return parseServiceAccountJson(
        env.GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON_BASE64,
        "GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON_BASE64",
      );
    }
  }

  if (env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    return parseServiceAccountJson(env.GOOGLE_SERVICE_ACCOUNT_JSON, "GOOGLE_SERVICE_ACCOUNT_JSON");
  }

  if (env.GOOGLE_DRIVE_APPLICATION_CREDENTIALS) {
    const credentialsPath = path.resolve(rootDir, env.GOOGLE_DRIVE_APPLICATION_CREDENTIALS);
    if (!existsSync(credentialsPath)) {
      throw new Error(`GOOGLE_DRIVE_APPLICATION_CREDENTIALS 파일을 찾을 수 없습니다: ${credentialsPath}`);
    }
    return parseServiceAccountJson(
      await readFile(credentialsPath, "utf8"),
      "GOOGLE_DRIVE_APPLICATION_CREDENTIALS",
    );
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

  throw new Error(
    "Drive 직접 다운로드에는 GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON_BASE64, GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 또는 GOOGLE_APPLICATION_CREDENTIALS가 필요합니다.",
  );
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

export async function readLocalEnv(envPath) {
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

export function formatKoreanTimestamp(date) {
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
  const snapshot = await collectDriveZipArtifacts({
    inputDir: args.inputDir,
    outputPath: args.outputPath,
    owner: args.owner,
    folderUrl: args.folderUrl,
    mode: args.mode,
    env,
  });
  console.log(
    `Drive zip snapshot written: ${snapshot.totals.archives} archive(s), ${snapshot.totals.extractedFiles} file(s), ${snapshot.totals.crcWarnings} CRC warning(s)`,
  );
}

function parseArgs(argv) {
  const args = {
    outputPath: path.join(rootDir, "public", "drive-artifact-zip-snapshot.local.json"),
    owner: "Drive 사용자",
    folderUrl: "",
    mode: "로컬 분할 zip 분석",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];
    if (arg === "--input-dir") {
      args.inputDir = next;
      index += 1;
    } else if (arg === "--output") {
      args.outputPath = next;
      index += 1;
    } else if (arg === "--owner") {
      args.owner = next;
      index += 1;
    } else if (arg === "--folder-url") {
      args.folderUrl = next;
      index += 1;
    } else if (arg === "--mode") {
      args.mode = next;
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
