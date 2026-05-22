import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = process.cwd();
const defaultCreditUrl = "https://gamma.app/";
const defaultSnapshotFileName = "gamma-credit-snapshot.local.json";

export function extractGammaCreditsFromText(text, { customPattern = "" } = {}) {
  const normalizedText = String(text ?? "").replace(/\u00a0/g, " ");
  const lines = normalizedText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const creditLines = lines.filter((line) => /credit|credits|크레딧/i.test(line));
  const patterns = [
    customPattern ? new RegExp(customPattern, "i") : null,
    /(?:remaining|available|balance|left|잔여|남은|보유)[^\d]{0,30}(\d[\d,]*)\s*(?:credits?|크레딧)?/i,
    /(\d[\d,]*)\s*(?:credits?|크레딧)(?:[^\d]{0,30}(?:remaining|available|balance|left|잔여|남은|보유))?/i,
    /(?:credits?|크레딧)[^\d]{0,30}(\d[\d,]*)/i,
  ].filter(Boolean);

  for (const line of creditLines) {
    for (const pattern of patterns) {
      const match = line.match(pattern);
      const value = match ? parseCreditNumber(match[1]) : null;
      if (typeof value === "number") {
        return {
          credits: value,
          matchedText: line,
          candidates: creditLines.slice(0, 12),
        };
      }
    }
  }

  return {
    credits: null,
    matchedText: "",
    candidates: creditLines.slice(0, 12),
  };
}

export function buildGammaCreditSnapshot({
  collectedAt = new Date(),
  credits = null,
  matchedText = "",
  candidates = [],
  status = "주의",
  note = "",
  url = defaultCreditUrl,
} = {}) {
  return {
    source: {
      name: "Gamma 웹 크레딧 크롤링",
      collectedAt: collectedAt.toISOString(),
      status,
      note,
      url,
    },
    currentCreditsRemaining: credits,
    matchedText,
    candidates,
  };
}

async function runCli() {
  const env = {
    ...process.env,
    ...(await readLocalEnv(path.join(rootDir, ".env.local"))),
  };
  const snapshot = await collectGammaCreditsFromWeb({ env, targetRootDir: rootDir });
  const outputPaths = await writeGammaCreditSnapshot(snapshot, env);

  console.log(`Wrote ${outputPaths.map((outputPath) => path.relative(rootDir, outputPath)).join(", ")}`);
  const creditLabel =
    typeof snapshot.currentCreditsRemaining === "number"
      ? `${snapshot.currentCreditsRemaining.toLocaleString("en-US")} credits`
      : "credits not found";
  console.log(`Gamma web credits: ${snapshot.source.status} · ${creditLabel} · ${snapshot.source.note}`);
}

