import { describe, expect, it } from "vitest";
import {
  buildGeminiWorkspaceUsageFromActivities,
  buildGammaUsageFromGenerationStatuses,
  buildGeminiBillingProjectFilter,
  parseGammaGenerationIds,
  parseClaudeCosts,
  resolveAnthropicAdminKeys,
  resolveGeminiMonitoringProjectIds,
  resolveGeminiBillingUsageProjectIds,
} from "./fetch-api-usage.mjs";

describe("Gemini billing project filters", () => {
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
    expect(usage.activationRate).toBe(66.7);
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
