import path from "node:path";
import {
  collectNotionPromptUsage,
  loadNotionPromptEnv,
  writeNotionPromptUsageSnapshot,
} from "./fetch-notion-prompt-usage.mjs";

const rootDir = process.cwd();

const env = await loadNotionPromptEnv({ targetRootDir: rootDir });
const snapshot = await collectNotionPromptUsage({
  env,
  targetRootDir: rootDir,
  collectedAt: new Date(),
});
const outputPaths = await writeNotionPromptUsageSnapshot(snapshot, env);

console.log(`Wrote ${outputPaths.map((outputPath) => path.relative(rootDir, outputPath)).join(", ")}`);
console.log(
  `Notion prompt usage: ${snapshot.source.status} · ${snapshot.totalPromptRecords.toLocaleString("en-US")} prompts · ${snapshot.totalGeneratedOutputs.toLocaleString("en-US")} outputs · ${snapshot.source.note}`,
);
