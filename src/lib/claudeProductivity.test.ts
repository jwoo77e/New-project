import { describe, expect, it } from "vitest";
import { initialClaudeTeamUsageData } from "../data/claudeTeamUsageData";
import { buildClaudeProductivitySignals } from "./claudeProductivity";

describe("Claude productivity signals", () => {
  it("classifies the current partial-month cohort from output and efficiency", () => {
    const signals = buildClaudeProductivitySignals(initialClaudeTeamUsageData.users);

    expect(signals.get("wody@riskzero.kr")?.level).toBe("top");
    expect(signals.get("woosung.jeon@riskzero.kr")?.level).toBe("top");
    expect(signals.get("kys0392@riskzero.kr")?.level).toBe("balanced");
    expect(signals.get("huizhen0227@riskzero.kr")?.level).toBe("balanced");
    expect(signals.get("jaewoo.kim@riskzero.kr")?.level).toBe("insufficient");
  });

  it("separates missing efficiency denominators from users without code output", () => {
    const signals = buildClaudeProductivitySignals(initialClaudeTeamUsageData.users);

    expect(signals.get("sjlim@riskzero.kr")?.level).toBe("insufficient");
    expect(signals.get("rkgmf1230@riskzero.kr")?.level).toBe("insufficient");
    expect(signals.get("ykchj1011@riskzero.kr")?.level).toBe("no-code");
    expect(signals.get("mjlee0828@riskzero.kr")?.level).toBe("insufficient");
  });

  it("labels the comparison as an activity signal rather than an HR performance score", () => {
    const signals = buildClaudeProductivitySignals(initialClaudeTeamUsageData.users);
    const signal = signals.get("wody@riskzero.kr");

    expect(signal?.label).toBe("높은 활동 신호");
    expect(signal?.detail).toContain("인사평가 점수가 아닌 운영 참고 신호");
  });
});
