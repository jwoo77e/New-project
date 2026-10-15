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
    expect(html).toContain("10-14까지 누적");
    expect(html).toContain("10월 2주차까지 누적");
    expect(html).toContain("2026-10-01 ~ 2026-10-14");
    expect(html).toContain("485,323줄");
    expect(html).toContain("676건");
  });

  it("renders the October sum for users active in only one week without a period mismatch", () => {
    const rows = renderToString(<App />).split("</tr>");
    for (const [email, tokens] of [["day@riskzero.kr", "13,789,658"], ["woals1329@riskzero.kr", "1,347,200"]]) {
      const row = rows.find(row => row.includes(email));
      expect(row).toBeDefined();
      expect(row).toContain(`${tokens} 토큰`);
      expect(row).toContain("1M 토큰당");
      expect(row).not.toContain("기간 불일치");
      expect(row).not.toContain("수집된 주차만 합산");
    }
  });
});
