import {describe, expect, it} from "vitest";
import snapshot from "./codexUsageSnapshot.json";
import {codexUsageForRange, combinedAiUsage} from "./codexUsageData";
import {individualUtilizationData} from "./individualUtilizationData";
import {calculateCodeOutputDensity} from "../lib/codeOutputDensity";
import {gitlabCommittedCodeRatio} from "./gitlabActivityData";

describe("Codex usage", () => {
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
  it("labels monthly totals as observed partial coverage without extrapolating", () => {
    const codex = codexUsageForRange("wody@riskzero.kr", "2026-09-01", "2026-09-30");
    expect(codex).toMatchObject({collected: true, complete: false, tokens: 1995124526});
    expect(combinedAiUsage(2003677746, 32922, codex)).toEqual({tokens: 3998802272, codeLines: 91170, partial: true});
    expect(combinedAiUsage(null, null, codexUsageForRange("unknown", "2026-08-01", "2026-08-31"))).toEqual({tokens: null, codeLines: null, partial: true});
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
});
