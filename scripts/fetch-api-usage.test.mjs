import { describe, expect, it, vi } from "vitest";
import {
  buildGeminiWorkspaceUsageFromActivities,
  collectApiUsage,
  buildGammaUsageFromGenerationStatuses,
  buildBigQueryBillingTableRef,
  buildGeminiBillingProjectFilter,
  getPaginatedJson,
  googleMonitoringHeaders,
  parseGammaGenerationIds,
  parseClaudeCosts,
  resolveAnthropicAdminKeys,
  resolveGeminiApiKeys,
  resolveGeminiMonitoringProjectIds,
  resolveGeminiBillingUsageProjectIds,
  resolveOpenAIAdminKeys,
} from "./fetch-api-usage.mjs";

describe("API usage history window", () => {
  it("retains 62 daily buckets so even the end of October includes all of September", async () => {
    const snapshot = await collectApiUsage({ env: {}, requestedDays: 62, collectedAt: new Date("2026-10-31T03:00:00Z") });
    expect(snapshot.dailyUsage).toHaveLength(62);
    expect(snapshot.dailyUsage[0].date).toBe("2026-08-31");
    expect(snapshot.dailyUsage.at(-1).date).toBe("2026-10-31");
    expect(snapshot.dailyUsage.filter(day => day.date.startsWith("2026-09"))).toHaveLength(30);
    expect(snapshot.source.period).toBe("최근 62일");
  });
});

describe("provider API pagination", () => {
  it("explicitly attributes Monitoring requests to the selected consumer project", () => {
    expect(googleMonitoringHeaders("test-token", "zeroby-two")).toEqual({
      Authorization: "Bearer test-token",
      "x-goog-user-project": "zeroby-two",
    });
  });
  it("collects every OpenAI and Claude page using the next_page cursor", async () => {
    const requestedPages = [];
    const fetchImpl = async (url) => {
      const page = url.searchParams.get("page");
      requestedPages.push(page);
      const payload = page
        ? { data: [{ starting_at: "2026-09-02T00:00:00Z" }], has_more: false, next_page: null }
        : { data: [{ starting_at: "2026-09-01T00:00:00Z" }], has_more: true, next_page: "page-2" };
      return new Response(JSON.stringify(payload), { status: 200 });
    };

    const result = await getPaginatedJson(
      new URL("https://example.com/usage?bucket_width=1d"),
      {},
      { fetchImpl },
    );

    expect(result.ok).toBe(true);
    expect(requestedPages).toEqual([null, "page-2"]);
    expect(result.data.data).toHaveLength(2);
    expect(result.data.has_more).toBe(false);
  });

  it("rejects an incomplete paginated response instead of publishing partial data", async () => {
    const fetchImpl = async () =>
      new Response(JSON.stringify({ data: [{ value: 1 }], has_more: true, next_page: null }), { status: 200 });

    const result = await getPaginatedJson(new URL("https://example.com/usage"), {}, { fetchImpl });

    expect(result.ok).toBe(false);
    expect(result.error).toContain("next_page");
  });
});