async function collectGammaCreditsFromWeb({ env = process.env, targetRootDir = process.cwd() } = {}) {
  const gammaUrl = env.GAMMA_CREDIT_URL || defaultCreditUrl;
  const userDataDir = path.resolve(targetRootDir, env.GAMMA_PLAYWRIGHT_USER_DATA_DIR || ".gamma-playwright-profile");
  const headless = String(env.GAMMA_CRAWL_HEADLESS ?? "true").toLowerCase() !== "false";
  const loginWaitMs = parsePositiveInt(env.GAMMA_LOGIN_WAIT_MS, headless ? 15000 : 180000);
  const email = env.GAMMA_LOGIN_EMAIL || "";
  const password = env.GAMMA_LOGIN_PASSWORD || "";

  let context;
  try {
    const { chromium } = await import("playwright");
    context = await launchPersistentGammaContext(chromium, userDataDir, { headless, env });
    const page = context.pages()[0] ?? (await context.newPage());
    await page.goto(gammaUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(3000);

    let extraction = await extractCreditsFromPage(page, env);
    if (typeof extraction.credits === "number") {
      return buildGammaCreditSnapshot({
        ...extraction,
        status: "정상",
        note: "Gamma 로그인 세션에서 잔여 크레딧을 수집했습니다.",
        url: page.url(),
      });
    }

    await maybeLogin(page, { email, password, loginWaitMs });
    extraction = await extractCreditsFromPage(page, env);
    if (typeof extraction.credits === "number") {
      return buildGammaCreditSnapshot({
        ...extraction,
        status: "정상",
        note: "Gamma 로그인 후 잔여 크레딧을 수집했습니다.",
        url: page.url(),
      });
    }

    return buildGammaCreditSnapshot({
      ...extraction,
      status: "주의",
      note: headless
        ? "Gamma 크레딧 텍스트를 찾지 못했습니다. 최초 1회 GAMMA_CRAWL_HEADLESS=false로 로그인 세션을 저장해 주세요."
        : "로그인 화면 또는 크레딧 표시 위치를 확인해야 합니다.",
      url: page.url(),
    });
  } catch (error) {
    return buildGammaCreditSnapshot({
      status: "주의",
      note: `Gamma 웹 크롤링 실패: ${shortenError(error instanceof Error ? error.message : String(error))}`,
      url: gammaUrl,
    });
  } finally {
    await context?.close();
  }
}

async function launchPersistentGammaContext(chromium, userDataDir, { headless, env }) {
  const launchOptions = {
    headless,
    viewport: { width: 1365, height: 900 },
  };
  const channel = env.GAMMA_PLAYWRIGHT_CHANNEL || "chrome";

  try {
    return await chromium.launchPersistentContext(userDataDir, { ...launchOptions, channel });
  } catch (error) {
    if (env.GAMMA_PLAYWRIGHT_CHANNEL) throw error;
    return chromium.launchPersistentContext(userDataDir, launchOptions);
  }
}

async function maybeLogin(page, { email, password, loginWaitMs }) {
  await clickByText(page, ["Log in", "Login", "Sign in", "Continue", "시작하기", "로그인"]);
  await page.waitForTimeout(1500);

  if (email) {
    await fillFirstVisible(page, [
      'input[type="email"]',
      'input[name="email"]',
      'input[autocomplete="email"]',
      'input[placeholder*="email" i]',
    ], email);
    await clickByText(page, ["Continue", "Next", "다음", "계속"]);
    await page.waitForTimeout(1500);
  }

  if (password) {
    await fillFirstVisible(page, [
      'input[type="password"]',
      'input[name="password"]',
      'input[autocomplete="current-password"]',
    ], password);
    await clickByText(page, ["Log in", "Login", "Sign in", "Next", "다음", "로그인"]);
  }

  if (!email || !password) {
    await page.waitForTimeout(loginWaitMs);
    return;
  }

  await page.waitForTimeout(Math.min(loginWaitMs, 20000));
}

async function extractCreditsFromPage(page, env) {
  const selector = env.GAMMA_CREDIT_TEXT_SELECTOR || "";
  if (selector) {
    const locator = page.locator(selector);
    if ((await locator.count()) > 0) {
      const text = await locator.first().innerText({ timeout: 5000 });
      return extractGammaCreditsFromText(text, { customPattern: env.GAMMA_CREDIT_REGEX });
    }
  }

  const text = await page.locator("body").innerText({ timeout: 10000 });
  return extractGammaCreditsFromText(text, { customPattern: env.GAMMA_CREDIT_REGEX });
}

async function fillFirstVisible(page, selectors, value) {
  for (const selector of selectors) {
    const locator = page.locator(selector);
    const count = await locator.count();
    for (let index = 0; index < count; index += 1) {
      const item = locator.nth(index);
      if (!(await item.isVisible().catch(() => false))) continue;
      await item.fill(value, { timeout: 5000 });
      return true;
    }
  }
  return false;
}

async function clickByText(page, labels) {
  for (const label of labels) {
    const locator = page.getByText(label, { exact: false });
    const count = await locator.count().catch(() => 0);
    for (let index = 0; index < Math.min(count, 5); index += 1) {
      const item = locator.nth(index);
      if (!(await item.isVisible().catch(() => false))) continue;
      await item.click({ timeout: 5000 }).catch(() => {});
      return true;
    }
  }
  return false;
}

async function writeGammaCreditSnapshot(snapshot, env = process.env) {
  const outputPaths = getGammaCreditOutputPaths(env);
  for (const outputPath of outputPaths) {
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`);
  }
  return outputPaths;
}

async function readLocalEnv(filePath) {
  if (!existsSync(filePath)) return {};

  const text = await readFile(filePath, "utf8");
  const entries = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const index = trimmed.indexOf("=");
    if (index < 0) continue;

    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
    entries[key] = value;
  }
  return entries;
}

function getGammaCreditOutputPaths(env) {
  const paths = [path.join(rootDir, "public", defaultSnapshotFileName)];

  if (existsSync(path.join(rootDir, "dist"))) {
    paths.push(path.join(rootDir, "dist", defaultSnapshotFileName));
  }

  if (env.GAMMA_CREDIT_OUTPUT_PATH) {
    paths.push(path.resolve(rootDir, env.GAMMA_CREDIT_OUTPUT_PATH));
  }

  return [...new Set(paths)];
}

function parseCreditNumber(value) {
  const parsed = Number(String(value ?? "").replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function parsePositiveInt(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : fallback;
}

function shortenError(error) {
  return String(error ?? "알 수 없는 오류").replace(/\s+/g, " ").slice(0, 140);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  await runCli();
}
