import { afterEach, describe, expect, it, vi } from "vitest";
import { createApiUsageRuntime } from "./api-usage-runtime.mjs";

function snapshot(timestamp = new Date().toISOString(), days = 62) {
  return {
    source: { collectedAt: timestamp },
    providers: ["OpenAI", "Gemini", "Claude"].map(provider => ({ provider, status: "정상" })),
    dailyUsage: Array.from({ length: days }, () => ({ totalTokens: 123 })),
  };
}

afterEach(() => vi.useRealTimers());
describe("API background collection", () => {
  it("collects and persists on startup and every five minutes without browser requests", async () => {
    vi.useFakeTimers();
    const collect = vi.fn(async () => snapshot());
    const persist = vi.fn(async () => {});
    const runtime = createApiUsageRuntime({ collect, persist });
    runtime.start();
    await vi.advanceTimersByTimeAsync(0);
    expect(collect).toHaveBeenCalledTimes(1);
    expect(persist).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(300_000);
    expect(collect).toHaveBeenCalledTimes(2);
    expect(persist).toHaveBeenCalledTimes(2);
    runtime.stop();
    await vi.advanceTimersByTimeAsync(300_000);
    expect(collect).toHaveBeenCalledTimes(2);
  });

  it("coalesces concurrent refreshes and serializes different date windows", async () => {
    let finish;
    const collect = vi.fn().mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }))
      .mockImplementation(async days => snapshot(undefined, days));
    const persist = vi.fn();
    const runtime = createApiUsageRuntime({ collect, persist });
    const requests = [runtime.get(62), runtime.get(62, { force: true }), runtime.get(7)];
    await vi.waitFor(() => expect(collect).toHaveBeenCalledTimes(1));
    finish(snapshot());
    const [first, same] = await Promise.all(requests);
    expect(first).toBe(same);
    expect(collect.mock.calls.map(([days]) => days)).toEqual([62, 7]);
    expect(persist).toHaveBeenCalledTimes(1);
  });

  it("preserves saved data on partial failure and recovers on a later refresh", async () => {
    const saved = snapshot("2026-10-26T03:00:00Z");
    const failed = snapshot();
    failed.providers[2].status = "주의";
    failed.dailyUsage = failed.dailyUsage.map(() => ({ totalTokens: 0 }));
    const collect = vi.fn().mockResolvedValueOnce(failed).mockResolvedValueOnce(snapshot());
    const persist = vi.fn();
    const runtime = createApiUsageRuntime({ collect, persist, readSaved: async () => saved });
    const retained = await runtime.get(62);
    expect(retained.dailyUsage).toEqual(saved.dailyUsage);
    expect(retained.source.collectedAt).toBe(saved.source.collectedAt);
    expect(retained.source.refreshError).toContain("실패");
    expect(persist).not.toHaveBeenCalled();
    const recovered = await runtime.get(62, { force: true });
    expect(recovered.source.refreshError).toBeUndefined();
    expect(persist).toHaveBeenCalledTimes(1);
  });

  it("does not expose raw errors or replace saved data when persistence fails", async () => {
    const saved = snapshot("2026-10-26T03:00:00Z");
    const runtime = createApiUsageRuntime({
      collect: async () => snapshot(), readSaved: async () => saved,
      persist: async () => { throw new Error("private-credential-in-error"); },
    });
    const result = await runtime.get(62);
    expect(result.source.collectedAt).toBe(saved.source.collectedAt);
    expect(JSON.stringify(result)).not.toContain("private-credential");
    expect(result.source.refreshError).toContain("실패");
  });
});
