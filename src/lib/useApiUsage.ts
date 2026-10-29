import { useEffect, useRef, useState } from "react";
import { initialApiUsageData, selectPreferredApiUsageData } from "../data/apiUsageData";
import { startApiUsagePolling, type ApiUsageSyncState } from "./apiUsagePolling";

export function useApiUsage() {
  const [data, setData] = useState(initialApiUsageData);
  const [sync, setSync] = useState<ApiUsageSyncState>({ refreshing: true, error: null });
  const poller = useRef<ReturnType<typeof startApiUsagePolling> | null>(null);
  useEffect(() => {
    const activePoller = startApiUsagePolling({
      snapshotUrl: `${import.meta.env.BASE_URL}api-usage-snapshot.local.json`,
      onData: (candidate) => setData((current) => selectPreferredApiUsageData(current, candidate)),
      onState: setSync,
    });
    poller.current = activePoller;
    return () => { activePoller.stop(); poller.current = null; };
  }, []);
  return { data, sync, refresh: () => { void poller.current?.refresh(true); } };
}
