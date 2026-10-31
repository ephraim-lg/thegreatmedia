# The Great Media — repo notes

Two things live here:

- `public/` + `src/` + `tools/build.js` — the main site, served by the Worker
  `morning-shape-c2bc` (static assets, **not** Pages). See `DEPLOY.md`.
- `workers/tgm-leads-api.js` — the shared lead-capture API used by the main
  site **and** by the construction offer page at `quotes.thegreatmediazm.com`
  (that page's source is in `C:\Users\HP\Downloads\tgm-quotes`).

## Landmines — read before touching the leads worker

**1. `ctx.waitUntil()` tasks get cancelled. Never put the alert email in one.**
The alert and the slow legacy Apps Script mirror used to share a single
`waitUntil(Promise.all([...]))`. The runtime cancelled the pending work after
the response, so the sheet email arrived and the "CALL TODAY" alert silently
did not — intermittently, which made it look like a Resend quota problem.
Cloudflare logs the cause: *"waitUntil() tasks did not complete within the
allowed time after invocation end and have been cancelled."*
The alert is now **awaited** on the request path and returns `alerted` in the
JSON response. Only the optional, slow mirror stays in `waitUntil`.

**2. Alert emails must be text-first, or Gmail drops them after Resend accepts.**
The old alert was a link-heavy HTML `<table>` with no plain-text part. Resend
returned 200 with a message id and the mail never arrived — not even in spam.
A plain test message from the same key/sender/recipient landed fine. The alert
now sends `text` **and** simple HTML with a single link. Do not reintroduce a
big table or multiple links.

**3. Adding a new front-end origin? Add it to `ALLOWED_ORIGINS`.**
Otherwise `access-control-allow-origin` falls back to the first entry, the
browser blocks the POST, and the page silently degrades to its WhatsApp
hand-off. Tests that stub the network will **not** catch this — always do one
real browser submission against the live origin.

**4. Unqualified applications must never produce an email.**
`if (q.qualified !== false)` guards both the alert and the legacy mirror. They
are still stored (status `lost`) so nothing is lost and the dashboard shows
them. This is a hard product requirement, not a nicety.

## Diagnosing email

`GET /mailcheck?key=<ADMIN_KEY>` sends a real message through Resend and
returns Resend's status and body. Use it before guessing.
Worker logs (observability is on, full sampling):
`POST /accounts/{acct}/workers/observability/telemetry/query`.

## Deploying the worker without a wrangler login

Wrangler is not logged in and minting an API token returns error 9109, so the
Cloudflare MCP is the only writer. Do **not** paste the whole 20KB source into
an MCP call — the sandbox can read the deployed script back:

    GET /accounts/{acct}/workers/services/tgm-leads-api/environments/production/content

(`/workers/scripts/{name}/content` is blocked for this auth scheme, the
`services/.../environments/production/content` one is not.) It returns
multipart; take the part after the first `\r\n\r\n` and trim the trailing
boundary. Apply targeted string replacements, then `PUT` it back with
`metadata.keep_bindings: ["secret_text"]` so the six secrets survive
(SUPABASE_URL, SUPABASE_SERVICE_KEY, ADMIN_KEY, RESEND_API_KEY, ALERT_EMAIL,
LEGACY_WEBHOOK). Always re-check `secrets: 6` in the settings call afterwards.

The MCP sandbox has `fetch`, but **egress is limited to the Cloudflare API** —
it cannot fetch pages.dev or anything else.

After deploying, sync `workers/tgm-leads-api.js` to match production exactly
(compare length + a rolling hash of the fetched content), so this repo stays
the source of truth.
