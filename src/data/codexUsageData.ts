import snapshot from "./codexUsageSnapshot.json";

type CodexUsage = {tokens: number; codeLines: number};
type Period = {startDate: string; endDate: string; users: Partial<Record<string, CodexUsage>>};
const periods: Period[] = snapshot.periods;
const monthlyPeriods: Period[] = snapshot.monthlyPeriods;
export const codexReportingWeeks = snapshot.derivedPeriods;

export function calendarMonthEnd(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(Date.UTC(year, monthNumber, 0)).toISOString().slice(0, 10);
}

export function codexUsageForRange(email: string, startDate: string, endDate: string) {
  const account = email.trim().toLowerCase();
  const derived = codexReportingWeeks.find((p) => p.startDate === startDate && p.endDate === endDate);
  if (derived) {
    const usage = (derived.users as Partial<Record<string, CodexUsage>>)[account];
    return {
      collected: true, complete: derived.periodAligned, overlapping: false,
      present: usage != null, tokens: usage?.tokens ?? 0, codeLines: usage?.codeLines ?? 0,
      periodLabel: derived.usageRanges.map((p) => `${p.startDate} ~ ${p.endDate}`).join(", "),
      periodAligned: derived.periodAligned, note: derived.note,
    };
  }
  // A complete monthly export replaces its weekly components; never add both.
  const months = monthlyPeriods.filter((p) => p.startDate >= startDate && p.endDate <= endDate);
  const contained = [
    ...months,
    ...periods.filter((p) => p.startDate >= startDate && p.endDate <= endDate &&
      !months.some((m) => p.startDate >= m.startDate && p.endDate <= m.endDate)),
  ].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const overlapping = periods.some((p) => p.startDate <= endDate && p.endDate >= startDate && !contained.includes(p) &&
    !months.some((m) => p.startDate >= m.startDate && p.endDate <= m.endDate));
  const matches = contained.flatMap((p) => p.users[account] ? [p.users[account]] : []);
  const complete = contained.length > 0 && contained[0].startDate === startDate &&
    contained[contained.length - 1].endDate === endDate && contained.every((p, index) => index === 0 ||
      Date.parse(`${p.startDate}T00:00:00Z`) - Date.parse(`${contained[index - 1].endDate}T00:00:00Z`) === 86400000);
  return {
    collected: contained.length > 0,
    complete,
    overlapping,
    present: matches.length > 0,
    tokens: matches.reduce((sum, u) => sum + u.tokens, 0),
    codeLines: matches.reduce((sum, u) => sum + u.codeLines, 0),
    periodLabel: contained.map((p) => `${p.startDate} ~ ${p.endDate}`).join(", "),
    periodAligned: true,
    note: "",
  };
}

export function combinedAiUsage(claudeTokens: number | null, claudeLines: number | null, codex: ReturnType<typeof codexUsageForRange>, claudePeriodComplete = true) {
  return {
    tokens: claudeTokens === null && !codex.collected ? null : (claudeTokens ?? 0) + codex.tokens,
    codeLines: claudeLines === null && !codex.collected ? null : (claudeLines ?? 0) + codex.codeLines,
    partial: claudeTokens === null || claudeLines === null || !claudePeriodComplete || !codex.complete || codex.overlapping,
  };
}
