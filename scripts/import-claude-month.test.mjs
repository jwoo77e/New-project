import {execFileSync} from "node:child_process";
import {mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from "node:fs";
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
    const invoke = (extra = []) => execFileSync("ruby", [resolve("scripts/import-claude-month.rb"), "--data-dir", directory,
      "--month", "2026-09", "--week-key", "2026-09-W4", "--spend", spend, "--code", code, "--previous-code", previous, ...extra], {stdio: "pipe", encoding: "utf8"});
    run({invoke, read: () => files.map(file => readFileSync(file, "utf8")), baseline, code, directory, spend});
  } finally {
    rmSync(directory, {recursive: true, force: true});
  }
}

describe("Claude monthly reconciliation", () => {
  it("keeps a partial personal-account baseline out of exact weekly totals, including on reimport", () => fixture(({invoke, read, directory}) => {
    const [monthly, , utilization] = read().map(JSON.parse);
    const lateUsage = metrics(10, 100, 0);
    const month = monthly.months[0];
    month.users["late@example.com"] = {...lateUsage, coverage: "partial", sourcePeriod: "2026-09-17 ~ 2026-09-27"};
    month.components = [
      {...month.components[0], users: {"a@example.com": month.users["a@example.com"], "preserved@example.com": month.users["preserved@example.com"]}, period: "2026-09-01 ~ 2026-09-16"},
      {fileName: "late-old.csv", period: "2026-09-17 ~ 2026-09-27", users: {"late@example.com": lateUsage}},
    ];
    utilization.users.push({email: "late@example.com", monthlyCodeLines: {}});
    writeFileSync(join(directory, "individualMonthlySpendSnapshot.json"), JSON.stringify(monthly));
    writeFileSync(join(directory, "individualUtilizationSnapshot.json"), JSON.stringify(utilization));
    const extraSpend = join(directory, "late-month.csv");
    writeFileSync(extraSpend, "user_email,product,model,total_requests,total_prompt_tokens,total_completion_tokens,total_net_spend_usd\nlate@example.com,Chat,model,30,500,0,0\n");
    const extra = ["--spend", extraSpend];
    invoke(extra);
    const saved = read();
    const [updatedMonth, updatedWeek] = saved.map(JSON.parse);
    expect(updatedMonth.months[0].users["late@example.com"]).toMatchObject({requests: 30, totalTokens: 500, sourcePeriod: "2026-09-01 ~ 2026-09-30", coverage: "complete"});
    const week = updatedWeek.periods[1];
    expect(week.users["late@example.com"]).toBeUndefined();
    expect(week.totals.totalTokens).toBe(50);
    expect(week.coverage).toBe("partial");
    expect(week.unallocatedUsage["late@example.com"]).toMatchObject({requests: 20, totalTokens: 400, baselinePeriod: "2026-09-17 ~ 2026-09-27", periods: ["2026-09-01 ~ 2026-09-16", "2026-09-28 ~ 2026-09-30"]});
    invoke(extra);
    expect(read()).toEqual(saved);
  }));
  it("adds another organization without replacing closed accounts or double counting matching file names", () => fixture(({invoke, read, directory, spend}) => {
    invoke();
    const before = read().map(JSON.parse);
    const supplemental = join(directory, "Clevel");
    mkdirSync(supplemental);
    const extraSpend = join(supplemental, "monthly.csv"), extraCode = join(supplemental, "monthly-code.csv"), extraPrevious = join(supplemental, "previous-code.csv");
    writeFileSync(extraSpend, "user_email,product,model,total_requests,total_prompt_tokens,total_completion_tokens,total_net_spend_usd\npreserved@example.com,Claude Code,model,6,80,0,3.00\n");
    writeFileSync(extraCode, "User,Lines this Month\npreserved@example.com,9\n");
    writeFileSync(extraPrevious, "User,Lines this Month\npreserved@example.com,7\n");
    const extra = ["--spend", extraSpend, "--code", extraCode, "--previous-code", extraPrevious];
    invoke(extra);
    const saved = read();
    const [monthly, weekly, utilization] = saved.map(JSON.parse);
    expect(monthly.months[0].users["a@example.com"]).toEqual(before[0].months[0].users["a@example.com"]);
    expect(weekly.periods[1].users["a@example.com"]).toEqual(before[1].periods[1].users["a@example.com"]);
    expect(monthly.months[0]).toMatchObject({coverage: "complete", preservedAccounts: [], totals: {totalTokens: 230, netSpendUsd: 4}});
    expect(monthly.months[0].monthClose.spendExports[1]).toEqual({fileName: "Clevel/monthly.csv", rowCount: 1, accounts: ["preserved@example.com"]});
    expect(weekly.periods[1].users["preserved@example.com"]).toMatchObject({requests: 1, totalTokens: 30, netSpendUsd: 1, codeLines: 2});
    expect(utilization.source.codeLines[0]).toMatchObject({totalLines: 24, preservedAccounts: []});
    invoke(extra);
    expect(read()).toEqual(saved);
    expect(() => invoke()).toThrow();
    expect(() => invoke([...extra, "--spend", spend])).toThrow();
    expect(read()).toEqual(saved);
  }));
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
