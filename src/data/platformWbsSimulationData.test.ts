import { describe, expect, it } from "vitest";
import { platformWbsSimulationData } from "./platformWbsSimulationData";

describe("platformWbsSimulationData", () => {
  it("covers all 23 platform development members with a clear simulation boundary", () => {
    expect(platformWbsSimulationData.source.mode).toBe("simulation");
    expect(platformWbsSimulationData.summary.memberCount).toBe(23);
    expect(new Set(platformWbsSimulationData.members.map((member) => member.email)).size).toBe(23);
    expect(platformWbsSimulationData.members.find((member) => member.displayName === "송인나 대리")).toMatchObject({
      email: "songinna@riskzero.kr",
      project: "신규 플랫폼",
      workPackage: "QA 시나리오",
    });
    expect(platformWbsSimulationData.members.find((member) => member.displayName === "최종윤 이사")?.email)
      .toBe("drager72@riskzero.kr");
    expect(platformWbsSimulationData.members.find((member) => member.displayName === "이창섭 부장")?.email)
      .toBe("cslee@riskzero.kr");
    expect(platformWbsSimulationData.members.find((member) => member.displayName === "윤종호 부장")?.email)
      .toBe("jhyun@riskzero.kr");
  });

  it("reconciles task counts, progress averages, and delay rules", () => {
    expect(platformWbsSimulationData.summary.completedTaskCount).toBe(
      platformWbsSimulationData.members.reduce((sum, member) => sum + member.completedTaskCount, 0),
    );
    expect(platformWbsSimulationData.summary.delayedMemberCount).toBe(6);
    expect(
      platformWbsSimulationData.members.filter((member) => member.status === "delayed")
        .every((member) => member.scheduleVariance <= -5),
    ).toBe(true);
    expect(platformWbsSimulationData.source.requiredColumns).toContain("담당자 이메일");
  });
});
