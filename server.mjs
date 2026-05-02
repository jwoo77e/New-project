import { createReadStream, existsSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { collectApiUsage, loadApiUsageEnv } from "./scripts/fetch-api-usage.mjs";

const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist");
const port = Number(process.env.PORT ?? 4173);
const apiUsageCacheMs = Number(process.env.API_USAGE_CACHE_MS ?? 5 * 60 * 1000);

let apiUsageCache = {
  expiresAt: 0,
  promise: null,
  snapshot: null,
};

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
};

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

    if (url.pathname === "/api/api-usage") {
      await handleApiUsage(url, response);
      return;
    }

    if (url.pathname === "/api/health") {
      sendJson(response, 200, {
        ok: true,
        service: "ai-cost-dashboard",
        runtimeApi: true,
      });
      return;
    }

    await serveStatic(url.pathname, response);
  } catch (error) {
    sendJson(response, 500, {
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`AI cost dashboard listening on http://0.0.0.0:${port}`);
});

async function handleApiUsage(url, response) {
  const requestedDays = Number(url.searchParams.get("days") ?? 7);
  const refresh = url.searchParams.get("refresh") === "1";
  const now = Date.now();

  response.setHeader("cache-control", "no-store");

  if (!refresh && apiUsageCache.snapshot && apiUsageCache.expiresAt > now) {
    sendJson(response, 200, apiUsageCache.snapshot);
    return;
  }

  if (!apiUsageCache.promise) {
    apiUsageCache.promise = collectRuntimeApiUsage(requestedDays).finally(() => {
      apiUsageCache.promise = null;
    });
  }

  const snapshot = await apiUsageCache.promise;
  apiUsageCache = {
    expiresAt: Date.now() + apiUsageCacheMs,
    promise: null,
    snapshot,
  };
  sendJson(response, 200, snapshot);
}

async function collectRuntimeApiUsage(requestedDays) {
  const env = await loadApiUsageEnv({ targetRootDir: rootDir });
  return collectApiUsage({
    env,
    targetRootDir: rootDir,
    requestedDays,
    collectedAt: new Date(),
    mode: "운영 런타임 API 수집",
  });
}

async function serveStatic(pathname, response) {
  if (!existsSync(distDir)) {
    sendJson(response, 503, {
      error: "dist directory is missing. Run npm run build before starting the server.",
    });
    return;
  }

  const safePathname = decodeURIComponent(pathname).replace(/^\/+/, "");
  const candidatePath = path.normalize(path.join(distDir, safePathname || "index.html"));
  const filePath = isInsideDist(candidatePath) ? candidatePath : path.join(distDir, "index.html");
  const resolvedPath = await resolveStaticPath(filePath);

  if (!resolvedPath) {
    sendText(response, 404, "Not found");
    return;
  }

  const extension = path.extname(resolvedPath);
  response.statusCode = 200;
  response.setHeader("content-type", mimeTypes[extension] ?? "application/octet-stream");
  response.setHeader(
    "cache-control",
    extension === ".html" || extension === ".json" ? "no-store" : "public, max-age=31536000, immutable",
  );
  createReadStream(resolvedPath).pipe(response);
}

async function resolveStaticPath(filePath) {
  try {
    const fileStat = await stat(filePath);
    if (fileStat.isFile()) return filePath;
  } catch {
    // Fall through to the SPA entry point.
  }

  const hasExtension = Boolean(path.extname(filePath));
  const indexPath = path.join(distDir, "index.html");
  if (!hasExtension && existsSync(indexPath)) return indexPath;
  return null;
}

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.end(`${JSON.stringify(payload, null, 2)}\n`);
}

function sendText(response, statusCode, message) {
  response.statusCode = statusCode;
  response.setHeader("content-type", "text/plain; charset=utf-8");
  response.end(message);
}

function isInsideDist(filePath) {
  const relativePath = path.relative(distDir, filePath);
  return relativePath === "" || (!relativePath.startsWith("..") && !path.isAbsolute(relativePath));
}
