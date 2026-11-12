# AI Control Hub — Mac mini

## Current deployment (2026-11-12)

- Office URL: **http://192.168.0.15:4176/**.
- Host: `riskzero@192.168.0.15`; Apple M4 Pro, macOS, native Node.js.
- Application: `/Users/riskzero/aihub/current` points to `releases/20261112-november-alignment`. Previous releases, including `releases/20261112-november-week2`, `releases/20261109-api-usage-sync-v2`, `releases/20261105-november-week1-cost`, `releases/20261103-october-card-cost` and the initial `releases/20261105-november-week1`, are retained for rollback.
- LaunchDaemon: `/Library/LaunchDaemons/kr.riskzero.aihub.plist`, label `kr.riskzero.aihub`.
- Listener is bound to `192.168.0.15`. Only actual TCP peers in `192.168.0.0/24` and loopback are allowed. Forwarded headers do not grant access.
- Config: `/Users/riskzero/aihub/secrets/runtime.env` (0600), linked as `.env.local` inside the release. Do not put it in source control or a public directory.
- Logs: `/Users/riskzero/aihub/logs/server.log` and `server-error.log`.
- Runtime snapshots are ordinary files in the release's `public/` and `dist/` directories; preserve them across updates. There is no application database to migrate.
- Browser-uploaded Excel data is stored in that browser origin's localStorage. It is not server data and does not transfer to a different IP/domain automatically.

**Railway is controlled by the user.** The user said they would stop it manually in Railway Console after checking the new service. Do not stop, redeploy, remove, or alter Railway as part of Mac mini maintenance. Its health URL returned HTTP 404 on October 28; the cause was not investigated in this API refresh task. Git push alone still does not deploy a new Mac mini release.

The user deferred DNS, then authorized public-IP access on October 24. The user will configure the router personally. See the pending public-IP preparation below. `aihub.riskzero.ai:8443` was discussed but is not configured. Existing Way 2.0, its Caddy settings, DNS and containers remain unchanged. On October 26 the user edited API credentials directly in `runtime.env`; the validated results are below.

## November month-to-date period alignment (2026-11-12)

- Replaced the partial November weekly rollup with the five supplied Claude spend exports and Codex report for **November 1–11**. Claude monthly code uses the previously supplied November 11 cumulative `Lines accepted` values. Monthly observations replace overlapping weekly components; weekly source records remain unchanged.
- Current-roster Claude totals: **29,930,983,852 tokens / 266,511 lines / $0.00 additional cost** across 38 accounts. Codex: **4,987,640,975 tokens / 85,498 lines / $12.74 estimated additional cost** across 16 accounts. Combined: **34,918,624,827 tokens / 352,009 lines**. The 144 Claude rows retain all 39 source accounts, including departed Song Inna outside current-roster totals.
- Monthly range selection honors the actual month-to-date report end instead of assuming November 30. Claude, Codex and GitLab therefore all cover **November 1–11**. GitLab totals remain **650 non-merge / 149 merges / 351,753 additions / 155,266 deletions / 15 authors**. The month remains incomplete after November 11; per-account coverage is complete for the verified observed period. Explicit monthly source code zero is shown for observed non-Code accounts without changing historical unmeasured periods.
- All **293 tests across 40 files**, TypeScript and Vite passed in a clean candidate made from the latest remote commit plus only the selected source files. Production browser confirmed zero `기간 불일치` rows, monthly totals and code density; November week two remains **154,686 lines / 21,669,730,365 tokens / 444 non-merge commits**. Browser errors and warnings were empty.
- Frontend-only release verified health and all four served file hashes while preserving 12 runtime snapshots, nine backend modules and private settings. Previous release retained for rollback. Provenance: `current/november-alignment-deployment.json`; backup: `/Users/riskzero/aihub/backups/20261112-november-alignment/`. Local source manifests, independent audits, candidate checks and deployment verification: `output/november-alignment-20261112/`.

## November week-two individual activity (2026-11-12)

