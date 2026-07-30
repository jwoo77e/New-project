import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createSign } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

let rootDir = process.cwd();
let envPath = path.join(rootDir, ".env.local");
let days = 7;
let now = new Date();
let endingAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
let startingAt = new Date(endingAt.getTime() - days * 24 * 60 * 60 * 1000);
let dayBuckets = makeDayBuckets(startingAt, days);

const providerColors = {
  OpenAI: "#0f8b8d",
  Gemini: "#c58612",
  Claude: "#5f6f8c",
};

const gammaApiBaseUrl = "https://public-api.gamma.app/v1.0";

const geminiRequestMetricTypes = [
  "generativelanguage.googleapis.com/quota/generate_content_free_tier_requests/usage",
  "generativelanguage.googleapis.com/quota/generate_content_paid_tier_requests/usage",
  "generativelanguage.googleapis.com/quota/generate_content_paid_tier_2_requests/usage",
  "generativelanguage.googleapis.com/quota/generate_content_paid_tier_3_requests/usage",
  "generativelanguage.googleapis.com/quota/generate_requests_per_model/usage",
  "generativelanguage.googleapis.com/quota/embed_content_free_tier_requests/usage",
  "generativelanguage.googleapis.com/quota/embed_content_paid_tier_requests/usage",
  "generativelanguage.googleapis.com/quota/embed_content_paid_tier_2_requests/usage",
  "generativelanguage.googleapis.com/quota/embed_content_paid_tier_3_requests/usage",
];

const geminiInputTokenMetricTypes = [
  "generativelanguage.googleapis.com/quota/generate_content_free_tier_input_token_count/usage",
  "generativelanguage.googleapis.com/quota/generate_content_paid_tier_input_token_count/usage",
  "generativelanguage.googleapis.com/quota/generate_content_paid_tier_2_input_token_count/usage",
  "generativelanguage.googleapis.com/quota/generate_content_paid_tier_3_input_token_count/usage",
  "generativelanguage.googleapis.com/quota/embed_content_free_tier_tokens/usage",
  "generativelanguage.googleapis.com/quota/embed_content_paid_tier_tokens/usage",
  "generativelanguage.googleapis.com/quota/embed_content_paid_tier_2_tokens/usage",
  "generativelanguage.googleapis.com/quota/embed_content_paid_tier_3_tokens/usage",
];

const geminiOutputTokenMetricTypes = ["generativelanguage.googleapis.com/generate_content_usage_output_token_count"];
const workspaceReportsScope = "https://www.googleapis.com/auth/admin.reports.audit.readonly";

export async function loadApiUsageEnv({ targetRootDir = process.cwd(), includeLocalEnv = true } = {}) {
  const localEnvPath = path.join(targetRootDir, ".env.local");
  return {
    ...process.env,
    ...(includeLocalEnv ? await readLocalEnv(localEnvPath) : {}),
  };
}

export async function collectApiUsage({
  env = process.env,
  targetRootDir = process.cwd(),
  requestedDays = 7,
  collectedAt = new Date(),
  mode = "런타임 API 수집",
} = {}) {
  configureRuntime({ targetRootDir, requestedDays, collectedAt });

  const [openai, gemini, claude, workspaceUsage, gammaUsage] = await Promise.all([
    collectOpenAI(env.OPENAI_ADMIN_KEY),
    collectGemini(env.GEMINI_API_KEY, env),
    collectClaude(resolveAnthropicAdminKeys(env)),
    collectGeminiWorkspaceUsage(env),
    collectGamma(env.GAMMA_API_KEY, env),
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
      openaiCostUsd: openaiDay.costUsd,
      geminiCostUsd: geminiDay.costUsd,
      claudeCostUsd: claudeDay.costUsd,
      costUsd: roundMoney(openaiDay.costUsd + geminiDay.costUsd + claudeDay.costUsd),
    };
  });

  return {
    source: {
      name: "생성형 AI API 사용 현황",
      period: `최근 ${days}일`,
      generatedAt: formatKoreanTimestamp(now),
      mode,
    },
    providers,
    dailyUsage,
    models: [...openai.models, ...gemini.models, ...claude.models].sort((a, b) => b.costUsd - a.costUsd),
    keyHealth: [openai.keyHealth, gemini.keyHealth, ...keyHealthRows(claude)],
    workspaceUsage,
    gammaUsage,
  };
}

