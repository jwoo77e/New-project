import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToString } from "react-dom/server";
import App from "./App";

const reporting = vi.hoisted(() => ({month: null as string | null}));
vi.mock("./data/individualUtilizationData", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./data/individualUtilizationData")>();
  return {
    ...actual,
    individualUtilizationData: {
      ...actual.individualUtilizationData,
      get months() {
        return reporting.month
          ? actual.individualUtilizationData.months.filter(month => month <= reporting.month!)
          : actual.individualUtilizationData.months;
      },
    },
  };
});

beforeEach(() => { reporting.month = null; });

describe("dashboard startup", () => {
  it("keeps marketing Claude Code lines unavailable when spend has Code activity but its accepted-line report is absent", () => {
    const row = renderToString(<App />).split("</tr>").find(row => row.includes("sblim0519@riskzero.kr"))!;
    expect(row.split("</td>")[1]).toContain("Code Lines 수집중");
    expect(row).not.toContain("기간 불일치");
    expect(row).not.toContain("1M 토큰당");
    expect(row).not.toContain("기존 자료");
  });
  it("loads the complete app and renders the initial page with current subscription data", () => {
    const html = renderToString(<App />);
    expect(html).toContain("AI CONTROL HUB");
    expect(html).toContain("개인별 AI 활동 근거");
    expect(html).toContain("AI 도구 결재 현황");
    expect(html).toContain("추가 비용");
    expect(html).not.toContain("순비용");
    expect(html).toContain('<option value="2026-11" selected="">');
    expect(html).toContain("564,225줄");
    expect(html).toContain("58.5B");
    expect(html).toContain("1,135건");
    expect(html).toContain("2026-11-01 ~ 2026-11-18");
    expect(html).toContain("코드라인 1계정 미수집");
    expect(html).not.toContain("2026-11-05부터 수집");
    expect(html).toContain("김대영 과장");
    expect(html).not.toContain("hchbae1001@riskzero.kr");
    expect(html).not.toContain("배현철 사원");
  });

  it("renders the November report rows with estimated Codex costs and supported code totals", () => {
    const rows = renderToString(<App />).replace(/<!-- -->/g, "").split("</tr>");
    const park = rows.find(row => row.includes("crow326@riskzero.kr"));
    expect(park).toContain("20,156줄");
    expect(park).toContain("96줄");
    expect(park).toContain("추가 비용 $5.32 (추정)");
    expect(park).toContain("20,252줄");
    expect(park).toContain("1M 토큰당");
    expect(park).not.toContain("기간 불일치");
    const lim = rows.find(row => row.includes("sblim0519@riskzero.kr"));
    expect(lim).toContain("1,300줄");
    expect(lim).toContain("추가 비용 $0.00 (추정)");
  });

  it("calculates November density from matched month-to-date sources", () => {
    const rows = renderToString(<App />).replace(/<!-- -->/g, "").split("</tr>");
    const jaewoo = rows.find(row => row.includes("jaewoo.kim@riskzero.kr"));
    expect(jaewoo).toContain("19,666줄");
    expect(jaewoo).toContain("32,787줄");
    expect(jaewoo).toContain("52,453줄");
    expect(jaewoo).toContain("5,092,942,804 토큰");
    expect(jaewoo).toContain("1M 토큰당");
    expect(jaewoo).toContain("10.3줄");
    expect(jaewoo).not.toContain("기간 불일치");
    expect(jaewoo).not.toContain("확인분 합산");
  });

  it("retains measured monthly zero lines for Jo Juyeon", () => {
    const rows = renderToString(<App />).replace(/<!-- -->/g, "").split("</tr>");
    for (const email of ["jyjo@riskzero.kr"]) {
      const row = rows.find(row => row.includes(email));
      expect(row).toBeDefined();
      const claudeCell = row!.split("</td>")[1];
      expect(claudeCell).toContain("0줄");
      expect(claudeCell).not.toContain("수집중");
      expect(row).toContain("1M 토큰당");
      expect(row).not.toContain("기간 불일치");
      expect(row).not.toContain("확인분 합산");
    }
  });

  it("keeps absent historical Claude measurements uncollected after the November import", () => {
    reporting.month = "2026-10";
    const rows = renderToString(<App />).replace(/<!-- -->/g, "").split("</tr>");
    for (const email of ["sblim0519@riskzero.kr", "jyjo@riskzero.kr"]) {
      const row = rows.find(row => row.includes(email));
      expect(row).toBeDefined();
      const claudeCell = row!.split("</td>")[1];
      expect(claudeCell).toContain("수집중");
      expect(claudeCell).not.toContain("0줄");
    }
  });

  it("preserves the closed October totals when that historical month is selected", () => {
    reporting.month = "2026-10";
    const html = renderToString(<App />);
    expect(html).toContain('<option value="2026-10" selected="">');
    expect(html).toContain("2026-10-01 ~ 2026-10-31");
    expect(html).toContain("877,043줄");
    expect(html).toContain("1,620건");
    expect(html).toContain("181,549,559 토큰");
    expect(html).not.toContain("10-28까지 누적");
    expect(html).not.toContain("10월 4주차까지 누적");
    expect(html).not.toContain("2026-11-05부터 수집");
  });

  it("renders the October sum for users active in only one week without a period mismatch", () => {
    reporting.month = "2026-10";
    const rows = renderToString(<App />).split("</tr>");
    for (const [email, tokens] of [["day@riskzero.kr", "13,789,658"], ["woals1329@riskzero.kr", "7,918,755"]]) {
      const row = rows.find(row => row.includes(email));
      expect(row).toBeDefined();
      expect(row).toContain(`${tokens} 토큰`);
      expect(row).toContain("1M 토큰당");
      expect(row).not.toContain("기간 불일치");
      expect(row).not.toContain("수집된 주차만 합산");
    }
  });

  it("retains Park Sujin's Claude non-use with complete Codex coverage for the full October month", () => {
    reporting.month = "2026-10";
    const row = renderToString(<App />).split("</tr>").find(row => row.includes("sjpark@riskzero.kr"));
    expect(row).toBeDefined();
    const claudeCell = row!.split("</td>")[1];
    expect(claudeCell).toContain("미사용");
    expect(claudeCell).not.toContain("수집중");
    expect(row).toContain("15,824,748 토큰");
    expect(row).toContain("1M 토큰당");
    expect(row).not.toContain("확인분 합산");
    expect(row).not.toContain("Cowork");
  });

  it("includes the newly observed Codex activity of Lim Seongbeom and Choi Jisook", () => {
    reporting.month = "2026-10";
    const rows = renderToString(<App />).split("</tr>");
    for (const [email, tokens] of [["sblim0519@riskzero.kr", "11,716,489"], ["jsc@riskzero.kr", "29,096,621"]]) {
      expect(rows.find(row => row.includes(email))).toContain(`${tokens} 토큰`);
    }
  });
});
