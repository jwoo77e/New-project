import { describe, expect, it } from "vitest";
import { platformWbsSimulationData } from "./platformWbsSimulationData";

describe("platformWbsSimulationData", () => {
  it("covers all 24 platform development members with a clear simulation boundary", () => {
    expect(platformWbsSimulationData.source.mode).toBe("simulation");
    expect(platformWbsSimulationData.summary.memberCount).toBe(24);
    expect(new Set(platformWbsSimulationData.members.map((member) => member.email)).size).toBe(24);
    expect(platformWbsSimulationData.members.find((member) => member.displayName === "박수진 과장")).toMatchObject({
      email: "sjpark@riskzero.kr",
      project: "신규 플랫폼",
      workPackage: "품질 기준 관리",
    });
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

  it("reconciles task counts and keeps every simulated member on track", () => {
    expect(platformWbsSimulationData.summary.completedTaskCount).toBe(
      platformWbsSimulationData.members.reduce((sum, member) => sum + member.completedTaskCount, 0),
    );
    expect(platformWbsSimulationData.summary.normalMemberCount).toBe(24);
    expect(
      platformWbsSimulationData.members.every(
        (member) =>
          member.status === "on-track" &&
          member.delayedTaskCount === 0 &&
          member.blocker === null &&
          member.forecastEndDate <= member.plannedEndDate,
      ),
    ).toBe(true);
    expect(platformWbsSimulationData.source.requiredColumns).toContain("담당자 이메일");
  });
});
