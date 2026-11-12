import { isCurrentEmployee } from "./activeRoster";
import { describe, expect, it } from "vitest";
import {
  gitlabCommittedCodeRatio,
  gitlabRangeCoverage,
  gitlabActivityData,
  gitlabCommitsForRange,
  gitlabSummaryForRange,
  gitlabUserMetricsForMonth,
  gitlabUserMetricsForRange,
} from "./gitlabActivityData";
import { codexUsageForRange, combinedAiUsage } from "./codexUsageData";
import { individualUtilizationData } from "./individualUtilizationData";

describe("gitlabActivityData", () => {
  it("reconciles November week two with the collected Korean authored dates and individual commit stats", () => {
    const startDate = "2026-11-05";
    const endDate = "2026-11-11";
    expect(gitlabRangeCoverage(startDate, endDate)).toMatchObject({available: true, complete: true});
    expect(gitlabSummaryForRange(startDate, endDate)).toMatchObject({
      commitCount: 444, mergeCommitCount: 106, additions: 279274, deletions: 90302,
      changedLines: 369576, activeAuthors: 15,
    });
    const rows = gitlabActivityData.users.flatMap(user => gitlabCommitsForRange(user.email, startDate, endDate));
    expect(rows).toHaveLength(550);
    expect(new Set(rows.map(row => `${row.projectId}:${row.sha}`)).size).toBe(550);
    expect(rows.every(row => {
      const authoredDay = new Date(Date.parse(row.authoredAt) + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
      return row.day === authoredDay && authoredDay >= startDate && authoredDay <= endDate;
    })).toBe(true);
    const nonMerge = rows.filter(row => !row.isMerge);
    expect(nonMerge).toHaveLength(444);
    expect(nonMerge.reduce((sum, row) => sum + row.additions, 0)).toBe(279274);
    expect(nonMerge.reduce((sum, row) => sum + row.deletions, 0)).toBe(90302);
    expect(nonMerge.every(row => ["complete", "partial"].includes(row.diff.status))).toBe(true);
    expect(gitlabUserMetricsForRange("wody@riskzero.kr", startDate, endDate))
      .toMatchObject({commitCount: 104, mergeCommitCount: 19, additions: 39673, deletions: 2405});
    expect(gitlabUserMetricsForRange("woosung.jeon@riskzero.kr", startDate, endDate))
      .toMatchObject({commitCount: 75, mergeCommitCount: 24, additions: 43511, deletions: 1254});
  });
  it("reconciles November week one for the same seven Korean authored dates as the AI sources", () => {
    expect(gitlabRangeCoverage("2026-10-29", "2026-11-04")).toMatchObject({available: true, complete: true});
    expect(gitlabSummaryForRange("2026-10-29", "2026-11-04")).toMatchObject({
      commitCount: 351, mergeCommitCount: 83, additions: 148597, deletions: 80154,
      changedLines: 228751, activeAuthors: 15,
    });
    const rows = gitlabActivityData.users.flatMap(user => gitlabCommitsForRange(user.email, "2026-10-29", "2026-11-04"));
    expect(rows).toHaveLength(434);
    expect(new Set(rows.map(row => `${row.projectId}:${row.sha}`)).size).toBe(434);
    expect(rows.filter(row => !row.isMerge).every(row => ["complete", "partial"].includes(row.diff.status))).toBe(true);
    const week = individualUtilizationData.weeklyUsage["2026-11-W1"];
    const email = "wody@riskzero.kr";
    const combined = combinedAiUsage(week.users[email].totalTokens, week.users[email].codeLines,
      codexUsageForRange(email, week.startDate, week.endDate));
    expect(combined).toEqual({tokens: 4749410955, codeLines: 123833, partial: false});
    const metrics = gitlabUserMetricsForRange(email, week.startDate, week.endDate);
    expect(metrics).toMatchObject({commitCount: 60, mergeCommitCount: 10, additions: 54474, deletions: 4598});
    expect(gitlabCommittedCodeRatio(combined.codeLines, metrics.additions)).toBeCloseTo(54474 / 123833 * 100);
  });
  it("reconciles the full October refresh by Korean authored date and unique project plus SHA", () => {
    const rows = gitlabActivityData.users.flatMap(user => gitlabCommitsForRange(user.email, "2026-10-01", "2026-10-31"));
    expect(gitlabSummaryForRange("2026-10-01", "2026-10-31")).toMatchObject({
      commitCount: 1620, mergeCommitCount: 396, additions: 1388693,
      deletions: 194468, changedLines: 1583161, activeAuthors: 16,
    });
    expect(rows).toHaveLength(2016);
    expect(new Set(rows.map(row => `${row.projectId}:${row.sha}`)).size).toBe(rows.length);
    expect(rows.filter(row => !row.isMerge).every(row => ["complete", "partial"].includes(row.diff.status))).toBe(true);
    expect(rows.every(row => row.day >= "2026-10-01" && row.day <= "2026-10-31")).toBe(true);
  });
  it("reconciles October week four by Korean authored date with every non-merge diff collected", () => {
    expect(gitlabRangeCoverage("2026-10-22", "2026-10-28"))
      .toMatchObject({available: true, complete: true});
    expect(gitlabSummaryForRange("2026-10-22", "2026-10-28")).toMatchObject({
      commitCount: 337, mergeCommitCount: 139, additions: 134040,
      deletions: 14989, changedLines: 149029, activeAuthors: 14,
    });
    const commits = gitlabActivityData.users.flatMap(user => gitlabCommitsForRange(user.email, "2026-10-22", "2026-10-28"));
    expect(commits).toHaveLength(476);
    expect(new Set(commits.map(commit => `${commit.projectId}:${commit.sha}`)).size).toBe(476);
    expect(commits.every(commit => commit.day >= "2026-10-22" && commit.day <= "2026-10-28")).toBe(true);
    expect(gitlabActivityData.source.diffCoverage.errorCommits).toBe(0);
  });
  it("covers the complete September and October months and their weekly ranges", () => {
    expect(gitlabRangeCoverage("2026-09-28", "2026-09-30")).toMatchObject({available: true, complete: true});
    expect(gitlabRangeCoverage("2026-09-01", "2026-09-30")).toMatchObject({available: true, complete: true});
    expect(gitlabRangeCoverage("2026-09-17", "2026-09-27")).toMatchObject({available: true, complete: true});
    expect(gitlabRangeCoverage("2026-10-01", "2026-10-07")).toMatchObject({available: true, complete: true});
    expect(gitlabRangeCoverage("2026-10-01", "2026-10-31")).toMatchObject({available: true, complete: true});
    expect(gitlabRangeCoverage("2026-10-08", "2026-10-14")).toMatchObject({available: true, complete: true});
    expect(gitlabRangeCoverage("2026-10-15", "2026-10-21")).toMatchObject({available: true, complete: true});
    expect(gitlabSummaryForRange("2026-10-15", "2026-10-21")).toMatchObject({
      commitCount: 313, mergeCommitCount: 72, additions: 142424, deletions: 54331, changedLines: 196755, activeAuthors: 14,
    });
    const commits = gitlabActivityData.users.flatMap(user => gitlabCommitsForRange(user.email, "2026-10-15", "2026-10-21"));
    expect(commits).toHaveLength(385);
    expect(new Set(commits.map(commit => `${commit.projectId}:${commit.sha}`)).size).toBe(385);
    expect(commits.every(commit => commit.day >= "2026-10-15" && commit.day <= "2026-10-21")).toBe(true);
  });
  it("includes September week two GitLab activity", () => {
    expect(gitlabSummaryForRange("2026-09-10", "2026-09-16")).toMatchObject({
      activeAuthors: 16, commitCount: 522, mergeCommitCount: 76,
      additions: 123233, deletions: 23521, changedLines: 146754,
    });
  });
  it("includes September 17-27 activity from the error-free GitLab refresh", () => {
    expect(gitlabActivityData.source).toMatchObject({
      period: "2026-05-01 ~ 2026-11-11",
      refreshedPeriod: "2026-11-05 ~ 2026-11-11",
      projectCount: 108,
      projectErrors: [],
    });
    expect(gitlabSummaryForRange("2026-09-17", "2026-09-27")).toMatchObject({
      commitCount: 521, mergeCommitCount: 157, additions: 143261,
      deletions: 18322, changedLines: 161583, activeAuthors: 14,
    });
  });
  it("reconciles user totals with the source snapshot", () => {
    const totals = gitlabActivityData.users.reduce(
      (sum, user) => ({
        commits: sum.commits + user.commitCount,
        merges: sum.merges + user.mergeCommitCount,
        lines: sum.lines + user.changedLines,
      }),
      { commits: 0, merges: 0, lines: 0 },
    );

    expect(totals).toEqual({
      commits: gitlabActivityData.totals.commitCount,
      merges: gitlabActivityData.totals.mergeCommitCount,
      lines: gitlabActivityData.totals.changedLines,
    });
    expect(gitlabActivityData.source.projectErrors).toEqual([]);
  });

  it("merges known personal Git emails into company accounts", () => {
    expect(gitlabActivityData.userByEmail.has("hchbae1001@gmail.com")).toBe(false);
    expect(gitlabActivityData.userByEmail.get("hchbae1001@riskzero.kr")?.sourceEmails).toContain(
      "hchbae1001@gmail.com",
    );
    expect(gitlabActivityData.userByEmail.has("seighaft@gmail.com")).toBe(false);
    expect(gitlabActivityData.userByEmail.has("sieghaft@gmail.com")).toBe(false);
    expect(gitlabActivityData.userByEmail.get("sieghaft@riskzero.kr")?.sourceEmails).toContain(
      "seighaft@gmail.com",
    );
    expect(gitlabActivityData.userByEmail.get("sieghaft@riskzero.kr")?.sourceEmails).toContain(
      "sieghaft@gmail.com",
    );
  });

  it("reconciles the refreshed August fourth-week GitLab activity", () => {
    const summary = gitlabSummaryForRange("2026-08-20", "2026-08-26");

    expect(summary).toMatchObject({
      commitCount: 394,
      mergeCommitCount: 127,
      additions: 630264,
      deletions: 8510,
      changedLines: 638774,
      activeAuthors: 13,
    });
  });

  it("publishes the complete August month and August 27 to September 2 range", () => {
    expect(gitlabActivityData.source).toMatchObject({
      period: "2026-05-01 ~ 2026-11-11",
      projectErrors: [],
    });
    expect(gitlabSummaryForRange("2026-08-01", "2026-08-31")).toMatchObject({
      commitCount: 911,
      mergeCommitCount: 305,
      additions: 838264,
      deletions: 106116,
      changedLines: 944380,
      activeAuthors: 15,
    });
    expect(gitlabSummaryForRange("2026-08-27", "2026-09-02")).toMatchObject({
      commitCount: 319,
      mergeCommitCount: 135,
      additions: 590776,
      deletions: 61664,
      changedLines: 652440,
      activeAuthors: 15,
    });
  });

  it("supports month and arbitrary date-range filters", () => {
    const user = gitlabActivityData.users.find((item) => item.commitCount > 0)!;
    const august = gitlabUserMetricsForMonth(user.email, "2026-08");
    const commits = gitlabCommitsForRange(user.email, "2026-08-01", "2026-08-31");
    const summary = gitlabSummaryForRange("2026-08-01", "2026-08-31");

    expect(august.commitCount).toBe(commits.filter((commit) => !commit.isMerge).length);
    expect(summary.commitCount).toBe(
      gitlabActivityData.months.find((month) => month.key === "2026-08")?.commitCount,
    );
  });

  it("publishes September 3-9 individually and preserves the September 1-2 baseline", () => {
    expect(gitlabSummaryForRange("2026-09-03", "2026-09-09")).toMatchObject({
      commitCount: 373, mergeCommitCount: 77, additions: 146363,
      deletions: 74326, changedLines: 220689, activeAuthors: 16,
    });
    expect(gitlabUserMetricsForRange("wody@riskzero.kr", "2026-09-03", "2026-09-09")).toMatchObject({
      commitCount: 72, additions: 81279, deletions: 59051,
    });
    expect(gitlabUserMetricsForRange("woosung.jeon@riskzero.kr", "2026-09-03", "2026-09-09")).toMatchObject({
      commitCount: 83, additions: 16450, deletions: 3921,
    });
    expect(gitlabSummaryForRange("2026-09-01", "2026-09-02")).toMatchObject({commitCount: 162, changedLines: 598712});
    expect(gitlabSummaryForRange("2026-09-01", "2026-09-09")).toMatchObject({commitCount: 535, changedLines: 819401});
  });

  it("reconciles September month and week four with unique commit rows and uncapped combined-code ratios", () => {
    expect(gitlabSummaryForRange("2026-09-01", "2026-09-30")).toMatchObject({
      commitCount: 1912, mergeCommitCount: 400, additions: 1327514, deletions: 174821, changedLines: 1502335, activeAuthors: 16,
    });
    expect(gitlabSummaryForRange("2026-09-28", "2026-09-30")).toMatchObject({
      commitCount: 334, mergeCommitCount: 51, additions: 350780, deletions: 23817, changedLines: 374597, activeAuthors: 14,
    });
    const rows = gitlabActivityData.users.flatMap(user => gitlabCommitsForRange(user.email, "2026-09-01", "2026-09-30"));
    expect(new Set(rows.map(row => `${row.projectId}:${row.sha}`)).size).toBe(rows.length);
    expect(rows.filter(row => !row.isMerge)).toHaveLength(1912);
    expect(rows.filter(row => !row.isMerge).reduce((sum, row) => sum + row.additions, 0)).toBe(1327514);
    expect(gitlabCommittedCodeRatio(275786, gitlabUserMetricsForMonth("wody@riskzero.kr", "2026-09").additions)).toBeCloseTo(60.396104);
  });

  it("reconciles October week one for each author and recalculates ratios using the collected AI lines", () => {
    const week = individualUtilizationData.weeklyUsage["2026-10-W1"];
    expect(gitlabSummaryForRange(week.startDate, week.endDate)).toMatchObject({
      commitCount: 590, mergeCommitCount: 69, additions: 712770,
      deletions: 62870, changedLines: 775640, activeAuthors: 15,
    });
    const commits = gitlabActivityData.users.flatMap(user =>
      gitlabCommitsForRange(user.email, week.startDate, week.endDate),
    );
    expect(commits).toHaveLength(659);
    expect(new Set(commits.map(commit => `${commit.projectId}:${commit.sha}`)).size).toBe(659);
    expect(commits.filter(commit => !commit.isMerge)).toHaveLength(590);
    expect(commits.filter(commit => !commit.isMerge).every(commit =>
      ["complete", "partial"].includes(commit.diff.status),
    )).toBe(true);
    for (const user of gitlabActivityData.users) {
      const userCommits = gitlabCommitsForRange(user.email, week.startDate, week.endDate);
      if (userCommits.length === 0) continue;
      expect(individualUtilizationData.users.some(person => person.email === user.email)).toBe(isCurrentEmployee(user.email));
      const nonMerge = userCommits.filter(commit => !commit.isMerge);
      expect(gitlabUserMetricsForRange(user.email, week.startDate, week.endDate)).toMatchObject({
        commitCount: nonMerge.length,
        mergeCommitCount: userCommits.length - nonMerge.length,
        additions: nonMerge.reduce((sum, commit) => sum + commit.additions, 0),
        deletions: nonMerge.reduce((sum, commit) => sum + commit.deletions, 0),
      });
    }
    const email = "wody@riskzero.kr";
    const claude = week.users[email];
    const codex = codexUsageForRange(email, week.startDate, week.endDate);
    const combined = combinedAiUsage(claude.totalTokens, claude.codeLines, codex);
    expect(codex).toMatchObject({collected: true, complete: true, codeLines: 31670});
    expect(combined).toMatchObject({codeLines: 59554, partial: false});
    const gitlab = gitlabUserMetricsForRange(email, week.startDate, week.endDate);
    expect(gitlab).toMatchObject({commitCount: 160, mergeCommitCount: 14, additions: 226930, deletions: 17146});
    expect(gitlabCommittedCodeRatio(combined.codeLines, gitlab.additions)).toBeCloseTo(226930 / 59554 * 100);
    expect(gitlabUserMetricsForRange("mjlee0828@riskzero.kr", week.startDate, week.endDate))
      .toMatchObject({commitCount: 148, additions: 405701, deletions: 21917});
  });

  it("reconciles October week two commits and uses combined Claude and Codex lines for the ratio", () => {
    const week = individualUtilizationData.weeklyUsage["2026-10-W2"];
    expect(gitlabSummaryForRange(week.startDate, week.endDate)).toMatchObject({
      commitCount: 235, mergeCommitCount: 76, additions: 323341,
      deletions: 47088, changedLines: 370429, activeAuthors: 12,
    });
    const commits = gitlabActivityData.users.flatMap(user =>
      gitlabCommitsForRange(user.email, week.startDate, week.endDate),
    );
    expect(commits).toHaveLength(311);
    expect(new Set(commits.map(commit => `${commit.projectId}:${commit.sha}`)).size).toBe(311);
    expect(commits.filter(commit => !commit.isMerge)).toHaveLength(235);
    expect(commits.filter(commit => !commit.isMerge).every(commit =>
      ["complete", "partial"].includes(commit.diff.status),
    )).toBe(true);
    for (const user of gitlabActivityData.users) {
      const rows = gitlabCommitsForRange(user.email, week.startDate, week.endDate);
      if (!rows.length) continue;
      expect(individualUtilizationData.users.some(person => person.email === user.email)).toBe(isCurrentEmployee(user.email));
      expect(gitlabUserMetricsForRange(user.email, week.startDate, week.endDate)).toMatchObject({
        commitCount: rows.filter(row => !row.isMerge).length,
        mergeCommitCount: rows.filter(row => row.isMerge).length,
        additions: rows.filter(row => !row.isMerge).reduce((sum, row) => sum + row.additions, 0),
      });
    }
    const email = "wody@riskzero.kr";
    const claude = week.users[email];
    const combined = combinedAiUsage(claude.totalTokens, claude.codeLines,
      codexUsageForRange(email, week.startDate, week.endDate));
    expect(combined).toEqual({tokens: 1412736715, codeLines: 32612, partial: false});
    const gitlab = gitlabUserMetricsForRange(email, week.startDate, week.endDate);
    expect(gitlab).toMatchObject({commitCount: 56, mergeCommitCount: 10, additions: 69289});
    expect(gitlabCommittedCodeRatio(combined.codeLines, gitlab.additions)).toBeCloseTo(69289 / (6717 + 25895) * 100);
  });

  it("calculates committed additions against generated code lines without capping the ratio", () => {
    expect(gitlabCommittedCodeRatio(1_000, 250)).toBe(25);
    expect(gitlabCommittedCodeRatio(1_000, 1_500)).toBe(150);
    expect(gitlabCommittedCodeRatio(0, 250)).toBeNull();
    expect(gitlabCommittedCodeRatio(null, 250)).toBeNull();
  });
});
