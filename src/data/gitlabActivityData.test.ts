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
  it("covers September and October week one without claiming the full October month", () => {
    expect(gitlabRangeCoverage("2026-09-28", "2026-09-30")).toMatchObject({available: true, complete: true});
    expect(gitlabRangeCoverage("2026-09-01", "2026-09-30")).toMatchObject({available: true, complete: true});
    expect(gitlabRangeCoverage("2026-09-17", "2026-09-27")).toMatchObject({available: true, complete: true});
    expect(gitlabRangeCoverage("2026-10-01", "2026-10-07")).toMatchObject({available: true, complete: true});
    expect(gitlabRangeCoverage("2026-10-01", "2026-10-31")).toMatchObject({available: true, complete: false});
    expect(gitlabRangeCoverage("2026-10-08", "2026-10-14")).toMatchObject({available: false, complete: false});
  });
  it("includes September week two GitLab activity", () => {
    expect(gitlabSummaryForRange("2026-09-10", "2026-09-16")).toMatchObject({
      activeAuthors: 16, commitCount: 522, mergeCommitCount: 76,
      additions: 123233, deletions: 23521, changedLines: 146754,
    });
  });
  it("includes September 17-27 activity from the error-free GitLab refresh", () => {
    expect(gitlabActivityData.source).toMatchObject({
      period: "2026-05-01 ~ 2026-10-07",
      refreshedPeriod: "2026-10-01 ~ 2026-10-07",
      projectCount: 103,
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
      period: "2026-05-01 ~ 2026-10-07",
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
      commitCount: 459, mergeCommitCount: 68, additions: 541171,
      deletions: 51591, changedLines: 592762, activeAuthors: 15,
    });
    const commits = gitlabActivityData.users.flatMap(user =>
      gitlabCommitsForRange(user.email, week.startDate, week.endDate),
    );
    expect(commits).toHaveLength(527);
    expect(new Set(commits.map(commit => `${commit.projectId}:${commit.sha}`)).size).toBe(527);
    expect(commits.filter(commit => !commit.isMerge)).toHaveLength(459);
    expect(commits.filter(commit => !commit.isMerge).every(commit =>
      ["complete", "partial"].includes(commit.diff.status),
    )).toBe(true);
    for (const user of gitlabActivityData.users) {
      const userCommits = gitlabCommitsForRange(user.email, week.startDate, week.endDate);
      if (userCommits.length === 0) continue;
      expect(individualUtilizationData.users.some(person => person.email === user.email)).toBe(true);
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
    expect(gitlab).toMatchObject({commitCount: 154, mergeCommitCount: 14, additions: 194050, deletions: 17132});
    expect(gitlabCommittedCodeRatio(combined.codeLines, gitlab.additions)).toBeCloseTo(325.8387346);
    expect(gitlabUserMetricsForRange("mjlee0828@riskzero.kr", week.startDate, week.endDate))
      .toMatchObject({commitCount: 35, additions: 283184, deletions: 21877});
  });

  it("calculates committed additions against generated code lines without capping the ratio", () => {
    expect(gitlabCommittedCodeRatio(1_000, 250)).toBe(25);
    expect(gitlabCommittedCodeRatio(1_000, 1_500)).toBe(150);
    expect(gitlabCommittedCodeRatio(0, 250)).toBeNull();
    expect(gitlabCommittedCodeRatio(null, 250)).toBeNull();
  });
});
