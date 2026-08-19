import { describe, expect, it } from "vitest";
import { aggregateGitlabActivity, summarizeDiffs } from "./collect-gitlab-activity.mjs";

function commit(overrides = {}) {
  return {
    projectId: 1,
    projectPath: "riskzero1/platform/sample",
    projectName: "sample",
    projectWebUrl: "https://gitlab.example.com/riskzero1/platform/sample",
    sha: "abcdef123456",
    shortId: "abcdef12",
    title: "Add activity collector",
    message: "Add activity collector",
    authoredAt: "2026-08-12T03:00:00.000Z",
    committedAt: "2026-08-12T03:00:00.000Z",
    day: "2026-08-12",
    month: "2026-08",
    authorName: "Kim Developer",
    authorEmail: "dev@riskzero.kr",
    committerName: "Kim Developer",
    committerEmail: "dev@riskzero.kr",
    webUrl: "https://gitlab.example.com/commit/abcdef123456",
    parentIds: ["parent"],
    isMerge: false,
    additions: 120,
    deletions: 20,
    changedLines: 140,
    diff: {
      status: "complete",
      changedFiles: 2,
      files: [{ path: "src/app.ts", status: "modified", generated: false, collapsed: false, tooLarge: false }],
      filesTruncated: false,
      error: null,
    },
    ...overrides,
  };
}

describe("GitLab activity aggregation", () => {
  it("excludes merge commits from line totals while retaining their count", () => {
    const snapshot = aggregateGitlabActivity({
      collectedAt: new Date("2026-08-19T00:00:00.000Z"),
      baseUrl: "https://gitlab.example.com",
      group: { id: 5, path: "riskzero1", name: "riskzero1" },
      since: "2026-05-01T00:00:00.000Z",
      until: "2026-08-19T00:00:00.000Z",
      projects: [{ id: 1, path: "riskzero1/platform/sample" }],
      commits: [
        commit(),
        commit({
          sha: "merge123456",
          shortId: "merge123",
          title: "Merge branch feature",
          parentIds: ["one", "two"],
          isMerge: true,
          additions: 500,
          deletions: 100,
          changedLines: 600,
        }),
      ],
      diffCommitLimit: 300,
    });

    expect(snapshot.totals).toMatchObject({
      commitCount: 1,
      mergeCommitCount: 1,
      additions: 120,
      deletions: 20,
      changedLines: 140,
      changedFiles: 2,
    });
    expect(snapshot.users[0]).toMatchObject({
      email: "dev@riskzero.kr",
      activeDays: 1,
      projectCount: 1,
      commitCount: 1,
      mergeCommitCount: 1,
    });
    expect(snapshot.users[0].monthly["2026-08"].changedLines).toBe(140);
  });

  it("stores file metadata without retaining raw diff contents", () => {
    const summary = summarizeDiffs([
      {
        old_path: "src/app.ts",
        new_path: "src/app.ts",
        new_file: false,
        deleted_file: false,
        renamed_file: false,
        diff: "+secret source line",
      },
      {
        old_path: "package-lock.json",
        new_path: "package-lock.json",
        new_file: false,
        deleted_file: false,
        renamed_file: false,
        diff: "+generated lock content",
      },
    ]);

    expect(summary.changedFiles).toBe(2);
    expect(summary.files[0]).not.toHaveProperty("diff");
    expect(summary.files[1]).toMatchObject({ generated: true });
  });

  it("merges configured personal Git emails into the company account", () => {
    const snapshot = aggregateGitlabActivity({
      collectedAt: new Date("2026-08-19T00:00:00.000Z"),
      baseUrl: "https://gitlab.example.com",
      group: { id: 5, path: "riskzero1", name: "riskzero1" },
      since: "2026-04-30T15:00:00.000Z",
      until: "2026-08-19T00:00:00.000Z",
      projects: [{ id: 1, path: "riskzero1/platform/sample" }],
      commits: [
        commit({ authorEmail: "dev@gmail.com" }),
        commit({ sha: "second", authorEmail: "dev@riskzero.kr", additions: 10, deletions: 5, changedLines: 15 }),
      ],
      authorAliases: { "dev@gmail.com": "dev@riskzero.kr" },
    });

    expect(snapshot.source.period).toBe("2026-05-01 ~ 2026-08-19");
    expect(snapshot.totals.activeAuthors).toBe(1);
    expect(snapshot.users[0]).toMatchObject({
      email: "dev@riskzero.kr",
      sourceEmails: ["dev@gmail.com", "dev@riskzero.kr"],
      commitCount: 2,
      changedLines: 155,
    });
  });
});
