import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_SINCE = "2026-05-01T00:00:00+09:00";
const DEFAULT_DIFF_COMMIT_LIMIT = 300;
const DEFAULT_CONCURRENCY = 6;

export async function loadGitlabEnv({ targetRootDir = process.cwd() } = {}) {
  const localEnv = await readLocalEnv(path.join(targetRootDir, ".env.local"));
  return { ...process.env, ...localEnv };
}

export async function collectGitlabActivity({
  env = process.env,
  collectedAt = new Date(),
  existingSnapshot = null,
  fetchImpl = fetch,
  targetRootDir = process.cwd(),
} = {}) {
  const baseUrl = requiredEnv(env, "GITLAB_BASE_URL").replace(/\/$/, "");
  const groupPath = requiredEnv(env, "GITLAB_GROUP_PATH");
  const token = requiredEnv(env, "GITLAB_READ_TOKEN");
  const since = normalizeDateTime(env.GITLAB_ACTIVITY_SINCE || DEFAULT_SINCE, "GITLAB_ACTIVITY_SINCE");
  const until = normalizeDateTime(env.GITLAB_ACTIVITY_UNTIL || collectedAt.toISOString(), "GITLAB_ACTIVITY_UNTIL");
  const concurrency = positiveInteger(env.GITLAB_ACTIVITY_CONCURRENCY, DEFAULT_CONCURRENCY);
  const diffCommitLimit = nonNegativeInteger(env.GITLAB_DIFF_COMMIT_LIMIT, DEFAULT_DIFF_COMMIT_LIMIT);
  const headers = { "PRIVATE-TOKEN": token };
  const authorAliases = await loadAuthorAliases(env, targetRootDir);

  const group = await getJson(
    `${baseUrl}/api/v4/groups/${encodeURIComponent(groupPath)}`,
    { headers, fetchImpl },
  );
  const projects = await getAllPages(
    `${baseUrl}/api/v4/groups/${group.id}/projects`,
    {
      headers,
      fetchImpl,
      query: { include_subgroups: "true", simple: "true", archived: "false", order_by: "path", sort: "asc" },
    },
  );

  const projectResults = await mapWithConcurrency(projects, concurrency, async (project) => {
    try {
      const commits = await getAllPages(
        `${baseUrl}/api/v4/projects/${project.id}/repository/commits`,
        {
          headers,
          fetchImpl,
          query: {
            all: "true",
            since,
            until,
            with_stats: "true",
            order: "default",
          },
        },
      );
      return {
        project: projectDescriptor(project),
        commits: dedupeCommits(commits).map((commit) => normalizeCommit(commit, project)),
        error: null,
      };
    } catch (error) {
      return {
        project: projectDescriptor(project),
        commits: [],
        error: safeError(error),
      };
    }
  });

  const allCommits = projectResults
    .flatMap((result) => result.commits)
    .sort((a, b) => b.authoredAt.localeCompare(a.authoredAt) || a.sha.localeCompare(b.sha));
  const previousDiffByCommit = previousDiffMap(existingSnapshot);
  const diffTargets = allCommits
    .filter((commit) => !commit.isMerge && !previousDiffByCommit.has(commitKey(commit)))
    .slice(0, diffCommitLimit);
  const diffResults = await mapWithConcurrency(diffTargets, concurrency, async (commit) => {
    try {
      const diffs = await getAllPages(
        `${baseUrl}/api/v4/projects/${commit.projectId}/repository/commits/${commit.sha}/diff`,
        { headers, fetchImpl },
      );
      return [commitKey(commit), summarizeDiffs(diffs)];
    } catch (error) {
      return [commitKey(commit), { status: "error", changedFiles: null, files: [], filesTruncated: false, error: safeError(error) }];
    }
  });
  const diffByCommit = new Map(previousDiffByCommit);
  for (const [key, value] of diffResults) diffByCommit.set(key, value);
  const commitsWithDiffs = allCommits.map((commit) => ({
    ...commit,
    diff: diffByCommit.get(commitKey(commit)) ?? {
      status: "not_collected",
      changedFiles: null,
      files: [],
      filesTruncated: false,
      error: null,
    },
  }));
  const projectErrors = projectResults
    .filter((result) => result.error)
    .map((result) => ({ projectId: result.project.id, projectPath: result.project.path, error: result.error }));
  const snapshot = aggregateGitlabActivity({
    collectedAt,
    baseUrl,
    group: { id: group.id, path: group.full_path, name: group.name },
    since,
    until,
    projects: projectResults.map((result) => result.project),
    commits: commitsWithDiffs,
    projectErrors,
    diffCommitLimit,
    authorAliases,
  });

  if (projects.length > 0 && projectErrors.length === projects.length) {
    throw new Error("모든 GitLab 프로젝트의 커밋 수집이 실패했습니다.");
  }
  return snapshot;
}