describe("Gemini billing project filters", () => {
  it("supports a trailing wildcard for billing-account export tables", () => {
    expect(
      buildBigQueryBillingTableRef("zeroby-two", "initialdataset", "gcp_billing_export_v1_*"),
    ).toBe("zeroby-two.initialdataset.gcp_billing_export_v1_*");
  });

  it("rejects unsafe or unbounded billing table wildcards", () => {
    expect(() => buildBigQueryBillingTableRef("zeroby-two", "initialdataset", "*")).toThrow();
    expect(() =>
      buildBigQueryBillingTableRef("zeroby-two", "initialdataset", "gcp_billing_*_export"),
    ).toThrow();
    expect(() =>
      buildBigQueryBillingTableRef("zeroby-two", "initialdataset", "billing`; DROP TABLE x; --"),
    ).toThrow();
  });

  it("keeps the existing single GOOGLE_CLOUD_PROJECT_ID behavior by default", () => {
    const filter = buildGeminiBillingProjectFilter({
      GOOGLE_CLOUD_PROJECT_ID: "zeroby-two",
    });

    expect(resolveGeminiBillingUsageProjectIds({ GOOGLE_CLOUD_PROJECT_ID: "zeroby-two" })).toEqual(["zeroby-two"]);
    expect(filter.sql).toBe("AND project.id = @usageProjectId");
    expect(filter.queryParameters).toEqual([
      {
        name: "usageProjectId",
        parameterType: { type: "STRING" },
        parameterValue: { value: "zeroby-two" },
      },
    ]);
  });

  it("supports multiple Gemini billing usage project ids", () => {
    const filter = buildGeminiBillingProjectFilter({
      GOOGLE_CLOUD_PROJECT_ID: "zeroby-two",
      GOOGLE_BILLING_USAGE_PROJECT_IDS: "zeroby-two, other-gemini-project other-gemini-project",
    });

    expect(resolveGeminiBillingUsageProjectIds({
      GOOGLE_CLOUD_PROJECT_ID: "zeroby-two",
      GOOGLE_BILLING_USAGE_PROJECT_IDS: "zeroby-two, other-gemini-project other-gemini-project",
    })).toEqual(["zeroby-two", "other-gemini-project"]);
    expect(filter.sql).toBe("AND project.id IN UNNEST(@usageProjectIds)");
    expect(filter.queryParameters[0]).toEqual({
      name: "usageProjectIds",
      parameterType: { type: "ARRAY", arrayType: { type: "STRING" } },
      parameterValue: {
        arrayValues: [{ value: "zeroby-two" }, { value: "other-gemini-project" }],
      },
    });
  });

  it("can intentionally include all projects in the billing export", () => {
    const filter = buildGeminiBillingProjectFilter({
      GOOGLE_BILLING_USAGE_PROJECT_IDS: "*",
      GOOGLE_CLOUD_PROJECT_ID: "zeroby-two",
    });

    expect(filter.sql).toBe("");
    expect(filter.queryParameters).toEqual([]);
    expect(filter.label).toBe("전체 사용 프로젝트");
  });

  it("uses billing project ids for Gemini Cloud Monitoring when no monitoring-specific list is set", () => {
    expect(resolveGeminiMonitoringProjectIds({
      GOOGLE_CLOUD_PROJECT_ID: "zeroby-two",
      GOOGLE_BILLING_USAGE_PROJECT_IDS: "zeroby-two,riskzero-cloud",
    })).toEqual(["zeroby-two", "riskzero-cloud"]);
  });

  it("lets Gemini Cloud Monitoring use an explicit project list", () => {
    expect(resolveGeminiMonitoringProjectIds({
      GOOGLE_CLOUD_PROJECT_ID: "zeroby-two",
      GOOGLE_BILLING_USAGE_PROJECT_IDS: "zeroby-two,riskzero-cloud",
      GOOGLE_MONITORING_PROJECT_IDS: "riskzero-cloud,analytics-project",
    })).toEqual(["riskzero-cloud", "analytics-project"]);
  });

  it("ignores display names that are not valid Google Cloud project ids", () => {
    expect(resolveGeminiBillingUsageProjectIds({
      GOOGLE_BILLING_USAGE_PROJECT_IDS: "zeroby-two,RiskZero Cloud,riskzero-cloud",
    })).toEqual(["zeroby-two", "riskzero-cloud"]);
    expect(resolveGeminiMonitoringProjectIds({
      GOOGLE_BILLING_USAGE_PROJECT_IDS: "zeroby-two,RiskZero Cloud,riskzero-cloud",
    })).toEqual(["zeroby-two", "riskzero-cloud"]);
  });
});

