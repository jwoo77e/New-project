import { describe, expect, it } from "vitest";
import { driveArtifactRepositoryData } from "../data/driveArtifactRepositoryData";
import { buildDriveArtifactDailyTrend } from "./driveArtifactTrend";

describe("buildDriveArtifactDailyTrend", () => {
  it("reconciles the daily trend with the repository total", () => {
    const trend = buildDriveArtifactDailyTrend(driveArtifactRepositoryData);

    expect(trend.owners).toEqual(["김재우", "이형배"]);
    expect(trend.points[0]?.date).toBe("2026-06-21");
    expect(trend.points[trend.points.length - 1]?.date).toBe("2026-07-22");
    expect(trend.points.reduce((sum, point) => sum + point.total, 0)).toBe(
      driveArtifactRepositoryData.totals.files,
    );
    expect(trend.points[trend.points.length - 1]?.cumulative).toBe(driveArtifactRepositoryData.totals.files);
  });

  it("groups UTC timestamps by their calendar date in Korea", () => {
    const trend = buildDriveArtifactDailyTrend({
      source: { period: "2026-07-01 ~ 2026-07-02" },
      repositories: [
        {
          owner: "테스트 사용자",
          artifacts: [
            { createdAt: "2026-06-30T16:00:00.000Z", kind: "문서 산출물" },
            { createdAt: "2026-07-02T14:59:59.000Z", kind: "프롬프트" },
          ],
        },
      ],
    });

    expect(trend.points.map((point) => [point.date, point.total])).toEqual([
      ["2026-07-01", 1],
      ["2026-07-02", 1],
    ]);
    expect(trend.points[trend.points.length - 1]?.cumulative).toBe(2);
  });
});
