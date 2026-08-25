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
const kstOffsetMs = 9 * 60 * 60 * 1000;

export const defaultDriveTrendRepositories = [
  {
    owner: "김재우",
    folderId: "1Q2OorOdMlPn8xRBzuHWyY5kqGHxRYpPZ",
    folderUrl:
      "https://drive.google.com/drive/folders/1Q2OorOdMlPn8xRBzuHWyY5kqGHxRYpPZ?usp=drive_link",
  },
  {
    owner: "이형배",
    folderId: "1OFfN4APAViKNtgURnmn9W51jSvcxy6fg",
    folderUrl:
      "https://drive.google.com/drive/folders/1OFfN4APAViKNtgURnmn9W51jSvcxy6fg?usp=sharing",
  },
  {
    owner: "전략사업팀",
    folderId: "1NK9PNOb_fbByPSSz0AqydMYj5lUK2Q25",
    folderUrl:
      "https://drive.google.com/drive/folders/1NK9PNOb_fbByPSSz0AqydMYj5lUK2Q25?usp=drive_link",
  },
  {
    owner: "정재요",
    folderId: "1nYUQzqS72RGA5d6aXDbVHuxOUYgKbA3p",
    folderUrl:
      "https://drive.google.com/drive/folders/1nYUQzqS72RGA5d6aXDbVHuxOUYgKbA3p?usp=drive_link",
  },
  {
    owner: "전우성",
    folderId: "1Qn2i19lKy_4OlTu-H1UiVfhuGZTevMZL",
    folderUrl:
      "https://drive.google.com/drive/folders/1Qn2i19lKy_4OlTu-H1UiVfhuGZTevMZL?usp=drive_link",
  },
];

export async function collectDriveArtifactTrend({
  repositories = defaultDriveTrendRepositories,
  collectedAt = new Date(),
  env = process.env,
} = {}) {
  const accessToken = await getGoogleAccessToken(env, {
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    subject: env.GOOGLE_DRIVE_IMPERSONATED_USER ?? "",
  });
  const repositoryScans = [];

  for (const repository of repositories) {
    repositoryScans.push(
      await scanDriveRepository({
        ...repository,
        accessToken,
      }),
    );
  }

  return buildDriveArtifactTrendSnapshot({ repositoryScans, collectedAt });
}

export async function scanDriveRepository({
  owner,
  folderId,
  folderUrl,
  accessToken,
}) {
  const normalizedOwner = normalizeDriveName(owner);
  const queue = [{ id: folderId, depth: 0, path: normalizedOwner }];
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
      accessToken,
      folderPath: folder.path,
    });

    for (const child of children) {
      const childName = normalizeDriveName(child.name);
      if (child.mimeType === folderMimeType) {
        folderCount += 1;
        maxDepth = Math.max(maxDepth, folder.depth + 1);
        queue.push({
          id: child.id,
          depth: folder.depth + 1,
          path: `${folder.path}/${childName}`,
        });
        continue;
      }

      files.push({
        id: child.id,
        name: childName,
        createdTime: child.createdTime ?? "",
        depth: folder.depth,
      });
    }
  }

  return {
    owner: normalizedOwner,
    folderId,
    folderUrl,
    files,
    folderCount,
    maxDepth,
  };
}