describe("Claude cost parsing", () => {
  it("resolves and deduplicates multiple OpenAI and Gemini keys", () => {
    expect(
      resolveOpenAIAdminKeys({
        OPENAI_ADMIN_KEY: "openai-a",
        OPENAI_ADMIN_KEY_LABEL: "본사",
        OPENAI_ADMIN_KEY_2: "openai-b",
        OPENAI_ADMIN_KEY_2_LABEL: "연구소",
        OPENAI_ADMIN_KEYS: "openai-a,openai-c",
        OPENAI_ADMIN_KEY_LABELS: "중복,플랫폼",
      }),
    ).toEqual([
      { key: "openai-a", label: "본사", sourceEnvName: "OPENAI_ADMIN_KEY" },
      { key: "openai-b", label: "연구소 GH", sourceEnvName: "OPENAI_ADMIN_KEY_2" },
      { key: "openai-c", label: "플랫폼 GH", sourceEnvName: "OPENAI_ADMIN_KEYS" },
    ]);

    expect(
      resolveGeminiApiKeys({
        GEMINI_API_KEY: "gemini-a",
        GEMINI_API_KEY_2: "gemini-b",
        GEMINI_API_KEY_2_LABEL: "두번째 프로젝트",
      }),
    ).toEqual([
      { key: "gemini-a", label: "Gemini API 1", sourceEnvName: "GEMINI_API_KEY" },
      { key: "gemini-b", label: "두번째 프로젝트 GH", sourceEnvName: "GEMINI_API_KEY_2" },
    ]);
  });

  it("marks the newly added third Claude account with GH without changing the existing two", () => {
    expect(
      resolveAnthropicAdminKeys({
        ANTHROPIC_ADMIN_API_KEY: "claude-a",
        ANTHROPIC_ADMIN_API_KEY_LABEL: "infra",
        ANTHROPIC_ADMIN_API_KEY_2: "claude-b",
        ANTHROPIC_ADMIN_API_KEY_2_LABEL: "bigone",
        ANTHROPIC_ADMIN_API_KEY_3: "claude-c",
        ANTHROPIC_ADMIN_API_KEY_3_LABEL: "신규 조직",
      }).map(({ label }) => label),
    ).toEqual(["infra", "bigone", "신규 조직 GH"]);
  });

  it("resolves multiple Anthropic admin keys with dashboard labels", () => {
    const keys = resolveAnthropicAdminKeys({
      ANTHROPIC_ADMIN_API_KEY: "admin-key-a",
      ANTHROPIC_ADMIN_API_KEY_LABEL: "리스크제로",
      ANTHROPIC_ADMIN_API_KEY_2: "admin-key-b",
      ANTHROPIC_ADMIN_API_KEY_2_LABEL: "스마트서비스",
    });

    expect(keys).toEqual([
      {
        key: "admin-key-a",
        label: "리스크제로",
        sourceEnvName: "ANTHROPIC_ADMIN_API_KEY",
      },
      {
        key: "admin-key-b",
        label: "스마트서비스",
        sourceEnvName: "ANTHROPIC_ADMIN_API_KEY_2",
      },
    ]);
  });

  it("deduplicates Anthropic admin keys from numbered and bulk env values", () => {
    const keys = resolveAnthropicAdminKeys({
      ANTHROPIC_ADMIN_API_KEY_1: "admin-key-a",
      ANTHROPIC_ADMIN_API_KEY_1_LABEL: "첫번째",
      ANTHROPIC_ADMIN_API_KEYS: "admin-key-a,admin-key-b",
      ANTHROPIC_ADMIN_API_KEY_LABELS: "중복,두번째",
    });

    expect(keys.map((key) => `${key.sourceEnvName}:${key.label}:${key.key}`)).toEqual([
      "ANTHROPIC_ADMIN_API_KEY_1:첫번째:admin-key-a",
      "ANTHROPIC_ADMIN_API_KEYS:두번째:admin-key-b",
    ]);
  });

  it("converts Anthropic Admin Cost API cent amounts into USD", () => {
    const costs = parseClaudeCosts({
      data: [
        {
          starting_at: "2026-05-14T00:00:00Z",
          ending_at: "2026-05-15T00:00:00Z",
          results: [{ currency: "USD", amount: "92.607" }],
        },
      ],
    });

    expect(costs.totalCostUsd).toBe(0.93);
    expect(costs.dailyCosts.get("2026-05-14")).toBe(0.93);
  });

  it("sums multiple Claude cent-denominated cost rows in the same bucket", () => {
    const costs = parseClaudeCosts({
      data: [
        {
          starting_at: "2026-05-14T00:00:00Z",
          results: [{ amount: "80.25" }, { amount: "12.357" }],
        },
      ],
    });

    expect(costs.totalCostUsd).toBe(0.93);
    expect(costs.dailyCosts.get("2026-05-14")).toBe(0.93);
  });
});