export function aggregateGitlabActivity({
  collectedAt,
  baseUrl,
  group,
  since,
  until,
  projects,
  commits,
  projectErrors = [],
  diffCommitLimit = 0,
  authorAliases = {},
}) {
  const users = new Map();
  const months = new Map();
  const days = new Map();
  const projectsWithCommits = new Set();

  for (const commit of commits) {
    projectsWithCommits.add(commit.projectId);
    const sourceEmail = normalizeEmail(commit.authorEmail || commit.committerEmail || "unknown");
    const email = canonicalEmail(sourceEmail, authorAliases);
    const user = users.get(email) ?? emptyUser(email);
    users.set(email, user);
    user.sourceEmails.add(sourceEmail);
    user.authorNames.add(commit.authorName || commit.committerName || email);
    user.projectIds.add(commit.projectId);
    user.activeDays.add(commit.day);
    addMetrics(user, commit);
    addPeriodMetrics(user.monthly, commit.month, commit, email);
    addPeriodMetrics(user.daily, commit.day, commit, email);
    addProjectMetrics(user.projects, commit.projectPath, commit);
    user.recentCommits.push(commitForSnapshot(commit));

    addPeriodMetrics(months, commit.month, commit, email);
    addPeriodMetrics(days, commit.day, commit, email);
  }

  const userRows = [...users.values()]
    .map(finalizeUser)
    .sort((a, b) => b.changedLines - a.changedLines || b.commitCount - a.commitCount || a.email.localeCompare(b.email));
  const totals = userRows.reduce(
    (total, user) => {
      total.commitCount += user.commitCount;
      total.mergeCommitCount += user.mergeCommitCount;
      total.additions += user.additions;
      total.deletions += user.deletions;
      total.changedLines += user.changedLines;
      total.changedFiles += user.changedFiles;
      return total;
    },
    {
      projects: projects.length,
      projectsWithCommits: projectsWithCommits.size,
      activeAuthors: userRows.length,
      commitCount: 0,
      mergeCommitCount: 0,
      additions: 0,
      deletions: 0,
      changedLines: 0,
      changedFiles: 0,
    },
  );
  const diffCollected = commits.filter((commit) => commit.diff.status !== "not_collected").length;
  const diffErrors = commits.filter((commit) => commit.diff.status === "error").length;

  return {
    source: {
      generatedAt: collectedAt.toISOString(),
      baseUrl,
      group,
      period: `${dateKeyKst(since)} ~ ${dateKeyKst(until)}`,
      since,
      until,
      branchScope: "all",
      linePolicy: "merge commit 제외 · GitLab commit stats 기준",
      detailPolicy: `회차당 신규 ${diffCommitLimit.toLocaleString("en-US")}개 비-merge 커밋의 변경 파일 경로를 증분 저장`,
      projectCount: projects.length,
      projectErrors,
      diffCoverage: {
        eligibleCommits: commits.filter((commit) => !commit.isMerge).length,
        collectedCommits: diffCollected,
        errorCommits: diffErrors,
      },
    },
    totals,
    months: mapPeriods(months),
    days: mapPeriods(days),
    users: userRows,
  };
}