- Imported the supplied November 5–11 Claude period spend exports from all five workspaces and the Codex weekly report. Current-roster Claude totals: **18,636,312,204 tokens / 119,097 lines / $0.00 additional cost**. Codex: **3,033,418,161 tokens / 35,589 lines / $5.80 estimated additional cost**, across 16 accounts. Combined observed totals: **21,669,730,365 tokens / 154,686 lines**.
- Claude code uses `Lines accepted`: November 11 cumulative **266,511** minus November 4 cumulative **147,414** equals **119,097**. Workspace subtotals: regular **254,017 − 143,263 = 110,754**, Clevel **12,494 − 4,151 = 8,343**. Sum by email across workspaces before subtraction; Jaewoo's Clevel row is an explicit zero. Original CSVs are unchanged; isolated inputs normalize the header for the existing importer. Codex's source already reports the week and is not differenced again.
- Retained all 14 prior Claude weekly periods, all prior Codex periods/monthly reconciliations and all previously verified GitLab history. The 125 spend rows include 38 accounts, with departed Song Inna retained in raw evidence and excluded from current-roster totals. All 18 spend-only accounts have no Claude Code product activity in the complete exports; their period code zero follows the existing complete-report convention. Accounts without a weekly observation retain the existing unmeasured/non-use distinction.
- GitLab refreshed 108 projects without collection errors, using Korean authored dates November 5 00:00 through November 11 23:59:59.999. Totals: **444 non-merge commits / 106 merges / 279,274 additions / 90,302 deletions / 15 authors**. All 550 project+SHA identities and authored-date boundaries reconciled. Three oversized diffs have partial file details; their authoritative commit stats are available and included. November GitLab cumulative activity is **650 non-merge / 149 merges**.
- The initial week-two release could not separate November 1–4 spend from the cross-month first-week export and displayed a partial November 5–11 monthly rollup. The subsequent month-to-date alignment above replaces that rollup with the supplied November 1–11 exports. The week-two view continues to align Claude, Codex and GitLab to November 5–11. October retains **877,043 combined lines / 74,171,428,670 tokens / 1,620 GitLab non-merge commits**.
- The workspace's canonical source files had drifted to September while `(MBP)` copies retained the November source family. Critical copies matched the November 5 production manifest exactly; production still served that frontend hash. Restored canonical source/test files from this verified family before the new import to preserve deployed features. Recovery backups and hashes are in `output/november-week2-20261112/source-recovery*`. These recoveries are recorded separately from the new week.
- All **275 tests across 40 files** passed; the final App test syntax compatibility adjustment passed its six tests. TypeScript and Vite passed (existing large-bundle warning retained). Independent source-by-source and person-by-person audits, KST date validation and historical preservation checks passed. Production browser verified week two, representative individual lines/costs/ratios, the partial-month note and October preservation; no browser errors/warnings were observed.
- Frontend-only release: all four served files matched the pinned archive manifest, 12 runtime snapshots, nine backend modules and the private settings were preserved. Health verified; automatic rollback is configured for activation or served-hash failure. Provenance: `current/november-week2-deployment.json`; backup: `/Users/riskzero/aihub/backups/20261112-november-week2/`. Local import, recovery, audits, tests, build and verification: `output/november-week2-20261112/`.

## API collection warning and pagination repair (2026-11-09)

- Existing deployment access uses the dedicated key at `.local/macmini-deploy/id_ed25519` and host registry `.local/macmini-known-hosts`, relative to `/Users/davidkim/Documents/리스크제로/Way2.0/way 2.0/way2-app`. Use `IdentitiesOnly=yes`, `BatchMode=yes` and `StrictHostKeyChecking=yes`; never copy or print the private key.
- The last successful snapshot was November 5 at 15:00 KST. One invalid Gemini generation key caused the runtime to reject complete service-account Monitoring/Billing measurements along with other providers. The collector now distinguishes `usageCollectionComplete` from key health; the invalid `GEMINI_API_KEY` remains visibly flagged and credentials are unchanged.
- Repeated diagnostic pagination also encountered upstream 429 responses. OpenAI and Claude now request 31 daily buckets per page, reducing a 62-day usage-plus-cost collection from 18 to four requests per credential. The complete pagination and failed-data preservation guards remain in effect.
- All 289 tests in 40 files, TypeScript and Vite passed; the collection-guard mutation was caught by regression tests. Deployed only two backend modules in a copied release, preserving frontend assets, runtime snapshots and private settings. The original release remains available for rollback.
- **Synchronization completed at 09:10 KST:** a normal scheduled collection published all three providers with `usageCollectionComplete: true`. Public/dist copies and the web-served JSON match; frontend hashes are unchanged. Browser verification shows the new timestamp, recovered monthly and detailed usage, and the retained Gemini key warning. November 2–8 source-day totals are **101,324,114 tokens / $554.25**. November 9 is present with zero usage in the current provider response and remains an ongoing period. Local public/dist snapshots were also synchronized.
- Local evidence and deployment scripts: `output/api-sync-20261109/`. Production deployment provenance: `current/api-sync-deployment.json`; backup directory: `/Users/riskzero/aihub/backups/20261109-api-usage-sync-v2/`.
- Calendar selection follows Korean dates, but usage remains in the providers' daily buckets. Before 09:00 KST on Monday November 9 the latest source date was November 8 UTC; do not relabel the previous week as this week or fabricate a measured zero for the missing date.

