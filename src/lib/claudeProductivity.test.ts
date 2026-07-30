import { describe, expect, it } from "vitest";
import { initialClaudeTeamUsageData } from "../data/claudeTeamUsageData";
import { buildClaudeProductivitySignals } from "./claudeProductivity";

describe("Claude productivity signals", () => {
  it("classifies the stable top cohort from Claude Code output and efficiency", () => {
    const signals = buildClaudeProductivitySignals(initialClaudeTeamUsageData.users);

    expect(signals.get("wody@riskzero.kr")?.level).toBe("top");
    expect(signals.get("jaewoo.kim@riskzero.kr")?.level).toBe("top");
    expect(signals.get("kys0392@riskzero.kr")?.level).toBe("top");
    expect(signals.get("hchbae1001@riskzero.kr")?.level).toBe("top");
    expect(signals.get("jisub1221@riskzero.kr")?.level).toBe("efficient");
    expect(signals.get("woosung.jeon@riskzero.kr")?.level).toBe("high-output");
  });

  it("separates small samples and users without Claude Code output", () => {
    const signals = buildClaudeProductivitySignals(initialClaudeTeamUsageData.users);

    expect(signals.get("sjlim@riskzero.kr")?.level).toBe("insufficient");
    expect(signals.get("ykchj1011@riskzero.kr")?.level).toBe("insufficient");
    expect(signals.get("mjlee0828@riskzero.kr")?.level).toBe("no-code");
  });
});
