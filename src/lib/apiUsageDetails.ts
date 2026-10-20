import type { ApiUsageDetail } from "../data/apiUsageData";
import type { ApiUsagePeriodSummary } from "./apiUsagePeriods";

export function apiUsageKeyId(row: ApiUsageDetail) {
  return JSON.stringify([row.provider, row.sourceName, row.keyId]);
}

export function filterApiUsageDetails(
  rows: ApiUsageDetail[],
  period: Pick<ApiUsagePeriodSummary, "startDate" | "endDate">,
  provider = "all",
  key = "all",
) {
  return rows.filter((row) => row.date >= period.startDate && row.date <= period.endDate &&
    (provider === "all" || row.provider === provider) && (key === "all" || apiUsageKeyId(row) === key));
}

export type ApiUsageDetailSummary = Omit<ApiUsageDetail, "date"> & { id: string; totalTokens: number };

export function summarizeApiUsageDetails(rows: ApiUsageDetail[], dimension: "key" | "model") {
  const groups = new Map<string, ApiUsageDetailSummary>();
  for (const row of rows) {
    const id = dimension === "key" ? apiUsageKeyId(row) : JSON.stringify([row.provider, row.model]);
    const total = groups.get(id);
    if (!total) {
      groups.set(id, { ...row, id, totalTokens: row.inputTokens + row.outputTokens });
      continue;
    }
    total.requests = total.requests === null || row.requests === null ? null : total.requests + row.requests;
    total.inputTokens += row.inputTokens;
    total.outputTokens += row.outputTokens;
    total.totalTokens += row.inputTokens + row.outputTokens;
    total.costUsd = total.costUsd === null || row.costUsd === null ? null : total.costUsd + row.costUsd;
  }
  return [...groups.values()].sort((a, b) => b.totalTokens - a.totalTokens || a.id.localeCompare(b.id));
}
