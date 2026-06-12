import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const rootDir = process.cwd();
const localScript = path.join("scripts", "run-notion-prompt-usage-collector.mjs");
const railwayBinary = process.env.RAILWAY_CLI_PATH || "/opt/homebrew/bin/railway";
const insideRailwayRuntime = Boolean(
  process.env.RAILWAY_PROJECT_ID || process.env.RAILWAY_ENVIRONMENT_ID || process.env.RAILWAY_SERVICE_ID,
);
const preferLocal = process.env.NOTION_PROMPT_USAGE_RUNTIME === "local";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    encoding: "utf8",
    ...options,
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  return result;
}

function fallbackToLocal(reason) {
  if (reason) {
    console.warn(`Railway runtime unavailable for Notion collector; falling back to local env. ${reason}`);
  }

  const result = run(process.execPath, [localScript], {
    env: process.env,
  });
  process.exitCode = result.status ?? 1;
}

if (preferLocal || insideRailwayRuntime) {
  fallbackToLocal("");
} else if (!existsSync(railwayBinary)) {
  fallbackToLocal("Railway CLI not found.");
} else {
  const result = run(railwayBinary, ["run", process.execPath, localScript], {
    env: process.env,
  });

  if (result.status === 0) {
    process.exitCode = 0;
  } else {
    const stderr = `${result.stderr || ""} ${result.stdout || ""}`.trim();
    fallbackToLocal(stderr ? `Railway run failed: ${stderr}` : "Railway run failed.");
  }
}
