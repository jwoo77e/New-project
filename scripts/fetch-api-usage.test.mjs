import { describe, expect, it } from "vitest";
import {
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
