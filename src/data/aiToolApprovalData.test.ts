import { describe, expect, it } from "vitest";
import {
  approvalMonthlyTotalsForMonth,
  buildApprovalPersonCostSummary,
  initialAiToolApprovalData,
} from "./aiToolApprovalData";

describe("initialAiToolApprovalData", () => {
  it("uses the assigned company email for each named approval account", () => {
    const accountsByOwner = (owner: string) => initialAiToolApprovalData.records
      .filter((record) => record.owner === owner)
      .map((record) => record.account);

    expect(accountsByOwner("이형배 상무 / 기술연구소")).toContain("hb777lee@riskzero.kr");
    expect(accountsByOwner("조욱상 이사 / 경영혁신팀")).toContain("airyoubi77@riskzero.kr");
    expect(accountsByOwner("이병현 이사 / 자금회계팀")).toContain("lbh0902@riskzero.kr");
    expect(accountsByOwner("박연석 전무 / 전략실")).toContain("yspark@riskzero.kr");
    expect(accountsByOwner("김대일 상무 / 기술연구소")).toContain("bigone@riskzero.kr");
    expect(accountsByOwner("조주연 부장 / 전략사업팀")).toContain("jyjo@riskzero.kr");
    expect(accountsByOwner("최종윤 이사 / 플랫폼개발")).toContain("drager72@riskzero.kr");
    expect(accountsByOwner("최용호 대리 / 스마트서비스")).toContain("use0505@riskzero.kr");
    expect(accountsByOwner("강훈 부장 / 스마트서비스")).toContain("khoon@riskzero.kr");
    expect(accountsByOwner("강재민 사원 / 스마트서비스")).toContain("woals1329@riskzero.kr");
    expect(accountsByOwner("김진희 과장 / 스마트서비스")).toContain("kjh17@riskzero.kr");
    expect(accountsByOwner("고원상 대리 / 스마트서비스")).toContain("day@riskzero.kr");
    expect(accountsByOwner("이창섭 부장 / 플랫폼개발")).toContain("cslee@riskzero.kr");
    expect(accountsByOwner("이진욱 부장 / 스마트서비스")).toContain("pentasix@riskzero.kr");
    expect(accountsByOwner("박명수 과장 / 스마트서비스")).toContain("pms0805@riskzero.kr");
    expect(accountsByOwner("윤종호 부장 / 플랫폼개발")).toContain("jhyun@riskzero.kr");
  });

  it("removes the retired company-wide ChatGPT Pro account", () => {
    expect(
      initialAiToolApprovalData.records.find(
        (record) => record.account === "riskzeroriskzero@gmail.com",
      ),
    ).toBeUndefined();
    expect(
      initialAiToolApprovalData.toolSummary.find(
        (item) => item.key === "chatGPT Pro(20배)",
      ),
    ).toMatchObject({
      count: 1,
      monthlyUsd: 220,
      monthlyKrw: 326_700,
    });
  });

  it("moves Lee Hyungbae to ChatGPT Business from August 2026", () => {
    expect(
      initialAiToolApprovalData.records.find(
        (record) => record.account === "hb777lee@riskzero.kr",
      ),
    ).toMatchObject({
      owner: "이형배 상무 / 기술연구소",
      department: "기술연구소",
      tool: "chatGPT Business Plan",
      monthlyUsd: 25,
      monthlyKrw: 37_125,
      startMonth: "2026-08",
      paymentMethod: "AI 전용 카드",
    });
    expect(initialAiToolApprovalData.toolSummary.find((item) => item.key === "chatGPT Pro(5배)")).toBeUndefined();
  });

  it("moves Kim Jaewoo and adds Jeong Jaeyo to ChatGPT Business", () => {
    expect(
      initialAiToolApprovalData.records.filter(
        (record) => record.category === "ChatGPT" && record.tool === "chatGPT Business Plan",
      ),
    ).toEqual([
      expect.objectContaining({
        account: "jaewoo.kim@riskzero.kr",
        owner: "김재우 부장 / 기술연구소",
        monthlyUsd: 25,
        monthlyKrw: 37_125,
        pricingEffectiveMonth: "2026-08",
        previousMonthlyUsd: 110,
        previousMonthlyKrw: 163_350,
      }),
      expect.objectContaining({
        account: "wody@riskzero.kr",
        owner: "정재요 차장 / 플랫폼개발",
        monthlyUsd: 25,
        monthlyKrw: 37_125,
        startMonth: "2026-08",
      }),
      expect.objectContaining({
        account: "hb777lee@riskzero.kr",
        owner: "이형배 상무 / 기술연구소",
        monthlyUsd: 25,
        monthlyKrw: 37_125,
        startMonth: "2026-08",
      }),
    ]);
  });

  it("assigns Kim Hana and Jeon Woosung to Claude Team Premium", () => {
    for (const account of ["staycurious@riskzero.kr", "woosung.jeon@riskzero.kr"]) {
      expect(
        initialAiToolApprovalData.records.find((record) => record.account === account),
      ).toMatchObject({
        tool: "Claude Team Plan Premium",
        monthlyUsd: 125,
        monthlyKrw: 185_625,
      });
    }
  });

  it("assigns Gu Munyoung to Claude Team Premium", () => {
    expect(
      initialAiToolApprovalData.records.find(
        (record) => record.account === "mygu@riskzero.kr",
      ),
    ).toMatchObject({
      owner: "구문영 사원 / 플랫폼개발",
      tool: "Claude Team Plan Premium",
      monthlyUsd: 125,
      monthlyKrw: 185_625,
    });
  });

  it("assigns Lim Sungbeom to Claude Team Standard from August 2026", () => {
    expect(
      initialAiToolApprovalData.records.find(
        (record) =>
          record.account === "riskzero.marketing@gmail.com" &&
          record.category === "Claude",
      ),
    ).toMatchObject({
      owner: "임성범 부장 / 전략사업팀",
      tool: "Claude Team Plan Standard",
      monthlyUsd: 25,
      monthlyKrw: 37_125,
      pricingEffectiveMonth: "2026-08",
      previousMonthlyUsd: 220,
      previousMonthlyKrw: 326_700,
    });
  });

  it("assigns Lee Donghun to Claude Team Standard", () => {
    expect(
      initialAiToolApprovalData.records.find(
        (record) => record.account === "dhlee@riskzero.kr",
      ),
    ).toMatchObject({
      owner: "이동훈 부장 / 플랫폼개발",
      department: "플랫폼개발",
      tool: "Claude Team Plan Standard",
      monthlyUsd: 25,
      monthlyKrw: 37_125,
      paymentMethod: "AI 전용 카드",
    });
  });

  it("assigns the Smart Service Gemini account to Kim Doyul", () => {
    expect(
      initialAiToolApprovalData.records.find(
        (record) => record.account === "ai.smartservice@riskzero.kr",
      ),
    ).toMatchObject({
      owner: "김도율 차장 / 스마트서비스",
      department: "스마트서비스",
      tool: "Gemini(Google Workspace)",
      linkedAccount: "doyul@riskzero.kr",
      monthlyUsd: 15.12,
      monthlyKrw: 22_453.2,
      paymentMethod: "AI 전용 카드",
    });
  });

  it("assigns Park Sujin and Song Inna to Claude Team Standard from August 2026", () => {
    expect(
      initialAiToolApprovalData.records.filter((record) =>
        ["sjpark@riskzero.kr", "songinna@riskzero.kr"].includes(record.account),
      ),
    ).toEqual([
      expect.objectContaining({
        owner: "박수진 과장 / 플랫폼개발",
        department: "플랫폼개발",
        tool: "Claude Team Plan Standard",
        monthlyUsd: 25,
        monthlyKrw: 37_125,
        startMonth: "2026-08",
        paymentMethod: "AI 전용 카드",
      }),
      expect.objectContaining({
        owner: "송인나 대리 / 플랫폼개발",
        department: "플랫폼개발",
        tool: "Claude Team Plan Standard",
        monthlyUsd: 25,
        monthlyKrw: 37_125,
        startMonth: "2026-08",
        paymentMethod: "AI 전용 카드",
      }),
    ]);
  });

  it("assigns Choi Jongyun to the platform development department", () => {
    expect(
      initialAiToolApprovalData.records.find((record) => record.owner.startsWith("최종윤 이사")),
    ).toMatchObject({
      tool: "Claude Team Plan Standard",
      owner: "최종윤 이사 / 플랫폼개발",
      department: "플랫폼개발",
    });
  });

  it("reconciles the updated plan mix and monthly totals", () => {
    expect(
      initialAiToolApprovalData.toolSummary.find(
        (item) => item.key === "Claude Team Plan Premium",
      ),
    ).toMatchObject({
      count: 11,
      monthlyUsd: 1_375,
      monthlyKrw: 2_041_875,
    });
    expect(
      initialAiToolApprovalData.toolSummary.find(
        (item) => item.key === "Claude Team Plan Standard",
      ),
    ).toMatchObject({
      count: 30,
      monthlyUsd: 750,
      monthlyKrw: 1_113_750,
    });
    expect(initialAiToolApprovalData.toolSummary.find((item) => item.key === "Claude Pro Max 5")).toBeUndefined();
    expect(initialAiToolApprovalData.toolSummary.find((item) => item.key === "Claude Pro Max 20")).toBeUndefined();
    expect(initialAiToolApprovalData.totalMonthlyUsd).toBe(2_795.59);
    expect(initialAiToolApprovalData.totalMonthlyKrw).toBe(5_651_451.15);
  });

  it("keeps category and payment totals aligned with the updated total", () => {
    expect(
      initialAiToolApprovalData.categorySummary.find((item) => item.key === "Claude"),
    ).toMatchObject({
      count: 41,
      monthlyUsd: 2_125,
      monthlyKrw: 3_155_625,
    });
    expect(
      initialAiToolApprovalData.categorySummary.find((item) => item.key === "ChatGPT"),
    ).toMatchObject({
      count: 4,
      monthlyUsd: 295,
      monthlyKrw: 438_075,
    });
    expect(initialAiToolApprovalData.aiDedicatedCardAccounts).toBe(53);
    expect(initialAiToolApprovalData.aiDedicatedCardKrw).toBe(5_651_451.15);
    expect(
      initialAiToolApprovalData.paymentSummary.find((item) => item.key === "계약 고정비"),
    ).toBeUndefined();
  });

  it("reconciles ChatGPT product counts and costs with the service-category total", () => {
    const chatGptCategory = initialAiToolApprovalData.categorySummary.find(
      (item) => item.key === "ChatGPT",
    );
    const chatGptProducts = initialAiToolApprovalData.toolSummary.filter((item) =>
      item.key.startsWith("chatGPT"),
    );

    expect(chatGptProducts.map((item) => item.key)).toEqual([
      "chatGPT Pro(20배)",
      "chatGPT Business Plan",
    ]);
    expect(chatGptProducts.reduce((sum, item) => sum + item.count, 0)).toBe(chatGptCategory?.count);
    expect(chatGptProducts.reduce((sum, item) => sum + item.monthlyUsd, 0)).toBe(chatGptCategory?.monthlyUsd);
    expect(chatGptProducts.reduce((sum, item) => sum + item.monthlyKrw, 0)).toBe(chatGptCategory?.monthlyKrw);
  });

  it("aggregates monthly approval costs by person and excludes shared costs", () => {
    const summary = buildApprovalPersonCostSummary(initialAiToolApprovalData.records);

    expect(summary.people.find((person) => person.name === "임성범 부장")).toMatchObject({
      name: "임성범 부장",
      departments: ["전략사업팀"],
      itemCount: 2,
      monthlyUsd: 299.99,
      monthlyKrw: 445_485.15,
    });
    expect(summary.people.find((person) => person.name === "박연석 전무")).toMatchObject({
      name: "박연석 전무",
      departments: ["전략실"],
      itemCount: 3,
      monthlyUsd: 360.12,
      monthlyKrw: 534_778.2,
    });
    expect(summary.people.find((person) => person.name === "김재우 부장")).toMatchObject({
      itemCount: 2,
      tools: ["chatGPT Business Plan", "Claude Team Plan Premium"],
      monthlyUsd: 150,
      monthlyKrw: 222_750,
    });
    expect(summary.people.find((person) => person.name === "이형배 상무")).toMatchObject({
      itemCount: 2,
      tools: ["chatGPT Business Plan", "Claude Team Plan Standard"],
      monthlyUsd: 50,
      monthlyKrw: 74_250,
    });
    expect(summary.sharedMonthlyKrw).toBe(1_522_453.2);
    expect(summary.personalMonthlyKrw + summary.sharedMonthlyKrw).toBe(
      initialAiToolApprovalData.totalMonthlyKrw,
    );
  });

  it("adds the GH AI Agent API fixed service cost from August 2026", () => {
    expect(
      initialAiToolApprovalData.records.find((record) => record.category === "AI API"),
    ).toMatchObject({
      tool: "GH AI Agent AI API 서비스",
      owner: "GH AI Agent 개발 / 플랫폼개발팀",
      department: "플랫폼개발",
      monthlyUsd: 0,
      monthlyKrw: 1_500_000,
      billingCurrency: "KRW",
      startMonth: "2026-08",
      paymentMethod: "AI 전용 카드",
    });

    expect(approvalMonthlyTotalsForMonth(initialAiToolApprovalData, "2026-07")).toMatchObject({
      count: 35,
      monthlyUsd: 2_795.59,
      monthlyKrw: 4_151_451.15,
    });
    expect(approvalMonthlyTotalsForMonth(initialAiToolApprovalData, "2026-08")).toMatchObject({
      count: 53,
      monthlyUsd: 2_795.59,
      monthlyKrw: 5_651_451.15,
    });
  });

  it("removes the unused ai.marketing Gemini account from approvals", () => {
    expect(
      initialAiToolApprovalData.records.some(
        (record) =>
          record.account === "ai.marketing@riskzero.kr" ||
          record.linkedAccount === "ai.marketing@riskzero.kr",
      ),
    ).toBe(false);
    expect(
      initialAiToolApprovalData.toolSummary.find(
        (item) => item.key === "Gemini(Google Workspace)",
      ),
    ).toMatchObject({
      count: 5,
      monthlyUsd: 75.6,
      monthlyKrw: 112_266,
    });
  });
});
