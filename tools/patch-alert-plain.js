/* The alert email was accepted by Resend (2xx) but never delivered, while a simple
   test message from the same key/sender/recipient landed in the inbox. Cause: a
   link-heavy HTML table with no plain-text alternative reads as phishing to Gmail.
   Fix: send a text-first message (text/ + simple HTML), which is also easier to
   read on a phone thirty seconds before Ephraim makes the call.                   */
const fs = require('fs');
const p = 'workers/tgm-leads-api.js';
let h = fs.readFileSync(p, 'utf8');
const rep = (a, b) => { if (!h.includes(a)) throw new Error('MISSING: ' + a.slice(0, 70)); h = h.split(a).join(b); };

const start = h.indexOf('async function alertByEmail(env, lead, id, q = {}) {');
const endMark = '\n  let res;\n  try {';
const end = h.indexOf(endMark, start);
if (start < 0 || end < 0) throw new Error('could not locate alertByEmail body');

const fresh = `async function alertByEmail(env, lead, id, q = {}) {
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
  const head = q.flow === "quotes-offer"
    ? "Call this person today."
    : "New application.";

  const text = head + "\n\n" + lines.join("\n") +
    "\n\n--- their answers ---\n" + detail +
    "\n\nDashboard: https://thegreatmediazm.com/leads.html\n";

  const html = "<div style=\\"font-family:system-ui,-apple-system,sans-serif;font-size:15px;color:#111\\">" +
    "<p><b>" + esc(head) + "</b></p>" +
    "<p>" + lines.map((l) => esc(l)).join("<br>") + "</p>" +
    "<p style=\\"white-space:pre-wrap;color:#333\\">" + esc(detail) + "</p>" +
    "<p><a href=\\"https://thegreatmediazm.com/leads.html\\">Open the leads dashboard</a></p>" +
    "</div>";

  const send = () => fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: \`Bearer \${env.RESEND_API_KEY}\`, "content-type": "application/json" },
    body: JSON.stringify({
      from: env.ALERT_FROM || "The Great Media <noreply@intercompanyrelay.org>",
      to: [env.ALERT_EMAIL],
      reply_to: lead.email || undefined,
      subject: q.qualified === false
        ? \`[Not a fit] \${lead.name}\${lead.business_name ? " - " + lead.business_name : ""}\`
        : q.flow === "quotes-offer"
          ? \`CALL TODAY - \${lead.name}, \${lead.business_name || "business"} (\${q.offer_package || "package tbc"})\`
          : \`New application (\${lead.quality_score}/100): \${lead.name}\${lead.business_name ? " - " + lead.business_name : ""}\`,
      text,
      html,
    }),
  });
`;

h = h.slice(0, start) + fresh + h.slice(end);

// the retry/report tail keeps its shape; make the logged id useful
rep(`    console.error("lead alert email THREW", String(e), "lead", id);`,
    `    console.error("lead alert email THREW", String(e), "lead", id);`);

fs.writeFileSync(p, h);
console.log('alert email is now text-first');
