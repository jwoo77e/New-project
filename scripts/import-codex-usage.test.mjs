import {execFileSync} from "node:child_process";
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join, resolve} from "node:path";
import {describe, expect, it} from "vitest";

function fixture(run) {
  const directory = mkdtempSync(join(tmpdir(), "codex-week-"));
  try {
    const output = join(directory, "snapshot.json"), input = join(directory, "week.csv");
    const baseline = {
      periods: [{startDate: "2026-09-03", endDate: "2026-09-27", fileName: "previous.csv", users: {"a@example.com": {tokens: 100, codeLines: 10}}}],
      monthlyPeriods: [{startDate: "2026-09-01", endDate: "2026-09-30", fileName: "month.csv", users: {"a@example.com": {tokens: 150, codeLines: 14}}}],
      derivedPeriods: [{key: "2026-09-W4", startDate: "2026-09-28", endDate: "2026-09-30", periodAligned: false,
        users: {"a@example.com": {tokens: 50, codeLines: 4}}}],
    };
    writeFileSync(output, JSON.stringify(baseline));
    writeFileSync(input, "Email,Tokens,Lines of code\na@example.com,40,5\n");
    const invoke = (start = "2026-09-28") => execFileSync("ruby", [resolve("scripts/import-codex-usage.rb"), "--output", output, input, start, "2026-09-30"], {stdio: "pipe"});
    run({invoke, input, baseline, read: () => readFileSync(output, "utf8")});
  } finally {
    rmSync(directory, {recursive: true, force: true});
  }
}

describe("Codex observed-period import", () => {
  it("supersedes the estimate, preserves the month, and records source discrepancies without modifying observations", () => fixture(({invoke, read, input, baseline}) => {
    invoke();
    const first = read();
    invoke();
    expect(read()).toBe(first);
    const result = JSON.parse(first);
    expect(result.periods[0]).toEqual(baseline.periods[0]);
    expect(result.periods[1].users["a@example.com"]).toEqual({tokens: 40, codeLines: 5});
    expect(result.monthlyPeriods).toEqual(baseline.monthlyPeriods);
    expect(result.derivedPeriods[0]).toEqual({...baseline.derivedPeriods[0], supersededBy: "week.csv"});
    expect(result.monthlyReconciliations[0].discrepancies).toEqual([
      {email: "a@example.com", metric: "codeLines", monthlyTotal: 14, periodsTotal: 15, excess: 1},
    ]);
    writeFileSync(input, "Email,Tokens,Lines of code\na@example.com,40,3\n");
    invoke();
    const corrected = JSON.parse(read());
    expect(corrected.periods).toHaveLength(2);
    expect(corrected.monthlyReconciliations).toEqual([]);
  }));
  it("rejects overlapping or empty sources before modifying the snapshot", () => fixture(({invoke, read, input}) => {
    const before = read();
    expect(() => invoke("2026-09-27")).toThrow();
    expect(read()).toBe(before);
    writeFileSync(input, "Email,Tokens,Lines of code\n");
    expect(invoke).toThrow();
    expect(read()).toBe(before);
  }));
});