describe("Gemini Workspace usage aggregation", () => {
  const buckets = [
    { date: "2026-05-01", label: "5/1" },
    { date: "2026-05-02", label: "5/2" },
    { date: "2026-05-03", label: "5/3" },
  ];

  it("aggregates user-level Gemini Workspace utilization events", () => {
    const usage = buildGeminiWorkspaceUsageFromActivities(
      [
        workspaceActivity("2026-05-01T01:00:00.000Z", "alpha@example.com", "summarize"),
        workspaceActivity("2026-05-02T01:00:00.000Z", "alpha@example.com", "suggest_full_replies"),
        workspaceActivity("2026-05-02T02:00:00.000Z", "beta@example.com", "bulletize"),
      ],
      {
        buckets,
        accountEmails: ["alpha@example.com", "beta@example.com", "zero@example.com"],
        licensedUsers: 4,
      },
    );

    expect(usage.activeUsers).toBe(2);
    expect(usage.listedUsers).toBe(3);
    expect(usage.licensedUsers).toBe(4);
    expect(usage.zeroUsers).toBe(1);
    expect(usage.totalEvents).toBe(3);
    expect(usage.activationRate).toBe(50);
    expect(usage.source.note).toContain("계정 목록 3/4명으로 불완전하여 도메인 전체 활동 반영");
    expect(usage.dailyUsage.find((day) => day.date === "2026-05-02")).toMatchObject({
      events: 2,
      activeUsers: 2,
    });
    expect(usage.users.find((user) => user.email === "zero@example.com")).toMatchObject({
      level: "Zero",
      events: 0,
    });
  });

  it("does not count inactive Gemini Workspace events as active utilization", () => {
    const usage = buildGeminiWorkspaceUsageFromActivities(
      [
        workspaceActivity("2026-05-01T01:00:00.000Z", "alpha@example.com", "generate_starter_tile_prompts", {
          event_category: "inactive",
        }),
        workspaceActivity("2026-05-01T02:00:00.000Z", "beta@example.com", "summarize", {
          app_name: "docs",
          event_category: "active_summarize",
        }),
      ],
      {
        buckets,
        accountEmails: ["alpha@example.com", "beta@example.com"],
      },
    );

    expect(usage.activeUsers).toBe(1);
    expect(usage.listedUsers).toBe(2);
    expect(usage.totalEvents).toBe(1);
    expect(usage.zeroUsers).toBe(1);
    expect(usage.appUsage).toEqual([{ app: "Docs", events: 1, activeUsers: 1 }]);
    expect(usage.users.find((user) => user.email === "alpha@example.com")).toMatchObject({
      level: "Zero",
      events: 0,
    });
  });

  it("excludes report actors that are not in the managed account roster", () => {
    const usage = buildGeminiWorkspaceUsageFromActivities(
      [
        workspaceActivity("2026-05-01T01:00:00.000Z", "alpha@example.com", "summarize"),
        workspaceActivity("2026-05-02T02:00:00.000Z", "deleted@example.com", "summarize"),
      ],
      {
        buckets,
        accountEmails: ["alpha@example.com", "zero@example.com"],
      },
    );

    expect(usage.listedUsers).toBe(2);
    expect(usage.activeUsers).toBe(1);
    expect(usage.zeroUsers).toBe(1);
    expect(usage.totalEvents).toBe(1);
    expect(usage.users.map((user) => user.email)).toEqual(["alpha@example.com", "zero@example.com"]);
    expect(usage.outOfScopeUsers).toEqual([]);
  });

  it("uses domain-wide activity when the configured roster is incomplete", () => {
    const usage = buildGeminiWorkspaceUsageFromActivities(
      [
        workspaceActivity("2026-05-01T01:00:00.000Z", "alpha@example.com", "summarize"),
        workspaceActivity("2026-05-02T02:00:00.000Z", "beta@example.com", "conversation"),
      ],
      {
        buckets,
        accountEmails: ["alpha@example.com"],
        licensedUsers: 7,
      },
    );

    expect(usage.listedUsers).toBe(2);
    expect(usage.activeUsers).toBe(2);
    expect(usage.totalEvents).toBe(2);
    expect(usage.activationRate).toBe(28.6);
    expect(usage.users.map((user) => user.email)).toEqual(["alpha@example.com", "beta@example.com"]);
    expect(usage.source.note).toContain("계정 목록 1/7명으로 불완전하여 도메인 전체 활동 반영");
  });
});

