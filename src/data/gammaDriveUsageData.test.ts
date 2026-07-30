import { describe, expect, it } from "vitest";
import { gammaDriveUsageData } from "./gammaDriveUsageData";

const sumBy = <T>(items: T[], select: (item: T) => number) =>
  items.reduce((sum, item) => sum + select(item), 0);

describe("Gamma Drive usage snapshot", () => {
  it("reconciles artifact, format, page, and topic totals", () => {
    const data = gammaDriveUsageData;

    expect(data.artifacts).toHaveLength(data.artifactCount);
    expect(data.googleSlidesCount + data.pdfCount).toBe(data.artifactCount);
    expect(data.artifacts.filter((artifact) => artifact.format === "Google Slides")).toHaveLength(
      data.googleSlidesCount,
    );
    expect(data.artifacts.filter((artifact) => artifact.format === "PDF")).toHaveLength(data.pdfCount);
    expect(sumBy(data.artifacts, (artifact) => artifact.slideCount)).toBe(data.totalPages);
    expect(sumBy(data.topicMix, (topic) => topic.count)).toBe(data.artifactCount);
  });
});