export async function writeGitlabActivitySnapshot(snapshot, {
  targetRootDir = process.cwd(),
  outputPath = "src/data/gitlabActivitySnapshot.json",
} = {}) {
  const absolutePath = path.resolve(targetRootDir, outputPath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, `${JSON.stringify(snapshot, null, 2)}\n`);
  return absolutePath;
}

export function summarizeDiffs(diffs) {
  const files = diffs.slice(0, 20).map((diff) => ({
    path: diff.new_path || diff.old_path,
    previousPath: diff.renamed_file ? diff.old_path : null,
    status: diff.new_file ? "added" : diff.deleted_file ? "deleted" : diff.renamed_file ? "renamed" : "modified",
    generated: isGeneratedPath(diff.new_path || diff.old_path),
    collapsed: Boolean(diff.collapsed),
    tooLarge: Boolean(diff.too_large),
  }));
  return {
    status: diffs.some((diff) => diff.too_large) ? "partial" : "complete",
    changedFiles: diffs.length,
    files,
    filesTruncated: diffs.length > files.length,
    error: null,
  };
}

function normalizeCommit(commit, project) {
  const authoredAt = commit.authored_date || commit.committed_date;
  const stats = commit.stats ?? {};
  const additions = finiteNumber(stats.additions);
  const deletions = finiteNumber(stats.deletions);
  return {
    projectId: project.id,
    projectPath: project.path_with_namespace,
    projectName: project.name,
    projectWebUrl: project.web_url,
    sha: commit.id,
    shortId: commit.short_id || commit.id.slice(0, 8),
    title: commit.title || commit.message?.split("\n")[0] || "제목 없음",
    message: commit.message || commit.title || "",
    authoredAt,
    committedAt: commit.committed_date || authoredAt,
    day: dateKeyKst(authoredAt),
    month: dateKeyKst(authoredAt).slice(0, 7),
    authorName: commit.author_name || "",
    authorEmail: normalizeEmail(commit.author_email || ""),
    committerName: commit.committer_name || "",
    committerEmail: normalizeEmail(commit.committer_email || ""),
    webUrl: commit.web_url,
    parentIds: Array.isArray(commit.parent_ids) ? commit.parent_ids : [],
    isMerge: Array.isArray(commit.parent_ids) && commit.parent_ids.length > 1,
    additions,
    deletions,
    changedLines: additions + deletions,
  };
}

function emptyUser(email) {
  return {
    email,
    sourceEmails: new Set(),
    authorNames: new Set(),
    projectIds: new Set(),
    activeDays: new Set(),
    commitCount: 0,
    mergeCommitCount: 0,
    additions: 0,
    deletions: 0,
    changedLines: 0,
    changedFiles: 0,
    monthly: new Map(),
    daily: new Map(),
    projects: new Map(),
    recentCommits: [],
  };
}

function addMetrics(target, commit) {
  if (commit.isMerge) {
    target.mergeCommitCount += 1;
    return;
  }
  target.commitCount += 1;
  target.additions += commit.additions;
  target.deletions += commit.deletions;
  target.changedLines += commit.changedLines;
  target.changedFiles += commit.diff.changedFiles ?? 0;
}

function addPeriodMetrics(map, key, commit, canonicalAuthorEmail) {
  const target = map.get(key) ?? {
    key,
    commitCount: 0,
    mergeCommitCount: 0,
    additions: 0,
    deletions: 0,
    changedLines: 0,
    changedFiles: 0,
    activeAuthors: new Set(),
    activeProjects: new Set(),
  };
  addMetrics(target, commit);
  target.activeAuthors.add(canonicalAuthorEmail);
  target.activeProjects.add(commit.projectId);
  map.set(key, target);
}

