import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const envPath = path.join(rootDir, ".env.local");
const days = parseDays(process.argv.find((arg) => arg.startsWith("--days=")) ?? "--days=7");
const now = new Date();
const endingAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
const startingAt = new Date(endingAt.getTime() - days * 24 * 60 * 60 * 1000);
const dayBuckets = makeDayBuckets(startingAt, days);

const env = {
  ...process.env,
  ...(await readLocalEnv(envPath)),
};
const outputPaths = getOutputPaths(env);

const providerColors = {
  OpenAI: "#0f8b8d",
  Gemini: "#c58612",
  Claude: "#5f6f8c",
};

const [openai, gemini, claude] = await Promise.all([
  collectOpenAI(env.OPENAI_ADMIN_KEY),
  collectGemini(env.GEMINI_API_KEY),
  collectClaude(env.ANTHROPIC_ADMIN_API_KEY),
]);

const providers = [openai.provider, gemini.provider, claude.provider];
const dailyUsage = dayBuckets.map((bucket) => {
  const openaiDay = openai.daily.get(bucket.date) ?? emptyDaily();
  const geminiDay = gemini.daily.get(bucket.date) ?? emptyDaily();
  const claudeDay = claude.daily.get(bucket.date) ?? emptyDaily();

  return {
    date: bucket.date,
    label: bucket.label,
    openaiRequests: openaiDay.requests,
    geminiRequests: geminiDay.requests,
    claudeRequests: claudeDay.requests,
    openaiTokens: openaiDay.tokens,
    geminiTokens: geminiDay.tokens,
    claudeTokens: claudeDay.tokens,
    totalTokens: openaiDay.tokens + geminiDay.tokens + claudeDay.tokens,
    costUsd: roundMoney(openaiDay.costUsd + geminiDay.costUsd + claudeDay.costUsd),
  };
});

const snapshot = {
  source: {
    name: "생성형 AI API 사용 현황",
    period: `최근 ${days}일`,
    generatedAt: formatKoreanTimestamp(now),
    mode: "로컬 수집 스냅샷",
  },
  providers,
  dailyUsage,
  models: [...openai.models, ...gemini.models, ...claude.models].sort((a, b) => b.costUsd - a.costUsd),
  keyHealth: [openai.keyHealth, gemini.keyHealth, claude.keyHealth],
};