export function buildDriveArtifactTrendSnapshot({
  repositoryScans,
  collectedAt = new Date(),
}) {
  const collectedDate = toKstDateKey(collectedAt.toISOString());
  const repositoryOwnerLabel = repositoryScans
    .map((scan) => normalizeDriveName(scan.owner))
    .join("·");
  const repositories = repositoryScans.map((scan) => {
    const dailyCounts = new Map();
    let metadataDateAnomalyCount = 0;

    for (const file of scan.files) {
      if (isMetadataDateAnomaly(file.createdTime, collectedAt)) {
        metadataDateAnomalyCount += 1;
        continue;
      }
      const date = toKstDateKey(file.createdTime);
      dailyCounts.set(date, (dailyCounts.get(date) ?? 0) + 1);
    }

    const sortedDailyCounts = [...dailyCounts.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([date, count]) => ({ date, count }));
    const directFileCount = scan.files.filter((file) => file.depth === 0).length;

    return {
      owner: scan.owner,
      folderId: scan.folderId,
      folderUrl: scan.folderUrl,
      artifacts: [],
      inventory: {
        fileCount: scan.files.length,
        directFileCount,
        nestedFileCount: scan.files.length - directFileCount,
        folderCount: scan.folderCount,
        maxDepth: scan.maxDepth,
        metadataDateAnomalyCount,
        dailyCounts: sortedDailyCounts,
      },
    };
  });
  const validDates = repositories
    .flatMap((repository) => repository.inventory.dailyCounts.map((item) => item.date))
    .sort();
  const startDate = validDates[0] ?? collectedDate;
  const totals = repositories.reduce(
    (summary, repository) => ({
      files: summary.files + repository.inventory.fileCount,
      directFiles: summary.directFiles + repository.inventory.directFileCount,
      nestedFiles: summary.nestedFiles + repository.inventory.nestedFileCount,
      folders: summary.folders + repository.inventory.folderCount,
      metadataDateAnomalies:
        summary.metadataDateAnomalies + repository.inventory.metadataDateAnomalyCount,
    }),
    {
      files: 0,
      directFiles: 0,
      nestedFiles: 0,
      folders: 0,
      metadataDateAnomalies: 0,
    },
  );

  return {
    version: 1,
    source: {
      name: "Claude Drive 날짜별 저장 파일 증감",
      status: "정상",
      collectedAt: formatKoreanTimestamp(collectedAt),
      generatedAt: collectedAt.toISOString(),
      period: `${startDate} ~ ${collectedDate}`,
      schedule: "매일 21:00 KST",
      note:
        `${repositoryOwnerLabel} Drive 루트의 모든 하위 폴더를 읽기 전용으로 재귀 조회하고 파일 생성일을 한국시간 기준으로 집계합니다.`,
    },
    repositories,
    totals,
  };
}

export function isDriveArtifactTrendSnapshot(value) {
  if (!value || typeof value !== "object") return false;
  if (value.version !== 1 || value.source?.status !== "정상") return false;
  if (!Array.isArray(value.repositories) || value.repositories.length === 0) return false;
  if (!Number.isFinite(value.totals?.files)) return false;

  const repositoryFiles = value.repositories.reduce((sum, repository) => {
    const inventory = repository?.inventory;
    if (!inventory || !Array.isArray(inventory.dailyCounts)) return Number.NaN;
    const datedFiles = inventory.dailyCounts.reduce(
      (dailySum, item) =>
        /^\d{4}-\d{2}-\d{2}$/.test(item.date) && Number.isFinite(item.count)
          ? dailySum + item.count
          : Number.NaN,
      0,
    );
    if (datedFiles + inventory.metadataDateAnomalyCount !== inventory.fileCount) {
      return Number.NaN;
    }
    return sum + inventory.fileCount;
  }, 0);

  return Number.isFinite(repositoryFiles) && repositoryFiles === value.totals.files;
}

export async function writeDriveArtifactTrendSnapshot(
  snapshot,
  { targetRootDir = rootDir } = {},
) {
  if (!isDriveArtifactTrendSnapshot(snapshot)) {
    throw new Error("Claude Drive 날짜별 그래프 스냅샷 검증에 실패했습니다.");
  }

  const paths = [
    path.join(targetRootDir, "public", "drive-artifact-trend-snapshot.json"),
  ];
  if (existsSync(path.join(targetRootDir, "dist"))) {
    paths.push(
      path.join(targetRootDir, "dist", "drive-artifact-trend-snapshot.json"),
    );
  }

  for (const outputPath of paths) {
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`);
  }
}

export async function loadDriveArtifactTrendEnv({ targetRootDir = rootDir } = {}) {
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
      "nextPageToken,files(id,name,mimeType,size,createdTime,modifiedTime)",
    );
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const result = await getJson(url, {
      headers: { authorization: `Bearer ${accessToken}` },
    });
    if (!result.ok) {
      throw new Error(`Drive 재귀 조회 실패 (${folderPath}): ${result.error}`);
    }
    files.push(...(result.data.files ?? []));
    pageToken = result.data.nextPageToken ?? "";
  } while (pageToken);

  return files;
}

function isMetadataDateAnomaly(value, collectedAt) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return true;
  const year = new Date(timestamp).getUTCFullYear();
  return year < 2000 || timestamp > collectedAt.getTime() + 24 * 60 * 60 * 1000;
}

function normalizeDriveName(value) {
  return String(value ?? "").normalize("NFC");
}

function toKstDateKey(value) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return "";
  return new Date(timestamp + kstOffsetMs).toISOString().slice(0, 10);
}

async function main() {
  const env = await loadDriveArtifactTrendEnv();
  const snapshot = await collectDriveArtifactTrend({ env });
  await writeDriveArtifactTrendSnapshot(snapshot);
  console.log(
    `Claude Drive trend snapshot written: ${snapshot.totals.files} file(s), ${snapshot.totals.folders} folder(s), ${snapshot.source.period}`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
