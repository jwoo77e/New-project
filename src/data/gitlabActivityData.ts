import snapshotJson from "./gitlabActivitySnapshot.json";

export type GitlabActivityMetrics = {
  commitCount: number;
  mergeCommitCount: number;
  additions: number;
  deletions: number;
  changedLines: number;
  changedFiles: number;
  activeDays: number;
};

export type GitlabCommitFile = {
  path: string;
  previousPath: string | null;
  status: "added" | "deleted" | "renamed" | "modified";
  generated: boolean;
  collapsed: boolean;
  tooLarge: boolean;
};

export type GitlabCommitSummary = {
  projectId: number;
  projectPath: string;
  projectName: string;
  projectWebUrl: string;
  sha: string;
  shortId: string;
  title: string;
  authoredAt: string;
  day: string;
  month: string;
  webUrl: string;
  isMerge: boolean;
  additions: number;
  deletions: number;
  changedLines: number;
  diff: {
    status: "complete" | "partial" | "error" | "not_collected";
    changedFiles: number | null;
    files: GitlabCommitFile[];
    filesTruncated: boolean;
    error: string | null;
  };
};

type GitlabPeriodSnapshot = Omit<GitlabActivityMetrics, "activeDays"> & {
  activeAuthors: number;
  activeProjects: number;
};

export type GitlabActivityUser = Omit<GitlabActivityMetrics, "activeDays"> & {
  email: string;
  sourceEmails: string[];
  authorNames: string[];
  activeDays: number;
  projectCount: number;
  isBot: boolean;
  monthly: Record<string, GitlabPeriodSnapshot>;
  daily: Record<string, GitlabPeriodSnapshot>;
  projects: Array<{
    path: string;
    name: string;
    webUrl: string;
    commitCount: number;
    mergeCommitCount: number;
    additions: number;
    deletions: number;
    changedLines: number;
    changedFiles: number;
  }>;
  commits: GitlabCommitSummary[];
};

type GitlabActivitySnapshot = {
  source: {
    generatedAt: string;
    baseUrl: string;
    group: { id: number; path: string; name: string };
    period: string;
    since: string;
    until: string;
    branchScope: "all";
    linePolicy: string;
    detailPolicy: string;
    projectCount: number;
    projectErrors: Array<{ projectId: number; projectPath: string; error: string }>;
    diffCoverage: { eligibleCommits: number; collectedCommits: number; errorCommits: number };
  };
  totals: Omit<GitlabActivityMetrics, "activeDays"> & {
    projects: number;
    projectsWithCommits: number;
    activeAuthors: number;
  };
  months: Array<GitlabPeriodSnapshot & { key: string }>;
  days: Array<GitlabPeriodSnapshot & { key: string }>;
  users: GitlabActivityUser[];
};

const snapshot = snapshotJson as unknown as GitlabActivitySnapshot;
const userByEmail = new Map(snapshot.users.map((user) => [user.email, user] as const));

const emptyMetrics = (): GitlabActivityMetrics => ({
  commitCount: 0,
  mergeCommitCount: 0,
  additions: 0,
  deletions: 0,
  changedLines: 0,
  changedFiles: 0,
  activeDays: 0,
});

function addPeriod(target: GitlabActivityMetrics, period?: GitlabPeriodSnapshot) {
  if (!period) return;
  target.commitCount += period.commitCount;
  target.mergeCommitCount += period.mergeCommitCount;
  target.additions += period.additions;
  target.deletions += period.deletions;
  target.changedLines += period.changedLines;
  target.changedFiles += period.changedFiles;
}

export function gitlabUserMetricsForRange(email: string, startDate: string, endDate: string) {
  const user = userByEmail.get(email.toLowerCase());
  const metrics = emptyMetrics();
  if (!user) return metrics;
  for (const [date, period] of Object.entries(user.daily)) {
    if (date < startDate || date > endDate) continue;
    addPeriod(metrics, period);
    if (period.commitCount > 0 || period.mergeCommitCount > 0) metrics.activeDays += 1;
  }
  return metrics;
}

export function gitlabUserMetricsForMonth(email: string, month: string) {
  return gitlabUserMetricsForRange(email, `${month}-01`, `${month}-31`);
}

export function gitlabSummaryForRange(startDate: string, endDate: string) {
  const metrics = emptyMetrics();
  const activeAuthors = new Set<string>();
  const activeProjects = new Set<string>();
  for (const user of snapshot.users) {
    const userMetrics = gitlabUserMetricsForRange(user.email, startDate, endDate);
    if (userMetrics.commitCount > 0 || userMetrics.mergeCommitCount > 0) activeAuthors.add(user.email);
    metrics.commitCount += userMetrics.commitCount;
    metrics.mergeCommitCount += userMetrics.mergeCommitCount;
    metrics.additions += userMetrics.additions;
    metrics.deletions += userMetrics.deletions;
    metrics.changedLines += userMetrics.changedLines;
    metrics.changedFiles += userMetrics.changedFiles;
    metrics.activeDays = Math.max(metrics.activeDays, userMetrics.activeDays);
    for (const commit of user.commits) {
      if (commit.day >= startDate && commit.day <= endDate) activeProjects.add(commit.projectPath);
    }
  }
  return { ...metrics, activeAuthors: activeAuthors.size, activeProjects: activeProjects.size };
}

export function gitlabCommitsForRange(email: string, startDate: string, endDate: string) {
  return (userByEmail.get(email.toLowerCase())?.commits ?? []).filter(
    (commit) => commit.day >= startDate && commit.day <= endDate,
  );
}

export const gitlabActivityData = {
  ...snapshot,
  userByEmail,
};
