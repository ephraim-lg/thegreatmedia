/**
 * The Great Media — lead capture + tracking API.
 *
 * Replaces a Google Apps Script call made with `mode: 'no-cors'`, which meant
 * the browser could never read the response: a lead could fail to save and the
 * visitor — and Ephraim — would never know. Every response here is readable, so
 * the form can tell a human when something went wrong instead of pretending.
 *
 * Deliberately a SEPARATE worker from the website. If this throws, the site
 * still serves; the form degrades to its WhatsApp hand-off.
 *
 * Storage: Supabase `public.tgm_leads`, RLS forced — only this worker's
 * service key can read or write it, and the key never reaches a browser.
 */

const ALLOWED_ORIGINS = [
  "https://thegreatmediazm.com",
  "https://www.thegreatmediazm.com",
  // the construction offer sales page and its Pages origin
  "https://quotes.thegreatmediazm.com",
  "https://tgm-quotes.pages.dev",
];

const STATUSES = ["new", "contacted", "qualified", "won", "lost"];

function corsHeaders(origin) {
  return {
    "access-control-allow-origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    "access-control-allow-methods": "GET,POST,PATCH,OPTIONS",
    "access-control-allow-headers": "content-type,x-admin-key",
    "access-control-max-age": "86400",
    vary: "origin",
  };
}

function json(body, status, origin, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...corsHeaders(origin), ...extra },
  });
}

/** Cheap, explainable lead score — the thing that makes "lead quality" a number
 *  you can filter and compare campaigns by, instead of a feeling. */
function scoreLead(lead, q = {}) {
  let score = 0;
  score += { elite: 45, premium: 40, growth: 30, starter: 20, low: 0 }[lead.budget] ?? 0;
  score += { now: 20, asap: 18, "2weeks": 15, month: 10, exploring: 0 }[lead.timeline] ?? 0;
  score += { yes: 5, partner: 2, notyet: 0 }[q.readiness] ?? 0;
  // Qualification answers (new application form): value of a customer + a real goal + a clear leak.
  score += { "K100,000+": 10, "K20,000 – K100,000": 8, "K5,000 – K20,000": 6, "K1,000 – K5,000": 2 }[q.customer_value] ?? 0;
  if (q.follow_up_owner === "Nobody consistently" || q.response_time === "Often missed") score += 3; // a fixable leak = easy win
  if (lead.email && /.+@.+\..+/.test(lead.email)) score += 10;
  if (lead.business_name && lead.business_name.trim().length > 1) score += 5;
  if (lead.audience && lead.audience.trim().length > 12) score += 5;
  const digits = String(lead.phone || "").replace(/\D/g, "");
  if (digits.length >= 9) score += 10;
  if (lead.utm_campaign || lead.fbclid) score += 5;
  if (lead.goal) score += 5;
  // Self-declared not-a-fit (budget below minimum) can never look hot in the dashboard.
  if (q.qualified === false) score = Math.min(score, 25);
  return Math.min(score, 100);
}

function normalisePhone(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("260")) return "+" + digits;
  if (digits.startsWith("0") && digits.length === 10) return "+26" + digits;
  return digits.length > 7 ? "+" + digits : digits;
}

