import type { DashboardData } from "../data/aiCostData";

const storageKey = "ai-cost-dashboard:data:v1";

export function loadStoredDashboardData(): DashboardData | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as unknown;
    if (isDashboardData(parsed)) {
      return parsed;
    }

    clearStoredDashboardData();
    return null;
  } catch {
    clearStoredDashboardData();
    return null;
  }
}

export function saveStoredDashboardData(data: DashboardData) {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function clearStoredDashboardData() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    // Some browser privacy modes can block localStorage access.
  }
}

function isDashboardData(value: unknown): value is DashboardData {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<DashboardData>;
  return (
    Boolean(candidate.sourceMeta) &&
    Array.isArray(candidate.monthlyActuals) &&
    Array.isArray(candidate.forecastAdjustments) &&
    Array.isArray(candidate.departmentCosts) &&
    Array.isArray(candidate.categoryCosts) &&
    Array.isArray(candidate.vendorCosts) &&
    Array.isArray(candidate.topTransactions)
  );
}
