import { describe, expect, it } from "vitest";
import { initialAiToolApprovalData } from "./aiToolApprovalData";
import {
  individualProfileDataByEmail,
  joJooyeonProfileData,
  kimJaewooProfileData,
  leeHyeongbaeProfileData,
  limSeongbeomProfileData,
} from "./individualProfileData";

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

describe("strategy shared-account profiles", () => {
  const profiles = [limSeongbeomProfileData, joJooyeonProfileData];

  it("exposes separate profile routes backed by the same exhaustive Drive scan", () => {
    expect(Object.keys(individualProfileDataByEmail)).toEqual([
      "jaewoo.kim@riskzero.kr",
      "shared-account:lim-seongbeom",
      "shared-account:jo-jooyeon",
      "shared-account:lee-hyeongbae",
    ]);

    for (const profile of profiles) {
      expect(profile.attributionMode).toBe("shared");
      expect(profile.drive.folderUrl).toContain("1NK9PNOb_fbByPSSz0AqydMYj5lUK2Q25");
      expect(profile.sourceLinks?.map((source) => source.url)).toEqual([
        expect.stringContaining("1NK9PNOb_fbByPSSz0AqydMYj5lUK2Q25"),
        expect.stringContaining("1MFJpVf9QfLNbzwLIE27N3b9yua9uYsa2"),
      ]);
      expect(profile.drive.scanErrors).toBe(0);
      expect(profile.drive.scannedFolderCount).toBe(
        profile.drive.childFolderCount + (profile.drive.rootFolderCount ?? 1),
      );
      expect(profile.drive.fileCount).toBe(237);
      expect(profile.drive.promptFiles).toBe(42);
      expect(profile.drive.outputAndSupportFiles).toBe(191);
      expect(profile.fileBreakdown.reduce((sum, item) => sum + item.count, 0)).toBe(
        profile.drive.fileCount,
      );
      expect(profile.promptTopics.reduce((sum, item) => sum + item.count, 0)).toBe(
        profile.drive.promptFiles,
      );
      expect(profile.dailyPromptCounts.reduce((sum, item) => sum + item.prompts, 0)).toBe(
        profile.drive.promptFiles,
      );
      expect(profile.monthlyPromptCounts).toEqual([
        { month: "2026-06", prompts: 10 },
        { month: "2026-07", prompts: 26 },
        { month: "2026-08", prompts: 6 },
      ]);
    }
  });

  it("uses Lim Seongbeom's fixed subscription cost for both profiles", () => {
    for (const profile of profiles) {
      const records = initialAiToolApprovalData.records.filter((record) =>
        record.owner.startsWith(profile.approvalOwner),
      );

      expect(profile.approvalOwner).toBe("임성범 부장");
      expect(records.map((record) => record.tool)).toEqual([
        "Claude Pro Max 20",
        "Genspark Pro",
      ]);
      expect(records.reduce((sum, record) => sum + record.monthlyUsd, 0)).toBeCloseTo(494.99, 2);
      expect(records.reduce((sum, record) => sum + record.monthlyKrw, 0)).toBeCloseTo(735_060.15, 2);
    }
  });
});

describe("leeHyeongbaeProfileData", () => {
  it("reconciles the recursive Drive inventory and stored output signals", () => {
    const data = leeHyeongbaeProfileData;

    expect(data.attributionMode).toBe("shared");
    expect(data.drive.folderUrl).toContain("1OFfN4APAViKNtgURnmn9W51jSvcxy6fg");
    expect(data.drive.scanErrors).toBe(0);
    expect(data.drive.scannedFolderCount).toBe(data.drive.childFolderCount + 1);
    expect(data.drive.fileCount).toBe(656);
    expect(data.drive.promptFiles).toBe(264);
    expect(data.drive.outputAndSupportFiles).toBe(283);
    expect(data.fileBreakdown.reduce((sum, item) => sum + item.count, 0)).toBe(
      data.drive.fileCount,
    );
    expect(
      data.drive.promptFiles + data.drive.outputAndSupportFiles + data.drive.archiveFiles,
    ).toBe(data.drive.fileCount);
  });

  it("reconciles classified conversation records and snapshot activity", () => {
    const data = leeHyeongbaeProfileData;

    expect(data.promptTopics.reduce((sum, item) => sum + item.count, 0)).toBe(
      data.drive.promptFiles,
    );
    expect(data.dailyPromptCounts.reduce((sum, item) => sum + item.prompts, 0)).toBe(
      data.drive.promptFiles,
    );
    expect(data.monthlyPromptCounts).toEqual([
      { month: "2026-07", prompts: 209 },
      { month: "2026-08", prompts: 55 },
    ]);
  });

  it("uses Lee Hyeongbae's two fixed subscriptions", () => {
    const records = initialAiToolApprovalData.records.filter((record) =>
      record.owner.startsWith(leeHyeongbaeProfileData.approvalOwner),
    );

    expect(records.map((record) => record.tool)).toEqual([
      "chatGPT Pro(5배)",
      "Claude Pro Max 5",
    ]);
    expect(records.reduce((sum, record) => sum + record.monthlyUsd, 0)).toBe(220);
    expect(records.reduce((sum, record) => sum + record.monthlyKrw, 0)).toBe(326_700);
  });
});