describe("Gamma API usage summary", () => {
  it("summarizes visible Gamma API fields from tracked generation statuses", () => {
    const usage = buildGammaUsageFromGenerationStatuses(
      [
        {
          generationId: "gen_1",
          status: "completed",
          gammaUrl: "https://gamma.app/docs/one",
          exportUrl: "https://gamma.app/export/one.pdf",
          creditsDeducted: 15,
          creditsRemaining: 485,
          hasExport: true,
          note: "",
        },
        {
          generationId: "gen_2",
          status: "failed",
          gammaUrl: "",
          exportUrl: "",
          creditsDeducted: 0,
          creditsRemaining: null,
          hasExport: false,
          note: "failed",
        },
      ],
      {
        themes: [{ id: "theme_1", name: "Corporate", type: "standard" }],
        folders: [{ id: "folder_1", name: "Sales", type: "folder" }],
        webCreditSnapshot: null,
      },
    );

    expect(usage.workspaceAccess).toBe(true);
    expect(usage.themeCount).toBe(1);
    expect(usage.folderCount).toBe(1);
    expect(usage.trackedGenerations).toBe(2);
    expect(usage.completedGenerations).toBe(1);
    expect(usage.failedGenerations).toBe(1);
    expect(usage.exportedGenerations).toBe(1);
    expect(usage.totalCreditsDeducted).toBe(15);
    expect(usage.latestCreditsRemaining).toBe(485);
    expect(usage.creditSource).toBe("generation");
  });

  it("parses comma and whitespace separated Gamma generation ids", () => {
    expect(parseGammaGenerationIds("gen_a, gen_b\ngen_a gen_c")).toEqual(["gen_a", "gen_b", "gen_c"]);
  });

  it("prefers web-crawled Gamma remaining credits when available", () => {
    const usage = buildGammaUsageFromGenerationStatuses(
      [
        {
          generationId: "gen_1",
          status: "completed",
          gammaUrl: "",
          exportUrl: "",
          creditsDeducted: 15,
          creditsRemaining: 485,
          hasExport: false,
          note: "",
        },
      ],
      {
        webCreditSnapshot: {
          currentCreditsRemaining: 1234,
        },
      },
    );

    expect(usage.latestCreditsRemaining).toBe(1234);
    expect(usage.creditSource).toBe("web-crawl");
  });
});

function workspaceActivity(time, email, action, extraParameters = {}) {
  return {
    id: { time },
    actor: { email },
    events: [
      {
        type: "ai_usage_event",
        name: "feature_utilization",
        parameters: [
          { name: "action", value: action },
          ...Object.entries(extraParameters).map(([name, value]) => ({ name, value })),
        ],
      },
    ],
  };
}


