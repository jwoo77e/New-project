import {describe, expect, it} from "vitest";
import snapshot from "./codexUsageSnapshot.json";
import {calendarMonthEnd, codexReportingWeeks, codexUsageForRange, combinedAiUsage} from "./codexUsageData";
import {individualUtilizationData} from "./individualUtilizationData";
import {calculateCodeOutputDensity} from "../lib/codeOutputDensity";
import {gitlabCommittedCodeRatio, gitlabUserMetricsForRange} from "./gitlabActivityData";

describe("Codex usage", () => {
  it("combines the October first-week export with all Claude sources and recalculates the GitLab ratio", () => {
    const week = individualUtilizationData.weeklyUsage["2026-10-W1"];
    const period = snapshot.periods.find(item => item.startDate === week.startDate && item.endDate === week.endDate)!;
    expect(period.fileName).toBe("leaderboard-users_workspace-riskzero_2026-10-01-to-2026-10-07.csv");
    expect(Object.keys(period.users)).toHaveLength(11);
    expect(Object.values(period.users).reduce((sum, usage) => sum + usage.tokens, 0)).toBe(4012510940);
    expect(Object.values(period.users).reduce((sum, usage) => sum + usage.codeLines, 0)).toBe(88310);
    for (const [email, usage] of Object.entries(period.users)) {
      expect(individualUtilizationData.users.some(user => user.email === email)).toBe(true);
      expect(codexUsageForRange(email, week.startDate, week.endDate))
        .toMatchObject({...usage, collected: true, complete: true, periodAligned: true});
    }
    const combinedUsers = individualUtilizationData.users.map(user => {
      const claude = week.users[user.email];
      return combinedAiUsage(claude?.totalTokens ?? null, claude?.codeLines ?? null,
        codexUsageForRange(user.email, week.startDate, week.endDate));
    });
    expect(combinedUsers.filter(usage => (usage.tokens ?? 0) > 0)).toHaveLength(34);
    expect(combinedUsers.reduce((sum, usage) => sum + (usage.tokens ?? 0), 0)).toBe(13150322946);
    expect(combinedUsers.reduce((sum, usage) => sum + (usage.codeLines ?? 0), 0)).toBe(279970);
    const email = "wody@riskzero.kr";
    const claude = week.users[email];
    const combined = combinedAiUsage(claude.totalTokens, claude.codeLines,
      codexUsageForRange(email, week.startDate, week.endDate));
    expect(combined).toEqual({tokens: 3697721149, codeLines: 59554, partial: false});
    expect(gitlabCommittedCodeRatio(combined.codeLines,
      gitlabUserMetricsForRange(email, week.startDate, week.endDate).additions)).toBeCloseTo(325.8387346);
    expect(codexUsageForRange("kys0392@riskzero.kr", week.startDate, week.endDate))
      .toMatchObject({tokens: 329420686, codeLines: 8678, present: true});
    expect(combinedAiUsage(null, null, codexUsageForRange("sjpark@riskzero.kr", week.startDate, week.endDate)))
      .toEqual({tokens: 596844, codeLines: 0, partial: true});
    expect(codexUsageForRange(email, "2026-10-01", "2026-10-31"))
      .toMatchObject({collected: true, complete: false});
  });
  it("uses combined generated lines as the commit ratio denominator", () => {
    const combined = combinedAiUsage(1399874957, 18294,
      codexUsageForRange("wody@riskzero.kr", "2026-09-03", "2026-09-09"));
    expect(gitlabCommittedCodeRatio(combined.codeLines, 33107)).toBe(50);
    expect(gitlabCommittedCodeRatio(0, 33107)).toBeNull();
    expect(gitlabCommittedCodeRatio(null, 33107)).toBeNull();
  });
  it("calculates density from combined lines and tokens, not per-tool densities", () => {
    const combined = combinedAiUsage(1399874957, 18294,
      codexUsageForRange("wody@riskzero.kr", "2026-09-03", "2026-09-09"));
    expect(calculateCodeOutputDensity(combined.codeLines!, combined.tokens!))
      .toBeCloseTo(66214 / 2961569089 * 1000000);
  });
  it("reconciles all nine exported accounts with existing dashboard users", () => {
    const users = snapshot.periods[0].users;
    expect(Object.keys(users)).toHaveLength(9);
    expect(Object.keys(users).every((email) => individualUtilizationData.users.some((u) => u.email === email))).toBe(true);
    expect(Object.values(users).reduce((n, u) => n + u.tokens, 0)).toBe(2881020762);
    expect(Object.values(users).reduce((n, u) => n + u.codeLines, 0)).toBe(77134);
  });
  it("adds matched same-week Claude and Codex values without credits-based exclusions", () => {
    const codex = codexUsageForRange("WODY@riskzero.kr", "2026-09-03", "2026-09-09");
    expect(codex).toMatchObject({present: true, tokens: 1561694132, codeLines: 47920, complete: true});
    expect(combinedAiUsage(1399874957, 18294, codex)).toEqual({tokens: 2961569089, codeLines: 66214, partial: false});
    expect(codexUsageForRange("kys0392@riskzero.kr", "2026-09-03", "2026-09-09").tokens).toBe(458094039);
  });
  it("distinguishes absent users from an uncollected or overlapping period", () => {
    expect(codexUsageForRange("yspark@riskzero.kr", "2026-09-03", "2026-09-09")).toMatchObject({collected: true, present: false, tokens: 0});
    expect(codexUsageForRange("wody@riskzero.kr", "2026-08-01", "2026-08-31")).toMatchObject({collected: false, present: false, tokens: 0});
    expect(codexUsageForRange("wody@riskzero.kr", "2026-09-04", "2026-09-05")).toMatchObject({collected: false, overlapping: true, tokens: 0});
  });
  it("uses the full monthly export once while retaining Claude partial coverage", () => {
    const codex = codexUsageForRange("wody@riskzero.kr", "2026-09-01", "2026-09-30");
    expect(codex).toMatchObject({collected: true, complete: true, overlapping: false, tokens: 4280170960, codeLines: 184747});
    expect(combinedAiUsage(2003677746, 32922, codex, false)).toEqual({tokens: 6283848706, codeLines: 217669, partial: true});
    expect(combinedAiUsage(null, null, codexUsageForRange("unknown", "2026-08-01", "2026-08-31"))).toEqual({tokens: null, codeLines: null, partial: true});
  });
  it("preserves all 12 monthly accounts and the superseded remainder as provenance", () => {
    const month = snapshot.monthlyPeriods[0];
    expect(Object.keys(month.users)).toHaveLength(12);
    const result = Object.entries(month.users).map(([email, expected]) => {
      const actual = codexUsageForRange(email, month.startDate, month.endDate);
      expect(actual).toMatchObject({...expected, complete: true});
      const previous = snapshot.periods.filter(period => period.endDate <= "2026-09-27").reduce((sum, period) => {
        const usage = (period.users as Partial<Record<string, {tokens: number; codeLines: number}>>)[email];
        return {tokens: sum.tokens + (usage?.tokens ?? 0), codeLines: sum.codeLines + (usage?.codeLines ?? 0)};
      }, {tokens: 0, codeLines: 0});
      const remainder = (snapshot.derivedPeriods[0].users as Record<string, {tokens: number; codeLines: number}>)[email];
      expect(previous.tokens + remainder.tokens).toBe(expected.tokens);
      expect(previous.codeLines + remainder.codeLines).toBe(expected.codeLines);
      expect(individualUtilizationData.users.some(user => user.email === email)).toBe(true);
      return actual;
    });
    expect(result.reduce((sum, u) => sum + u.tokens, 0)).toBe(10591805667);
    expect(result.reduce((sum, u) => sum + u.codeLines, 0)).toBe(350355);
    const residual = snapshot.derivedPeriods[0];
    expect(Object.values(residual.users).reduce((sum, u) => sum + u.tokens, 0)).toBe(2807990511);
    expect(Object.values(residual.users).reduce((sum, u) => sum + u.codeLines, 0)).toBe(121638);
    expect(residual.supersededBy).toBe("leaderboard-users_workspace-riskzero_2026-09-28-to-2026-09-30.csv");
    expect(codexReportingWeeks).toHaveLength(0);
  });
  it("uses the exact fourth-week export and restores aligned combined metrics", () => {
    const week = individualUtilizationData.weeklyUsage["2026-09-W4"];
    expect(week).toMatchObject({startDate: "2026-09-28", endDate: "2026-09-30", coverage: "complete"});
    expect(week.source).toMatchObject({spendMethod: "current_cumulative_minus_previous_cumulative", codeMethod: "current_cumulative_minus_previous_cumulative"});
    const codex = codexUsageForRange("wody@riskzero.kr", week.startDate, week.endDate);
    expect(codex).toMatchObject({tokens: 365430737, codeLines: 27621, complete: true, periodAligned: true, periodLabel: "2026-09-28 ~ 2026-09-30", note: ""});
    const claude = week.users["wody@riskzero.kr"];
    const combined = combinedAiUsage(claude.totalTokens, claude.codeLines, codex);
    expect(combined).toEqual({tokens: 2628052744, codeLines: 51958, partial: false});
    const gitlab = gitlabUserMetricsForRange("wody@riskzero.kr", week.startDate, week.endDate);
    expect(gitlab).toMatchObject({commitCount: 129, additions: 20866});
    expect(gitlabCommittedCodeRatio(combined.codeLines, gitlab.additions)).toBeCloseTo(20866 / 51958 * 100);
    expect(combinedAiUsage(null, null, codex)).toMatchObject({partial: true});
    expect(codexUsageForRange("wody@riskzero.kr", "2026-09-03", "2026-09-30")).toMatchObject({tokens: 3545156292, complete: true});
    const actual = snapshot.periods.find(period => period.startDate === week.startDate)!;
    expect(Object.keys(actual.users)).toHaveLength(10);
    for (const [email, usage] of Object.entries(actual.users)) {
      expect(individualUtilizationData.users.some(user => user.email === email)).toBe(true);
      expect(codexUsageForRange(email, week.startDate, week.endDate)).toMatchObject({...usage, complete: true, periodAligned: true});
    }
    const tokens = Object.values(actual.users).reduce((sum, usage) => sum + usage.tokens, 0);
    const lines = Object.values(actual.users).reduce((sum, usage) => sum + usage.codeLines, 0);
    expect(tokens).toBe(1903801646);
    expect(lines).toBe(79468);
    expect(tokens + week.totals.totalTokens).toBe(12184455090);
    expect(lines + week.totals.codeLines).toBe(165175);
    const lbh = week.users["lbh0902@riskzero.kr"];
    expect(combinedAiUsage(lbh.totalTokens, lbh.codeLines, codexUsageForRange("lbh0902@riskzero.kr", week.startDate, week.endDate)))
      .toEqual({tokens: 18384747, codeLines: 0, partial: false});
    expect(codexUsageForRange("yspark@riskzero.kr", week.startDate, week.endDate)).toMatchObject({collected: true, present: false, tokens: 0, codeLines: 0, complete: true});
  });
  it("discloses the 26-line source discrepancy without changing monthly or weekly observations", () => {
    expect(snapshot.monthlyReconciliations[0].discrepancies).toEqual([
      {email: "jaewoo.kim@riskzero.kr", metric: "codeLines", monthlyTotal: 15019, periodsTotal: 15045, excess: 26},
    ]);
    expect(codexUsageForRange("jaewoo.kim@riskzero.kr", "2026-09-01", "2026-09-30").codeLines).toBe(15019);
    const week = codexUsageForRange("jaewoo.kim@riskzero.kr", "2026-09-28", "2026-09-30");
    expect(week).toMatchObject({codeLines: 6220, complete: true, periodAligned: true});
    expect(week.note).toContain("26");
    expect(codexUsageForRange("", "2026-09-28", "2026-09-30").note).not.toContain("미분리");
  });
  it("recalculates September combined totals and commit ratios after the Claude month close", () => {
    const users = individualUtilizationData.users;
    const month = individualUtilizationData.monthlySpend["2026-09"]!;
    const combined = users.map(user => combinedAiUsage(month.users[user.email]?.totalTokens ?? null,
      user.monthlyCodeLines["2026-09"] ?? 0, codexUsageForRange(user.email, "2026-09-01", "2026-09-30")));
    expect(month.users["songinna@riskzero.kr"].totalTokens).toBe(2723453);
    expect(users.some(user => user.email === "songinna@riskzero.kr")).toBe(false);
    expect(combined.reduce((sum, usage) => sum + (usage.tokens ?? 0), 0)).toBe(70547494590 - 2723453);
    expect(combined.reduce((sum, usage) => sum + (usage.codeLines ?? 0), 0)).toBe(855090);
    const wody = combinedAiUsage(month.users["wody@riskzero.kr"].totalTokens, 91039,
      codexUsageForRange("wody@riskzero.kr", "2026-09-01", "2026-09-30"));
    expect(wody).toEqual({tokens: 11173499637, codeLines: 275786, partial: false});
    expect(gitlabCommittedCodeRatio(wody.codeLines, 33107)).toBeCloseTo(33107 / 275786 * 100);
  });
  it("keeps unresolved Claude usage unknown when the account has no Codex activity", () => {
    const week = individualUtilizationData.weeklyUsage["2026-09-W4"];
    const codex = codexUsageForRange("lbh0902@riskzero.kr", week.startDate, week.endDate);
    expect(codex).toMatchObject({collected: true, present: false});
    expect(combinedAiUsage(null, null, codex, false)).toEqual({tokens: null, codeLines: null, partial: true});
    expect(combinedAiUsage(0, 0, codex)).toEqual({tokens: 0, codeLines: 0, partial: false});
  });
  it("uses a real month end so September monthly coverage is complete", () => {
    expect(calendarMonthEnd("2026-09")).toBe("2026-09-30");
    expect(calendarMonthEnd("2026-10")).toBe("2026-10-31");
    expect(calendarMonthEnd("2028-02")).toBe("2028-02-29");
  });
  it("combines September week two Claude and Codex activity", () => {
    const week = individualUtilizationData.weeklyUsage["2026-09-W2"];
    expect(week.startDate).toBe("2026-09-10");
    expect(week.endDate).toBe("2026-09-16");
    expect(week.source.codeMethod).toBe("current_cumulative_minus_previous_cumulative");
    const users = snapshot.periods.find(p => p.startDate === week.startDate)!.users;
    expect(Object.keys(users)).toHaveLength(9);
    expect(Object.keys(users).every(email => individualUtilizationData.users.some(u => u.email === email))).toBe(true);
    expect(Object.values(users).reduce((sum, u) => sum + u.tokens, 0)).toBe(2062461615);
    expect(Object.values(users).reduce((sum, u) => sum + u.codeLines, 0)).toBe(54787);
    const usage = codexUsageForRange("wody@riskzero.kr", week.startDate, week.endDate);
    expect(combinedAiUsage(week.users["wody@riskzero.kr"].totalTokens, week.users["wody@riskzero.kr"].codeLines, usage)).toEqual({tokens: 1464774545, codeLines: 30903, partial: false});
    expect(combinedAiUsage(null, null, usage)).toEqual({tokens: 433430394, codeLines: 10328, partial: true});
  });
  it("combines the September 17-27 Codex export with matching Claude usage", () => {
    const week = individualUtilizationData.weeklyUsage["2026-09-W3"];
    const users = snapshot.periods.find(p => p.startDate === week.startDate && p.endDate === week.endDate)!.users;
    expect(week.source.spendMethod).toBe("period_total");
    expect(week.source.codeMethod).toBe("current_cumulative_minus_previous_cumulative");
    expect(Object.keys(users)).toHaveLength(11);
    expect(Object.keys(users).every(email => individualUtilizationData.users.some(u => u.email === email))).toBe(true);
    expect(Object.values(users).reduce((sum, u) => sum + u.tokens, 0)).toBe(2840332779);
    expect(Object.values(users).reduce((sum, u) => sum + u.codeLines, 0)).toBe(96796);
    const usage = codexUsageForRange("wody@riskzero.kr", week.startDate, week.endDate);
    expect(usage).toMatchObject({complete: true, tokens: 1184601029, codeLines: 56785});
    expect(combinedAiUsage(week.users["wody@riskzero.kr"].totalTokens,
      week.users["wody@riskzero.kr"].codeLines, usage))
      .toEqual({tokens: 2780285802, codeLines: 69990, partial: false});
    expect(gitlabCommittedCodeRatio(69990, 18795)).toBeCloseTo(26.8538362623);
  });
});
