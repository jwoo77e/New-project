import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createSign } from "node:crypto";
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

const [openai, gemini, claude] = await Promise.all([
  collectOpenAI(env.OPENAI_ADMIN_KEY),
  collectGemini(env.GEMINI_API_KEY, env),
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
    ? "BigQuery Billing 비용 수집 완료"
    : `BigQuery Billing 미수집: ${shortenError(billingCosts.error)}`;
  const note = hasUsage
    ? `Cloud Monitoring 사용량 수집 완료. ${billingNote}`
    : `Cloud Monitoring 조회 완료, 최근 사용량 없음. ${billingNote}`;

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
      scope: `generative language, monitoring (${monitoring.projectId})`,
      requests: usage.totalRequests,
      status: "정상",
      note: billingCosts.ok
        ? "Cloud Monitoring 및 BigQuery Billing 인증 성공"
        : `Cloud Monitoring 인증 성공. ${shortenError(billingCosts.error)}`,
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

async function collectGeminiMonitoring(env) {
  try {
    const projectId = env.GOOGLE_CLOUD_PROJECT_ID ?? env.GOOGLE_CLOUD_PROJECT;
    if (!projectId) {
      return { ok: false, error: "GOOGLE_CLOUD_PROJECT_ID가 없습니다." };
    }

    const accessToken = await getGoogleAccessToken(env);
    const usage = emptyUsage();
    for (const metricType of geminiRequestMetricTypes) {
      await addGoogleMonitoringMetricUsage({ projectId, accessToken, metricType, usage, valueType: "requests" });
    }
    for (const metricType of geminiInputTokenMetricTypes) {
      await addGoogleMonitoringMetricUsage({ projectId, accessToken, metricType, usage, valueType: "inputTokens" });
    }
    for (const metricType of geminiOutputTokenMetricTypes) {
      await addGoogleMonitoringMetricUsage({ projectId, accessToken, metricType, usage, valueType: "outputTokens" });
    }

    return { ok: true, projectId, usage };
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
    const projectFilter = env.GOOGLE_CLOUD_PROJECT_ID ? "AND project.id = @projectId" : "";
    const query = `
      SELECT
        DATE(usage_start_time) AS usage_date,
        SUM(cost + IFNULL((SELECT SUM(credit.amount) FROM UNNEST(credits) AS credit), 0)) AS cost
      FROM \`${tableRef}\`
      WHERE usage_start_time >= @startingAt
        AND usage_start_time < @endingAt
        ${projectFilter}
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
    if (env.GOOGLE_CLOUD_PROJECT_ID) {
      queryParameters.push({
        name: "projectId",
        parameterType: { type: "STRING" },
        parameterValue: { value: env.GOOGLE_CLOUD_PROJECT_ID },
      });
    }

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

    return { ok: true, totalCostUsd: roundMoney(totalCostUsd), dailyCosts };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
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

async function getGoogleAccessToken(env) {
  const serviceAccount = await readGoogleServiceAccount(env);
  const tokenUri = serviceAccount.token_uri ?? "https://oauth2.googleapis.com/token";
  const nowSeconds = Math.floor(Date.now() / 1000);
  const assertionBody = [
    base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" })),
    base64Url(
      JSON.stringify({
        iss: serviceAccount.client_email,
        scope: "https://www.googleapis.com/auth/cloud-platform",
        aud: tokenUri,
        iat: nowSeconds,
        exp: nowSeconds + 3600,
      }),
    ),
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

function isIgnorableMonitoringMetricError(error) {
  return /metric|descriptor|not found|unknown|invalid/i.test(String(error ?? ""));
}
