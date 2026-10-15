import { calendarMonthEnd } from "./codexUsageData";
import type {
  IndividualMonthlySpendPeriod,
  IndividualMonthlySpendUser,
  IndividualWeeklyUsagePeriod,
} from "./individualUtilizationData";

const metrics = ["requests", "promptTokens", "completionTokens", "totalTokens", "netSpendUsd"] as const;
const emptyMetrics = () => ({requests: 0, promptTokens: 0, completionTokens: 0, totalTokens: 0, netSpendUsd: 0});
const follows = (previous: string, next: string) => Date.parse(`${next}T00:00:00Z`) - Date.parse(`${previous}T00:00:00Z`) === 86400000;

/** Use weekly observations only until an authoritative monthly report is available. */
export function buildWeeklyMonthlyUsage(
  periods: IndividualWeeklyUsagePeriod[],
  reportedMonths: string[],
): Record<string, IndividualMonthlySpendPeriod> {
  const months = [...new Set(periods.map(period => period.startDate.slice(0, 7)))];
  const result: Record<string, IndividualMonthlySpendPeriod> = {};
  for (const month of months) {
    if (reportedMonths.includes(month)) continue;
    // A cross-month export cannot be split without daily source rows.
    const weeks = periods.filter(period => period.startDate.startsWith(month) && period.endDate.startsWith(month) &&
      period.source.spendMethod !== "not_collected").sort((a, b) => a.startDate.localeCompare(b.startDate));
    if (!weeks.length || weeks.some((week, index) => index > 0 && week.startDate <= weeks[index - 1].endDate)) continue;
    const startDate = `${month}-01`;
    const endDate = weeks[weeks.length - 1].endDate;
    const contiguous = weeks[0].startDate === startDate && weeks.every((week, index) =>
      index === 0 || follows(weeks[index - 1].endDate, week.startDate));
    const emails = [...new Set(weeks.flatMap(week => Object.keys(week.users)))];
    const users: Record<string, IndividualMonthlySpendUser> = {};
    for (const email of emails) {
      const observed = weeks.filter(week => week.users[email]);
      const codeCollected = observed.every(week => week.source.codeMethod !== "not_collected" &&
        (!week.source.codePeriod || week.source.codePeriod === `${week.startDate} ~ ${week.endDate}`));
      const complete = contiguous && observed.length === weeks.length && codeCollected && observed.every(week =>
        (week.users[email].coverage ?? week.coverage) === "complete");
      const user: IndividualMonthlySpendUser = {
        ...emptyMetrics(), products: [], models: [], codeLines: codeCollected ? 0 : null,
        sourcePeriod: observed.map(week => `${week.startDate} ~ ${week.endDate}`).join(", "),
        coverage: complete ? "complete" : "partial",
      };
      if (complete) user.sourcePeriod = `${startDate} ~ ${endDate}`;
      for (const week of observed) {
        const usage = week.users[email];
        for (const metric of metrics) user[metric] += usage[metric];
        if (user.codeLines != null) user.codeLines += usage.codeLines;
        user.products.push(...usage.products);
        user.models.push(...usage.models);
      }
      user.netSpendUsd = Number(user.netSpendUsd.toFixed(6));
      user.products = [...new Set(user.products)].sort();
      user.models = [...new Set(user.models)].sort();
      users[email] = user;
    }
    const totals = emptyMetrics();
    for (const user of Object.values(users)) for (const metric of metrics) totals[metric] += user[metric];
    totals.netSpendUsd = Number(totals.netSpendUsd.toFixed(6));
    result[month] = {
      month, period: `${startDate} ~ ${endDate}`,
      fileName: [...new Set(weeks.map(week => week.source.currentSpendFile))].join(" + "),
      rowCount: weeks.reduce((sum, week) => sum + week.source.currentSpendRows, 0),
      coverage: contiguous && endDate === calendarMonthEnd(month) && Object.values(users).every(user => user.coverage === "complete")
        ? "complete" : "partial",
      weeklyRollup: {startDate, endDate, weekKeys: weeks.map(week => week.key), throughLabel: weeks[weeks.length - 1].label},
      totals, users,
    };
  }
  return result;
}