## November week-one activity and additional costs (2026-11-05)

- Imported all 12 supplied CSVs for October 29–November 4. The user confirmed that the Codex filename ending November 5 actually covers through November 4; the original filename and confirmation are preserved in source metadata. Five Claude spend exports contain 134 rows, including separately supplied marketing, Clevel, Lee Byeonghyeon and Jo Wooksang accounts. Product/model identities were checked for overlapping spend rows before combining workspaces.
- Claude code lines use each workspace's October 31 cumulative value minus October 28 cumulative value, plus November 1–4 `Lines accepted`: regular team 202,877 + Clevel 5,213 = **208,090 lines**. The period explanation discloses this cross-month calculation and changed source header. No November monthly spend was fabricated from a week spanning two months.
- Current-roster Claude totals: **18,784,977,437 tokens, 208,090 lines and $409.61 additional cost**. Codex: **3,649,683,151 tokens, 64,711 lines and $20.07 estimated additional cost** across 16 accounts. Combined observed totals: **22,434,660,588 tokens and 272,801 lines**; reported additional costs sum to $429.68, including the estimated Codex amount. Departed staff remain excluded from roster totals while raw source evidence is retained.
- All individual Claude/Codex cost labels now say `추가 비용`. Codex imports the supplied `Estimated costs` USD field, retaining explicit zero amounts and marking values as estimates; periods without cost evidence remain unavailable rather than being filled with zero. Actual new weekly Claude observations for Lim Seongbeom and Jo Juyeon are displayed without changing their older unmeasured-period status. Park Sujin's confirmed Claude non-use remains visible.
- Refreshed 108 GitLab projects without errors and collected all 354 returned non-merge diffs. Three commits authored outside the requested Korean date range were excluded. Published **351 non-merge commits, 83 merges, 148,597 added lines and 80,154 deleted lines** across 15 authors. All 177 previously verified commits inside the week were retained; commit objects outside it were preserved. Eight newly discovered October 29–31 non-merge commits also update October's monthly GitLab total to **1,620 non-merge commits / 396 merges** (1,388,693 additions / 194,468 deletions).
- Previous Claude weekly/monthly observations and the authoritative October AI sources are unchanged. Monthly Codex aggregation uses the monthly export once and excludes overlapping weekly exports, preserving October's **74,171,428,670 combined tokens / 877,043 lines** despite the new cross-month week.
- All **285 tests in 40 files**, TypeScript and Vite passed. Production browser checks confirmed week/month filters, updated totals and ratios, newly measured marketing accounts, both additional-cost columns and absence of the old cost label. The frontend-only release passed health and all four served-file hash checks; deployment preserved 12 runtime snapshots, nine backend modules and private settings.
- Reports: `/Users/riskzero/aihub/backups/20261105-november-week1-cost/production-verification.json`; provenance: `current/november-week1-cost-deployment.json`. Local source calculations, preservation audits, test/build logs and browser screenshot: `output/november-week1-20261105/`.

## October card-cost actuals (2026-11-03)