export async function writeApiUsageSnapshot(snapshot, env = process.env) {
  const outputPaths = getOutputPaths(env);
  for (const outputPath of outputPaths) {
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`);
  }
  return outputPaths;
}

async function runCli() {
  const requestedDays = parseDays(process.argv.find((arg) => arg.startsWith("--days=")) ?? "--days=7");
  configureRuntime({ targetRootDir: process.cwd(), requestedDays, collectedAt: new Date() });
  const env = await loadApiUsageEnv({ targetRootDir: rootDir });
  const snapshot = await collectApiUsage({
    env,
    targetRootDir: rootDir,
    requestedDays,
    collectedAt: now,
    mode: "로컬 수집 스냅샷",
  });
  const existingSnapshot = await readExistingApiUsageSnapshot(env);
  const preserveExisting =
    env.API_USAGE_PRESERVE_ON_FAILURE !== "false" &&
    isApiUsageFetchFailure(snapshot) &&
    hasLiveApiUsage(existingSnapshot);
  const outputSnapshot = preserveExisting ? existingSnapshot : snapshot;
  const outputPaths = await writeApiUsageSnapshot(outputSnapshot, env);

  console.log(`Wrote ${outputPaths.map((outputPath) => path.relative(rootDir, outputPath)).join(", ")}`);
  if (preserveExisting) {
    console.log("API usage live collection failed; preserved previous normal snapshot instead of writing zero-value warnings.");
  }
  for (const provider of outputSnapshot.providers) {
    console.log(
      `${provider.provider}: ${provider.status} · ${provider.requests.toLocaleString("en-US")} requests · ${provider.costUsd.toFixed(2)} USD · ${provider.note}`,
    );
  }
  console.log(
    `Gemini Workspace: ${outputSnapshot.workspaceUsage.source.status} · ${outputSnapshot.workspaceUsage.activeUsers.toLocaleString("en-US")} active users · ${outputSnapshot.workspaceUsage.totalEvents.toLocaleString("en-US")} events · ${outputSnapshot.workspaceUsage.source.note}`,
  );
  console.log(
    `Gamma: ${outputSnapshot.gammaUsage.source.status} · ${outputSnapshot.gammaUsage.themeCount.toLocaleString("en-US")} themes · ${outputSnapshot.gammaUsage.folderCount.toLocaleString("en-US")} folders · ${outputSnapshot.gammaUsage.totalCreditsDeducted.toLocaleString("en-US")} credits · ${outputSnapshot.gammaUsage.source.note}`,
  );
}

function configureRuntime({ targetRootDir = process.cwd(), requestedDays = 7, collectedAt = new Date() } = {}) {
  rootDir = targetRootDir;
  envPath = path.join(rootDir, ".env.local");
  days = parseDays(requestedDays);
  now = collectedAt;
  endingAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  startingAt = new Date(endingAt.getTime() - days * 24 * 60 * 60 * 1000);
  dayBuckets = makeDayBuckets(startingAt, days);
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

async function collectGemini(apiKey, env) {
  const providerName = "Gemini";
  if (!apiKey) return missingProvider(providerName, "GEMINI_API_KEY가 없습니다.");

  const modelsUrl = new URL("https://generativelanguage.googleapis.com/v1beta/models");
  modelsUrl.searchParams.set("key", apiKey);
  const modelsResult = await getJson(modelsUrl);

  if (!modelsResult.ok) {
    return errorProvider(providerName, "Gemini 키 확인 실패", modelsResult.error);
  }

  const catalogModels = parseGeminiModels(modelsResult.data);
  const monitoring = await collectGeminiMonitoring(env);

  if (!monitoring.ok) {
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
        note: `API 키 확인됨. Cloud Monitoring 미수집: ${shortenError(monitoring.error)}`,
      }),
      daily: new Map(dayBuckets.map((bucket) => [bucket.date, emptyDaily()])),
      models: catalogModels,
      keyHealth: makeKeyHealth(providerName, {
        name: "gemini-prod",
        scope: "generative language, monitoring",
        requests: 0,
        status: "확인필요",
        note: shortenError(monitoring.error),
      }),
    };
  }

  const usage = monitoring.usage;
  const billingCosts = await collectGeminiBillingCosts(env);
  const costByToken =
    billingCosts.ok && usage.inputTokens + usage.outputTokens > 0
      ? billingCosts.totalCostUsd / (usage.inputTokens + usage.outputTokens)
      : 0;
  const usageModels = [...usage.models.values()]
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
    .sort((a, b) => b.inputTokens + b.outputTokens + b.requests - (a.inputTokens + a.outputTokens + a.requests));
  const hasUsage = usage.totalRequests > 0 || usage.inputTokens + usage.outputTokens > 0;
  const billingNote = billingCosts.ok
    ? `BigQuery Billing 비용 수집 완료 (${billingCosts.projectFilterLabel})`
    : `BigQuery Billing 미수집: ${shortenError(billingCosts.error)}`;
  const note = hasUsage
    ? `Cloud Monitoring 사용량 수집 완료 (${monitoring.projectLabel}). ${billingNote}`
    : `Cloud Monitoring 조회 완료 (${monitoring.projectLabel}), 최근 사용량 없음. ${billingNote}`;

  return {
    provider: makeProvider({
      provider: providerName,
      label: "Gemini API",
      requests: usage.totalRequests,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      costUsd: billingCosts.ok ? billingCosts.totalCostUsd : 0,
      activeKeys: 1,
      status: hasUsage ? "정상" : "주의",
      note,
    }),
    daily: mergeDaily(usage.daily, billingCosts.ok ? billingCosts.dailyCosts : new Map()),
    models: usageModels.length > 0 ? usageModels : catalogModels,
    keyHealth: makeKeyHealth(providerName, {
      name: "gemini-prod",
      scope: `generative language, monitoring (${monitoring.projectLabel})`,
      requests: usage.totalRequests,
      status: "정상",
      note: billingCosts.ok
        ? "Cloud Monitoring 및 BigQuery Billing 인증 성공"
        : `Cloud Monitoring 인증 성공. ${shortenError(billingCosts.error)}`,
    }),
  };
}

export function resolveAnthropicAdminKeys(env = {}) {
  const entries = [];
  const seen = new Set();

  const addEntry = ({ apiKey, label, sourceEnvName }) => {
    const key = String(apiKey ?? "").trim();
    if (!key || seen.has(key)) return;
    seen.add(key);
    entries.push({
      key,
      label: String(label ?? "").trim() || `Claude Admin ${entries.length + 1}`,
      sourceEnvName,
    });
  };

  addEntry({
    apiKey: env.ANTHROPIC_ADMIN_API_KEY,
    label: env.ANTHROPIC_ADMIN_API_KEY_LABEL ?? "Claude Admin 1",
    sourceEnvName: "ANTHROPIC_ADMIN_API_KEY",
  });

  addEntry({
    apiKey: env.ANTHROPIC_ADMIN_API_KEY_1,
    label: env.ANTHROPIC_ADMIN_API_KEY_1_LABEL ?? env.ANTHROPIC_ADMIN_API_KEY_LABEL ?? "Claude Admin 1",
    sourceEnvName: "ANTHROPIC_ADMIN_API_KEY_1",
  });

  Object.keys(env)
    .map((key) => key.match(/^ANTHROPIC_ADMIN_API_KEY_(\d+)$/)?.[1])
    .filter(Boolean)
    .map(Number)
    .filter((index) => index > 1)
    .sort((a, b) => a - b)
    .forEach((index) => {
      addEntry({
        apiKey: env[`ANTHROPIC_ADMIN_API_KEY_${index}`],
        label: env[`ANTHROPIC_ADMIN_API_KEY_${index}_LABEL`] ?? `Claude Admin ${index}`,
        sourceEnvName: `ANTHROPIC_ADMIN_API_KEY_${index}`,
      });
    });

  const bulkKeys = splitEnvList(env.ANTHROPIC_ADMIN_API_KEYS);
  const bulkLabels = splitLabelList(env.ANTHROPIC_ADMIN_API_KEY_LABELS);
  bulkKeys.forEach((apiKey, index) => {
    addEntry({
      apiKey,
      label: bulkLabels[index] ?? `Claude Admin ${entries.length + 1}`,
      sourceEnvName: "ANTHROPIC_ADMIN_API_KEYS",
    });
  });

  return entries;
}

async function collectClaude(adminKeys) {
  const providerName = "Claude";
  const keys = Array.isArray(adminKeys) ? adminKeys : [];
  if (keys.length === 0) {
    return missingProvider(providerName, "ANTHROPIC_ADMIN_API_KEY 또는 ANTHROPIC_ADMIN_API_KEY_2가 없습니다.");
  }

  const results = await Promise.all(keys.map((adminKey, index) => collectClaudeAdminKey(adminKey, index + 1)));
  if (results.length === 1) {
    return {
      ...results[0],
      keyHealth: [results[0].keyHealth],
    };
  }

  return aggregateClaudeAdminResults(results, keys.length);
}

async function collectClaudeAdminKey(adminKey, index) {
  const providerName = "Claude";
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
    "x-api-key": adminKey.key,
  };
  const usageResult = await getJson(usageUrl, { headers });
  const costResult = await getJson(costUrl, { headers });
  const keyName = `claude-admin-${index}: ${adminKey.label}`;

  if (!usageResult.ok && !costResult.ok) {
    const error = usageResult.error ?? costResult.error;
    return {
      provider: makeProvider({
        provider: providerName,
        label: "Claude API",
        requests: 0,
        inputTokens: 0,
        outputTokens: 0,
        costUsd: 0,
        activeKeys: 1,
        status: "주의",
        note: `${adminKey.label} Claude Admin API 조회 실패: ${shortenError(error)}`,
      }),
      daily: new Map(dayBuckets.map((bucket) => [bucket.date, emptyDaily()])),
      models: [],
      keyHealth: makeKeyHealth(providerName, {
        name: keyName,
        scope: "admin usage, costs",
        requests: 0,
        status: "확인필요",
        note: `${adminKey.sourceEnvName}: ${shortenError(error)}`,
      }),
    };
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
      note: usageResult.ok
        ? `${adminKey.label} Admin Usage/Cost API 수집 완료`
        : `${adminKey.label} Cost API만 수집됨`,
    }),
    daily,
    models,
    keyHealth: makeKeyHealth(providerName, {
      name: keyName,
      scope: "admin usage, costs",
      requests: usage.totalRequests,
      status: "정상",
      note: `${adminKey.sourceEnvName}에서만 읽음`,
    }),
  };
}

function aggregateClaudeAdminResults(results, activeKeys) {
  const providerName = "Claude";
  const totals = results.reduce(
    (sum, result) => ({
      requests: sum.requests + result.provider.requests,
      inputTokens: sum.inputTokens + result.provider.inputTokens,
      outputTokens: sum.outputTokens + result.provider.outputTokens,
      costUsd: sum.costUsd + result.provider.costUsd,
      ok: sum.ok + (result.provider.status === "정상" ? 1 : 0),
    }),
    { requests: 0, inputTokens: 0, outputTokens: 0, costUsd: 0, ok: 0 },
  );

  const daily = new Map();
  for (const bucket of dayBuckets) {
    const mergedDay = results.reduce((sum, result) => {
      const day = result.daily.get(bucket.date) ?? emptyDaily();
      return {
        requests: sum.requests + day.requests,
        tokens: sum.tokens + day.tokens,
        costUsd: sum.costUsd + day.costUsd,
      };
    }, emptyDaily());
    daily.set(bucket.date, {
      ...mergedDay,
      costUsd: roundMoney(mergedDay.costUsd),
    });
  }

  const status = totals.ok === results.length ? "정상" : totals.ok > 0 ? "주의" : "주의";
  const note =
    totals.ok === results.length
      ? `${results.length}개 Claude Admin 키 수집 완료`
      : `${results.length}개 Claude Admin 키 중 ${totals.ok}개 수집 완료`;

  return {
    provider: makeProvider({
      provider: providerName,
      label: "Claude API",
      requests: totals.requests,
      inputTokens: totals.inputTokens,
      outputTokens: totals.outputTokens,
      costUsd: totals.costUsd,
      activeKeys,
      status,
      note,
    }),
    daily,
    models: combineModelRows(results.flatMap((result) => result.models)),
    keyHealth: results.map((result) => result.keyHealth),
  };
}

async function collectGamma(apiKey, env) {
  const generationIds = parseGammaGenerationIds(env.GAMMA_GENERATION_IDS ?? env.GAMMA_GENERATION_ID);

  if (!apiKey) {
    return emptyGammaUsage({
      apiKeyConfigured: false,
      generationIds,
      note: "GAMMA_API_KEY가 없어 Gamma API 항목을 수집하지 않았습니다.",
      status: "연동대기",
    });
  }

  const headers = {
    "X-API-KEY": apiKey,
    accept: "application/json",
  };
  const [themesResult, foldersResult] = await Promise.all([
    getJson(`${gammaApiBaseUrl}/themes?limit=10`, { headers }),
    getJson(`${gammaApiBaseUrl}/folders?limit=10`, { headers }),
  ]);

  if (!themesResult.ok && !foldersResult.ok) {
    return emptyGammaUsage({
      apiKeyConfigured: true,
      generationIds,
      note: `Gamma API 키 확인 실패: ${shortenError(themesResult.error ?? foldersResult.error)}`,
      status: "주의",
    });
  }

  const generationResults = await Promise.all(
    generationIds.map(async (generationId) => {
      const result = await getJson(`${gammaApiBaseUrl}/generations/${encodeURIComponent(generationId)}`, { headers });
      return result.ok
        ? parseGammaGenerationStatus(result.data, generationId)
        : {
            generationId,
            status: "failed",
            gammaUrl: "",
            exportUrl: "",
            creditsDeducted: 0,
            creditsRemaining: null,
            hasExport: false,
            note: shortenError(result.error),
          };
    }),
  );

  const themes = themesResult.ok ? parseGammaWorkspaceItems(themesResult.data, "theme") : [];
  const folders = foldersResult.ok ? parseGammaWorkspaceItems(foldersResult.data, "folder") : [];
  const webCreditSnapshot = await readGammaCreditSnapshot(env);
  const failedSources = [
    !themesResult.ok ? `테마 조회 실패: ${shortenError(themesResult.error)}` : "",
    !foldersResult.ok ? `폴더 조회 실패: ${shortenError(foldersResult.error)}` : "",
  ].filter(Boolean);

  return buildGammaUsageFromGenerationStatuses(generationResults, {
    apiKeyConfigured: true,
    folders,
    note:
      failedSources.length > 0
        ? failedSources.join(" · ")
        : webCreditSnapshot
          ? `Gamma API 키 확인 및 웹 크레딧 수집값 반영 완료 (${webCreditSnapshot.currentCreditsRemaining?.toLocaleString?.("en-US") ?? "-"} credits)`
        : generationIds.length > 0
          ? "Gamma API 키 확인 및 generation credit 수집 완료"
          : "Gamma API 키 확인 완료. 크레딧 차감량은 GAMMA_GENERATION_IDS 설정 시 수집됩니다.",
    status: failedSources.length > 0 ? "주의" : "정상",
    themes,
    webCreditSnapshot,
  });
}

function emptyGammaUsage({ apiKeyConfigured, generationIds = [], note, status }) {
  return buildGammaUsageFromGenerationStatuses(
    generationIds.map((generationId) => ({
      generationId,
      status: "unknown",
      gammaUrl: "",
      exportUrl: "",
      creditsDeducted: 0,
      creditsRemaining: null,
      hasExport: false,
      note: "GAMMA_API_KEY 설정 후 조회 가능",
    })),
    {
      apiKeyConfigured,
      folders: [],
      note,
      status,
      themes: [],
      webCreditSnapshot: null,
    },
  );
}

export function buildGammaUsageFromGenerationStatuses(
  generations,
  {
    apiKeyConfigured = true,
    folders = [],
    note = "Gamma API 수집 완료",
    status = "정상",
    themes = [],
    webCreditSnapshot = null,
  } = {},
) {
  const completedGenerations = generations.filter((generation) => generation.status === "completed").length;
  const failedGenerations = generations.filter((generation) => generation.status === "failed").length;
  const generationCreditsRemaining = [...generations]
    .reverse()
    .find((generation) => typeof generation.creditsRemaining === "number")?.creditsRemaining;
  const webCreditsRemaining =
    webCreditSnapshot && typeof webCreditSnapshot.currentCreditsRemaining === "number"
      ? webCreditSnapshot.currentCreditsRemaining
      : null;
  const latestCreditsRemaining =
    typeof webCreditsRemaining === "number"
      ? webCreditsRemaining
      : typeof generationCreditsRemaining === "number"
        ? generationCreditsRemaining
        : null;

  return {
    source: {
      name: "Gamma API 사용 가능 항목",
      period: `최근 ${days}일`,
      generatedAt: formatKoreanTimestamp(now),
      mode: "Gamma API 수집",
      status,
      note,
    },
    apiKeyConfigured,
    workspaceAccess: themes.length > 0 || folders.length > 0,
    themeCount: themes.length,
    folderCount: folders.length,
    sampleThemes: themes.slice(0, 5),
    sampleFolders: folders.slice(0, 5),
    trackedGenerations: generations.length,
    completedGenerations,
    failedGenerations,
    exportedGenerations: generations.filter((generation) => generation.hasExport).length,
    totalCreditsDeducted: generations.reduce((sum, generation) => sum + generation.creditsDeducted, 0),
    latestCreditsRemaining,
    creditSource: typeof webCreditsRemaining === "number" ? "web-crawl" : "generation",
    webCreditSnapshot,
    generations,
  };
}

export function parseGammaGenerationIds(value) {
  return [
    ...new Set(
      String(value ?? "")
        .split(/[,\s]+/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}

async function collectGeminiWorkspaceUsage(env) {
  const requestedWorkspaceDays = parseDays(env.GOOGLE_WORKSPACE_GEMINI_DAYS ?? "28");
  const endingAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  const startingAt = new Date(endingAt.getTime() - requestedWorkspaceDays * 24 * 60 * 60 * 1000);
  const buckets = makeDayBuckets(startingAt, requestedWorkspaceDays);
  const accountEmails = parseEmailList(env.GOOGLE_WORKSPACE_GEMINI_USER_EMAILS);

  if (!env.GOOGLE_WORKSPACE_ADMIN_EMAIL) {
    return emptyGeminiWorkspaceUsage({
      buckets,
      accountEmails,
      note: "GOOGLE_WORKSPACE_ADMIN_EMAIL이 없어 Workspace Reports API를 수집하지 않았습니다.",
      status: "연동대기",
    });
  }

  try {
    const accessToken = await getGoogleAccessToken(env, {
      scopes: [workspaceReportsScope],
      subject: env.GOOGLE_WORKSPACE_ADMIN_EMAIL,
    });
    const activities = await listGeminiWorkspaceActivities({ accessToken, startingAt, endingAt });
    const usage = buildGeminiWorkspaceUsageFromActivities(activities, {
      buckets,
      accountEmails,
      licensedUsers: numberValue(env.GOOGLE_WORKSPACE_GEMINI_LICENSED_USERS),
      mode: "Google Workspace Reports API 수집",
      note: "Gemini Workspace Audit logs 수집 완료",
      status: "정상",
    });
    return usage;
  } catch (error) {
    return emptyGeminiWorkspaceUsage({
      buckets,
      accountEmails,
      note: `Workspace Reports API 미수집: ${shortenError(error instanceof Error ? error.message : String(error))}`,
      status: "주의",
    });
  }
}

async function listGeminiWorkspaceActivities({ accessToken, startingAt, endingAt }) {
  const activities = [];
  let pageToken = "";

  do {
    const url = new URL(
      "https://admin.googleapis.com/admin/reports/v1/activity/users/all/applications/gemini_in_workspace_apps",
    );
    url.searchParams.set("eventName", "feature_utilization");
    url.searchParams.set("startTime", startingAt.toISOString());
    url.searchParams.set("endTime", endingAt.toISOString());
    url.searchParams.set("maxResults", "1000");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const result = await getJson(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!result.ok) {
      throw new Error(result.error);
    }

    activities.push(...(result.data.items ?? []));
    pageToken = result.data.nextPageToken ?? "";
  } while (pageToken);

  return activities;
}

export function buildGeminiWorkspaceUsageFromActivities(
  activities,
  {
    buckets = makeDayBuckets(startingAt, days),
    accountEmails = [],
    licensedUsers = 0,
    mode = "Google Workspace Reports API 수집",
    note = "Gemini Workspace Audit logs 수집 완료",
    status = "정상",
  } = {},
) {
  const users = new Map();
  const daily = new Map(buckets.map((bucket) => [bucket.date, { date: bucket.date, label: bucket.label, events: 0, users: new Set() }]));
  const appUsage = new Map();
  const rosterAccounts = new Set(accountEmails.map((email) => email.toLowerCase()));
  const hasRoster = rosterAccounts.size > 0;
  const restrictToRoster = hasRoster && (licensedUsers <= 0 || rosterAccounts.size >= licensedUsers);
  const knownAccounts = new Set(rosterAccounts);

  for (const activity of activities ?? []) {
    const email = stringValue(activity?.actor?.email, "").toLowerCase();
    if (!email) continue;

    const isManagedUser = !restrictToRoster || rosterAccounts.has(email);
    if (!restrictToRoster) knownAccounts.add(email);
    const time = stringValue(activity?.id?.time, "");
    const date = time ? time.slice(0, 10) : "";
    const reportEvents = Array.isArray(activity?.events) ? activity.events : [];

    for (const event of reportEvents) {
      if (event?.name && event.name !== "feature_utilization") continue;
      const parameters = eventParametersToObject(event?.parameters);
      const eventCategory = stringValue(parameters.event_category ?? parameters.eventCategory, "").toLowerCase();
      if (eventCategory === "inactive") continue;

      const action = stringValue(parameters.action ?? event?.name, "feature_utilization");
      const app = inferWorkspaceApp(parameters, action);
      if (!isManagedUser) continue;

      const user = getWorkspaceUserAccumulator(users, email);

      user.events += 1;
      if (date) {
        user.activeDates.add(date);
        if (!user.lastUsed || date > user.lastUsed) user.lastUsed = date;
      }
      user.apps.add(app);
      user.actions.set(action, (user.actions.get(action) ?? 0) + 1);
      users.set(email, user);

      const day = daily.get(date);
      if (day) {
        day.events += 1;
        day.users.add(email);
      }

      const appRow = appUsage.get(app) ?? { app, events: 0, users: new Set() };
      appRow.events += 1;
      appRow.users.add(email);
      appUsage.set(app, appRow);
    }
  }

  for (const email of knownAccounts) {
    if (!users.has(email)) {
      users.set(email, getWorkspaceUserAccumulator(users, email));
    }
  }

  const userRows = buildGeminiWorkspaceUserRows(users);
  const activeUsers = userRows.filter((user) => user.events > 0).length;
  const listedUsers = knownAccounts.size;
  const resolvedLicensedUsers = hasRoster
    ? Math.max(licensedUsers, listedUsers)
    : Math.max(licensedUsers, listedUsers, activeUsers);
  const activationBase = restrictToRoster ? listedUsers : resolvedLicensedUsers;
  const totalEvents = userRows.reduce((sum, user) => sum + user.events, 0);
  const totalActiveDays = userRows.reduce((sum, user) => sum + user.activeDays, 0);
  const zeroUsers = userRows.filter((user) => user.level === "Zero").length;
  const rosterCoverageNote =
    hasRoster && !restrictToRoster
      ? ` · 계정 목록 ${rosterAccounts.size}/${resolvedLicensedUsers}명으로 불완전하여 도메인 전체 활동 반영`
      : "";

  return {
    source: {
      name: "Gemini Workspace 활용 현황",
      period: `최근 ${buckets.length}일`,
      generatedAt: formatKoreanTimestamp(now),
      mode,
      status,
      note: `${note}${rosterCoverageNote}`,
    },
    licensedUsers: resolvedLicensedUsers,
    listedUsers,
    activeUsers,
    activationRate: activationBase > 0 ? roundRate((activeUsers / activationBase) * 100) : 0,
    totalEvents,
    totalActiveDays,
    avgActiveDays: activeUsers > 0 ? roundRate(totalActiveDays / activeUsers) : 0,
    highUsers: userRows.filter((user) => user.level === "High").length,
    mediumUsers: userRows.filter((user) => user.level === "Medium").length,
    lowUsers: userRows.filter((user) => user.level === "Low").length,
    zeroUsers,
    dailyUsage: [...daily.values()].map((day) => ({
      date: day.date,
      label: day.label,
      events: day.events,
      activeUsers: day.users.size,
    })),
    appUsage: [...appUsage.values()]
      .map((app) => ({
        app: app.app,
        events: app.events,
        activeUsers: app.users.size,
      }))
      .sort((a, b) => b.events - a.events || a.app.localeCompare(b.app)),
    users: userRows,
    outOfScopeUsers: [],
  };
}

function emptyGeminiWorkspaceUsage({ buckets, accountEmails = [], note, status }) {
  return buildGeminiWorkspaceUsageFromActivities([], {
    buckets,
    accountEmails,
    mode: "Google Workspace Reports API 연결 대기",
    note,
    status,
  });
}

function getWorkspaceUserAccumulator(users, email) {
  return (
    users.get(email) ?? {
      email,
      events: 0,
      activeDates: new Set(),
      lastUsed: "",
      apps: new Set(),
      actions: new Map(),
    }
  );
}

function buildGeminiWorkspaceUserRows(users) {
  return [...users.values()]
    .map((user) => {
      const activeDays = user.activeDates.size;
      const topAction = topMapKey(user.actions) || "-";
      const level = geminiWorkspaceUsageLevel(user.events, activeDays);
      return {
        email: user.email,
        events: user.events,
        activeDays,
        lastUsed: user.lastUsed || "-",
        apps: [...user.apps].sort(),
        topAction,
        level,
        score: geminiWorkspaceUsageScore({ events: user.events, activeDays, appCount: user.apps.size }),
      };
    })
    .sort((a, b) => b.score - a.score || b.events - a.events || a.email.localeCompare(b.email));
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

export function parseClaudeCosts(payload) {
  const dailyCosts = new Map();
  let totalCostUsd = 0;
  for (const bucket of bucketItems(payload)) {
    const date = dateFromBucket(bucket);
    let bucketCost = 0;
    for (const result of resultItems(bucket)) {
      bucketCost += centsAmountValue(result.amount ?? result.cost ?? result.total_cost ?? result);
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

function parseGammaWorkspaceItems(payload, fallbackType) {
  const items = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload?.items) ? payload.items : [];
  return items.map((item) => ({
    id: stringValue(item?.id, ""),
    name: stringValue(item?.name ?? item?.title, "이름 없음"),
    type: stringValue(item?.type, fallbackType),
  }));
}

function parseGammaGenerationStatus(payload, fallbackGenerationId) {
  const credits = payload?.credits ?? {};
  return {
    generationId: stringValue(payload?.generationId ?? payload?.id, fallbackGenerationId),
    status: stringValue(payload?.status, "unknown"),
    gammaUrl: stringValue(payload?.gammaUrl, ""),
    exportUrl: stringValue(payload?.exportUrl, ""),
    creditsDeducted: numberValue(credits.deducted),
    creditsRemaining:
      credits.remaining === null || typeof credits.remaining === "undefined" ? null : numberValue(credits.remaining),
    hasExport: Boolean(payload?.exportUrl),
    note: payload?.error?.message ? shortenError(payload.error.message) : "",
  };
}

async function readGammaCreditSnapshot(env) {
  const snapshotPaths = [
    env.GAMMA_CREDIT_SNAPSHOT_PATH ? path.resolve(rootDir, env.GAMMA_CREDIT_SNAPSHOT_PATH) : "",
    path.join(rootDir, "public", "gamma-credit-snapshot.local.json"),
    path.join(rootDir, "dist", "gamma-credit-snapshot.local.json"),
  ].filter(Boolean);

  for (const snapshotPath of [...new Set(snapshotPaths)]) {
    if (!existsSync(snapshotPath)) continue;
    try {
      const snapshot = JSON.parse(await readFile(snapshotPath, "utf8"));
      if (typeof snapshot?.currentCreditsRemaining === "number") return snapshot;
    } catch {
      // Ignore malformed local crawl snapshots and fall back to generation credits.
    }
  }

  return null;
}

async function readExistingApiUsageSnapshot(env) {
  for (const snapshotPath of getOutputPaths(env)) {
    if (!existsSync(snapshotPath)) continue;
    try {
      return JSON.parse(await readFile(snapshotPath, "utf8"));
    } catch {
      // Ignore malformed local snapshots and allow the new collection result to be written.
    }
  }

  return null;
}

function isApiUsageFetchFailure(snapshot) {
  if (!snapshot) return false;

  const providerFailures = Array.isArray(snapshot.providers)
    ? snapshot.providers.length > 0 && snapshot.providers.every((provider) => provider.status !== "정상")
    : true;
  const workspaceFailure = snapshot.workspaceUsage?.source?.status !== "정상";
  const gammaFailure = snapshot.gammaUsage?.source?.status !== "정상";

  return providerFailures && workspaceFailure && gammaFailure;
}

function hasLiveApiUsage(snapshot) {
  if (!snapshot) return false;

  const hasNormalProvider = Array.isArray(snapshot.providers)
    ? snapshot.providers.some((provider) => provider.status === "정상")
    : false;
  const hasNormalWorkspace = snapshot.workspaceUsage?.source?.status === "정상";
  const hasNormalGamma = snapshot.gammaUsage?.source?.status === "정상";

  return hasNormalProvider || hasNormalWorkspace || hasNormalGamma;
}

async function collectGeminiMonitoring(env) {
  try {
    const projectIds = resolveGeminiMonitoringProjectIds(env);
    if (projectIds.length === 0) {
      return { ok: false, error: "GOOGLE_MONITORING_PROJECT_IDS 또는 GOOGLE_CLOUD_PROJECT_ID가 없습니다." };
    }

    const accessToken = await getGoogleAccessToken(env);
    const usage = emptyUsage();
    for (const projectId of projectIds) {
      for (const metricType of geminiRequestMetricTypes) {
        await addGoogleMonitoringMetricUsage({ projectId, accessToken, metricType, usage, valueType: "requests" });
      }
      for (const metricType of geminiInputTokenMetricTypes) {
        await addGoogleMonitoringMetricUsage({ projectId, accessToken, metricType, usage, valueType: "inputTokens" });
      }
      for (const metricType of geminiOutputTokenMetricTypes) {
        await addGoogleMonitoringMetricUsage({ projectId, accessToken, metricType, usage, valueType: "outputTokens" });
      }
    }

    return { ok: true, projectIds, projectLabel: projectIds.length === 1 ? projectIds[0] : `${projectIds.length} projects`, usage };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

async function collectGeminiBillingCosts(env) {
  try {
    const billingProjectId = env.GOOGLE_BILLING_BQ_PROJECT_ID;
    const datasetId = env.GOOGLE_BILLING_BQ_DATASET;
    const tableId = env.GOOGLE_BILLING_BQ_TABLE;
    if (!billingProjectId || !datasetId || !tableId) {
      return { ok: false, error: "GOOGLE_BILLING_BQ_PROJECT_ID/DATASET/TABLE 중 비어 있는 값이 있습니다." };
    }

    const accessToken = await getGoogleAccessToken(env);
    const tableRef = `${bigQueryIdentifier(billingProjectId)}.${bigQueryIdentifier(datasetId)}.${bigQueryIdentifier(tableId)}`;
    const projectFilter = buildGeminiBillingProjectFilter(env);
    const query = `
      SELECT
        DATE(usage_start_time) AS usage_date,
        SUM(
          (cost + IFNULL((SELECT SUM(credit.amount) FROM UNNEST(credits) AS credit), 0)) /
          COALESCE(NULLIF(currency_conversion_rate, 0), 1)
        ) AS cost
      FROM \`${tableRef}\`
      WHERE usage_start_time >= @startingAt
        AND usage_start_time < @endingAt
        ${projectFilter.sql}
        AND (
          LOWER(service.description) LIKE '%gemini%'
          OR LOWER(service.description) LIKE '%generative language%'
          OR LOWER(sku.description) LIKE '%gemini%'
          OR LOWER(sku.description) LIKE '%generative language%'
          OR LOWER(sku.description) LIKE '%generative ai%'
        )
      GROUP BY usage_date
      ORDER BY usage_date`;
    const queryParameters = [
      {
        name: "startingAt",
        parameterType: { type: "TIMESTAMP" },
        parameterValue: { value: startingAt.toISOString() },
      },
      {
        name: "endingAt",
        parameterType: { type: "TIMESTAMP" },
        parameterValue: { value: endingAt.toISOString() },
      },
    ];
    queryParameters.push(...projectFilter.queryParameters);

    const queryResult = await getJson(`https://bigquery.googleapis.com/bigquery/v2/projects/${billingProjectId}/queries`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        query,
        useLegacySql: false,
        parameterMode: "NAMED",
        queryParameters,
      }),
    });
    if (!queryResult.ok) {
      return { ok: false, error: queryResult.error };
    }

    const dailyCosts = new Map();
    let totalCostUsd = 0;
    const fields = queryResult.data.schema?.fields ?? [];
    for (const row of queryResult.data.rows ?? []) {
      const values = Object.fromEntries(row.f.map((cell, index) => [fields[index]?.name, cell.v]));
      const date = stringValue(values.usage_date, "");
      const cost = roundMoney(numberValue(values.cost));
      if (!date) continue;
      dailyCosts.set(date, roundMoney((dailyCosts.get(date) ?? 0) + cost));
      totalCostUsd += cost;
    }

    return { ok: true, totalCostUsd: roundMoney(totalCostUsd), dailyCosts, projectFilterLabel: projectFilter.label };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export function resolveGeminiBillingUsageProjectIds(env) {
  const rawValue =
    env.GOOGLE_BILLING_USAGE_PROJECT_IDS ??
    env.GOOGLE_BILLING_BQ_USAGE_PROJECT_IDS ??
    env.GOOGLE_CLOUD_PROJECT_IDS ??
    env.GOOGLE_CLOUD_PROJECT_ID ??
    env.GOOGLE_CLOUD_PROJECT ??
    "";
  const trimmed = String(rawValue).trim();

  if (!trimmed) return [];
  if (trimmed === "*") return ["*"];

  return parseProjectIdList(trimmed);
}