function addProjectMetrics(map, projectPath, commit) {
  const target = map.get(projectPath) ?? {
    path: projectPath,
    name: commit.projectName,
    webUrl: commit.projectWebUrl,
    commitCount: 0,
    mergeCommitCount: 0,
    additions: 0,
    deletions: 0,
    changedLines: 0,
    changedFiles: 0,
  };
  addMetrics(target, commit);
  map.set(projectPath, target);
}

function finalizeUser(user) {
  return {
    email: user.email,
    sourceEmails: [...user.sourceEmails].sort(),
    authorNames: [...user.authorNames].sort((a, b) => a.localeCompare(b, "ko")),
    commitCount: user.commitCount,
    mergeCommitCount: user.mergeCommitCount,
    additions: user.additions,
    deletions: user.deletions,
    changedLines: user.changedLines,
    changedFiles: user.changedFiles,
    activeDays: user.activeDays.size,
    projectCount: user.projectIds.size,
    isBot: /(?:bot|noreply|gitlab-ci|dependabot)/i.test(user.email),
    monthly: Object.fromEntries(mapPeriods(user.monthly).map(({ key, ...metrics }) => [key, metrics])),
    daily: Object.fromEntries(mapPeriods(user.daily).map(({ key, ...metrics }) => [key, metrics])),
    projects: [...user.projects.values()].sort(
      (a, b) => b.changedLines - a.changedLines || b.commitCount - a.commitCount || a.path.localeCompare(b.path),
    ),
    commits: user.recentCommits
      .sort((a, b) => b.authoredAt.localeCompare(a.authoredAt) || a.sha.localeCompare(b.sha))
  };
}

function commitForSnapshot(commit) {
  return {
    projectId: commit.projectId,
    projectPath: commit.projectPath,
    projectName: commit.projectName,
    projectWebUrl: commit.projectWebUrl,
    sha: commit.sha,
    shortId: commit.shortId,
    title: commit.title,
    authoredAt: commit.authoredAt,
    day: commit.day,
    month: commit.month,
    webUrl: commit.webUrl,
    isMerge: commit.isMerge,
    additions: commit.isMerge ? 0 : commit.additions,
    deletions: commit.isMerge ? 0 : commit.deletions,
    changedLines: commit.isMerge ? 0 : commit.changedLines,
    diff: commit.diff,
  };
}

function mapPeriods(map) {
  return [...map.values()]
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((period) => ({
      ...period,
      activeAuthors: period.activeAuthors.size,
      activeProjects: period.activeProjects.size,
    }));
}

function projectDescriptor(project) {
  return {
    id: project.id,
    name: project.name,
    path: project.path_with_namespace,
    webUrl: project.web_url,
    defaultBranch: project.default_branch ?? null,
  };
}

function dedupeCommits(commits) {
  return [...new Map(commits.map((commit) => [commit.id, commit])).values()];
}

function commitKey(commit) {
  return `${commit.projectId}:${commit.sha}`;
}

function previousDiffMap(snapshot) {
  const rows = snapshot?.users?.flatMap((user) => user.commits ?? user.recentCommits ?? []) ?? [];
  return new Map(
    rows
      .filter((commit) => commit?.projectId && commit?.sha && ["complete", "partial"].includes(commit?.diff?.status))
      .map((commit) => [`${commit.projectId}:${commit.sha}`, commit.diff]),
  );
}

async function getAllPages(baseUrl, { headers, fetchImpl, query = {} }) {
  const rows = [];
  const perPage = 100;
  for (let page = 1; ; page += 1) {
    const url = new URL(baseUrl);
    for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value);
    url.searchParams.set("per_page", String(perPage));
    url.searchParams.set("page", String(page));
    const pageRows = await getJson(url, { headers, fetchImpl });
    if (!Array.isArray(pageRows)) throw new Error(`${url.pathname} 응답이 배열이 아닙니다.`);
    rows.push(...pageRows);
    if (pageRows.length < perPage) return rows;
  }
}

