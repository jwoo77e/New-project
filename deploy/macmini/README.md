# AI Control Hub — Mac mini

## Current deployment (2026-10-29)

- Office URL: **http://192.168.0.15:4176/**.
- Host: `riskzero@192.168.0.15`; Apple M4 Pro, macOS, native Node.js.
- Application: `/Users/riskzero/aihub/current` points to `releases/20261029-october-week4-codex`. Previous releases, including `releases/20261029-october-week4`, are retained for rollback.
- LaunchDaemon: `/Library/LaunchDaemons/kr.riskzero.aihub.plist`, label `kr.riskzero.aihub`.
- Listener is bound to `192.168.0.15`. Only actual TCP peers in `192.168.0.0/24` and loopback are allowed. Forwarded headers do not grant access.
- Config: `/Users/riskzero/aihub/secrets/runtime.env` (0600), linked as `.env.local` inside the release. Do not put it in source control or a public directory.
- Logs: `/Users/riskzero/aihub/logs/server.log` and `server-error.log`.
- Runtime snapshots are ordinary files in the release's `public/` and `dist/` directories; preserve them across updates. There is no application database to migrate.
- Browser-uploaded Excel data is stored in that browser origin's localStorage. It is not server data and does not transfer to a different IP/domain automatically.

**Railway is controlled by the user.** The user said they would stop it manually in Railway Console after checking the new service. Do not stop, redeploy, remove, or alter Railway as part of Mac mini maintenance. Its health URL returned HTTP 404 on October 28; the cause was not investigated in this API refresh task. Git push alone still does not deploy a new Mac mini release.

The user deferred DNS, then authorized public-IP access on October 24. The user will configure the router personally. See the pending public-IP preparation below. `aihub.riskzero.ai:8443` was discussed but is not configured. Existing Way 2.0, its Caddy settings, DNS and containers remain unchanged. On October 26 the user edited API credentials directly in `runtime.env`; the validated results are below.

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