export function resolveGeminiMonitoringProjectIds(env) {
  const explicitValue =
    env.GOOGLE_MONITORING_PROJECT_IDS ??
    env.GOOGLE_GEMINI_MONITORING_PROJECT_IDS ??
    env.GOOGLE_CLOUD_MONITORING_PROJECT_IDS;
  const explicitProjectIds = parseProjectIdList(explicitValue);
  if (explicitProjectIds.length > 0) return explicitProjectIds.filter((projectId) => projectId !== "*");

  const billingProjectIds = resolveGeminiBillingUsageProjectIds(env);
  if (billingProjectIds.length > 0 && !billingProjectIds.includes("*")) return billingProjectIds;

  return parseProjectIdList(env.GOOGLE_CLOUD_PROJECT_ID ?? env.GOOGLE_CLOUD_PROJECT);
}

export function buildGeminiBillingProjectFilter(env) {
  const projectIds = resolveGeminiBillingUsageProjectIds(env);

  if (projectIds.length === 0 || projectIds.includes("*")) {
    return {
      sql: "",
      queryParameters: [],
      label: "전체 사용 프로젝트",
    };
  }

  if (projectIds.length === 1) {
    return {
      sql: "AND project.id = @usageProjectId",
      queryParameters: [
        {
          name: "usageProjectId",
          parameterType: { type: "STRING" },
          parameterValue: { value: projectIds[0] },
        },
      ],
      label: `사용 프로젝트 ${projectIds[0]}`,
    };
  }

  return {
    sql: "AND project.id IN UNNEST(@usageProjectIds)",
    queryParameters: [
      {
        name: "usageProjectIds",
        parameterType: { type: "ARRAY", arrayType: { type: "STRING" } },
        parameterValue: {
          arrayValues: projectIds.map((projectId) => ({ value: projectId })),
        },
      },
    ],
    label: `사용 프로젝트 ${projectIds.length}개`,
  };
}

