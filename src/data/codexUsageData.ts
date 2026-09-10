import snapshot from "./codexUsageSnapshot.json";

type CodexUsage = {tokens: number; codeLines: number};
type Period = {startDate: string; endDate: string; users: Record<string, CodexUsage>};
const periods: Period[] = snapshot.periods;

export function codexUsageForRange(email: string, startDate: string, endDate: string) {
  const contained = periods.filter((p) => p.startDate >= startDate && p.endDate <= endDate);
  const overlapping = periods.some((p) => p.startDate <= endDate && p.endDate >= startDate && !contained.includes(p));
  const account = email.trim().toLowerCase();
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
  };
}

export function combinedAiUsage(claudeTokens: number | null, claudeLines: number | null, codex: ReturnType<typeof codexUsageForRange>) {
  return {
    tokens: claudeTokens === null && !codex.collected ? null : (claudeTokens ?? 0) + codex.tokens,
    codeLines: claudeLines === null && !codex.collected ? null : (claudeLines ?? 0) + codex.codeLines,
    partial: claudeTokens === null || claudeLines === null || !codex.complete || codex.overlapping,
  };
}