describe("daily key and model collection", () => {
  it("retains daily/model/key dimensions through pagination and estimates costs within each day", async () => {
    const urls = [];
    vi.stubGlobal("fetch", async (url) => {
      urls.push(new URL(url));
      const isClaude = url.hostname === "api.anthropic.com";
      const isCost = url.pathname.includes("cost");
      const page2 = url.searchParams.has("page");
      const day = page2 ? "2026-10-01" : "2026-09-30";
      const usage = isClaude
        ? [{ model: "claude-test", api_key_id: "provider-key-a", uncached_input_tokens: 10,
          cache_read_input_tokens: 20, cache_creation: { ephemeral_5m_input_tokens: 30 }, output_tokens: 40 }]
        : [{ model: "gpt-test", api_key_id: "provider-key-a", num_model_requests: 2, input_tokens: 60, output_tokens: 40 },
          { model: "gpt-test", api_key_id: "provider-key-b", num_model_requests: 3, input_tokens: 180, output_tokens: 120 },
          { model: "gpt-other", api_key_id: null, num_model_requests: 1, input_tokens: 60, output_tokens: 40 }];
      const amount = (page2 ? 20 : 10) * (isClaude ? 100 : 1);
      return new Response(JSON.stringify({ data: [{ starting_at: `${day}T00:00:00Z`,
        results: isCost ? [{ amount: isClaude ? String(amount) : { value: amount } }] : usage }],
        has_more: !page2, next_page: page2 ? null : "second" }), { status: 200 });
    });
    try {
      const snapshot = await collectApiUsage({
        env: { OPENAI_ADMIN_KEY: "secret-openai", ANTHROPIC_ADMIN_API_KEY: "secret-claude" },
        collectedAt: new Date("2026-10-21T03:00:00Z"),
      });
      expect(urls.filter(url => url.pathname.includes("usage")).every(url =>
        url.searchParams.getAll("group_by[]").join(",") === "model,api_key_id")).toBe(true);
      expect(snapshot.usageDetails).toHaveLength(8);
      const openai = snapshot.usageDetails.filter(row => row.provider === "OpenAI");
      expect(openai.filter(row => row.date === "2026-09-30").map(row => row.costUsd)).toEqual([2, 6, 2]);
      expect(openai.filter(row => row.date === "2026-10-01").map(row => row.costUsd)).toEqual([4, 12, 4]);
      expect(openai[0].keyId).toBe(openai[3].keyId);
      expect(openai[0].keyId).not.toBe(openai[1].keyId);
      expect(openai[2].keyId).toBeNull();
      expect(snapshot.usageDetails.find(row => row.provider === "Claude"))
        .toMatchObject({ inputTokens: 60, outputTokens: 40, requests: null, costUsd: 10 });
      expect(JSON.stringify(snapshot)).not.toContain("secret-");
      expect(JSON.stringify(snapshot)).not.toContain("provider-key-");
      expect(snapshot.usageDetailCoverage.filter(row => row.collected)).toHaveLength(2);
      for (const provider of ["OpenAI", "Claude"]) {
        const total = snapshot.usageDetails.filter(row => row.provider === provider)
          .reduce((sum, row) => sum + row.inputTokens + row.outputTokens, 0);
        const source = snapshot.providers.find(row => row.provider === provider);
        expect(total).toBe(source.inputTokens + source.outputTokens);
      }
    } finally { vi.unstubAllGlobals(); }
  });

  it("does not turn failed cost collection into free usage or failed usage into measured zero", async () => {
    vi.stubGlobal("fetch", async (url, options) => {
      if (url.pathname.includes("cost") || options.headers.Authorization === "Bearer broken") {
        return new Response(JSON.stringify({ error: { message: "unavailable" } }), { status: 403 });
      }
      return new Response(JSON.stringify({ data: [{ starting_at: "2026-10-01T00:00:00Z",
        results: [{ model: "test", api_key_id: "id", num_model_requests: 1, input_tokens: 100, output_tokens: 20 }] }],
        has_more: false }), { status: 200 });
    });
    try {
      const snapshot = await collectApiUsage({
        env: { OPENAI_ADMIN_KEY: "working", OPENAI_ADMIN_KEY_2: "broken" },
        collectedAt: new Date("2026-10-21T03:00:00Z"),
      });
      expect(snapshot.usageDetails).toHaveLength(1);
      expect(snapshot.usageDetails[0].costUsd).toBeNull();
      expect(snapshot.usageDetailCoverage.filter(row => row.provider === "OpenAI").map(row => row.collected)).toEqual([true, false]);
    } finally { vi.unstubAllGlobals(); }
  });
});