- Imported all 239 rows from `이용내역조회_10월.xls`, sheet `sheet 1`, as October actuals. The source contains normal purchased transactions used October 1–30 and acquired October 2–31, with no cancellation, pending-purchase or discount rows. Transaction identities were checked for duplicates before import; no card or approval numbers were retained in the frontend snapshot.
- October actual cost is **16,692,274 KRW / 239 transactions**. Source column K (`매출금액`) matched the purchase amount in all 53 uniquely matched, already-purchased rows from `승인내역조회_10월23일 기준.xls`. This preserves the existing purchase-principal convention. Column M conversion fees of **30,815 KRW** are disclosed separately and excluded; principal plus those fees would be 16,723,089 KRW.
- Category additions: Claude/Anthropic 11,163,001; ChatGPT/OpenAI 4,067,070; Google/Gemini (including Workspace) 834,118; Genspark 302,357; Gamma 34,361; existing unclassified category (AWS/Railway) 291,367 KRW. The source has no department field, so October is aggregated into the existing unassigned shared-card department.
- January–September actuals and forecast adjustment records are unchanged. January–October totals reconcile across monthly, category and department views to **69,816,909 KRW / 512 transactions**. Forecast months now start in November through the existing calculation. Vendor totals retain their prior partial-history scope rather than assuming missing historical vendors had zero cost.
- Added a source-backed snapshot, an October append function with duplicate-month protection and reconciliation tests. The October-actual test failed before the update; all 281 tests in 40 files, TypeScript and Vite passed afterward. The production monthly table shows October actual 16,692,274 KRW / 239, and the cost-basis notes disclose fees and attribution.
- Frontend-only release: all four served files matched the build; 12 runtime snapshots, nine backend modules and private settings were preserved. Reports: `/Users/riskzero/aihub/backups/20261103-october-card-cost/`; provenance: `current/october-card-cost-deployment.json`. Local source audit, source comparison and screenshot: `output/october-card-cost-20261103/`.

## Kim Jaewoo October profile analysis (2026-11-03)

- The live profile showed 946 October Drive files but empty Prompt Mix and Output Highlights panels. File inventory refreshes do not generate qualitative insights; the profile's selected-month analysis only existed through September. Added October-specific analysis without falling back to prior-month content.
- Re-enumerated the designated Kim Jaewoo Drive root: 4,884 files across 1,712 scanned folders, zero errors. The October Korean creation-date total remains 946. Within October dated folders, 173 prompt files + 173 session records + 31 indexes + 561 output/support files reconcile to 938; six prior-dated files and two templates account for the other eight October-created files.
- Classified the 173 October prompts into seven work areas using their session titles and paths, with each file assigned once. These counts are prompt-record observations, not completed jobs or new-mail/commit counts. Displayed the classification basis and corrected the selected-month output/support count to 561, including intermediate files and support code.
- Read six representative source documents and added five saved-output highlights: Way 2.0 QA archive reconstruction, the site-safety dashboard design, ZeroBy chatbot/Korean-language checks, IRIS report files, and AI-trend/safety reports. Retained source limitations such as mock dashboard values, archived report scope and unverified operational results.
- The missing-month regression failed before the data correction. All 278 tests across 39 files, TypeScript and Vite passed. Production UI confirmed seven topic cards, five highlights and removal of the October collection-pending messages. The October organization-wide AI/GitLab totals remain the prior monthly release's values.
- Frontend-only release; four served assets matched the build, 12 runtime snapshots and nine backend modules were preserved, and private settings remained unchanged. Reports: `/Users/riskzero/aihub/backups/20261103-jaewoo-october-insights/`; provenance: `current/jaewoo-october-deployment.json`. Source inventory, classification audit and screenshot: local `output/kim-jaewoo-profile-20261103/`.

## October monthly close (2026-11-02)

- Imported all seven supplied October 1–31 CSVs as authoritative monthly observations, replacing the displayed October 1–28 weekly rollup. Monthly reports are used once; existing Claude/Codex weekly sources and earlier months remain unchanged, and no fifth week was derived.
- The four Claude spend exports contain 253 rows and 38 resolved accounts. Two `(unsynced user)` identities were matched to Choi Jisook and departed Bae Hyeoncheol by both provider account UUID and user ID in earlier exports. Raw retired-account evidence is retained; current-roster AI totals exclude departed employees. Kim Daeil's regular-team and Clevel product rows were checked for overlap and combined, including 309 + 42,627 = 42,936 code lines.
- Current-roster Claude totals: 229,548 requests, 60,059,386,331 tokens, 661,502 generated lines and $3,631.56 net spend. Codex: 17 accounts, 14,112,042,339 tokens and 215,541 lines. Combined: **74,171,428,670 tokens and 877,043 lines**. Confirmed Claude non-use and unmeasured-account labels are preserved.
- Refreshed all 109 GitLab projects without errors, with all 1,614 returned non-merge diffs collected. Two commits authored in August were excluded from the October range. Korean authored-date October totals: **1,612 non-merge commits, 396 merges, 1,387,878 added lines and 194,266 deleted lines**. Earlier verified history outside October is unchanged. The full refresh also found 199 additional non-merge commits and six merges within October 1–28, so those weekly GitLab counts and ratios now reflect the reverified source.
- All 277 tests across 39 files, TypeScript and Vite passed. Independent per-user CSV reconciliation, import idempotence and historical preservation checks passed. Production monthly totals, representative users, updated ratios and the retained week-four AI totals were verified in the browser.
- Frontend-only release: all four served files matched the build manifest; 12 runtime snapshots, nine backend modules and the private secret file were preserved. Health returned 200. Reports: `/Users/riskzero/aihub/backups/20261102-october-month/`; provenance: `current/october-month-deployment.json`. Local source audits and the screenshot are under `output/october-month-20261102/`.

