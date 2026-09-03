import { describe, expect, it } from "vitest";
import {
  gitlabCommittedCodeRatio,
  gitlabActivityData,
  gitlabCommitsForRange,
  gitlabSummaryForRange,
  gitlabUserMetricsForMonth,
} from "./gitlabActivityData";

describe("gitlabActivityData", () => {
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
      period: "2026-05-01 ~ 2026-09-03",
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
      commitCount: 295,
      mergeCommitCount: 139,
      additions: 573926,
      deletions: 55167,
      changedLines: 629093,
      activeAuthors: 14,
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

  it("calculates committed additions against generated code lines without capping the ratio", () => {
    expect(gitlabCommittedCodeRatio(1_000, 250)).toBe(25);
    expect(gitlabCommittedCodeRatio(1_000, 1_500)).toBe(150);
    expect(gitlabCommittedCodeRatio(0, 250)).toBeNull();
    expect(gitlabCommittedCodeRatio(null, 250)).toBeNull();
  });
});
