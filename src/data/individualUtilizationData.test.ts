import { describe, expect, it } from "vitest";
import { individualUtilizationData } from "./individualUtilizationData";

const sumBy = <T,>(items: T[], selector: (item: T) => number) =>
  items.reduce((sum, item) => sum + selector(item), 0);

describe("individualUtilizationData", () => {
  it("reconciles the five requested CSV sources", () => {
    const data = individualUtilizationData;

    expect(data.source.spend.rowCount).toBe(119);
    expect(data.users).toHaveLength(41);
    expect(data.users.filter((user) => user.measurementStatus === "measured")).toHaveLength(21);
    expect(data.totals.requests).toBe(50524);
    expect(data.totals.totalTokens).toBe(12554215370);
    expect(data.totals.netSpendUsd).toBeCloseTo(34.93, 2);
    expect(data.source.codeLines).toHaveLength(4);
    expect(sumBy(data.source.codeLines, (item) => item.totalLines)).toBe(1014276);
    expect(sumBy(data.users, (user) => user.totalCodeLines)).toBe(1014276);
  });

  it("keeps activity metrics behind an explicit HR evidence gate", () => {
    expect(individualUtilizationData.methodology.productivity).toContain("개인 고과에 직접 사용하지 않음");
    expect(individualUtilizationData.methodology.evaluationGate).toContain("최종 승인");
    expect(individualUtilizationData.methodology.evaluationGate).toContain("재사용");
  });

  it("adds shared-account users without fabricating individual metrics", () => {
    const sharedAccountUsers = individualUtilizationData.users.filter(
      (user) => user.measurementStatus === "shared-account-unmeasured",
    );

    expect(sharedAccountUsers.map((user) => user.displayName)).toEqual([
      "임성범 부장",
      "조주연 부장",
      "이형배 상무",
      "김대일 상무",
      "박연석 전무",
    ]);
    expect(sharedAccountUsers.every((user) => user.displayAccount === null)).toBe(true);
    expect(sharedAccountUsers.map((user) => user.usageScopeOverride)).toEqual([
      "Claude 및 Genspark 공통 계정 사용",
      "Claude, Genspark 및 Gamma 공통 계정 사용",
      "Claude 공통 계정 사용",
      "Claude 가입 계정 사용",
      "Claude 가입 계정 사용",
    ]);
    expect(
      sharedAccountUsers.every((user) =>
        Object.values(user.monthEvaluations).every(
          (evaluation) => evaluation.productivityScore === null && evaluation.codeLines === null,
        ),
      ),
    ).toBe(true);
  });

  it("adds Lee Donghun as an enrolled account with uncollected usage", () => {
    const user = individualUtilizationData.users.find(
      (item) => item.email === "dhlee@riskzero.kr",
    );

    expect(user).toMatchObject({
      displayName: "이동훈 부장",
      measurementStatus: "source-uncollected",
      displayAccount: "dhlee@riskzero.kr",
      usageScopeOverride: "Claude Team Plan Standard · 사용량 원천 미수집",
      requests: 0,
      totalTokens: 0,
      totalCodeLines: 0,
    });
    expect(
      Object.values(user?.monthEvaluations ?? {}).every(
        (evaluation) =>
          evaluation.productivityScore === null &&
          evaluation.codeLines === null &&
          evaluation.evidence.includes("원천 사용량 미수집"),
      ),
    ).toBe(true);
  });

  it("promotes Park Sujin and Song Inna to measured users when the new source includes them", () => {
    const users = individualUtilizationData.users.filter((user) =>
      ["sjpark@riskzero.kr", "songinna@riskzero.kr"].includes(user.email),
    );

    expect(users).toEqual([
      expect.objectContaining({
        displayName: "박수진 과장",
        displayAccount: "sjpark@riskzero.kr",
        measurementStatus: "measured",
        usageScopeOverride: null,
        products: ["Cowork"],
        models: ["claude-haiku-4-5-20251001", "claude-sonnet-5"],
        requests: 13,
        totalTokens: 786254,
        totalCodeLines: 0,
      }),
      expect.objectContaining({
        displayName: "송인나 대리",
        displayAccount: "songinna@riskzero.kr",
        measurementStatus: "measured",
        usageScopeOverride: null,
        products: ["Cowork"],
        models: ["claude-haiku-4-5-20251001", "claude-sonnet-5"],
        requests: 17,
        totalTokens: 1523030,
        totalCodeLines: 0,
      }),
    ]);
    expect(users.every((user) => user.totalCodeLines === 0)).toBe(true);
  });

  it("adds the requested ChatGPT users with uncollected metrics", () => {
    const expectedNames = [
      "최종윤 이사",
      "윤종호 부장",
      "이창섭 부장",
      "조욱상 이사",
      "이병현 이사",
      "강훈 부장",
      "이진욱 부장",
      "박명수 과장",
      "김도율 차장",
      "김진희 과장",
      "고원상 대리",
      "최용호 대리",
      "강재민 사원",
      "박병민 이사",
    ];
    const users = individualUtilizationData.users.filter((user) =>
      user.email.startsWith("chatgpt-account:"),
    );

    expect(users.map((user) => user.displayName)).toEqual(expectedNames);
    const claudeCommonAccountNames = new Set([
      "김도율 차장",
      "최종윤 이사",
      "박병민 이사",
    ]);
    expect(
      users.every(
        (user) =>
          user.measurementStatus === "source-uncollected" &&
          user.displayAccount === null &&
          user.usageScopeOverride === (
            claudeCommonAccountNames.has(user.displayName)
              ? "chatGPT 공통 계정 사용 · Claude 공통 계정 사용"
              : "chatGPT 공통 계정 사용"
          ) &&
          user.requests === 0 &&
          user.totalTokens === 0 &&
          user.totalCodeLines === 0 &&
          Object.values(user.monthEvaluations).every(
            (evaluation) =>
              evaluation.productivityScore === null &&
              evaluation.codeLines === null,
          ),
      ),
    ).toBe(true);
  });

  it("keeps timestamp-backed weekly activity separate from monthly Code Lines", () => {
    const data = individualUtilizationData;

    expect(data.weeks[0]).toBe("2026-05-11");
    expect(data.weeks[data.weeks.length - 1]).toBe("2026-08-03");
    expect(sumBy(data.weeklyTrend, (item) => item.conversations)).toBe(168);
    expect(sumBy(data.weeklyTrend, (item) => item.humanPrompts)).toBe(1429);
    expect(data.weeklyTrend.every((item) => item.codeLines === null)).toBe(true);
    expect(
      data.users.every((user) =>
        Object.values(user.weekEvaluations).every(
          (evaluation) => evaluation.codeLines === null && evaluation.productivityScore === null,
        ),
      ),
    ).toBe(true);
  });

  it("publishes both August period files as filterable weekly totals", () => {
    const data = individualUtilizationData;
    const firstWeek = data.weeklyUsage["2026-08-W1"];
    const secondWeek = data.weeklyUsage["2026-08-W2"];

    expect(data.usageWeeks).toEqual(["2026-08-W1", "2026-08-W2"]);
    expect(firstWeek).toMatchObject({
      label: "8월 1주차",
      startDate: "2026-08-01",
      endDate: "2026-08-05",
      totals: {
        activeUsers: 18,
        requests: 20148,
        totalTokens: 5203366729,
        netSpendUsd: 0,
        codeLines: 64530,
      },
    });
    expect(secondWeek).toMatchObject({
      label: "8월 2주차",
      startDate: "2026-08-06",
      endDate: "2026-08-12",
      totals: {
        activeUsers: 18,
        requests: 30376,
        promptTokens: 7323296308,
        completionTokens: 27552333,
        totalTokens: 7350848641,
        netSpendUsd: 34.93,
        codeLines: 102199,
      },
    });
    expect(secondWeek.users["woosung.jeon@riskzero.kr"]).toMatchObject({
      requests: 5929,
      totalTokens: 1570580922,
      codeLines: 32418,
    });
    expect(Object.values(secondWeek.users).every((usage) => usage.totalTokens >= 0)).toBe(true);
    expect(data.weeklyUsageTrend).toHaveLength(2);
  });

  it("produces bounded peer-comparison scores for every user and period", () => {
    const data = individualUtilizationData;
    const scores = data.users.flatMap((user) => [
      user.overallActivityScore,
      user.overallProductivityScore,
      ...Object.values(user.monthEvaluations).flatMap((evaluation) => [
        evaluation.activityScore,
        evaluation.productivityScore ?? 0,
      ]),
      ...Object.values(user.weekEvaluations).map((evaluation) => evaluation.activityScore),
    ]);

    expect(scores.every((score) => Number.isFinite(score) && score >= 0 && score <= 100)).toBe(true);
    const augustLeader = [...data.users].sort(
      (a, b) => b.monthEvaluations["2026-08"].productivityScore! - a.monthEvaluations["2026-08"].productivityScore!,
    )[0];
    expect(augustLeader.email).toBe("woosung.jeon@riskzero.kr");
    expect(data.source.notes).toContain("Code Lines는 월 누적 스냅샷의 최신 파일을 월 누적값으로 사용하고 주차 값은 스냅샷 간 순증으로 계산합니다.");
  });

  it("does not treat missing Claude Code prompt details as zero activity", () => {
    const augustCodeUsersWithoutChatPrompts = individualUtilizationData.users.filter((user) => {
      const evaluation = user.monthEvaluations["2026-08"];
      return (evaluation.codeLines ?? 0) > 0 && evaluation.humanPrompts === 0;
    });

    expect(augustCodeUsersWithoutChatPrompts).toHaveLength(12);
    expect(
      augustCodeUsersWithoutChatPrompts.every(
        (user) => user.monthEvaluations["2026-08"].codeActivityDetailsMissing,
      ),
    ).toBe(true);
    expect(
      augustCodeUsersWithoutChatPrompts.every(
        (user) => user.monthEvaluations["2026-08"].evidence.includes("미수집"),
      ),
    ).toBe(true);
  });

  it("uses monthly Spend reports for monthly request and token totals", () => {
    const data = individualUtilizationData;

    expect(data.monthlySpend["2026-05"]?.totals).toMatchObject({
      requests: 644,
      totalTokens: 124283890,
    });
    expect(data.monthlySpend["2026-06"]?.totals).toMatchObject({
      requests: 66606,
      totalTokens: 11861497110,
    });
    expect(data.monthlySpend["2026-06"]?.sourceCommit).toBe("8e72279");
    expect(data.monthlySpend["2026-07"]?.totals).toMatchObject({
      requests: 107968,
      totalTokens: 22109534845,
    });
    expect(data.monthlySpend["2026-08"]?.totals).toMatchObject({
      requests: 50524,
      promptTokens: 12508404680,
      completionTokens: 45810690,
      totalTokens: 12554215370,
    });
    expect(data.monthlySpend["2026-08"]?.coverage).toBe("partial");
    expect(data.monthlySpend["2026-08"]?.period).toBe("2026-08-01 ~ 2026-08-12");
    expect(data.monthlySpend["2026-08"]?.users["woosung.jeon@riskzero.kr"]).toMatchObject({
      requests: 10135,
      totalTokens: 2899028449,
    });
    expect(data.monthlySpend["2026-08"]?.users["jungyr98@riskzero.kr"]).toMatchObject({
      requests: 1260,
      totalTokens: 113282866,
    });
    expect(
      Object.values(data.monthlySpend["2026-08"]?.users ?? {}).every(
        (usage) => usage.requests >= 0 && usage.totalTokens >= 0,
      ),
    ).toBe(true);
    expect(data.monthlySpendSource.missingMonths).toHaveLength(0);
  });
});
