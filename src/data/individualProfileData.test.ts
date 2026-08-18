import { describe, expect, it } from "vitest";
import { initialAiToolApprovalData } from "./aiToolApprovalData";
import {
  individualProfileDataByEmail,
  joJooyeonProfileData,
  kimDaeilProfileData,
  kimJaewooProfileData,
  leeHyeongbaeProfileData,
  limSeongbeomProfileData,
  parkYeonseokProfileData,
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
      "shared-account:kim-daeil",
      "shared-account:park-yeonseok",
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
        "Claude Team Plan Standard",
        "Genspark Pro",
      ]);
      expect(records.reduce((sum, record) => sum + record.monthlyUsd, 0)).toBeCloseTo(299.99, 2);
      expect(records.reduce((sum, record) => sum + record.monthlyKrw, 0)).toBeCloseTo(445_485.15, 2);
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
      "Claude Team Plan Standard",
    ]);
    expect(records.reduce((sum, record) => sum + record.monthlyUsd, 0)).toBe(135);
    expect(records.reduce((sum, record) => sum + record.monthlyKrw, 0)).toBe(200_475);
  });
});

describe("Claude subscribed-account Drive profiles", () => {
  const cases = [
    {
      profile: kimDaeilProfileData,
      folderId: "1PV6ISnJ9W86MP1grcOxntHo2eBkCd7NM",
      physicalFiles: 39,
      analyzedFiles: 46,
      archiveInnerFiles: 8,
      tools: ["Claude Team Plan Premium", "Gemini(Google Workspace)"],
      monthlyUsd: 140.12,
      monthlyKrw: 208_078.2,
    },
    {
      profile: parkYeonseokProfileData,
      folderId: "11K6a5HMGcqUkP1CAEDh8TDQ8lD4ixMJs",
      physicalFiles: 10,
      analyzedFiles: 13,
      archiveInnerFiles: 4,
      tools: ["chatGPT Pro(20배)", "Claude Team Plan Premium", "Gemini(Google Workspace)"],
      monthlyUsd: 360.12,
      monthlyKrw: 534_778.2,
    },
  ];

  it("reconciles Drive files and ZIP-internal documents without double-counting the archive", () => {
    for (const { profile, folderId, physicalFiles, analyzedFiles, archiveInnerFiles } of cases) {
      expect(profile.drive.folderUrl).toContain(folderId);
      expect(profile.drive.scanErrors).toBe(0);
      expect(profile.drive.scannedFolderCount).toBe(profile.drive.childFolderCount + 1);
      expect(profile.drive.fileCount).toBe(physicalFiles);
      expect(profile.drive.analyzedFileCount).toBe(analyzedFiles);
      expect(profile.drive.outputMetricValue).toBe(archiveInnerFiles);
      expect(profile.promptTopics.reduce((sum, item) => sum + item.count, 0)).toBe(
        analyzedFiles,
      );
      expect(profile.fileBreakdown.reduce((sum, item) => sum + item.count, 0)).toBe(
        analyzedFiles,
      );
      expect(profile.dailyPromptCounts).toEqual([
        { date: "2026-08-07", prompts: analyzedFiles },
      ]);
      expect(profile.monthlyPromptCounts).toEqual([
        { month: "2026-08", prompts: analyzedFiles },
      ]);
    }
  });

  it("links each profile to the current fixed subscription records", () => {
    for (const { profile, tools, monthlyUsd, monthlyKrw } of cases) {
      const records = initialAiToolApprovalData.records.filter((record) =>
        record.owner.startsWith(profile.approvalOwner),
      );

      expect(profile.accountLabel).toBe("Claude 가입 계정 사용");
      expect(records.map((record) => record.tool)).toEqual(tools);
      expect(records.reduce((sum, record) => sum + record.monthlyUsd, 0)).toBeCloseTo(monthlyUsd, 2);
      expect(records.reduce((sum, record) => sum + record.monthlyKrw, 0)).toBeCloseTo(monthlyKrw, 2);
    }
  });
});
