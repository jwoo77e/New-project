import { afterEach, describe, expect, it, vi } from "vitest";
import { initialApiUsageData } from "../data/apiUsageData";
import { startApiUsagePolling } from "./apiUsagePolling";

afterEach(() => vi.useRealTimers());

function setup(fetchImpl = vi.fn(async () => Response.json(initialApiUsageData))) {
  const windowTarget = new EventTarget();
  const documentTarget = Object.assign(new EventTarget(), { visibilityState: "visible" });
  const onData = vi.fn();
  const onState = vi.fn();
  const poller = startApiUsagePolling({ snapshotUrl: "/saved.json", onData, onState, fetchImpl, windowTarget, documentTarget });
  return { poller, fetchImpl, onData, onState, windowTarget, documentTarget };
}

describe("live API usage polling", () => {
  it("polls every minute, refreshes on return, and cleans up on unmount", async () => {
    vi.useFakeTimers();
    const test = setup();
    await vi.advanceTimersByTimeAsync(0);
    expect(test.fetchImpl).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(test.fetchImpl).toHaveBeenCalledTimes(3);
    test.documentTarget.visibilityState = "hidden";
    await vi.advanceTimersByTimeAsync(60_000);
    expect(test.fetchImpl).toHaveBeenCalledTimes(3);
    test.documentTarget.visibilityState = "visible";
    test.documentTarget.dispatchEvent(new Event("visibilitychange"));
    await vi.advanceTimersByTimeAsync(0);
    expect(test.fetchImpl).toHaveBeenCalledTimes(4);
    test.poller.stop();
    test.windowTarget.dispatchEvent(new Event("focus"));
    await vi.advanceTimersByTimeAsync(60_000);
    expect(test.fetchImpl).toHaveBeenCalledTimes(4);
  });

  it("forces a manual refresh and reports failure without clearing displayed data", async () => {
    vi.useFakeTimers();
    const test = setup();
    await vi.advanceTimersByTimeAsync(0);
    test.fetchImpl.mockRejectedValueOnce(new Error("private server error"));
    await test.poller.refresh(true);
    expect(test.fetchImpl).toHaveBeenLastCalledWith("/api/api-usage?days=62&refresh=1", expect.anything());
    expect(test.onData).toHaveBeenCalledTimes(2);
    expect(test.onState.mock.lastCall?.[0].error).toContain("실패");
    expect(test.onState.mock.lastCall?.[0].error).not.toContain("private");
    await test.poller.refresh();
    expect(test.onState.mock.lastCall?.[0]).toEqual({ refreshing: false, error: null });
    test.poller.stop();
  });

  it("does not overlap slow requests and ignores responses after stop", async () => {
    vi.useFakeTimers();
    let finish: (response: Response) => void = () => {};
    const fetchImpl = vi.fn(() => new Promise<Response>(resolve => { finish = resolve; }));
    const test = setup(fetchImpl);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    test.poller.stop();
    finish(Response.json(initialApiUsageData));
    await vi.advanceTimersByTimeAsync(0);
    expect(test.onData).not.toHaveBeenCalled();
  });
});
