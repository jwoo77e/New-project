import { describe, expect, it } from "vitest";
import { individualUtilizationData } from "./individualUtilizationData";

const sumBy = <T,>(items: T[], selector: (item: T) => number) =>
  items.reduce((sum, item) => sum + selector(item), 0);

describe("individualUtilizationData", () => {
  it("reconciles the complete August monthly sources", () => {
    const data = individualUtilizationData;

    expect(data.source.spend.rowCount).toBe(138);
    expect(data.users).toHaveLength(40);
    expect(data.users.filter((user) => user.measurementStatus === "measured")).toHaveLength(32);
    expect(data.totals.requests).toBe(161582);
    expect(data.totals.totalTokens).toBe(37099774050);
    expect(data.totals.netSpendUsd).toBeCloseTo(414.44, 2);
    expect(data.source.codeLines).toHaveLength(5);
    expect(sumBy(data.source.codeLines, (item) => item.totalLines)).toBe(1295216);
    expect(sumBy(data.users, (user) => user.totalCodeLines)).toBe(1295216);
  });

  it("keeps activity metrics behind an explicit HR evidence gate", () => {
    expect(individualUtilizationData.methodology.productivity).toContain("Code Lines ÷ 총 토큰 × 1M");
    expect(individualUtilizationData.methodology.productivity).toContain("GitLab 추가 라인 ÷ Claude Code Lines × 100");
    expect(individualUtilizationData.methodology.productivity).toContain("개인 고과에 직접 사용하지 않음");
    expect(individualUtilizationData.methodology.evaluationGate).toContain("최종 승인");
    expect(individualUtilizationData.methodology.evaluationGate).toContain("재사용");
  });

  it("keeps only accounts without individual source data unmeasured", () => {
    const sharedAccountUsers = individualUtilizationData.users.filter(
      (user) => user.measurementStatus === "shared-account-unmeasured",
    );

    expect(sharedAccountUsers.map((user) => user.displayName)).toEqual([
      "임성범 부장",
      "조주연 부장",
    ]);
    expect(sharedAccountUsers.map((user) => user.displayAccount)).toEqual([
      "sblim0519@riskzero.kr",
      "jyjo@riskzero.kr",
    ]);
    expect(sharedAccountUsers.every((user) => user.usageScopeOverride === null)).toBe(true);
    expect(sharedAccountUsers.every((user) => user.products.length === 0)).toBe(true);
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
      usageScopeOverride: null,
      requests: 0,
      totalTokens: 0,
      totalCodeLines: 0,
    });
    expect(
      Object.values(user?.monthEvaluations ?? {}).every(
        (evaluation) =>
          evaluation.productivityScore === null &&
          evaluation.codeLines === null &&
          evaluation.evidence.includes("원천 사용량 수집중"),
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

  it("maps the requested users to company email addresses", () => {
    const expectedAccounts = new Map([
      ["최종윤 이사", "drager72@riskzero.kr"],
      ["최용호 대리", "use0505@riskzero.kr"],
      ["조욱상 이사", "airyoubi77@riskzero.kr"],
      ["강훈 부장", "khoon@riskzero.kr"],
      ["강재민 사원", "woals1329@riskzero.kr"],
      ["김도율 차장", "doyul@riskzero.kr"],
      ["김진희 과장", "kjh17@riskzero.kr"],
      ["고원상 대리", "day@riskzero.kr"],
      ["이병현 이사", "lbh0902@riskzero.kr"],
      ["이창섭 부장", "cslee@riskzero.kr"],
      ["이진욱 부장", "pentasix@riskzero.kr"],
      ["박명수 과장", "pms0805@riskzero.kr"],
      ["윤종호 부장", "jhyun@riskzero.kr"],
      ["조주연 부장", "jyjo@riskzero.kr"],
      ["김대일 상무", "bigone@riskzero.kr"],
      ["이형배 상무", "hb777lee@riskzero.kr"],
      ["임성범 부장", "sblim0519@riskzero.kr"],
      ["박연석 전무", "yspark@riskzero.kr"],
    ]);
    const users = individualUtilizationData.users.filter((user) =>
      expectedAccounts.has(user.displayName),
    );

    expect(users).toHaveLength(expectedAccounts.size);
    expect(users.every((user) =>
      user.email === expectedAccounts.get(user.displayName) &&
      user.displayAccount === expectedAccounts.get(user.displayName),
    )).toBe(true);
    expect(users.find((user) => user.email === "airyoubi77@riskzero.kr")?.measurementStatus).toBe("measured");
    expect(users.find((user) => user.email === "doyul@riskzero.kr")?.measurementStatus).toBe("measured");
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

  it("publishes the five provided period files as filterable weekly totals", () => {
    const data = individualUtilizationData;
    const firstWeek = data.weeklyUsage["2026-08-W1"];
    const secondWeek = data.weeklyUsage["2026-08-W2"];
    const thirdWeek = data.weeklyUsage["2026-08-W3"];
    const fourthWeek = data.weeklyUsage["2026-08-W4"];
    const fifthWeek = data.weeklyUsage["2026-08-W5"];

    expect(data.usageWeeks).toEqual([
      "2026-08-W1",
      "2026-08-W2",
      "2026-08-W3",
      "2026-08-W4",
      "2026-08-W5",
    ]);
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
    expect(thirdWeek).toMatchObject({
      label: "8월 3주차",
      startDate: "2026-08-13",
      endDate: "2026-08-19",
      totals: {
        activeUsers: 19,
        requests: 20976,
        totalTokens: 4391243968,
        netSpendUsd: 72.36,
        codeLines: 70943,
      },
    });
    expect(thirdWeek.users["wody@riskzero.kr"]).toMatchObject({
      requests: 3348,
      totalTokens: 677485181,
      codeLines: 17990,
    });
    expect(fourthWeek).toMatchObject({
      label: "8월 4주차",
      startDate: "2026-08-20",
      endDate: "2026-08-26",
      totals: {
        activeUsers: 27,
        requests: 48522,
        promptTokens: 10109922417,
        completionTokens: 39655598,
        totalTokens: 10149578015,
        netSpendUsd: 226.32,
        codeLines: 143511,
      },
    });
    expect(fourthWeek.users["wody@riskzero.kr"]).toMatchObject({
      requests: 8786,
      totalTokens: 1436716785,
      codeLines: 46515,
    });
    expect(fourthWeek.users["airyoubi77@riskzero.kr"]).toMatchObject({
      requests: 456,
      totalTokens: 49106500,
      products: ["Chat", "Office Agents"],
    });
    expect(fourthWeek.users["yspark@riskzero.kr"]).toMatchObject({
      requests: 689,
      totalTokens: 151448571,
      models: ["claude-fable-5", "claude-haiku-4-5-20251001", "claude-opus-5", "claude-sonnet-5"],
    });
    expect(
      Object.values(fourthWeek.users).every(
        (usage) => usage.requests >= 0 && usage.totalTokens >= 0 && usage.codeLines >= 0,
      ),
    ).toBe(true);
    expect(fifthWeek).toMatchObject({
      label: "8월 5주차",
      startDate: "2026-08-27",
      endDate: "2026-09-02",
      coverage: "complete",
      source: {
        currentSpendFile: "2026-09-03-spend-report.csv + spend-report-17711e80-a5e7-427c-b20e-230325bbae9f-2026-08-27-to-2026-09-02.csv + spend-report-f5ff68f8-ab8f-4101-aa65-a766ac49a78e-2026-08-27-to-2026-09-02.csv",
        currentSpendRows: 106,
        previousCodeFile: "2026-08-27-claude_code.csv",
        currentCodeFile: "claude_code_team_2026_08_01_to_2026_08_31.csv + 2026-09-03-claude_code.csv + claude_code_team_2026_09_01_to_2026_09_30.csv",
        codePeriod: "2026-08-27 ~ 2026-09-02",
        spendMethod: "period_total",
        codeMethod: "current_cumulative_minus_previous_cumulative",
      },
      totals: {
        activeUsers: 28,
        requests: 58113,
        promptTokens: 13725100861,
        completionTokens: 46704623,
        totalTokens: 13771805484,
        netSpendUsd: 151.34,
        codeLines: 126549,
      },
    });
    expect(fifthWeek.users["woosung.jeon@riskzero.kr"]).toMatchObject({
      requests: 8767,
      totalTokens: 2764004879,
      codeLines: 15108,
      products: ["Claude Code", "Cowork"],
    });
    expect(fifthWeek.users["yspark@riskzero.kr"]).toMatchObject({
      requests: 1240,
      totalTokens: 255296324,
      codeLines: 0,
    });
    expect(fifthWeek.users["bigone@riskzero.kr"]).toMatchObject({
      requests: 759,
      totalTokens: 182378494,
      codeLines: 5538,
    });
    expect(fifthWeek.users["airyoubi77@riskzero.kr"]).toMatchObject({
      requests: 103,
      totalTokens: 18485100,
      codeLines: 0,
      products: ["Chat"],
      models: ["claude-opus-5"],
    });
    expect(fifthWeek.notes).toContain(
      "Code Lines는 2026-08-27 ~ 2026-09-02 누적 순증입니다.",
    );
    const augustThroughFourthWeek = data.usageWeeks.slice(0, 4).map((week) => data.weeklyUsage[week]);
    expect(sumBy(augustThroughFourthWeek, (week) => week.totals.requests)).toBe(120022);
    expect(sumBy(augustThroughFourthWeek, (week) => week.totals.totalTokens)).toBe(27095037353);
    expect(sumBy(augustThroughFourthWeek, (week) => week.totals.codeLines)).toBe(381183);
    expect(data.monthlySpend["2026-08"]?.totals.requests).toBeGreaterThan(
      sumBy(augustThroughFourthWeek, (week) => week.totals.requests),
    );
    expect(data.weeklyUsageTrend).toHaveLength(5);
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

    expect(augustCodeUsersWithoutChatPrompts).toHaveLength(15);
    expect(
      augustCodeUsersWithoutChatPrompts.every(
        (user) => user.monthEvaluations["2026-08"].codeActivityDetailsMissing,
      ),
    ).toBe(true);
    expect(
      augustCodeUsersWithoutChatPrompts.every(
        (user) => user.monthEvaluations["2026-08"].evidence.includes("수집중"),
      ),
    ).toBe(true);
  });

  it("uses monthly Spend reports for monthly request and token totals", () => {
    const data = individualUtilizationData;

    expect(data.monthlySpend["2026-05"]?.totals).toMatchObject({
      requests: 30856,
      totalTokens: 4151596632,
    });
    expect(data.monthlySpend["2026-05"]?.coverage).toBe("partial");
    expect(data.monthlySpend["2026-05"]?.period).toBe("2026-05-14 ~ 2026-05-31");
    expect(data.monthlySpend["2026-06"]?.totals).toMatchObject({
      requests: 91857,
      totalTokens: 18193157446,
    });
    expect(data.monthlySpend["2026-06"]?.coverage).toBe("complete");
    expect(data.monthlySpend["2026-07"]?.totals).toMatchObject({
      requests: 117300,
      totalTokens: 23991487530,
    });
    expect(data.monthlySpend["2026-07"]?.coverage).toBe("complete");
    expect(data.monthlySpend["2026-07"]?.users["ykchj1011@riskzero.kr"]).toMatchObject({
      requests: 1512,
      totalTokens: 91698060,
      products: ["Chat", "Claude Code", "Cowork"],
      models: ["claude-haiku-4-5-20251001", "claude-sonnet-5"],
    });
    expect(data.monthlySpend["2026-08"]?.totals).toMatchObject({
      requests: 161582,
      promptTokens: 36963541520,
      completionTokens: 136232530,
      totalTokens: 37099774050,
    });
    expect(data.monthlySpend["2026-08"]?.coverage).toBe("complete");
    expect(data.monthlySpend["2026-08"]?.period).toBe("2026-08-01 ~ 2026-08-31");
    expect(data.monthlySpend["2026-08"]?.users["woosung.jeon@riskzero.kr"]).toMatchObject({
      requests: 30141,
      totalTokens: 8486318779,
    });
    expect(data.monthlySpend["2026-08"]?.users["jungyr98@riskzero.kr"]).toMatchObject({
      requests: 6530,
      totalTokens: 992766909,
    });
    expect(data.monthlySpend["2026-08"]?.users["airyoubi77@riskzero.kr"]).toMatchObject({
      requests: 627,
      totalTokens: 69416249,
      products: ["Chat", "Cowork", "Office Agents"],
    });
    expect(data.monthlySpend["2026-08"]?.users["yspark@riskzero.kr"]).toMatchObject({
      requests: 966,
      totalTokens: 188206187,
      models: ["claude-fable-5", "claude-haiku-4-5-20251001", "claude-opus-5", "claude-sonnet-4-6", "claude-sonnet-5"],
    });
    expect(
      Object.values(data.monthlySpend["2026-08"]?.users ?? {}).every(
        (usage) => usage.requests >= 0 && usage.totalTokens >= 0,
      ),
    ).toBe(true);
    expect(data.monthlySpendSource.missingMonths).toHaveLength(0);
    expect(data.monthlySpend["2026-09"]).toMatchObject({
      period: "2026-09-01 ~ 2026-09-02",
      coverage: "partial",
      totals: {
        requests: 1543,
        totalTokens: 359219033,
      },
    });
    expect(data.monthlySpend["2026-09"]?.users["yspark@riskzero.kr"]).toMatchObject({
      requests: 745,
      totalTokens: 171659607,
    });
    expect(data.monthlySpend["2026-09"]?.users["bigone@riskzero.kr"]).toMatchObject({
      requests: 759,
      totalTokens: 182378494,
    });
    expect(data.monthlySpend["2026-09"]?.users["airyoubi77@riskzero.kr"]).toMatchObject({
      requests: 39,
      totalTokens: 5180932,
      products: ["Chat"],
      models: ["claude-opus-5"],
    });
    expect(data.source.codeLines.find((item) => item.month === "2026-09")).toMatchObject({
      fileName: "claude_code_team_2026_09_01_to_2026_09_30.csv",
      period: "2026-09-01 ~ 2026-09-02",
      rowCount: 1,
      totalLines: 5538,
    });
  });

  it("reconciles the provided May through July Code Lines files", () => {
    const data = individualUtilizationData;

    expect(data.source.codeLines.filter((item) => item.month <= "2026-07")).toEqual([
      expect.objectContaining({ month: "2026-05", rowCount: 11, totalLines: 125684 }),
      expect.objectContaining({ month: "2026-06", rowCount: 14, totalLines: 344036 }),
      expect.objectContaining({ month: "2026-07", rowCount: 17, totalLines: 377827 }),
    ]);
    expect(
      data.users.find((user) => user.email === "ykchj1011@riskzero.kr")?.monthlyCodeLines["2026-07"],
    ).toBe(864);
  });
});