## October week-four Codex completion (2026-10-29)

- Imported the explicit October 22–28 Codex export: 14 accounts, 2,842,530,724 tokens and 26,298 generated lines. Every CSV row and total was independently reconciled; all accounts resolve to existing dashboard users, including Lim Seongbeom and Choi Jisook. Earlier Codex periods and monthly reconciliation records were preserved exactly.
- Both Claude and Codex now cover October 1–28. Current-roster combined week-four totals are 18,346,156,011 tokens and 171,254 generated lines; October month-to-date totals are 64,549,107,560 tokens and 803,306 lines. GitLab data remains the previously verified October 28 snapshot, with individual ratios recalculated against the updated combined generated lines.
- Production month/week views and representative accounts were verified. Jeong Jaeyo shows 55,784 combined weekly lines and a 22.5% GitLab ratio. Missing Claude observations remain partial; the confirmed Claude non-use label for Park Sujin is preserved.
- 274 tests in 39 files, TypeScript and Vite passed. All four served frontend assets matched their build hashes. All 12 runtime snapshots, backend code and secrets were preserved. Reports: `/Users/riskzero/aihub/backups/20261029-october-week4-codex/`; provenance: `current/october-week4-codex-deployment.json`.

## October week-four activity update (2026-10-29, before Codex import)

- Imported October 22–28 Claude spend for the regular team, Clevel, Lee Byeonghyeon and Jo Wooksang. Code lines use each workspace's October 28 cumulative export minus its October 21 export. Eight CSVs were independently reconciled by email, with no overlapping spend accounts.
- Kim Daeil's 10,147 weekly lines combine 309 in the regular team and 9,838 in Clevel. Kim Daeyoung's first observed usage, 246 requests / 46,870,308 tokens, was included from the separate account rows in Jo Wooksang's export. No legacy monthly usage was fabricated for this new activity account.
- Source totals: 56,682 requests, 15,517,054,252 tokens, 144,956 code lines and $1,232.05 net spend. Current-roster totals exclude departed staff: 56,607 requests and 15,503,625,287 tokens; code lines and cost are unchanged. Existing historical Claude periods remain unchanged.
- Read 108 GitLab projects without errors; all 296 returned non-merge diffs were collected. Two commits authored on October 16 were excluded from this week, consistent with the existing Korean authored-date convention. Published 294 non-merge commits, 134 merges, 119,478 added lines and 14,221 deleted lines for October 22–28. All 5,990 previously verified commits outside the requested range were preserved.
- October rolls up through October 28. At this initial release Codex covered October 1–21; the Codex completion above supersedes that partial combined coverage. Confirmed Claude non-use and departed-employee exclusions remain in place.
- 272 tests in 39 files, TypeScript and Vite passed. Production month/week filters and all five additional account rows were verified. Monthly combined observed totals are 777,008 lines / 61.7B tokens; GitLab shows 1,276 non-merge commits. Weekly UI shows 144,956 lines / 15.5B tokens / 294 non-merge commits.
- Only frontend assets changed in the new release. All 12 runtime snapshots, backend modules and the private secret file were preserved. Health returned 200 and all four served frontend files matched the local build hashes. Deployment and verification reports are in `/Users/riskzero/aihub/backups/20261029-october-week4/`; provenance is `current/october-week4-deployment.json`.

## Automatic API refresh repair (2026-10-28)

