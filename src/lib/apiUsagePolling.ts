import { isApiUsageData, type ApiUsageData } from "../data/apiUsageData";

export type ApiUsageSyncState = { refreshing: boolean; error: string | null };
export const API_USAGE_POLL_MS = 60_000;

export function startApiUsagePolling({
  snapshotUrl, onData, onState,
  fetchImpl = fetch, windowTarget = window, documentTarget = document,
}: {
  snapshotUrl: string;
  onData: (data: ApiUsageData) => void;
  onState: (state: ApiUsageSyncState) => void;
  fetchImpl?: typeof fetch;
  windowTarget?: EventTarget;
  documentTarget?: EventTarget & { visibilityState: string };
}) {
  let stopped = false;
  let inFlight: Promise<void> | null = null;
  const controller = new AbortController();

  async function read(url: string, timeout: number) {
    const response = await fetchImpl(url, {
      cache: "no-store",
      signal: AbortSignal.any([controller.signal, AbortSignal.timeout(timeout)]),
    });
    if (!response.ok) throw new Error("API request failed");
    const data: unknown = await response.json();
    if (!isApiUsageData(data)) throw new Error("Invalid API snapshot");
    return data;
  }

  function refresh(force = false): Promise<void> {
    if (stopped) return Promise.resolve();
    if (inFlight) return inFlight;
    onState({ refreshing: true, error: null });
    inFlight = (async () => {
      try {
        const data = await read(`/api/api-usage?days=62${force ? "&refresh=1" : ""}`, 75_000);
        if (stopped) return;
        onData(data);
        onState({ refreshing: false, error: data.source.refreshError ?? null });
      } catch {
        if (!stopped) onState({
          refreshing: false,
          error: "최신 API 조회에 실패했습니다. 표시 중인 자료를 유지하며 1분 후 다시 확인합니다.",
        });
      } finally { inFlight = null; }
    })();
    return inFlight;
  }

  // Load the saved copy without blocking a fresh runtime request. The selection
  // function rejects a slow, older static response arriving after the runtime.
  void read(snapshotUrl, 10_000).then((data) => { if (!stopped) onData(data); }).catch(() => {});
  void refresh();
  const resume = () => { if (documentTarget.visibilityState === "visible") void refresh(); };
  const interval = setInterval(resume, API_USAGE_POLL_MS);
  windowTarget.addEventListener("focus", resume);
  documentTarget.addEventListener("visibilitychange", resume);

  return {
    refresh,
    stop() {
      stopped = true;
      clearInterval(interval);
      controller.abort();
      windowTarget.removeEventListener("focus", resume);
      documentTarget.removeEventListener("visibilitychange", resume);
    },
  };
}