for (const outputPath of outputPaths) {
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`);
}

console.log(`Wrote ${outputPaths.map((outputPath) => path.relative(rootDir, outputPath)).join(", ")}`);
for (const provider of providers) {
  console.log(
    `${provider.provider}: ${provider.status} · ${provider.requests.toLocaleString("en-US")} requests · ${provider.costUsd.toFixed(2)} USD · ${provider.note}`,
  );
}

async function collectOpenAI(apiKey) {
  const providerName = "OpenAI";
  if (!apiKey) return missingProvider(providerName, "OPENAI_ADMIN_KEY가 없습니다.");

  const usageUrl = new URL("https://api.openai.com/v1/organization/usage/completions");
  usageUrl.searchParams.set("start_time", String(Math.floor(startingAt.getTime() / 1000)));
  usageUrl.searchParams.set("end_time", String(Math.floor(endingAt.getTime() / 1000)));
  usageUrl.searchParams.set("bucket_width", "1d");
  usageUrl.searchParams.append("group_by[]", "model");

  const costsUrl = new URL("https://api.openai.com/v1/organization/costs");
  costsUrl.searchParams.set("start_time", String(Math.floor(startingAt.getTime() / 1000)));
  costsUrl.searchParams.set("end_time", String(Math.floor(endingAt.getTime() / 1000)));
  costsUrl.searchParams.set("bucket_width", "1d");

  const headers = { Authorization: `Bearer ${apiKey}` };
  const usageResult = await getJson(usageUrl, { headers });
  const costsResult = await getJson(costsUrl, { headers });

  if (!usageResult.ok && !costsResult.ok) {
    return errorProvider(providerName, "OpenAI 조회 실패", usageResult.error ?? costsResult.error);
  }

  const usage = usageResult.ok ? parseOpenAIUsage(usageResult.data) : emptyUsage();
  const costs = costsResult.ok ? parseOpenAICosts(costsResult.data) : { totalCostUsd: 0, dailyCosts: new Map() };
  const daily = mergeDaily(usage.daily, costs.dailyCosts);
  const costByToken =
    usage.inputTokens + usage.outputTokens > 0 ? costs.totalCostUsd / (usage.inputTokens + usage.outputTokens) : 0;
  const models = [...usage.models.values()]
    .map((model) => ({
      provider: providerName,
      model: model.model,
      requests: model.requests,
      inputTokens: model.inputTokens,
      outputTokens: model.outputTokens,
      costUsd: roundMoney((model.inputTokens + model.outputTokens) * costByToken),
      avgLatencyMs: 0,
      errorRate: 0,
    }))
    .sort((a, b) => b.requests - a.requests);

  return {
    provider: makeProvider({
      provider: providerName,
      label: "OpenAI API",
      requests: usage.totalRequests,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      costUsd: costs.totalCostUsd,
      activeKeys: 1,
      status: "정상",
      note: usageResult.ok ? "Organization Usage/Costs API 수집 완료" : "Costs API만 수집됨",
    }),
    daily,
    models,
    keyHealth: makeKeyHealth(providerName, {
      name: "openai-admin",
      scope: "organization usage, costs",
      requests: usage.totalRequests,
      status: "정상",
      note: "환경변수에서만 읽음",
    }),
  };
}

async function collectGemini(apiKey) {
  const providerName = "Gemini";
  if (!apiKey) return missingProvider(providerName, "GEMINI_API_KEY가 없습니다.");

  const modelsUrl = new URL("https://generativelanguage.googleapis.com/v1beta/models");
  modelsUrl.searchParams.set("key", apiKey);
  const modelsResult = await getJson(modelsUrl);

  if (!modelsResult.ok) {
    return errorProvider(providerName, "Gemini 키 확인 실패", modelsResult.error);
  }

  return {
    provider: makeProvider({
      provider: providerName,
      label: "Gemini API",
      requests: 0,
      inputTokens: 0,
      outputTokens: 0,
      costUsd: 0,
      activeKeys: 1,
      status: "주의",
      note: "API 키 확인됨. 사용량/과금은 Cloud Billing 또는 AI Studio 대조 필요",
    }),
    daily: new Map(dayBuckets.map((bucket) => [bucket.date, emptyDaily()])),
    models: parseGeminiModels(modelsResult.data),
    keyHealth: makeKeyHealth(providerName, {
      name: "gemini-prod",
      scope: "generative language",
      requests: 0,
      status: "정상",
      note: "키 유효성 확인됨. 비용 수집은 GCP Billing 연동 필요",
    }),
  };
}

async function collectClaude(apiKey) {
  const providerName = "Claude";
  if (!apiKey) return missingProvider(providerName, "ANTHROPIC_ADMIN_API_KEY가 없습니다.");

  const usageUrl = new URL("https://api.anthropic.com/v1/organizations/usage_report/messages");
  usageUrl.searchParams.set("starting_at", startingAt.toISOString());
  usageUrl.searchParams.set("ending_at", endingAt.toISOString());
  usageUrl.searchParams.set("bucket_width", "1d");
  usageUrl.searchParams.append("group_by[]", "model");

  const costUrl = new URL("https://api.anthropic.com/v1/organizations/cost_report");
  costUrl.searchParams.set("starting_at", startingAt.toISOString());
  costUrl.searchParams.set("ending_at", endingAt.toISOString());

  const headers = {
    "anthropic-version": "2023-06-01",
    "x-api-key": apiKey,
  };
  const usageResult = await getJson(usageUrl, { headers });
  const costResult = await getJson(costUrl, { headers });

  if (!usageResult.ok && !costResult.ok) {
    return errorProvider(providerName, "Claude Admin API 조회 실패", usageResult.error ?? costResult.error);
  }

  const usage = usageResult.ok ? parseClaudeUsage(usageResult.data) : emptyUsage();
  const costs = costResult.ok ? parseClaudeCosts(costResult.data) : { totalCostUsd: 0, dailyCosts: new Map() };
  const daily = mergeDaily(usage.daily, costs.dailyCosts);
  const costByToken =
    usage.inputTokens + usage.outputTokens > 0 ? costs.totalCostUsd / (usage.inputTokens + usage.outputTokens) : 0;
  const models = [...usage.models.values()]
    .map((model) => ({
      provider: providerName,
      model: model.model,
      requests: model.requests,
      inputTokens: model.inputTokens,
      outputTokens: model.outputTokens,
      costUsd: roundMoney((model.inputTokens + model.outputTokens) * costByToken),
      avgLatencyMs: 0,
      errorRate: 0,
    }))
    .sort((a, b) => b.requests - a.requests);

  return {
    provider: makeProvider({
      provider: providerName,
      label: "Claude API",
      requests: usage.totalRequests,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      costUsd: costs.totalCostUsd,
      activeKeys: 1,
      status: "정상",
      note: usageResult.ok ? "Admin Usage/Cost API 수집 완료" : "Cost API만 수집됨",
    }),
    daily,
    models,
    keyHealth: makeKeyHealth(providerName, {
      name: "claude-admin",
      scope: "admin usage, costs",
      requests: usage.totalRequests,
      status: "정상",
      note: "환경변수에서만 읽음",
    }),
  };
}

function parseOpenAIUsage(payload) {
  const usage = emptyUsage();
  for (const bucket of bucketItems(payload)) {
    const date = dateFromBucket(bucket);
    for (const result of resultItems(bucket)) {
      const model = stringValue(result.model ?? result.snapshot_id ?? result.project_id, "OpenAI total");
      const requests = numberValue(result.num_model_requests ?? result.requests ?? result.num_requests);
      const inputTokens = numberValue(result.input_tokens);
      const outputTokens = numberValue(result.output_tokens);
      addUsage(usage, date, model, requests, inputTokens, outputTokens);
    }
  }
  return usage;
}

function parseOpenAICosts(payload) {
  const dailyCosts = new Map();
  let totalCostUsd = 0;
  for (const bucket of bucketItems(payload)) {
    const date = dateFromBucket(bucket);
    let bucketCost = 0;
    for (const result of resultItems(bucket)) {
      bucketCost += amountValue(result.amount ?? result.cost ?? result);
    }
    dailyCosts.set(date, roundMoney((dailyCosts.get(date) ?? 0) + bucketCost));
    totalCostUsd += bucketCost;
  }
  return { totalCostUsd: roundMoney(totalCostUsd), dailyCosts };
}

function parseClaudeUsage(payload) {
  const usage = emptyUsage();
  for (const bucket of bucketItems(payload)) {
    const date = dateFromBucket(bucket);
    for (const result of resultItems(bucket)) {
      const model = stringValue(result.model ?? result.description ?? result.workspace_id, "Claude total");
      const requests = numberValue(
        result.requests ?? result.num_requests ?? result.message_count ?? result.messages ?? result.count,
      );
      const inputTokens =
        numberValue(result.input_tokens ?? result.input_tokens_count ?? result.uncached_input_tokens) +
        numberValue(result.cache_read_input_tokens) +
        numberValue(result.cache_creation_input_tokens) +
        numberValue(result.cache_creation?.ephemeral_1h_input_tokens) +
        numberValue(result.cache_creation?.ephemeral_5m_input_tokens);
      const outputTokens = numberValue(result.output_tokens ?? result.output_tokens_count);
      addUsage(usage, date, model, requests, inputTokens, outputTokens);
    }
  }
  return usage;
}

function parseClaudeCosts(payload) {
  const dailyCosts = new Map();
  let totalCostUsd = 0;
  for (const bucket of bucketItems(payload)) {
    const date = dateFromBucket(bucket);
    let bucketCost = 0;
    for (const result of resultItems(bucket)) {
      bucketCost += amountValue(result.amount ?? result.cost ?? result.total_cost ?? result);
    }
    dailyCosts.set(date, roundMoney((dailyCosts.get(date) ?? 0) + bucketCost));
    totalCostUsd += bucketCost;
  }
  return { totalCostUsd: roundMoney(totalCostUsd), dailyCosts };
}

function parseGeminiModels(payload) {
  const models = Array.isArray(payload?.models) ? payload.models : [];
  return models.slice(0, 8).map((model) => ({
    provider: "Gemini",
    model: stringValue(model.displayName ?? model.name, "Gemini model").replace(/^models\//, ""),
    requests: 0,
    inputTokens: 0,
    outputTokens: 0,
    costUsd: 0,
    avgLatencyMs: 0,
    errorRate: 0,
  }));
}

function addUsage(usage, date, model, requests, inputTokens, outputTokens) {
  usage.totalRequests += requests;
  usage.inputTokens += inputTokens;
  usage.outputTokens += outputTokens;

  const daily = usage.daily.get(date) ?? emptyDaily();
  daily.requests += requests;
  daily.tokens += inputTokens + outputTokens;
  usage.daily.set(date, daily);

  const modelUsage = usage.models.get(model) ?? {
    model,
    requests: 0,
    inputTokens: 0,
    outputTokens: 0,
  };
  modelUsage.requests += requests;
  modelUsage.inputTokens += inputTokens;
  modelUsage.outputTokens += outputTokens;
  usage.models.set(model, modelUsage);
}

function mergeDaily(usageDaily, dailyCosts) {
  const merged = new Map();
  for (const bucket of dayBuckets) {
    const usage = usageDaily.get(bucket.date) ?? emptyDaily();
    merged.set(bucket.date, {
      ...usage,
      costUsd: roundMoney(dailyCosts.get(bucket.date) ?? 0),
    });
  }
  return merged;
}

function makeProvider({ provider, label, requests, inputTokens, outputTokens, costUsd, activeKeys, status, note }) {
  return {
    provider,
    label,
    color: providerColors[provider],
    requests,
    inputTokens,
    outputTokens,
    costUsd: roundMoney(costUsd),
    avgLatencyMs: 0,
    errorRate: 0,
    quotaUsedRate: 0,
    activeKeys,
    lastSynced: formatKoreanTimestamp(now),
    status,
    note,
  };
}

function makeKeyHealth(provider, { name, scope, requests, status, note }) {
  return {
    provider,
    name,
    scope,
    lastUsed: formatKoreanTimestamp(now),
    requests,
    status,
    note,
  };
}

function missingProvider(provider, note) {
  return {
    provider: makeProvider({
      provider,
      label: `${provider} API`,
      requests: 0,
      inputTokens: 0,
      outputTokens: 0,
      costUsd: 0,
      activeKeys: 0,
      status: "연동대기",
      note,
    }),
    daily: new Map(dayBuckets.map((bucket) => [bucket.date, emptyDaily()])),
    models: [],
    keyHealth: makeKeyHealth(provider, {
      name: `${provider.toLowerCase()}-key`,
      scope: "not configured",
      requests: 0,
      status: "확인필요",
      note,
    }),
  };
}

function errorProvider(provider, note, error) {
  return {
    provider: makeProvider({
      provider,
      label: `${provider} API`,
      requests: 0,
      inputTokens: 0,
      outputTokens: 0,
      costUsd: 0,
      activeKeys: 1,
      status: "주의",
      note: `${note}: ${shortenError(error)}`,
    }),
    daily: new Map(dayBuckets.map((bucket) => [bucket.date, emptyDaily()])),
    models: [],
    keyHealth: makeKeyHealth(provider, {
      name: `${provider.toLowerCase()}-key`,
      scope: "usage",
      requests: 0,
      status: "확인필요",
      note: shortenError(error),
    }),
  };
}

async function getJson(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      return {
        ok: false,
        error: data?.error?.message ?? data?.message ?? `${response.status} ${response.statusText}`,
      };
    }

    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

async function readLocalEnv(filePath) {
  if (!existsSync(filePath)) return {};

  const text = await readFile(filePath, "utf8");
  const entries = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const index = trimmed.indexOf("=");
    if (index < 0) continue;

    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
    entries[key] = value;
  }
  return entries;
}

function getOutputPaths(env) {
  const snapshotFileName = "api-usage-snapshot.local.json";
  const paths = [path.join(rootDir, "public", snapshotFileName)];

  if (existsSync(path.join(rootDir, "dist"))) {
    paths.push(path.join(rootDir, "dist", snapshotFileName));
  }

  if (env.API_USAGE_OUTPUT_PATH) {
    paths.push(path.resolve(rootDir, env.API_USAGE_OUTPUT_PATH));
  }

  return [...new Set(paths)];
}

function bucketItems(payload) {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.buckets)) return payload.buckets;
  if (Array.isArray(payload?.results)) return [{ results: payload.results }];
  if (Array.isArray(payload)) return payload;
  return [];
}

function resultItems(bucket) {
  if (Array.isArray(bucket?.results)) return bucket.results;
  if (Array.isArray(bucket?.data)) return bucket.data;
  return [bucket].filter(Boolean);
}

function dateFromBucket(bucket) {
  const raw = bucket?.start_time ?? bucket?.starting_at ?? bucket?.start_at ?? bucket?.date;
  if (typeof raw === "number") return toDateKey(new Date(raw * 1000));
  if (typeof raw === "string") return toDateKey(new Date(raw));
  return toDateKey(startingAt);
}

function makeDayBuckets(startDate, count) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(startDate.getTime() + index * 24 * 60 * 60 * 1000);
    return {
      date: toDateKey(date),
      label: `${date.getUTCMonth() + 1}/${date.getUTCDate()}`,
    };
  });
}

function emptyUsage() {
  return {
    totalRequests: 0,
    inputTokens: 0,
    outputTokens: 0,
    daily: new Map(),
    models: new Map(),
  };
}

function emptyDaily() {
  return {
    requests: 0,
    tokens: 0,
    costUsd: 0,
  };
}

function amountValue(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return numberValue(value);
  if (typeof value?.value === "number" || typeof value?.value === "string") return numberValue(value.value);
  if (typeof value?.amount === "number" || typeof value?.amount === "string") return numberValue(value.amount);
  return 0;
}

function numberValue(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function stringValue(value, fallback) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function parseDays(arg) {
  const value = Number(arg.split("=")[1]);
  if (!Number.isFinite(value) || value < 1 || value > 31) return 7;
  return Math.round(value);
}

function formatKoreanTimestamp(date) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function shortenError(error) {
  return String(error ?? "알 수 없는 오류").replace(/\s+/g, " ").slice(0, 120);
}
