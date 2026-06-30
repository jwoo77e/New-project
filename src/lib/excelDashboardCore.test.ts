import { describe, expect, it } from "vitest";
import { dashboardDataFromSheets } from "./excelDashboardCore";

describe("dashboardDataFromSheets", () => {
  it("builds dashboard aggregates from a workbook sheet", () => {
    const data = dashboardDataFromSheets("sample.xlsx", [
      {
        sheet: "요약",
        data: [
          ["매월 약 224만원"],
          ["2025년 AI 비용"],
          ["합계", 1000, 13004940],
        ],
      },
      {
        sheet: "키워드검색결과",
        data: [
          ["일자", "부서", "품명", "거래처", "분류", "사용금액"],
          ["2026-01-02", "자금회계팀", "구글 그룹웨어 이용", "구글클라우드코리아", "Google", 2000000],
          ["2026-01-03", "박연석", "CHAT GPT Pro", "OPENAI OPCO", "", 300000],
          ["2026-02-04", "조욱상", "Genspark Pro", "MAINFUNC PTE. LTD.", "", 100000],
          ["날짜 아님", "자금회계팀", "제외 행", "거래처", "", 1000],
          ["2026-02-05", "자금회계팀", "환불 제외", "거래처", "", -1000],
        ],
      },
    ]);

    expect(data.sourceMeta).toMatchObject({
      fileName: "sample.xlsx",
      sourceSheet: "키워드검색결과",
      period: "2026년 1월 - 2월",
      recordCount: 3,
      totalActual: 2400000,
      expectedMonthlyFixed: 2240000,
      expectedQuarterFixed: 4480000,
      priorYearTotal: 13004940,
    });

    expect(data.monthlyActuals).toEqual([
      { month: "2026-01", label: "1월", amount: 2300000, transactions: 2 },
      { month: "2026-02", label: "2월", amount: 100000, transactions: 1 },
    ]);
    expect(data.forecastAdjustments).toEqual([
      {
        month: "2026-01",
        label: "1월",
        amount: 2000000,
        transactions: 1,
        reason: "개발/데모용 구글 API 일시 비용",
      },
    ]);
    expect(data.departmentCosts.slice(0, 3).map((row) => [row.name, row.total])).toEqual([
      ["자금회계팀(공용)", 2000000],
      ["전략기획실(단독)", 300000],
      ["경영혁신팀(단독)", 100000],
    ]);
    expect(data.categoryCosts.map((row) => [row.name, row.amount])).toEqual([
      ["Google/Gemini", 2000000],
      ["ChatGPT/OpenAI", 300000],
      ["Genspark", 100000],
    ]);
    expect(data.topTransactions[0]).toMatchObject({
      department: "자금회계팀(공용)",
      category: "Google/Gemini",
      amount: 2000000,
    });
  });

  it("throws when no sheet has the required cost columns", () => {
    expect(() =>
      dashboardDataFromSheets("broken.xlsx", [
        {
          sheet: "Sheet1",
          data: [
            ["이름", "설명"],
            ["샘플", "비용 컬럼 없음"],
          ],
        },
      ]),
    ).toThrow("일자, 사용금액, 부서 컬럼을 가진 시트를 찾지 못했습니다.");
  });

  it("supports corporate card approval headers and prefers the 2026 full-detail sheet", () => {
    const data = dashboardDataFromSheets("2026년_4월_법인카드_AI.xlsx", [
      {
        sheet: "2025년 11월",
        data: [
          ["승인일자", "전표적요", "승인금액", "가맹점", "부서"],
          ["2025-11-17", "과거 사용료", 999999, "OPENAI OPCO", "자금회계팀"],
        ],
      },
      {
        sheet: "2026년 전체내역",
        data: [
          ["승인일자", "카드명", "전표적요", "승인금액", "가맹점", "차변계정", "부서", "해당월"],
          [
            "2026-04-01",
            "우리카드",
            "AI 개발자 도구 Claude Maximum Flexibility",
            340886,
            "CLAUDE.AI SUBSCRIPTION SAN FRANCISCO USA",
            "지급수수료",
            "자금회계팀",
            "4월",
          ],
          [
            "2026-04-02",
            "하나카드",
            "구글 그룹웨어 이용",
            821508,
            "토스페이먼츠 주식회사",
            "지급수수료",
            "자금회계팀",
            "4월",
          ],
          [
            "2026-04-29",
            "우리카드",
            "AI 이용료",
            31682,
            "OLLAMA INC.",
            "지급수수료",
            "자금회계팀",
            "4월",
          ],
        ],
      },
    ]);

    expect(data.sourceMeta.sourceSheet).toBe("2026년 전체내역");
    expect(data.monthlyActuals).toEqual([
      { month: "2026-04", label: "4월", amount: 1194076, transactions: 3 },
    ]);
    expect(data.forecastAdjustments).toEqual([
      {
        month: "2026-04",
        label: "4월",
        amount: 821508,
        transactions: 1,
        reason: "개발/데모용 구글 API 일시 비용",
      },
    ]);
    expect(data.categoryCosts.map((row) => [row.name, row.amount])).toEqual([
      ["Google/Gemini", 821508],
      ["Claude/Anthropic", 340886],
      ["Ollama", 31682],
    ]);
  });

  it("groups 기술연구소 source rows into the existing 기술연구소 단독 department bucket", () => {
    const data = dashboardDataFromSheets("2026년_5월_법인카드_AI.xlsx", [
      {
        sheet: "2026년 5월",
        data: [
          ["승인일자", "카드명", "전표적요", "승인금액", "가맹점", "차변계정", "부서", "월"],
          [
            "2026-05-12",
            "하나카드기명식",
            "AX업무 클루드사용료",
            213160,
            "CLAUDE.AI SUBSCRIPTION SAN FRANCISCO USA",
            "지급수수료",
            "김대일",
            "5월",
          ],
          [
            "2026-05-21",
            "하나카드",
            "chatGPT Pro 20x 사용료",
            341560,
            "OPENAI OPCO, LLC",
            "지급수수료",
            "기술연구소",
            "5월",
          ],
        ],
      },
    ]);

    expect(data.departmentCosts.find((row) => row.name === "기술연구소(단독)")).toMatchObject({
      sourceName: "김대일",
      transactions: 2,
      total: 554720,
      monthly: { "2026-05": 554720 },
    });
  });
});
