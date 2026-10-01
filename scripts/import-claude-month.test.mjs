import {execFileSync} from "node:child_process";
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join, resolve} from "node:path";
import {describe, expect, it} from "vitest";

const metrics = (requests, tokens, cost) => ({requests, promptTokens: tokens, completionTokens: 0, totalTokens: tokens, netSpendUsd: cost, products: ["Claude Code"], models: ["model"]});
function fixture(run, {tokens = 150, previousLines = 10, baselineStart = "2026-09-01"} = {}) {
  const directory = mkdtempSync(join(tmpdir(), "claude-month-"));
  try {
    const names = ["individualMonthlySpendSnapshot", "individualWeeklyUsageSnapshot", "individualUtilizationSnapshot"];
    const files = names.map(name => join(directory, `${name}.json`));
    const users = {"a@example.com": metrics(10, 100, 1.01), "preserved@example.com": metrics(5, 50, 2)};
    const period = `${baselineStart} ~ 2026-09-27`;
    const component = {fileName: "old-spend.csv", period, rowCount: 2, users};
    const source = {month: "2026-09", fileName: "old-code.csv", period, rowCount: 2, totalLines: 17};
    const baseline = [
      {generatedAt: "old", months: [{month: "2026-09", ...component, coverage: "partial", components: [component]}]},
      {generatedAt: "old", periods: [{key: "2026-09-W3", startDate: "2026-09-17", users: {keep: true}}]},
      {source: {codeLines: [source]}, totals: {codeLines: 17}, users: Object.keys(users).map((email, i) => ({email, monthlyCodeLines: {"2026-09": i ? 7 : 10}}))},
    ];
    files.forEach((file, i) => writeFileSync(file, JSON.stringify(baseline[i])));
    const spend = join(directory, "monthly.csv"), code = join(directory, "monthly-code.csv"), previous = join(directory, "previous-code.csv");
    writeFileSync(spend, `user_email,product,model,total_requests,total_prompt_tokens,total_completion_tokens,total_net_spend_usd\na@example.com,Claude Code,model,15,${tokens},0,1.00\n`);
    writeFileSync(code, "User,Lines this Month\na@example.com,15\n");
    writeFileSync(previous, `User,Lines this Month\na@example.com,${previousLines}\n`);
    const invoke = () => execFileSync("ruby", [resolve("scripts/import-claude-month.rb"), "--data-dir", directory,
      "--month", "2026-09", "--week-key", "2026-09-W4", "--spend", spend, "--code", code, "--previous-code", previous], {stdio: "pipe", encoding: "utf8"});
    run({invoke, read: () => files.map(file => readFileSync(file, "utf8")), baseline, code});
  } finally {
    rmSync(directory, {recursive: true, force: true});
  }
}

describe("Claude monthly reconciliation", () => {
  it("replaces imported accounts, preserves other sources, and retains rounding corrections", () => fixture(({invoke, read, baseline, code}) => {
    invoke();
    const first = read();
    invoke();
    expect(read()).toEqual(first);
    const [monthly, weekly, utilization] = first.map(JSON.parse);
    const month = monthly.months[0];
    expect(month.totals).toMatchObject({requests: 20, totalTokens: 200, netSpendUsd: 3});
    expect(month.users["preserved@example.com"]).toMatchObject({...baseline[0].months[0].users["preserved@example.com"], coverage: "partial", sourcePeriod: "2026-09-01 ~ 2026-09-27"});
    expect(weekly.periods[0]).toEqual(baseline[1].periods[0]);
    expect(weekly.periods[1].users["a@example.com"]).toMatchObject({requests: 5, totalTokens: 50, netSpendUsd: -0.01, codeLines: 5});
    expect(weekly.periods[1].users["preserved@example.com"]).toBeUndefined();
    expect(utilization.source.codeLines[0]).toMatchObject({totalLines: 22, exportedTotalLines: 15});
    // A corrected monthly source must still subtract the original attached baseline.
    writeFileSync(code, "User,Lines this Month\na@example.com,18\n");
    invoke();
    expect(JSON.parse(read()[1]).periods[1].users["a@example.com"].codeLines).toBe(8);
  }));
  it.each([{tokens: 90}, {previousLines: 9}, {baselineStart: "2026-09-03"}])("rejects inconsistent or incomplete baselines before writing: %j", options => fixture(({invoke, read}) => {
    const before = read();
    expect(invoke).toThrow();
    expect(read()).toEqual(before);
  }, options));
});