async function getJson(url, { headers, fetchImpl }) {
  const response = await fetchImpl(url, { headers });
  if (!response.ok) {
    const body = (await response.text()).slice(0, 300);
    throw new Error(`GitLab API ${response.status}: ${body || response.statusText}`);
  }
  return response.json();
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await mapper(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, Math.max(items.length, 1)) }, worker));
  return results;
}

async function readLocalEnv(filePath) {
  if (!existsSync(filePath)) return {};
  const env = {};
  for (const line of (await readFile(filePath, "utf8")).split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value;
  }
  return env;
}

async function loadAuthorAliases(env, targetRootDir) {
  const aliasPath = path.resolve(
    targetRootDir,
    env.GITLAB_AUTHOR_ALIAS_PATH || "src/data/gitlabAuthorAliases.json",
  );
  let aliases = {};
  if (existsSync(aliasPath)) {
    aliases = JSON.parse(await readFile(aliasPath, "utf8"));
  }
  if (env.GITLAB_AUTHOR_ALIASES?.trim()) {
    aliases = { ...aliases, ...JSON.parse(env.GITLAB_AUTHOR_ALIASES) };
  }
  return Object.fromEntries(
    Object.entries(aliases).map(([source, target]) => [normalizeEmail(source), normalizeEmail(target)]),
  );
}

function requiredEnv(env, name) {
  const value = env[name]?.trim();
  if (!value) throw new Error(`${name}가 필요합니다.`);
  return value;
}

function normalizeDateTime(value, name) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) throw new Error(`${name} 날짜 형식이 올바르지 않습니다.`);
  return parsed.toISOString();
}

function positiveInteger(value, fallback) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function nonNegativeInteger(value, fallback) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function finiteNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function canonicalEmail(email, aliases) {
  return aliases[email] || email;
}

function dateKeyKst(value) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function safeError(error) {
  return error instanceof Error ? error.message.slice(0, 500) : String(error).slice(0, 500);
}

function isGeneratedPath(filePath = "") {
  return /(^|\/)(?:node_modules|dist|build|coverage|vendor|generated)(\/|$)|(?:^|\/)(?:package-lock|yarn\.lock|pnpm-lock|composer\.lock)|\.(?:min\.js|min\.css|map)$/i.test(filePath);
}

async function runCli() {
  const targetRootDir = process.cwd();
  const env = await loadGitlabEnv({ targetRootDir });
  const outputPath = path.resolve(targetRootDir, "src/data/gitlabActivitySnapshot.json");
  const existing = existsSync(outputPath) ? JSON.parse(await readFile(outputPath, "utf8")) : null;
  try {
    const snapshot = await collectGitlabActivity({
      env,
      collectedAt: new Date(),
      existingSnapshot: existing,
      targetRootDir,
    });
    await writeGitlabActivitySnapshot(snapshot, { targetRootDir });
    console.log(`Wrote ${path.relative(targetRootDir, outputPath)}`);
    console.log(
      `${snapshot.source.group.path}: ${snapshot.totals.projects} projects · ${snapshot.totals.activeAuthors} authors · ${snapshot.totals.commitCount} commits · ${snapshot.totals.changedLines} changed lines`,
    );
    if (snapshot.source.projectErrors.length > 0) {
      console.warn(`Partial collection: ${snapshot.source.projectErrors.length} project errors`);
      process.exitCode = 2;
    }
  } catch (error) {
    if (existing?.totals?.commitCount > 0) {
      console.error(`GitLab collection failed; preserved existing snapshot: ${safeError(error)}`);
      process.exitCode = 2;
      return;
    }
    throw error;
  }
}

const isCli = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isCli) {
  runCli().catch((error) => {
    console.error(safeError(error));
    process.exitCode = 1;
  });
}
