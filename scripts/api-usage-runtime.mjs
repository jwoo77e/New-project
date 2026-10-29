const DEFAULT_INTERVAL_MS = 5 * 60 * 1000;

export function createApiUsageRuntime({
  collect, persist, readSaved = async () => null,
  intervalMs = DEFAULT_INTERVAL_MS, now = Date.now,
  onResult = () => {},
}) {
  const refreshMs = Number.isFinite(intervalMs) && intervalMs >= 1000 ? intervalMs : DEFAULT_INTERVAL_MS;
  const caches = new Map();
  // The legacy collector shares its date window between providers. Serialize
  // different requested windows as well as coalescing same-window requests.
  let queue = Promise.resolve();
  let timer;
  const initialized = Promise.resolve().then(readSaved).then((saved) => {
    if (saved?.source && saved.dailyUsage?.length === 62) {
      caches.set(62, { snapshot: saved, expiresAt: 0, promise: null });
    }
  }).catch(() => {});

  async function get(requestedDays = 62, { force = false } = {}) {
    await initialized;
    const numeric = Number(requestedDays);
    const days = Number.isFinite(numeric) ? Math.max(1, Math.min(62, Math.round(numeric))) : 62;
    const cache = caches.get(days) ?? { snapshot: null, expiresAt: 0, promise: null };
    caches.set(days, cache);
    if (cache.promise) return cache.promise;
    if (!force && cache.snapshot && cache.expiresAt > now()) return cache.snapshot;

    cache.promise = queue.then(async () => {
      const attemptedAt = new Date(now()).toISOString();
      let candidate;
      try {
        candidate = await collect(days);
        const failures = ["OpenAI", "Gemini", "Claude"].filter((name) =>
          !candidate.providers?.some((provider) => provider.provider === name && provider.status === "정상"));
        if (failures.length) {
          throw new Error(`${failures.join(" · ")} 수집 실패`);
        }
        candidate = {
          ...candidate,
          source: { ...candidate.source, lastAttemptAt: attemptedAt, refreshError: undefined },
        };
        if (days === 62) await persist(candidate);
        cache.snapshot = candidate;
        onResult({ ok: true, days, collectedAt: candidate.source.collectedAt });
      } catch {
        // Do not overwrite good historical data with zero-filled failed calls,
        // or label the retained values with a new successful collection time.
        const previous = cache.snapshot ?? candidate;
        if (!previous) throw new Error("API 사용량 수집에 실패했습니다. 잠시 후 다시 시도합니다.");
        cache.snapshot = {
          ...previous,
          source: {
            ...previous.source,
            lastAttemptAt: attemptedAt,
            refreshError: "최신 API 수집에 실패했습니다. 마지막 수집 자료를 표시하며 자동 재시도합니다.",
          },
        };
        onResult({ ok: false, days });
      } finally {
        cache.expiresAt = now() + refreshMs;
      }
      return cache.snapshot;
    }).finally(() => { cache.promise = null; });
    queue = cache.promise.catch(() => {});
    return cache.promise;
  }

  function start() {
    if (timer) return;
    const refresh = () => { void get(62, { force: true }).catch(() => onResult({ ok: false, days: 62 })); };
    refresh();
    timer = setInterval(refresh, refreshMs);
    timer.unref?.();
  }

  return { get, start, stop: () => { clearInterval(timer); timer = undefined; }, refreshMs };
}