function parseProjectIdList(value) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return [];
  if (trimmed === "*") return ["*"];

  return [
    ...new Set(
      trimmed
        .split(/[,\s]+/)
        .map((item) => item.trim())
        .filter(isValidGoogleProjectId),
    ),
  ];
}

function isValidGoogleProjectId(value) {
  return /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(value);
}

export async function collectBillingCostBreakdown(
  env,
  { startingDate = "2026-05-02", endingDate = "2026-05-05", limit = 30 } = {},
) {
  const billingProjectId = env.GOOGLE_BILLING_BQ_PROJECT_ID;
  const datasetId = env.GOOGLE_BILLING_BQ_DATASET;
  const tableId = env.GOOGLE_BILLING_BQ_TABLE;
  if (!billingProjectId || !datasetId || !tableId) {
    throw new Error("GOOGLE_BILLING_BQ_PROJECT_ID/DATASET/TABLE 중 비어 있는 값이 있습니다.");
  }

  const accessToken = await getGoogleAccessToken(env);
  const tableRef = `${bigQueryIdentifier(billingProjectId)}.${bigQueryIdentifier(datasetId)}.${bigQueryIdentifier(tableId)}`;
  const projectFilter = buildGeminiBillingProjectFilter(env);
  const query = `
    SELECT
      DATE(usage_start_time) AS usage_date,
      project.id AS project_id,
      ANY_VALUE(currency) AS currency,
      service.description AS service,
      sku.description AS sku,
      SUM(cost + IFNULL((SELECT SUM(credit.amount) FROM UNNEST(credits) AS credit), 0)) AS billing_currency_cost,
      SUM(
        (cost + IFNULL((SELECT SUM(credit.amount) FROM UNNEST(credits) AS credit), 0)) /
        COALESCE(NULLIF(currency_conversion_rate, 0), 1)
      ) AS cost_usd
    FROM \`${tableRef}\`
    WHERE usage_start_time >= @startingAt
      AND usage_start_time < @endingAt
      ${projectFilter.sql}
    GROUP BY usage_date, project_id, service, sku
    HAVING ABS(billing_currency_cost) > 0
    ORDER BY billing_currency_cost DESC
    LIMIT @limit`;
  const queryParameters = [
    {
      name: "startingAt",
      parameterType: { type: "TIMESTAMP" },
      parameterValue: { value: `${startingDate}T00:00:00.000Z` },
    },
    {
      name: "endingAt",
      parameterType: { type: "TIMESTAMP" },
      parameterValue: { value: `${endingDate}T00:00:00.000Z` },
    },
    {
      name: "limit",
      parameterType: { type: "INT64" },
      parameterValue: { value: String(limit) },
    },
    ...projectFilter.queryParameters,
  ];

  const queryResult = await getJson(`https://bigquery.googleapis.com/bigquery/v2/projects/${billingProjectId}/queries`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query,
      useLegacySql: false,
      parameterMode: "NAMED",
      queryParameters,
    }),
  });
  if (!queryResult.ok) {
    throw new Error(queryResult.error);
  }

  const fields = queryResult.data.schema?.fields ?? [];
  return (queryResult.data.rows ?? []).map((row) => {
    const values = Object.fromEntries(row.f.map((cell, index) => [fields[index]?.name, cell.v]));
    return {
      date: stringValue(values.usage_date, ""),
      projectId: stringValue(values.project_id, ""),
      currency: stringValue(values.currency, ""),
      service: stringValue(values.service, ""),
      sku: stringValue(values.sku, ""),
      billingCurrencyCost: roundMoney(numberValue(values.billing_currency_cost)),
      costUsd: roundMoney(numberValue(values.cost_usd)),
    };
  });
}

