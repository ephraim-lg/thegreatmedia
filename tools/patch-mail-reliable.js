/* ROOT CAUSE: alertByEmail and mirrorToLegacy shared one ctx.waitUntil() budget.
   The legacy Apps Script mirror is slow, and the runtime cancelled the pending
   tasks after the response — killing the Resend call. Symptom: the sheet email
   arrived, the "CALL TODAY" alert silently did not.

   FIX: the alert is the product requirement ("I get an email and call them
   immediately"), so it is now AWAITED before the response, with one retry.
   The slow, optional sheet mirror keeps waitUntil on its own.                    */
const fs = require('fs');
const p = 'workers/tgm-leads-api.js';
let h = fs.readFileSync(p, 'utf8');
const rep = (a, b) => { if (!h.includes(a)) throw new Error('MISSING: ' + a.slice(0, 70)); h = h.split(a).join(b); };

// 1. the alert now reports whether it actually sent, and retries a transient failure once
rep(`  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: \`Bearer \${env.RESEND_API_KEY}\`, "content-type": "application/json" },
    body: JSON.stringify({`,
`  const send = () => fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: \`Bearer \${env.RESEND_API_KEY}\`, "content-type": "application/json" },
    body: JSON.stringify({`);

rep(`      html,
    }),
  });
  if (!res.ok) {
    console.error("lead alert email FAILED", res.status, (await res.text()).slice(0, 200), "lead", id);
  }
}`,
`      html,
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
}`);

// 2. the email is awaited; only the optional sheet mirror stays fire-and-forget
rep(`        if (q.qualified !== false) {
          ctx.waitUntil(Promise.all([alertByEmail(env, lead, newId, q), mirrorToLegacy(env, body)]));
        }

        return json({ ok: true, id: newId, score: lead.quality_score }, 201, origin);`,
`        // The alert is AWAITED, not fired into waitUntil: a shared waitUntil budget
        // was being cancelled by the slow legacy mirror and the email never sent.
        // The slow, optional mirror keeps waitUntil on its own.
        let alerted = null;
        if (q.qualified !== false) {
          ctx.waitUntil(mirrorToLegacy(env, body));
          alerted = await alertByEmail(env, lead, newId, q);
        }

        return json({ ok: true, id: newId, score: lead.quality_score, alerted }, 201, origin);`);

fs.writeFileSync(p, h);
console.log('alert email made reliable');
