import {execFileSync} from "node:child_process";
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join, resolve} from "node:path";
import {describe, expect, it} from "vitest";

function fixture(run, {start = "2026-09-03", total = 150, monthlyEmail = "a@riskzero.kr"} = {}) {
  const directory = mkdtempSync(join(tmpdir(), "codex-month-"));
  try {
    const output = join(directory, "snapshot.json");
    const input = join(directory, "monthly.csv");
    const baseline = {periods: [{startDate: start, endDate: "2026-09-27", fileName: "weekly.csv",
      users: {"a@riskzero.kr": {tokens: 100, codeLines: 10}}}]};
    writeFileSync(output, JSON.stringify(baseline));
    writeFileSync(input, `Email,Tokens,Lines of code\n${monthlyEmail},${total},15\n`);
    const invoke = () => execFileSync("ruby", [resolve("scripts/import-codex-month.rb"), "--output", output,
      input, "2026-09-01", "2026-09-30", "2026-09-W4", "9월 4주차"], {encoding: "utf8", stdio: "pipe"});
    run({invoke, output, baseline});
  } finally {
    rmSync(directory, {recursive: true, force: true});
  }
}

describe("Codex monthly import", () => {
  it("preserves weekly sources, records uncovered dates, and replaces on reimport", () => fixture(({invoke, output, baseline}) => {
    invoke();
    const first = readFileSync(output, "utf8");
    invoke();
    expect(readFileSync(output, "utf8")).toBe(first);
    const result = JSON.parse(first);
    expect(result.periods).toEqual(baseline.periods);
    expect(result.derivedPeriods[0]).toMatchObject({periodAligned: false, users: {"a@riskzero.kr": {tokens: 50, codeLines: 5}},
      usageRanges: [{startDate: "2026-09-01", endDate: "2026-09-02"}, {startDate: "2026-09-28", endDate: "2026-09-30"}]});
  }));
  it("marks the remainder exact only when baseline dates cover the month start", () => fixture(({invoke, output}) => {
    invoke();
    expect(JSON.parse(readFileSync(output, "utf8")).derivedPeriods[0].periodAligned).toBe(true);
  }, {start: "2026-09-01"}));
  it.each([{total: 99}, {monthlyEmail: "missing@riskzero.kr"}])("rejects inconsistent totals or missing accounts without modifying the snapshot: %j", options =>
    fixture(({invoke, output}) => {
      const before = readFileSync(output, "utf8");
      expect(invoke).toThrow();
      expect(readFileSync(output, "utf8")).toBe(before);
    }, options));
});