- The stored API snapshot had remained at October 26 even though the live API returned October 28 data. The frontend only fetched once and compared source mode/key count without comparing collection timestamps. Because the stored file also had runtime mode, the newer live response was discarded.
- The frontend now selects newer data by an ISO collection timestamp (with compatibility for old display timestamps), polls once per minute while visible, and checks again when the page regains focus. The API page shows collection status, last successful collection time, failures and a `지금 갱신` button.
- The server collects at startup and every five minutes without requiring an open browser, coalesces simultaneous requests and serializes different date windows. Successful 62-day results atomically replace both API snapshot files. Failed or partial results preserve prior figures and their original collection time while exposing a failed-refresh notice.
- Outbound requests have a 30-second timeout within a 60-second collection deadline. OpenAI/Claude usage-only or cost-only results are now marked partial; Gemini requires successful billing and key checks before reporting normal collection.
- 270 tests across 39 files passed; TypeScript and Vite build passed. Production UI and manual refresh verified all three providers and seven keys as normal. API response and both saved copies matched, with zero exact credential matches.
- A passive file watch verified the next scheduled collection at 08:24 KST, after the manual 08:20 refresh. Both saved copies matched, all providers remained normal, and the already-open browser advanced to 08:24 without reloading or clicking refresh.
- The user's private configuration and all 12 prior snapshot files were preserved during release activation. API snapshots then advanced through normal collection. Other data, Way 2.0, router settings and Railway were not modified.
- Verification files are in `/Users/riskzero/aihub/backups/20261028-api-refresh/`. Deployment provenance is `/Users/riskzero/aihub/current/api-refresh-deployment.json`.
- Collection timestamps display Korean time. The existing daily facts retain the source UTC day buckets; before 09:00 KST, the latest daily bucket can be the preceding calendar date. Provider-side reporting latency is separate from dashboard polling.

## API credential activation (2026-10-26)

- Restarted `kr.riskzero.aihub` after applying a backend security patch in a new release. All 12 saved snapshots survived activation; the two API usage snapshots were then refreshed with validated data.
- At 12:02 KST, OpenAI's 2 Admin keys, Claude's 3 Admin keys, and Gemini's 2 API keys all returned normal status. Google Cloud Monitoring and BigQuery Billing successfully collected data for both configured projects.
- The 62-day response (August 26 through October 26) contained 514 usage detail rows. Published it to both `public/api-usage-snapshot.local.json` and `dist/api-usage-snapshot.local.json`; the browser showed all three providers as normal with current-month and previous-month statistics.
- Gemini authentication now uses the `x-goog-api-key` header. Provider errors, network errors and nested snapshot text are redacted before returning or saving; invalid JSON responses return a generic error without echoing their bodies.
- All 256 tests across 37 files passed. Source syntax and deployed source hashes were verified. The runtime response, published snapshots and current service logs contained none of the seven configured credential values. This is a scoped check, not a complete security audit.
- The user's secret file remained unchanged with mode 0600 and its directory mode 0700. New credentials were not copied to Railway or the local repository.
- Private verification report: `/Users/riskzero/aihub/backups/20261026-api-security/verification.json`. Deployment provenance: `/Users/riskzero/aihub/current/security-deployment.json`.

## Public-IP access preparation — pending activation

- Gateway: `192.168.0.1`, ipTIME AX7800M-6E. Public IPv4 observed on October 24: `116.32.21.23`.
- Intended URL: `https://116.32.21.23:8444/`. This is a target, not a verified working public endpoint.
- Add one router rule: TCP external `8444` → `192.168.0.15:8444`. Keep the Mac mini address reserved/static. Do not forward the unprotected internal app's `4176` port.
- `Caddyfile.public-ip` and `kr.riskzero.aihub-proxy.plist` define a separate authenticated HTTPS proxy. It has independent storage and admin port 2020; it must not replace Way's Caddy service on 8443/admin 2019.
- Authentication covers the entire site, assets and APIs. The credential configuration belongs in private `secrets/public-proxy.env`, never in Git or frontend files.
- The proxy configuration is staged at `/Users/riskzero/aihub/proxy/Caddyfile` with a separate plist in that same folder, not installed in LaunchDaemons. Private credentials have been generated in `secrets/public-proxy.env` and `secrets/public-login.txt` (0600). Deliver the login information privately only when the trusted public endpoint is ready.
- Caddy configuration validation and plist validation passed. A temporary loopback HTTPS test explicitly trusted its own test certificate: unauthenticated HTML, JSON and API requests and an incorrect password all returned 401; authenticated UI and health returned 200. The test process and temporary certificate were removed. This does not establish public TLS or external reachability. The report is `proxy/verification.json`.
- A public IP certificate is required. The existing `*.riskzero.ai` certificate does not match an IP address. The staged configuration selects Let's Encrypt's `shortlived` profile, with automatic renewal.
- Rechecked Way's live certificate on October 24 at the user's request: `/Users/riskzero/way2-standby/tls/fullchain.pem`, with key `/Users/riskzero/way2-standby/tls/privkey.pem` (0600). SANs are only `*.riskzero.ai` and `riskzero.ai`; the certificate does not cover `116.32.21.23`. Issuer is Sectigo; expiry is 2026-11-30 23:59:59 UTC. The key contents were not printed or copied. The user explicitly chose to retain direct public-IP access after being offered `way.riskzero.ai:8444`, so do not substitute a domain URL or serve this wildcard certificate to the IP endpoint.
- Certificate issuance/renewal uses public port **80** and the `/.well-known/acme-challenge/` path. Current public port 80 responds as the SmartService Dashboard's nginx with HTTP 401. Its upstream host/configuration has not been identified. Preserve its existing forwarding and service; its operator must route only this challenge path to `http://192.168.0.15:8081`, preserving the original Host and without Basic Auth for that path. Do not replace the existing public 80/443 forwarding rules blindly.
- Before activation, verify challenge reachability and inspect the existing port-80 rule, then obtain a trusted IP certificate and verify unauthenticated HTTP 401, authenticated UI/API success, and external/mobile connectivity. Until these gates pass, keep the public proxy stopped and report the migration as LAN-only.
- After readiness, install only the new proxy plist and start `kr.riskzero.aihub-proxy`. The backend LAN allowlist can stay in place because the local proxy connects from the Mac mini's LAN IP. Rollback stops only this new service and removes its forwarding rule.

