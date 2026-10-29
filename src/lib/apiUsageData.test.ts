import { describe, expect, it } from "vitest";
import {
  initialApiUsageData,
  selectPreferredApiUsageData,
  type ApiUsageData,
} from "../data/apiUsageData";

function cloneApiUsageData(overrides: Partial<ApiUsageData> = {}): ApiUsageData {
  return structuredClone({
    ...initialApiUsageData,
    ...overrides,
  });
}

describe("API usage snapshot selection", () => {
  it("replaces a persisted runtime snapshot with the newer runtime response", () => {
    const old = cloneApiUsageData();
    old.source = { ...old.source, generatedAt: "10. 26. 오후 12:02", mode: "운영 런타임 API 수집" };
    const fresh = structuredClone(old);
    fresh.source.generatedAt = "10. 28. 오전 08:11";
    expect(selectPreferredApiUsageData(old, fresh)).toBe(fresh);
    expect(selectPreferredApiUsageData(fresh, old)).toBe(fresh);
  });

  it("orders ISO collection timestamps across the year boundary", () => {
    const old = cloneApiUsageData();
    old.source.collectedAt = "2026-12-31T23:59:00Z";
    const fresh = structuredClone(old);
    fresh.source.collectedAt = "2027-01-01T00:01:00Z";
    expect(selectPreferredApiUsageData(old, fresh)).toBe(fresh);
    expect(selectPreferredApiUsageData(fresh, old)).toBe(fresh);
  });

  it("shows failed refresh metadata without advancing the collection time", () => {
    const old = cloneApiUsageData();
    old.source.collectedAt = "2026-10-28T00:00:00Z";
    const retained = structuredClone(old);
    retained.source.lastAttemptAt = "2026-10-28T00:05:00Z";
    retained.source.refreshError = "수집 실패";
    expect(selectPreferredApiUsageData(old, retained)).toBe(retained);
    expect(selectPreferredApiUsageData(retained, old)).toBe(retained);
  });

  it("keeps a static snapshot with more Claude admin keys over a stale runtime response", () => {
    const staticSnapshot = cloneApiUsageData({
      source: {
        ...initialApiUsageData.source,
        generatedAt: "6. 29. AM 10:31",
        mode: "로컬 수집 스냅샷",
      },
      providers: initialApiUsageData.providers.map((provider) =>
        provider.provider === "Claude" ? { ...provider, activeKeys: 2 } : provider,
      ),
      keyHealth: [
        ...initialApiUsageData.keyHealth.filter((key) => key.provider !== "Claude"),
        {
          provider: "Claude",
          name: "claude-admin-1: infra",
          scope: "admin usage, costs",
          lastUsed: "6. 29. AM 10:31",
          requests: 0,
          status: "정상",
          note: "ANTHROPIC_ADMIN_API_KEY에서만 읽음",
        },
        {
          provider: "Claude",
          name: "claude-admin-2: bigone",
          scope: "admin usage, costs",
          lastUsed: "6. 29. AM 10:31",
          requests: 0,
          status: "정상",
          note: "ANTHROPIC_ADMIN_API_KEY_2에서만 읽음",
        },
      ],
    });
    const staleRuntimeSnapshot = cloneApiUsageData({
      source: {
        ...initialApiUsageData.source,
        generatedAt: "6. 29. AM 10:35",
        mode: "운영 런타임 API 수집",
      },
      providers: initialApiUsageData.providers.map((provider) =>
        provider.provider === "Claude" ? { ...provider, activeKeys: 1 } : provider,
      ),
      keyHealth: [
        ...initialApiUsageData.keyHealth.filter((key) => key.provider !== "Claude"),
        {
          provider: "Claude",
          name: "claude-admin-1: Claude Admin 1",
          scope: "admin usage, costs",
          lastUsed: "6. 29. AM 10:35",
          requests: 0,
          status: "정상",
          note: "ANTHROPIC_ADMIN_API_KEY에서만 읽음",
        },
      ],
    });

    expect(selectPreferredApiUsageData(staticSnapshot, staleRuntimeSnapshot)).toBe(staticSnapshot);
  });

  it("uses runtime data when Claude admin key coverage is not worse", () => {
    const staticSnapshot = cloneApiUsageData({
      source: {
        ...initialApiUsageData.source,
        generatedAt: "6. 29. AM 10:31",
        mode: "로컬 수집 스냅샷",
      },
    });
    const runtimeSnapshot = cloneApiUsageData({
      source: {
        ...initialApiUsageData.source,
        generatedAt: "6. 29. AM 10:35",
        mode: "운영 런타임 API 수집",
      },
    });

    expect(selectPreferredApiUsageData(staticSnapshot, runtimeSnapshot)).toBe(runtimeSnapshot);
  });
});