async function addGoogleMonitoringMetricUsage({ projectId, accessToken, metricType, usage, valueType }) {
  const series = await listGoogleMonitoringTimeSeries(projectId, accessToken, metricType);
  for (const timeSeries of series) {
    const model = stringValue(timeSeries.metric?.labels?.model, "Gemini total").replace(/^models\//, "");
    for (const point of timeSeries.points ?? []) {
      const date = dateFromTimeSeriesPoint(point);
      const value = pointValue(point);
      if (valueType === "requests") {
        addUsage(usage, date, model, value, 0, 0);
      } else if (valueType === "inputTokens") {
        addUsage(usage, date, model, 0, value, 0);
      } else {
        addUsage(usage, date, model, 0, 0, value);
      }
    }
  }
}

async function listGoogleMonitoringTimeSeries(projectId, accessToken, metricType) {
  const allSeries = [];
  let pageToken = "";

  do {
    const url = new URL(`https://monitoring.googleapis.com/v3/projects/${projectId}/timeSeries`);
    url.searchParams.set("filter", `metric.type = "${metricType}"`);
    url.searchParams.set("interval.startTime", startingAt.toISOString());
    url.searchParams.set("interval.endTime", endingAt.toISOString());
    url.searchParams.set("aggregation.alignmentPeriod", "86400s");
    url.searchParams.set("aggregation.perSeriesAligner", "ALIGN_SUM");
    url.searchParams.set("aggregation.crossSeriesReducer", "REDUCE_SUM");
    url.searchParams.append("aggregation.groupByFields", "metric.label.model");
    url.searchParams.set("view", "FULL");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const result = await getJson(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!result.ok) {
      if (isIgnorableMonitoringMetricError(result.error)) return [];
      throw new Error(`Cloud Monitoring 조회 실패 (${metricType}): ${result.error}`);
    }

    allSeries.push(...(result.data.timeSeries ?? []));
    pageToken = result.data.nextPageToken ?? "";
  } while (pageToken);

  return allSeries;
}

async function getGoogleAccessToken(env, { scopes = ["https://www.googleapis.com/auth/cloud-platform"], subject = "" } = {}) {
  const serviceAccount = await readGoogleServiceAccount(env);
  const tokenUri = serviceAccount.token_uri ?? "https://oauth2.googleapis.com/token";
  const nowSeconds = Math.floor(Date.now() / 1000);
  const claims = {
    iss: serviceAccount.client_email,
    scope: scopes.join(" "),
    aud: tokenUri,
    iat: nowSeconds,
    exp: nowSeconds + 3600,
  };
  if (subject) claims.sub = subject;
  const assertionBody = [
    base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" })),
    base64Url(JSON.stringify(claims)),
  ].join(".");
  const signature = createSign("RSA-SHA256").update(assertionBody).sign(serviceAccount.private_key, "base64url");
  const tokenResult = await getJson(tokenUri, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${assertionBody}.${signature}`,
    }),
  });

  if (!tokenResult.ok) {
    throw new Error(`Google 서비스 계정 토큰 발급 실패: ${tokenResult.error}`);
  }

  return tokenResult.data.access_token;
}

async function readGoogleServiceAccount(env) {
  const rawJson = env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (rawJson) {
    return parseServiceAccountJson(rawJson, "GOOGLE_SERVICE_ACCOUNT_JSON");
  }

  const base64Json = env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64;
  if (base64Json) {
    try {
      return parseServiceAccountJson(Buffer.from(base64Json, "base64").toString("utf8"), "GOOGLE_SERVICE_ACCOUNT_JSON_BASE64");
    } catch (error) {
      try {
        return parseServiceAccountJson(base64Json, "GOOGLE_SERVICE_ACCOUNT_JSON_BASE64");
      } catch {
        throw new Error(
          "GOOGLE_SERVICE_ACCOUNT_JSON_BASE64가 서비스 계정 JSON으로 해석되지 않습니다. service-account.json 전체를 base64로 변환해 넣어주세요.",
        );
      }
    }
  }

  if (env.GOOGLE_APPLICATION_CREDENTIALS) {
    const credentialsPath = path.resolve(rootDir, env.GOOGLE_APPLICATION_CREDENTIALS);
    if (!existsSync(credentialsPath)) {
      throw new Error(`GOOGLE_APPLICATION_CREDENTIALS 파일을 찾을 수 없습니다: ${credentialsPath}`);
    }
    return parseServiceAccountJson(await readFile(credentialsPath, "utf8"), "GOOGLE_APPLICATION_CREDENTIALS");
  }

  throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 또는 GOOGLE_APPLICATION_CREDENTIALS가 없습니다.");
}

function parseServiceAccountJson(text, sourceName) {
  const serviceAccount = JSON.parse(text);
  if (!serviceAccount.client_email || !serviceAccount.private_key) {
    throw new Error(`${sourceName}에 client_email/private_key가 없습니다.`);
  }
  return serviceAccount;
}

function base64Url(value) {
  return Buffer.from(value).toString("base64url");
}

function bigQueryIdentifier(value) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) {
    throw new Error(`BigQuery 식별자 형식이 올바르지 않습니다: ${value}`);
  }
  return value.replace(/`/g, "");
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

function keyHealthRows(result) {
  return Array.isArray(result.keyHealth) ? result.keyHealth : [result.keyHealth];
}

function combineModelRows(models) {
  const combined = new Map();
  for (const model of models) {
    const key = `${model.provider}:${model.model}`;
    const current = combined.get(key) ?? {
      provider: model.provider,
      model: model.model,
      requests: 0,
      inputTokens: 0,
      outputTokens: 0,
      costUsd: 0,
      avgLatencyMs: 0,
      errorRate: 0,
    };
    current.requests += model.requests;
    current.inputTokens += model.inputTokens;
    current.outputTokens += model.outputTokens;
    current.costUsd = roundMoney(current.costUsd + model.costUsd);
    combined.set(key, current);
  }

  return [...combined.values()].sort((a, b) => b.costUsd - a.costUsd || b.requests - a.requests);
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

function dateFromTimeSeriesPoint(point) {
  const raw = point?.interval?.startTime ?? point?.interval?.endTime;
  if (!raw) return toDateKey(startingAt);
  const date = new Date(raw);
  if (point?.interval?.endTime && !point?.interval?.startTime) {
    date.setMilliseconds(date.getMilliseconds() - 1);
  }
  return toDateKey(date);
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

function centsAmountValue(value) {
  return amountValue(value) / 100;
}

function eventParametersToObject(parameters = []) {
  const result = {};
  for (const parameter of parameters) {
    const name = stringValue(parameter.name, "");
    if (!name) continue;
    const normalizedName = name.replace(/\s+/g, "");
    const value =
      parameter.value ??
      parameter.intValue ??
      parameter.boolValue ??
      parameter.multiValue?.join(",") ??
      parameter.multiIntValue?.join(",") ??
      "";
    result[name] = value;
    result[normalizedName] = value;
  }
  return result;
}

function inferWorkspaceApp(parameters, action) {
  const explicitApp =
    parameters.app_name ??
    parameters.application_name ??
    parameters.workspace_app ??
    parameters.product_name ??
    parameters.app ??
    parameters.surface;
  if (explicitApp) return formatWorkspaceAppName(String(explicitApp));

  const normalizedAction = String(action).toLowerCase();
  if (/gmail|mail|reply|draft|email/.test(normalizedAction)) return "Gmail";
  if (/docs|document|proofread|write|summarize/.test(normalizedAction)) return "Docs";
  if (/sheet|smart_fill|organize/.test(normalizedAction)) return "Sheets";
  if (/slide|bulletize|image/.test(normalizedAction)) return "Slides";
  if (/meet|meeting|note/.test(normalizedAction)) return "Meet";
  if (/chat/.test(normalizedAction)) return "Chat";
  if (/classroom|rubric|lesson|student/.test(normalizedAction)) return "Classroom";
  if (/calendar/.test(normalizedAction)) return "Calendar";
  return "Workspace";
}

function formatWorkspaceAppName(value) {
  const normalized = value.replace(/^google[_\s-]*/i, "").replace(/[_-]+/g, " ").trim();
  if (!normalized) return "Workspace";
  return normalized
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function geminiWorkspaceUsageLevel(events, activeDays) {
  if (events <= 0) return "Zero";
  if (events >= 20 && activeDays >= 4) return "High";
  if (events >= 5 || activeDays >= 3) return "Medium";
  return "Low";
}

function geminiWorkspaceUsageScore({ events, activeDays, appCount }) {
  return Math.min(100, Math.round(events * 2 + activeDays * 6 + appCount * 8));
}

function topMapKey(map) {
  return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] ?? "";
}

function parseEmailList(value) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return [];
  return [
    ...new Set(
      trimmed
        .split(/[,\s]+/)
        .map((email) => email.trim().toLowerCase())
        .filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)),
    ),
  ];
}

function numberValue(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function pointValue(point) {
  const value = point?.value ?? {};
  return numberValue(value.int64Value ?? value.doubleValue ?? value.stringValue);
}

function stringValue(value, fallback) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

function roundRate(value) {
  return Math.round(value * 10) / 10;
}

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function parseDays(arg) {
  const rawValue = typeof arg === "string" ? (arg.includes("=") ? arg.split("=").at(-1) : arg) : arg;
  const value = Number(rawValue);
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

function splitEnvList(value) {
  return String(value ?? "")
    .split(/[,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitLabelList(value) {
  return String(value ?? "")
    .split(/[,\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function shortenError(error) {
  return String(error ?? "알 수 없는 오류").replace(/\s+/g, " ").slice(0, 120);
}

function isIgnorableMonitoringMetricError(error) {
  return /metric|descriptor|not found|unknown|invalid/i.test(String(error ?? ""));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  await runCli();
}
