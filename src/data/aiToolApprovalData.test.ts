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
    expect(accountsByOwner("강재민 사원 / 스마트서비스")).toContain("woals1329@riskzero.kr");
    expect(accountsByOwner("김진희 과장 / 스마트서비스")).toContain("kjh17@riskzero.kr");
    expect(accountsByOwner("고원상 대리 / 스마트서비스")).toContain("day@riskzero.kr");
    expect(accountsByOwner("이창섭 부장 / 플랫폼개발")).toContain("cslee@riskzero.kr");
    expect(accountsByOwner("이진욱 부장 / 스마트서비스")).toContain("pentasix@riskzero.kr");
    expect(accountsByOwner("박명수 과장 / 스마트서비스")).toContain("pms0805@riskzero.kr");
    expect(accountsByOwner("윤종호 부장 / 플랫폼개발")).toContain("jhyun@riskzero.kr");
  });

  it("removes Kang Hoon because he does not use an AI tool", () => {
    expect(
      initialAiToolApprovalData.records.some(
        (record) => record.account === "khoon@riskzero.kr" || record.owner.startsWith("강훈 부장"),
      ),
    ).toBe(false);
  });

  it("converts the two executive ChatGPT Pro seats to Premium from September without changing prior costs", () => {
    expect(
      initialAiToolApprovalData.records.find(
        (record) => record.account === "riskzeroriskzero@gmail.com",
      ),
    ).toBeUndefined();
    expect(
      initialAiToolApprovalData.toolSummary.find(
        (item) => item.key === "chatGPT Pro(20배)",
      ),
    ).toBeUndefined();
    for (const account of ["yspark@riskzero.kr", "bigone@riskzero.kr"]) {
      expect(initialAiToolApprovalData.records.filter(
        (record) => record.account === account && record.category === "ChatGPT",
      )).toEqual([expect.objectContaining({
        tool: "chatGPT Business Plan Premium",
        monthlyUsd: 125,
        monthlyKrw: 185_625,
        pricingEffectiveMonth: "2026-09",
        previousMonthlyUsd: 220,
        previousMonthlyKrw: 326_700,
        paymentMethod: "AI 전용 카드",
      })]);
      expect(approvalMonthlyTotalsForMonth(initialAiToolApprovalData, "2026-08").records.find(
        (record) => record.account === account && record.category === "ChatGPT",
      )).toMatchObject({ monthlyUsd: 220, monthlyKrw: 326_700 });
    }
    expect(initialAiToolApprovalData.records.find(
      (record) => record.account === "bigone@riskzero.kr" && record.category === "ChatGPT",
    )).toMatchObject({ startMonth: "2026-08" });
  });

  it("adds Minjae Standard and keeps Hanho Standard and Seongjin Premium without duplicates", () => {
    for (const [account, tool, monthlyUsd] of [
      ["mjlee0828@riskzero.kr", "chatGPT Business Plan Standard", 25],
      ["hhlee0227@riskzero.kr", "chatGPT Business Plan Standard", 25],
      ["sieghaft@riskzero.kr", "chatGPT Business Plan Premium", 125],
    ] as const) {
      expect(initialAiToolApprovalData.records.filter(
        (record) => record.account === account && record.category === "ChatGPT",
      )).toEqual([expect.objectContaining({
        tool, monthlyUsd, monthlyKrw: monthlyUsd * 1485, startMonth: "2026-09",
        department: "플랫폼개발", paymentMethod: "AI 전용 카드",
      })]);
    }
    expect(approvalMonthlyTotalsForMonth(initialAiToolApprovalData, "2026-08").records.some(
      (record) => record.account === "mjlee0828@riskzero.kr" && record.category === "ChatGPT",
    )).toBe(false);
  });

  it("labels Lee Hyungbae as ChatGPT Business Standard from August 2026", () => {
    expect(
      initialAiToolApprovalData.records.find(
        (record) => record.account === "hb777lee@riskzero.kr",
      ),
    ).toMatchObject({
      owner: "이형배 상무 / 기술연구소",
      department: "기술연구소",
      tool: "chatGPT Business Plan Standard",
      monthlyUsd: 25,
      monthlyKrw: 37_125,
      startMonth: "2026-08",
      paymentMethod: "AI 전용 카드",
    });
    expect(initialAiToolApprovalData.toolSummary.find((item) => item.key === "chatGPT Pro(5배)")).toBeUndefined();
  });

  it("assigns the requested ChatGPT Business Premium and Standard seats", () => {
    const premiumAccounts = initialAiToolApprovalData.records
      .filter((record) => record.tool === "chatGPT Business Plan Premium")
      .map((record) => record.account);
    const standardAccounts = initialAiToolApprovalData.records
      .filter((record) => record.tool === "chatGPT Business Plan Standard")
      .map((record) => record.account);

    expect(premiumAccounts).toEqual([
      "yspark@riskzero.kr",
      "bigone@riskzero.kr",
      "jaewoo.kim@riskzero.kr",
      "wody@riskzero.kr",
      "kys0392@riskzero.kr",
      "woosung.jeon@riskzero.kr",
      "mjkim1122@riskzero.kr",
      "sieghaft@riskzero.kr",
      "mygu@riskzero.kr",
      "ykchj1011@riskzero.kr",
    ]);
    expect(standardAccounts).toEqual([
      "hb777lee@riskzero.kr",
      "hhlee0227@riskzero.kr",
      "mjlee0828@riskzero.kr",
      "dhlee@riskzero.kr",
      "huizhen0227@riskzero.kr",
      "staycurious@riskzero.kr",
      "crow326@riskzero.kr",
      "sjpark@riskzero.kr",
    ]);
    expect(
      initialAiToolApprovalData.records.filter((record) =>
        [...premiumAccounts, ...standardAccounts].includes(record.account) &&
        record.category === "ChatGPT" &&
        record.startMonth === "2026-09",
      ),
    ).toHaveLength(13);
  });

  it("assigns Minjeong and Seongjin one ChatGPT Premium seat each from September and preserves Claude seats", () => {
    for (const [account, owner, claudeTool, claudeMonthlyUsd] of [
      ["mjkim1122@riskzero.kr", "김민정 차장 / 플랫폼개발", "Claude Team Plan Standard", 25],
      ["sieghaft@riskzero.kr", "김성진 부장 / 플랫폼개발", "Claude Team Plan Premium", 125],
    ] as const) {
      expect(initialAiToolApprovalData.records.filter(
        (record) => record.account === account && record.category === "ChatGPT",
      )).toEqual([expect.objectContaining({
        tool: "chatGPT Business Plan Premium",
        owner,
        department: "플랫폼개발",
        monthlyUsd: 125,
        monthlyKrw: 185_625,
        startMonth: "2026-09",
        paymentMethod: "AI 전용 카드",
      })]);
      expect(initialAiToolApprovalData.records.find(
        (record) => record.account === account && record.category === "Claude",
      )).toMatchObject({ tool: claudeTool, monthlyUsd: claudeMonthlyUsd });
      expect(approvalMonthlyTotalsForMonth(initialAiToolApprovalData, "2026-08").records.some(
        (record) => record.account === account && record.category === "ChatGPT",
      )).toBe(false);
    }
  });

  it("assigns Kim Hana and Jeon Woosung to Claude Team Premium", () => {
    for (const account of ["staycurious@riskzero.kr", "woosung.jeon@riskzero.kr"]) {
      expect(
        initialAiToolApprovalData.records.find(
          (record) => record.account === account && record.category === "Claude",
        ),
      ).toMatchObject({
        tool: "Claude Team Plan Premium",
        monthlyUsd: 125,
        monthlyKrw: 185_625,
      });
    }
  });

  it("corrects Kim Yeongsan to Standard in September and preserves the August price", () => {
    expect(
      initialAiToolApprovalData.records.find(
        (record) => record.account === "kys0392@riskzero.kr" && record.category === "Claude",
      ),
    ).toMatchObject({
      owner: "김영산 과장 / 플랫폼개발",
      department: "플랫폼개발",
      tool: "Claude Team Plan Standard",
      monthlyUsd: 25,
      monthlyKrw: 37_125,
    });
    for (const [month, monthlyUsd] of [["2026-07", 25], ["2026-08", 125], ["2026-09", 25]] as const) {
      expect(approvalMonthlyTotalsForMonth(initialAiToolApprovalData, month).records.find(
        (record) => record.account === "kys0392@riskzero.kr" && record.category === "Claude",
      )).toMatchObject({ monthlyUsd, monthlyKrw: monthlyUsd * 1485 });
    }
    expect(initialAiToolApprovalData.records.find(
      (record) => record.account === "kys0392@riskzero.kr" && record.category === "ChatGPT",
    )).toMatchObject({ tool: "chatGPT Business Plan Premium", monthlyUsd: 125 });
  });

  it("adds Kim Gihwan as Smart Service Standard without backdating billing", () => {
    expect(initialAiToolApprovalData.records.filter(
      (record) => record.account === "kh.kim@riskzero.kr",
    )).toEqual([expect.objectContaining({
      category: "Claude",
      tool: "Claude Team Plan Standard",
      owner: "김기환 대리 / 스마트서비스",
      department: "스마트서비스",
      monthlyUsd: 25,
      monthlyKrw: 37_125,
      startMonth: "2026-09",
      paymentMethod: "AI 전용 카드",
    })]);
    expect(approvalMonthlyTotalsForMonth(initialAiToolApprovalData, "2026-08").records.some(
      (record) => record.account === "kh.kim@riskzero.kr",
    )).toBe(false);
  });

  it("preserves the six seats outside the supplied organization member list", () => {
    const accounts = ["airyoubi77@riskzero.kr", "lbh0902@riskzero.kr", "sblim0519@riskzero.kr", "yspark@riskzero.kr", "bigone@riskzero.kr", "dhlee@riskzero.kr"];
    const otherSeats = initialAiToolApprovalData.records.filter(
      (record) => record.category === "Claude" && accounts.includes(record.account),
    );
    expect(otherSeats).toHaveLength(6);
    expect(otherSeats.reduce((total, record) => total + record.monthlyUsd, 0)).toBe(550);
  });

  it("moves Kim Seongjin to Claude Team Premium from September 2026", () => {
    expect(
      initialAiToolApprovalData.records.find(
        (record) => record.account === "sieghaft@riskzero.kr" && record.category === "Claude",
      ),
    ).toMatchObject({
      owner: "김성진 부장 / 플랫폼개발",
      tool: "Claude Team Plan Premium",
      monthlyUsd: 125,
      monthlyKrw: 185_625,
      pricingEffectiveMonth: "2026-09",
      previousMonthlyUsd: 25,
      previousMonthlyKrw: 37_125,
    });
  });

  it("moves Yoon Younggwan to Claude Team Premium from September 2026", () => {
    expect(initialAiToolApprovalData.records.find(
      (record) => record.account === "ykchj1011@riskzero.kr" && record.category === "Claude",
    )).toMatchObject({
      owner: "윤영관 과장 / 플랫폼개발",
      tool: "Claude Team Plan Premium",
      monthlyUsd: 125,
      monthlyKrw: 185_625,
      pricingEffectiveMonth: "2026-09",
      previousMonthlyUsd: 25,
      previousMonthlyKrw: 37_125,
    });
  });

  it("assigns Choi Jisuk one Standard seat from September without backdating costs", () => {
    expect(initialAiToolApprovalData.records.filter(
      (record) => record.account === "jsc@riskzero.kr",
    )).toEqual([expect.objectContaining({
      category: "Claude",
      tool: "Claude Team Plan Standard",
      owner: "최지숙 과장 / 전략사업팀",
      department: "전략사업팀",
      monthlyUsd: 25,
      monthlyKrw: 37_125,
      startMonth: "2026-09",
      paymentMethod: "AI 전용 카드",
    })]);
    const august = approvalMonthlyTotalsForMonth(initialAiToolApprovalData, "2026-08");
    expect(august.records.find((record) => record.account === "jsc@riskzero.kr")).toBeUndefined();
    expect(august.records.find(
      (record) => record.account === "ykchj1011@riskzero.kr" && record.category === "Claude",
    )).toMatchObject({ monthlyUsd: 25, monthlyKrw: 37_125 });
  });

  it("assigns Gu Munyoung to Claude Team Premium", () => {
    expect(
      initialAiToolApprovalData.records.find(
        (record) => record.account === "mygu@riskzero.kr" && record.category === "Claude",
      ),
    ).toMatchObject({
      owner: "구문영 사원 / 플랫폼개발",
      tool: "Claude Team Plan Premium",
      monthlyUsd: 125,
      monthlyKrw: 185_625,
    });
  });

  it("moves Gu Munyoung to ChatGPT Business Premium", () => {
    expect(
      initialAiToolApprovalData.records.find(
        (record) => record.account === "mygu@riskzero.kr" && record.category === "ChatGPT",
      ),
    ).toMatchObject({
      owner: "구문영 사원 / 플랫폼개발",
      tool: "chatGPT Business Plan Premium",
      monthlyUsd: 125,
      monthlyKrw: 185_625,
    });
  });

  it("assigns Lim Sungbeom to Claude Team Standard from August 2026", () => {
    expect(
      initialAiToolApprovalData.records.find(
        (record) =>
          record.account === "sblim0519@riskzero.kr" &&
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

  it("uses Lee Hyeongbae's own account", () => {
    expect(
      initialAiToolApprovalData.records.find(
        (record) => record.owner === "이형배 상무 / 기술연구소" && record.category === "Claude",
      ),
    ).toMatchObject({
      account: "hb777lee@riskzero.kr",
      tool: "Claude Team Plan Standard",
    });
  });

  it("assigns Lee Donghun to Claude Team Standard", () => {
    expect(
      initialAiToolApprovalData.records.find(
        (record) => record.account === "dhlee@riskzero.kr" && record.category === "Claude",
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

  it("adds one ChatGPT Standard seat for Lee Donghun from September without backdating billing", () => {
    expect(initialAiToolApprovalData.records.filter(
      (record) => record.account === "dhlee@riskzero.kr" && record.category === "ChatGPT",
    )).toEqual([expect.objectContaining({
      owner: "이동훈 부장 / 플랫폼개발",
      department: "플랫폼개발",
      tool: "chatGPT Business Plan Standard",
      monthlyUsd: 25,
      monthlyKrw: 37_125,
      startMonth: "2026-09",
      paymentMethod: "AI 전용 카드",
    })]);
    expect(approvalMonthlyTotalsForMonth(initialAiToolApprovalData, "2026-08").records.some(
      (record) => record.account === "dhlee@riskzero.kr" && record.category === "ChatGPT",
    )).toBe(false);
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
      monthlyUsd: 15.12,
      monthlyKrw: 22_453.2,
      paymentMethod: "AI 전용 카드",
    });
  });

  it("replaces Park Sujin's Claude seat with ChatGPT Business Standard", () => {
    expect(
      initialAiToolApprovalData.records.filter((record) => record.account === "sjpark@riskzero.kr"),
    ).toEqual([
      expect.objectContaining({
        owner: "박수진 과장 / 플랫폼개발",
        department: "플랫폼개발",
        category: "ChatGPT",
        tool: "chatGPT Business Plan Standard",
        monthlyUsd: 25,
        monthlyKrw: 37_125,
        startMonth: "2026-09",
        paymentMethod: "AI 전용 카드",
      }),
    ]);
  });

  it("keeps Song Inna on Claude Team Standard from August 2026", () => {
    expect(
      initialAiToolApprovalData.records.find((record) => record.account === "songinna@riskzero.kr"),
    ).toMatchObject({
      owner: "송인나 대리 / 플랫폼개발",
      department: "플랫폼개발",
      tool: "Claude Team Plan Standard",
      monthlyUsd: 25,
      monthlyKrw: 37_125,
      startMonth: "2026-08",
      paymentMethod: "AI 전용 카드",
    });
  });

  it("moves Yoon Younggwan to ChatGPT Business Premium", () => {
    expect(
      initialAiToolApprovalData.records.find(
        (record) => record.account === "ykchj1011@riskzero.kr" && record.category === "ChatGPT",
      ),
    ).toMatchObject({
      owner: "윤영관 과장 / 플랫폼개발",
      tool: "chatGPT Business Plan Premium",
      monthlyUsd: 125,
      monthlyKrw: 185_625,
    });
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
      count: 12,
      monthlyUsd: 1_500,
      monthlyKrw: 2_227_500,
    });
    expect(
      initialAiToolApprovalData.toolSummary.find(
        (item) => item.key === "Claude Team Plan Standard",
      ),
    ).toMatchObject({
      count: 28,
      monthlyUsd: 700,
      monthlyKrw: 1_039_500,
    });
    expect(initialAiToolApprovalData.toolSummary.find((item) => item.key === "Claude Pro Max 5")).toBeUndefined();
    expect(initialAiToolApprovalData.toolSummary.find((item) => item.key === "Claude Pro Max 20")).toBeUndefined();
    expect(initialAiToolApprovalData.totalMonthlyUsd).toBe(4_025.59);
    expect(initialAiToolApprovalData.totalMonthlyKrw).toBe(7_478_001.15);
  });

  it("keeps category and payment totals aligned with the updated total", () => {
    expect(
      initialAiToolApprovalData.categorySummary.find((item) => item.key === "Claude"),
    ).toMatchObject({
      count: 40,
      monthlyUsd: 2_200,
      monthlyKrw: 3_267_000,
    });
    expect(
      initialAiToolApprovalData.categorySummary.find((item) => item.key === "ChatGPT"),
    ).toMatchObject({
      count: 18,
      monthlyUsd: 1_450,
      monthlyKrw: 2_153_250,
    });
    expect(initialAiToolApprovalData.totalAccounts).toBe(66);
    expect(initialAiToolApprovalData.aiDedicatedCardAccounts).toBe(66);
    expect(initialAiToolApprovalData.aiDedicatedCardKrw).toBe(7_478_001.15);
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
      "chatGPT Business Plan Premium",
      "chatGPT Business Plan Standard",
    ]);
    expect(chatGptProducts.reduce((sum, item) => sum + item.count, 0)).toBe(chatGptCategory?.count);
    expect(chatGptProducts.reduce((sum, item) => sum + item.monthlyUsd, 0)).toBe(chatGptCategory?.monthlyUsd);
    expect(chatGptProducts.reduce((sum, item) => sum + item.monthlyKrw, 0)).toBe(chatGptCategory?.monthlyKrw);
    expect(chatGptProducts.find((item) => item.key === "chatGPT Business Plan Premium")).toMatchObject({
      count: 10,
      monthlyUsd: 1_250,
      monthlyKrw: 1_856_250,
    });
    expect(chatGptProducts.find((item) => item.key === "chatGPT Business Plan Standard")).toMatchObject({
      count: 8,
      monthlyUsd: 200,
      monthlyKrw: 297_000,
    });
  });

  it("reflects the executive conversions and Standard additions in department budgets", () => {
    for (const expected of [
      { key: "전략실", count: 3, monthlyUsd: 265.12, monthlyKrw: 393_703.2 },
      { key: "기술연구소", count: 7, monthlyUsd: 565.12, monthlyKrw: 839_203.2 },
      { key: "플랫폼개발", count: 37, monthlyUsd: 2_300, monthlyKrw: 4_915_500 },
    ]) {
      expect(initialAiToolApprovalData.departmentSummary.find(
        (department) => department.key === expected.key,
      )).toMatchObject(expected);
    }
    expect(initialAiToolApprovalData.departmentSummary.reduce(
      (total, department) => total + department.monthlyKrw, 0,
    )).toBeCloseTo(initialAiToolApprovalData.totalMonthlyKrw, 2);
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
      tools: ["chatGPT Business Plan Premium", "Claude Team Plan Premium", "Gemini(Google Workspace)"],
      monthlyUsd: 265.12,
      monthlyKrw: 393_703.2,
    });
    expect(summary.people.find((person) => person.name === "김재우 부장")).toMatchObject({
      itemCount: 2,
      tools: ["chatGPT Business Plan Premium", "Claude Team Plan Premium"],
      monthlyUsd: 250,
      monthlyKrw: 371_250,
    });
    expect(summary.people.find((person) => person.name === "이형배 상무")).toMatchObject({
      itemCount: 2,
      tools: ["chatGPT Business Plan Standard", "Claude Team Plan Standard"],
      monthlyUsd: 50,
      monthlyKrw: 74_250,
    });
    expect(summary.people.find((person) => person.name === "박정원 차장")).toMatchObject({
      itemCount: 2,
      tools: ["chatGPT Business Plan Standard", "Claude Team Plan Standard"],
      monthlyUsd: 50,
      monthlyKrw: 74_250,
    });
    expect(summary.people.find((person) => person.name === "박수진 과장")).toMatchObject({
      itemCount: 1,
      tools: ["chatGPT Business Plan Standard"],
      monthlyUsd: 25,
      monthlyKrw: 37_125,
    });
    expect(summary.people.find((person) => person.name === "윤영관 과장")).toMatchObject({
      itemCount: 2,
      tools: ["chatGPT Business Plan Premium", "Claude Team Plan Premium"],
      monthlyUsd: 250,
      monthlyKrw: 371_250,
    });
    expect(summary.people.find((person) => person.name === "최지숙 과장")).toMatchObject({
      departments: ["전략사업팀"],
      itemCount: 1,
      tools: ["Claude Team Plan Standard"],
      monthlyUsd: 25,
      monthlyKrw: 37_125,
    });
    expect(summary.people.find((person) => person.name === "김기환 대리")).toMatchObject({
      departments: ["스마트서비스"],
      itemCount: 1,
      tools: ["Claude Team Plan Standard"],
      monthlyUsd: 25,
      monthlyKrw: 37_125,
    });
    expect(summary.people.find((person) => person.name === "김영산 과장")).toMatchObject({
      itemCount: 2,
      monthlyUsd: 150,
      monthlyKrw: 222_750,
    });
    expect(summary.people.find((person) => person.name === "구문영 사원")).toMatchObject({
      itemCount: 2,
      tools: ["chatGPT Business Plan Premium", "Claude Team Plan Premium"],
      monthlyUsd: 250,
      monthlyKrw: 371_250,
    });
    expect(summary.people.find((person) => person.name === "김대일 상무")).toMatchObject({
      itemCount: 3,
      tools: ["chatGPT Business Plan Premium", "Claude Team Plan Premium", "Gemini(Google Workspace)"],
      monthlyUsd: 265.12,
      monthlyKrw: 393_703.2,
    });
    expect(summary.people.find((person) => person.name === "이민재 부장")).toMatchObject({
      itemCount: 2,
      tools: ["chatGPT Business Plan Standard", "Claude Team Plan Standard"],
      monthlyUsd: 50,
      monthlyKrw: 74_250,
    });
    expect(summary.people.find((person) => person.name === "김민정 차장")).toMatchObject({
      itemCount: 2,
      tools: ["chatGPT Business Plan Premium", "Claude Team Plan Standard"],
      monthlyUsd: 150,
      monthlyKrw: 222_750,
    });
    expect(summary.people.find((person) => person.name === "김성진 부장")).toMatchObject({
      itemCount: 2,
      tools: ["chatGPT Business Plan Premium", "Claude Team Plan Premium"],
      monthlyUsd: 250,
      monthlyKrw: 371_250,
    });
    expect(summary.people.find((person) => person.name === "이동훈 부장")).toMatchObject({
      itemCount: 2,
      tools: ["chatGPT Business Plan Standard", "Claude Team Plan Standard"],
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
      count: 51,
      monthlyUsd: 2_940.59,
      monthlyKrw: 5_866_776.15,
    });
    expect(approvalMonthlyTotalsForMonth(initialAiToolApprovalData, "2026-09")).toMatchObject({
      count: 66,
      monthlyUsd: 4_025.59,
      monthlyKrw: 7_478_001.15,
    });
    expect(approvalMonthlyTotalsForMonth(initialAiToolApprovalData, "2026-10")).toMatchObject({
      count: 66,
      monthlyUsd: 4_025.59,
      monthlyKrw: 7_478_001.15,
    });
  });

  it("removes the unused ai.marketing Gemini account from approvals", () => {
    expect(
      initialAiToolApprovalData.records.some(
        (record) =>
          record.account === "ai.marketing@riskzero.kr",
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