References: [Let's Encrypt IP certificates](https://letsencrypt.org/2026/01/15/6day-and-ip-general-availability), [HTTP-01 requirements](https://letsencrypt.org/docs/challenge-types/), [Caddy Basic Auth](https://caddyserver.com/docs/caddyfile/directives/basic_auth).

## Data and integration verification

- Initial migration: 247 tests, TypeScript and Vite build passed. The October 26 backend patch passed 256 tests; the frontend build is unchanged.
- All 10 initial served static files matched the local build byte for byte; source and secret paths return 404.
- UI verified: October through 21st, 39 people, 632,052 code lines, 46.2B tokens, 982 GitLab commits; fixed monthly cost 7,849,251 won / 68 items.
- LaunchDaemon registration and an application restart were verified. All 12 saved snapshot files survived unchanged. A full machine reboot was not performed.
- Data backup: `/Users/riskzero/aihub/backups/20261024-1852/runtime-data.tgz`. Private configuration is separate from this data archive.
- The initial migration found invalid/deactivated provider keys. The October 26 activation above supersedes that result for OpenAI, Claude and Gemini. Gamma's prior key issue was outside this update; Google Workspace and other integrations were not revalidated in this step.
- Notion connects but reports zero live records and retains the existing fallback counts (5 records / 7 outputs); do not describe it as a complete live Notion sync.
- Claude Drive uses the last verified snapshot (51,472 files) while retaining the daily 21:00 KST schedule. A full recursive refresh was interrupted during restart validation; do not call it a completed fresh scan. Genspark retains its existing verified snapshot and 22:00 schedule; its separate reconciliation issue is unchanged. Notion is scheduled for 08:00.

## Preparing a future release

From the repository root:

```sh
npm test
npx tsc --noEmit
npx vite build
python3 deploy/macmini/package-release.py --output .macmini-deploy.local/RELEASE.tgz
```

Use `npx vite build` here: `npm run build` also invokes an external API collector through its postbuild hook. The packaging helper includes all non-test Node modules so transitive imports are not missed. Secret settings are transferred separately over the verified SSH connection.

Before activating a new release, extract it into a **new** directory and verify every entry in `release-manifest.json`. Preserve the current release and current runtime snapshots. For each snapshot select the newest verified complete result, not merely an empty or error response. Link the existing private `runtime.env`; never replace it with a stale configuration copy after keys are changed.

Only after the new release is verified, change the `current` symlink and restart this service:

```sh
sudo launchctl kickstart -k system/kr.riskzero.aihub
curl --fail http://192.168.0.15:4176/api/health
sudo launchctl print system/kr.riskzero.aihub
```

Verify the UI, static asset hashes, snapshots and provider status; verify Way 2.0 and Railway are still healthy. For rollback, restore `current` to the retained previous release and restart only `kr.riskzero.aihub`. Never copy old secrets over new ones during rollback.
