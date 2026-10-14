import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import App from "./App";

describe("dashboard startup", () => {
  it("loads the complete app and renders the initial page with current subscription data", () => {
    const html = renderToString(<App />);
    expect(html).toContain("AI CONTROL HUB");
    expect(html).toContain("개인별 AI 활동 근거");
    expect(html).toContain("AI 도구 결재 현황");
  });
});
