import { describe, expect, it } from "vitest";
import { kimJaewooProfileData } from "./individualProfileData";

describe("kimJaewooProfileData", () => {
  it("reconciles the exhaustive Drive inventory", () => {
    const data = kimJaewooProfileData;

    expect(data.drive.scanErrors).toBe(0);
    expect(data.drive.scannedFolderCount).toBe(data.drive.childFolderCount + 1);
    expect(data.fileBreakdown.reduce((sum, item) => sum + item.count, 0)).toBe(
      data.drive.fileCount,
    );
    expect(data.drive.promptFiles + data.drive.responseFiles).toBe(696);
    expect(data.drive.outputAndSupportFiles + data.drive.archiveFiles + 696).toBe(
      data.drive.fileCount,
    );
  });

  it("reconciles prompt topics and daily prompt activity", () => {
    const data = kimJaewooProfileData;

    expect(data.promptTopics.reduce((sum, item) => sum + item.count, 0)).toBe(
      data.drive.promptFiles,
    );
    expect(data.dailyPromptCounts.reduce((sum, item) => sum + item.prompts, 0)).toBe(
      data.drive.promptFiles,
    );
    expect(data.monthlyPromptCounts).toEqual([
      { month: "2026-07", prompts: 298 },
      { month: "2026-08", prompts: 48 },
    ]);
  });
});
