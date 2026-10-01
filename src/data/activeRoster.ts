// Keep source snapshots intact while excluding departed employees from current dashboard rosters.
export const departedEmployeeEmails = new Set(["jisub1221@riskzero.kr", "songinna@riskzero.kr"]);

export function isCurrentEmployee(email: string) {
  return !departedEmployeeEmails.has(email.toLowerCase());
}
