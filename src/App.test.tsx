import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import App from "./App";

describe("dashboard startup", () => {
  it("loads the complete app and renders the initial page with current subscription data", () => {
    const html = renderToString(<App />);
    expect(html).toContain("AI CONTROL HUB");
    expect(html).toContain("개인별 AI 활동 근거");
    expect(html).toContain("AI 도구 결재 현황");
    expect(html).toContain('<option value="2026-10" selected="">');
    expect(html).toContain("10-28까지 누적");
    expect(html).toContain("10월 4주차까지 누적");
    expect(html).toContain("2026-10-01 ~ 2026-10-28");
    expect(html).toContain("803,306줄");
    expect(html).toContain("1,276건");
    expect(html).toContain("김대영 과장");
    expect(html).toContain("46,870,308 토큰");
    expect(html).not.toContain("hchbae1001@riskzero.kr");
    expect(html).not.toContain("배현철 사원");
  });

  it("renders the October sum for users active in only one week without a period mismatch", () => {
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

  it("retains Park Sujin's Claude non-use with complete Codex coverage through week four", () => {
    const row = renderToString(<App />).split("</tr>").find(row => row.includes("sjpark@riskzero.kr"));
    expect(row).toBeDefined();
    const claudeCell = row!.split("</td>")[1];
    expect(claudeCell).toContain("미사용");
    expect(claudeCell).not.toContain("수집중");
    expect(row).toContain("7,139,913 토큰");
    expect(row).toContain("1M 토큰당");
    expect(row).not.toContain("확인분 합산");
    expect(row).not.toContain("Cowork");
  });

  it("includes the newly observed Codex activity of Lim Seongbeom and Choi Jisook", () => {
    const rows = renderToString(<App />).split("</tr>");
    for (const [email, tokens] of [["sblim0519@riskzero.kr", "445,930"], ["jsc@riskzero.kr", "22,865,423"]]) {
      expect(rows.find(row => row.includes(email))).toContain(`${tokens} 토큰`);
    }
  });
});
