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
});
