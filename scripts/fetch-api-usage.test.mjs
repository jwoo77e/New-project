import { describe, expect, it } from "vitest";
import {
  buildGeminiWorkspaceUsageFromActivities,
  buildGeminiBillingProjectFilter,
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
