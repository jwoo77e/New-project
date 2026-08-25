import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { collectDriveZipArtifacts } from "./collect-drive-zip-artifacts.mjs";

describe("collectDriveZipArtifacts", () => {
  it("records invalid zip verification failures without aborting the snapshot", async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), "drive-zip-test-"));
    const inputDir = path.join(tempDir, "input");
    const outputPath = path.join(tempDir, "snapshot.json");

    try {
      await mkdir(inputDir, { recursive: true });
      await writeFile(path.join(inputDir, "broken.zip"), "not a zip");

      const snapshot = await collectDriveZipArtifacts({
        inputDir,
        outputPath,
        owner: "테스트",
        folderUrl: "https://drive.google.com/drive/folders/test",
        collectedAt: new Date("2026-08-25T00:00:00.000Z"),
      });

      expect(snapshot.totals.archives).toBe(1);
      expect(snapshot.totals.extractedFiles).toBe(0);
      expect(snapshot.archives[0]).toMatchObject({
        archiveName: "broken.zip",
        extractedFiles: 0,
        cleanupStatus: "검증 실패 후 결합 zip과 압축 해제 폴더는 삭제됨",
      });
      expect(snapshot.archives[0].verificationStatus).toContain(
        "End-of-central-directory signature not found",
      );
      await expect(readFile(outputPath, "utf8")).resolves.toContain("broken.zip");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });
});
