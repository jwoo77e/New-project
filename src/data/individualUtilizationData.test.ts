import { describe, expect, it } from "vitest";
import { individualUtilizationData } from "./individualUtilizationData";

const sumBy = <T,>(items: T[], selector: (item: T) => number) =>
  items.reduce((sum, item) => sum + selector(item), 0);

describe("individualUtilizationData", () => {
  it("reconciles the five requested CSV sources", () => {
    const data = individualUtilizationData;

    expect(data.source.spend.rowCount).toBe(180);
    expect(data.users).toHaveLength(19);
    expect(data.totals.requests).toBe(264669);
    expect(data.totals.totalTokens).toBe(52004482235);
    expect(data.totals.netSpendUsd).toBeCloseTo(1211.75, 2);
    expect(data.source.codeLines).toHaveLength(4);
    expect(sumBy(data.source.codeLines, (item) => item.totalLines)).toBe(912077);
    expect(sumBy(data.users, (user) => user.totalCodeLines)).toBe(912077);
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
    expect(augustLeader.email).toBe("wody@riskzero.kr");
    expect(data.source.notes).toContain("Code Lines는 사용자별 월 합계이며 주간 값으로 임의 배분하지 않습니다.");
  });

  it("does not treat missing Claude Code prompt details as zero activity", () => {
    const augustCodeUsersWithoutChatPrompts = individualUtilizationData.users.filter((user) => {
      const evaluation = user.monthEvaluations["2026-08"];
      return (evaluation.codeLines ?? 0) > 0 && evaluation.humanPrompts === 0;
    });

    expect(augustCodeUsersWithoutChatPrompts).toHaveLength(11);
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
      requests: 6568,
      totalTokens: 1907464286,
    });
    expect(data.monthlySpend["2026-08"]?.coverage).toBe("partial");
    expect(data.monthlySpendSource.missingMonths).toHaveLength(0);
  });
});
