/* Add /mailcheck — an admin-only endpoint that actually sends through Resend and
   returns Resend's status and body. The alert email is fired inside waitUntil, so a
   failure there is invisible: this makes it visible in one request.                 */
const fs = require('fs');
const p = 'workers/tgm-leads-api.js';
let h = fs.readFileSync(p, 'utf8');
if (h.includes('"/mailcheck"')) { console.log('already present'); process.exit(0); }
const a = '      /* ---------------------------------------------------- public: capture */';
if (!h.includes(a)) throw new Error('anchor missing');
const add = `      /* --------------------------------------- admin: is email actually working */
      if (path === "/mailcheck") {
        if (!authed(request, url, env)) return json({ ok: false, error: "no" }, 401, origin);
        if (!env.RESEND_API_KEY) return json({ ok: false, error: "RESEND_API_KEY not set" }, 500, origin);
        if (!env.ALERT_EMAIL) return json({ ok: false, error: "ALERT_EMAIL not set" }, 500, origin);
        const from = env.ALERT_FROM || "The Great Media <noreply@intercompanyrelay.org>";
        const r = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { authorization: \`Bearer \${env.RESEND_API_KEY}\`, "content-type": "application/json" },
          body: JSON.stringify({ from, to: [env.ALERT_EMAIL],
            subject: "Mailcheck — lead alerts are working",
            html: "<p>If you are reading this, lead alert emails can be delivered.</p>" }),
        });
        return json({ ok: r.ok, status: r.status, from, to: env.ALERT_EMAIL,
                      resend: (await r.text()).slice(0, 400) }, 200, origin);
      }

`;
fs.writeFileSync(p, h.replace(a, add + a));
console.log('mailcheck endpoint added');
