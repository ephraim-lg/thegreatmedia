/* Support the construction "Get More Quote Requests" offer page:
   - notes_override: the offer page sends its own readable answer block
   - offer_package: shows as its own row in the alert
   - subject shouts CALL TODAY for qualified offer leads, so it is obvious in the inbox
   Unqualified leads still send no email at all (that gate is untouched).            */
const fs = require('fs');
const p = 'workers/tgm-leads-api.js';
let h = fs.readFileSync(p, 'utf8');
const rep = (a, b) => { if (!h.includes(a)) throw new Error('MISSING: ' + a.slice(0, 70)); h = h.split(a).join(b); };

// 1. package gets its own labelled row
rep('const QUAL_FIELDS = [\n  ["customer_value", "Customer value"],',
    'const QUAL_FIELDS = [\n  ["offer_package", "Package"],\n  ["customer_value", "Customer value"],');

// 2. don't print an empty Budget line when the offer has no budget band
rep('  lines.push(`Budget: ${budgetLabel(lead)} · Start: ${label(lead.timeline)}`);',
    '  if (lead.budget) lines.push(`Budget: ${budgetLabel(lead)} · Start: ${label(lead.timeline)}`);');

// 3. carry the new fields through
rep('          readiness: body.readiness || null, readiness_label: FIELD_LABELS[body.readiness] || null,',
    '          readiness: body.readiness || null, readiness_label: FIELD_LABELS[body.readiness] || null,\n          offer_package: body.offer_package || null, flow: body.flow || null,');

// 4. a page that sends its own notes block wins — it is written for a human to read
rep('        if (q.customer_value || q.qualified !== null) lead.notes = qualificationBlock(q, lead);',
    `        if (body.notes_override) {
          lead.notes = String(body.notes_override).slice(0, 4000) +
            (q.qualified === false ? "\\n\\nNOT A FIT — " + (q.fit_reason || "") : "");
        } else if (q.customer_value || q.qualified !== null) {
          lead.notes = qualificationBlock(q, lead);
        }`);

// 5. make a qualified offer lead impossible to miss in the inbox
rep('      subject: `${q.qualified === false ? "[Not a fit] " : ""}New application (${lead.quality_score}/100): ${lead.name}${lead.business_name ? " — " + lead.business_name : ""}`,',
    `      subject: q.qualified === false
        ? \`[Not a fit] \${lead.name}\${lead.business_name ? " — " + lead.business_name : ""}\`
        : q.flow === "quotes-offer"
          ? \`CALL TODAY — \${lead.name}, \${lead.business_name || "business"} (\${q.offer_package || "package tbc"})\`
          : \`New application (\${lead.quality_score}/100): \${lead.name}\${lead.business_name ? " — " + lead.business_name : ""}\`,`);

fs.writeFileSync(p, h);
console.log('worker patched for the offer page');
