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
});