async function sb(env, path, init = {}) {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: env.SUPABASE_SERVICE_KEY,
      authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      "content-type": "application/json",
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`supabase ${res.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}

function authed(request, url, env) {
  const key = request.headers.get("x-admin-key") || url.searchParams.get("key");
  return Boolean(env.ADMIN_KEY) && key === env.ADMIN_KEY;
}

const esc = (v) => String(v ?? "").replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));

const FIELD_LABELS = {
  low: "Under K10,000/mo", starter: "K10,000–K20,000/mo", growth: "K20,000–K50,000/mo", premium: "K50,000–K100,000/mo", elite: "K100,000+/mo",
  "construction-offer": "More quote requests (construction offer)",
  ads: "Ads", website: "Website only", both: "Ads + Website", ecom: "E-commerce", system: "Acquisition system", unsure: "Not sure — recommend",
  now: "Right now — this week", asap: "This month", "2weeks": "Within 2 weeks", month: "In 1–3 months", exploring: "Just researching",
  yes: "Ready to decide within 7 days", partner: "Needs partner/director on the call", notyet: "Not ready — gathering information",
};
// Website-only applications quote a one-off project budget, not a monthly fee.
const WEB_BUDGET = { low: "Under K7,500", starter: "K7,500–K15,000", growth: "K15,000–K35,000", premium: "K35,000–K75,000", elite: "K75,000+" };
const budgetLabel = (lead) => (lead.service === "website" ? (WEB_BUDGET[lead.budget] || lead.budget) + " one-off" : FIELD_LABELS[lead.budget] || lead.budget || "");

/** The qualification answers that have no column of their own. They're kept
 *  as a readable block in `notes` (shown in the dashboard) and in the alert. */
const QUAL_FIELDS = [
  ["offer_package", "Package"],
  ["customer_value", "Customer value"], ["revenue", "Monthly revenue"], ["enquiries", "Enquiries / month"],
  ["ad_spend", "Current ad spend"], ["response_time", "Reply time"], ["follow_up_owner", "Who follows up"],
  ["bottleneck", "Bottleneck"], ["site_job", "Site job"], ["site_content", "Content ready"], ["website", "Web/social"],
  ["readiness_label", "Readiness"], ["role", "Role"], ["plan", "Plan clicked"],
];
function qualificationBlock(q, lead) {
  const lines = [];
  lines.push(`Fit: ${q.qualified === false ? "NOT A FIT — " + (q.fit_reason || "") : "qualified"}`);
  if (lead.budget) lines.push(`Budget: ${budgetLabel(lead)} · Start: ${label(lead.timeline)}`);
  for (const [k, label] of QUAL_FIELDS) if (q[k]) lines.push(`${label}: ${q[k]}`);
  if (lead.audience) lines.push(`Location: ${lead.audience}`);
  if (lead.pages) lines.push(`${lead.service === "website" ? "Pages/features" : "Web/social"}: ${lead.pages}`);
  if (lead.source) lines.push(`Lead sources: ${lead.source}`);
  if (lead.goal) lines.push(`90-day goal: ${lead.goal}`);
  return lines.join("\n");
}
const label = (v) => FIELD_LABELS[v] || v || "";

/**
 * Alert Ephraim the moment a lead lands. AWAITED on the capture path, not fired
 * into ctx.waitUntil(): a shared waitUntil budget was being cancelled by the slow
 * legacy mirror, so the alert silently never sent. Returns true only if Resend
 * accepted it; a failure is logged, never swallowed.
 */
async function alertByEmail(env, lead, id, q = {}) {
  if (!env.RESEND_API_KEY || !env.ALERT_EMAIL) return false;

  const lines = [];
  const add = (k, v) => { if (v) lines.push(k + ": " + v); };
  add("Name", lead.name);
  add("Business", lead.business_name);
  add("Trade", lead.business_type);
  add("Phone", lead.phone);
  add("Email", lead.email);
  add("Area", lead.audience);
  add("Wants", label(lead.service));
  if (lead.budget) add("Budget", budgetLabel(lead));
  add("Start", label(lead.timeline));
  for (const [k, lbl] of QUAL_FIELDS) add(lbl, q[k]);
  add("Goal", lead.goal);
  add("Score", lead.quality_score + "/100");
  add("Campaign", lead.utm_campaign);

  // The page sends its own readable answer block; prefer it over the field list.
  const detail = lead.notes ? String(lead.notes) : lines.join("\n");
  const head = q.flow === "quotes-offer" ? "Call this person today." : "New application.";

  const text = head + "\n\n" + lines.join("\n") +
    "\n\n--- their answers ---\n" + detail +
    "\n\nDashboard: https://thegreatmediazm.com/leads.html\n";

  const html = "<div style=\"font-family:system-ui,-apple-system,sans-serif;font-size:15px;color:#111\">" +
    "<p><b>" + esc(head) + "</b></p>" +
    "<p>" + lines.map((l) => esc(l)).join("<br>") + "</p>" +
    "<p style=\"white-space:pre-wrap;color:#333\">" + esc(detail) + "</p>" +
    "<p><a href=\"https://thegreatmediazm.com/leads.html\">Open the leads dashboard</a></p>" +
    "</div>";

  const send = () => fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: env.ALERT_FROM || "The Great Media <noreply@intercompanyrelay.org>",
      to: [env.ALERT_EMAIL],
      reply_to: lead.email || undefined,
      subject: q.qualified === false
        ? `[Not a fit] ${lead.name}${lead.business_name ? " - " + lead.business_name : ""}`
        : q.flow === "quotes-offer"
          ? `CALL TODAY - ${lead.name}, ${lead.business_name || "business"} (${q.offer_package || "package tbc"})`
          : `New application (${lead.quality_score}/100): ${lead.name}${lead.business_name ? " - " + lead.business_name : ""}`,
      text,
      html,
    }),
  });

  let res;
  try {
    res = await send();
    if (!res.ok && res.status >= 500) res = await send(); // one retry on a transient Resend fault
  } catch (e) {
    console.error("lead alert email THREW", String(e), "lead", id);
    return false;
  }
  if (!res.ok) {
    console.error("lead alert email FAILED", res.status, (await res.text()).slice(0, 200), "lead", id);
    return false;
  }
  return true;
}

/**
 * The old Google Apps Script still feeds whatever sheet and alert Ephraim had
 * before. Keep posting to it server-side so nothing he already relies on goes
 * dark just because the storage moved. Slow and optional: it stays in waitUntil.
 */
async function mirrorToLegacy(env, body) {
  if (!env.LEGACY_WEBHOOK) return;
  try {
    const res = await fetch(env.LEGACY_WEBHOOK, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) console.error("legacy mirror non-ok", res.status);
  } catch (e) {
    console.error("legacy mirror failed", String(e));
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get("origin") || "";
    const path = url.pathname.replace(/\/+$/, "") || "/";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    try {
      /* --------------------------------------- admin: is email actually working */
      if (path === "/mailcheck") {
        if (!authed(request, url, env)) return json({ ok: false, error: "no" }, 401, origin);
        if (!env.RESEND_API_KEY) return json({ ok: false, error: "RESEND_API_KEY not set" }, 500, origin);
        if (!env.ALERT_EMAIL) return json({ ok: false, error: "ALERT_EMAIL not set" }, 500, origin);
        const from = env.ALERT_FROM || "The Great Media <noreply@intercompanyrelay.org>";
        const r = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
          body: JSON.stringify({ from, to: [env.ALERT_EMAIL],
            subject: "Mailcheck — lead alerts are working",
            html: "<p>If you are reading this, lead alert emails can be delivered.</p>" }),
        });
        return json({ ok: r.ok, status: r.status, from, to: env.ALERT_EMAIL,
                      resend: (await r.text()).slice(0, 400) }, 200, origin);
      }

      /* ---------------------------------------------------- public: capture */
      if (path === "/lead" && request.method === "POST") {
        let body;
        try {
          body = await request.json();
        } catch {
          return json({ ok: false, error: "Send valid JSON." }, 400, origin);
        }

        const name = String(body.name || "").trim();
        const phone = normalisePhone(body.phone);
        if (!name) return json({ ok: false, error: "Please tell us your name." }, 422, origin);
        if (phone.replace(/\D/g, "").length < 9) {
          return json({ ok: false, error: "Please enter a WhatsApp number we can reach you on." }, 422, origin);
        }

        const lead = {
          name,
          phone,
          business_name: body.businessName || null,
          business_type: body.businessType || null,
          email: body.email || null,
          service: body.service || null,
          goal: body.goal || null,
          pages: body.pages || null,
          audience: body.audience || null,
          budget: body.budget || null,
          timeline: body.timeline || null,
          source: body.source || null,
          utm_source: body.utm_source || null,
          utm_medium: body.utm_medium || null,
          utm_campaign: body.utm_campaign || null,
          utm_content: body.utm_content || null,
          utm_term: body.utm_term || null,
          fbclid: body.fbclid || null,
          referrer: body.referrer || null,
          landing_page: body.landing_page || null,
          user_agent: request.headers.get("user-agent") || null,
          country: request.cf?.country || null,
        };
        const q = {
          customer_value: body.customer_value || null, revenue: body.revenue || null, enquiries: body.enquiries || null,
          ad_spend: body.ad_spend || null, response_time: body.response_time || null, follow_up_owner: body.follow_up_owner || null,
          bottleneck: body.bottleneck || null, role: body.role || null, plan: body.plan || null,
          site_job: body.site_job || null, site_content: body.site_content || null, website: body.website || null,
          readiness: body.readiness || null, readiness_label: FIELD_LABELS[body.readiness] || null,
          offer_package: body.offer_package || null, flow: body.flow || null,
          qualified: typeof body.qualified === "boolean" ? body.qualified : null, fit_reason: body.fit_reason || null,
        };
        lead.quality_score = scoreLead(lead, q);
        // No spare columns for the qualification answers — keep them readable in notes.
        if (body.notes_override) {
          lead.notes = String(body.notes_override).slice(0, 4000) +
            (q.qualified === false ? "\n\nNOT A FIT — " + (q.fit_reason || "") : "");
        } else if (q.customer_value || q.qualified !== null) {
          lead.notes = qualificationBlock(q, lead);
        }
        if (q.qualified === false) lead.status = "lost";

        // A double-tapped submit button must not create two leads.
        const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
        const dupes = await sb(
          env,
          `tgm_leads?select=id&phone=eq.${encodeURIComponent(phone)}&created_at=gte.${encodeURIComponent(since)}&limit=1`,
        );
        if (dupes?.length) {
          return json({ ok: true, id: dupes[0].id, score: lead.quality_score, duplicate: true }, 200, origin);
        }

        const inserted = await sb(env, "tgm_leads", {
          method: "POST",
          headers: { prefer: "return=representation" },
          body: JSON.stringify(lead),
        });

        const newId = inserted?.[0]?.id ?? null;
        // Not-a-fit applications NEVER reach the inbox — no Resend alert, no legacy
        // sheet/email mirror. They are kept in the database (status "lost") so the
        // dashboard still shows them and nothing is silently dropped.
        // The alert is AWAITED: a shared waitUntil budget was being cancelled by the
        // slow legacy mirror and the email never sent. The mirror keeps waitUntil alone.
        let alerted = null;
        if (q.qualified !== false) {
          ctx.waitUntil(mirrorToLegacy(env, body));
          alerted = await alertByEmail(env, lead, newId, q);
        }

        return json({ ok: true, id: newId, score: lead.quality_score, alerted }, 201, origin);
      }

      /* ------------------------------------------------------ admin: read */
      if (path === "/leads" && request.method === "GET") {
        if (!authed(request, url, env)) return json({ ok: false, error: "Unauthorised" }, 401, origin);
        const limit = Math.min(Number(url.searchParams.get("limit")) || 500, 1000);
        const status = url.searchParams.get("status");
        const campaign = url.searchParams.get("campaign");
        let q = `tgm_leads?select=*&order=created_at.desc&limit=${limit}`;
        if (status && STATUSES.includes(status)) q += `&status=eq.${status}`;
        if (campaign) q += `&utm_campaign=eq.${encodeURIComponent(campaign)}`;
        const rows = await sb(env, q);
        return json({ ok: true, count: rows.length, leads: rows }, 200, origin);
      }

      if (path === "/stats" && request.method === "GET") {
        if (!authed(request, url, env)) return json({ ok: false, error: "Unauthorised" }, 401, origin);
        const rows = await sb(env, "tgm_leads?select=created_at,status,source,budget,utm_campaign,utm_source,quality_score&order=created_at.desc&limit=5000");
        const tally = (key) =>
          rows.reduce((acc, r) => {
            const k = r[key] || "unknown";
            acc[k] = (acc[k] || 0) + 1;
            return acc;
          }, {});
        const day = 24 * 60 * 60 * 1000;
        const since = (n) => rows.filter((r) => Date.now() - new Date(r.created_at).getTime() < n * day).length;
        const scores = rows.map((r) => r.quality_score || 0);
        return json(
          {
            ok: true,
            total: rows.length,
            last7: since(7),
            last30: since(30),
            avgScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
            hot: rows.filter((r) => (r.quality_score || 0) >= 60).length,
            byStatus: tally("status"),
            bySource: tally("source"),
            byBudget: tally("budget"),
            byCampaign: tally("utm_campaign"),
          },
          200,
          origin,
        );
      }

      if (path === "/export.csv" && request.method === "GET") {
        if (!authed(request, url, env)) return json({ ok: false, error: "Unauthorised" }, 401, origin);
        const rows = await sb(env, "tgm_leads?select=*&order=created_at.desc&limit=5000");
        const cols = rows.length ? Object.keys(rows[0]) : ["id"];
        const csvEsc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
        const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => csvEsc(r[c])).join(","))].join("\n");
        return new Response(csv, {
          status: 200,
          headers: {
            "content-type": "text/csv; charset=utf-8",
            "content-disposition": `attachment; filename="tgm-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
            ...corsHeaders(origin),
          },
        });
      }

      /* ---------------------------------------------------- admin: update */
      const match = path.match(/^\/lead\/([0-9a-f-]{36})$/i);
      if (match && request.method === "PATCH") {
        if (!authed(request, url, env)) return json({ ok: false, error: "Unauthorised" }, 401, origin);
        const body = await request.json().catch(() => ({}));
        const patch = {};
        if (body.status) {
          if (!STATUSES.includes(body.status)) return json({ ok: false, error: "Unknown status" }, 422, origin);
          patch.status = body.status;
          if (body.status === "contacted") patch.contacted_at = new Date().toISOString();
        }
        if (typeof body.notes === "string") patch.notes = body.notes;
        if (!Object.keys(patch).length) return json({ ok: false, error: "Nothing to update" }, 422, origin);
        const updated = await sb(env, `tgm_leads?id=eq.${match[1]}`, {
          method: "PATCH",
          headers: { prefer: "return=representation" },
          body: JSON.stringify(patch),
        });
        if (!updated?.length) return json({ ok: false, error: "Lead not found" }, 404, origin);
        return json({ ok: true, lead: updated[0] }, 200, origin);
      }

      if (path === "/health") {
        return json({ ok: true, service: "tgm-leads-api", time: new Date().toISOString() }, 200, origin);
      }

      return json({ ok: false, error: "Not found" }, 404, origin);
    } catch (err) {
      // Loud, not silent: the caller gets a real error and the log keeps the cause.
      console.error("tgm-leads-api", err && err.stack ? err.stack : String(err));
      return json({ ok: false, error: "Something went wrong saving that. Please try again." }, 500, origin);
    }
  },
};
