// Worker patch: elite band, readiness/website fields, per-flow labels.
const fs = require('fs');
let w = fs.readFileSync('workers/tgm-leads-api.js', 'utf8');
const rep = (a, b) => { if (!w.includes(a)) throw new Error('missing: ' + a.slice(0, 70)); w = w.replace(a, b); };

rep('score += { premium: 40, growth: 30, starter: 20, low: 0 }[lead.budget] ?? 0;',
    'score += { elite: 45, premium: 40, growth: 30, starter: 20, low: 0 }[lead.budget] ?? 0;');
rep('score += { asap: 20, "2weeks": 15, month: 10, exploring: 0 }[lead.timeline] ?? 0;',
    'score += { now: 20, asap: 18, "2weeks": 15, month: 10, exploring: 0 }[lead.timeline] ?? 0;\n  score += { yes: 5, partner: 2, notyet: 0 }[q.readiness] ?? 0;');

rep(`const FIELD_LABELS = {
  low: "Under K10,000/mo", starter: "K10,000–K20,000/mo", growth: "K20,000–K50,000/mo", premium: "K50,000+/mo",
  ads: "Ads", website: "Website", both: "Ads + Website", ecom: "E-commerce", system: "Acquisition system",
  asap: "This month", "2weeks": "Within 2 weeks", month: "In 1–3 months", exploring: "Just researching",
};`,
`const FIELD_LABELS = {
  low: "Under K10,000/mo", starter: "K10,000–K20,000/mo", growth: "K20,000–K50,000/mo", premium: "K50,000–K100,000/mo", elite: "K100,000+/mo",
  ads: "Ads", website: "Website only", both: "Ads + Website", ecom: "E-commerce", system: "Acquisition system", unsure: "Not sure — recommend",
  now: "Right now — this week", asap: "This month", "2weeks": "Within 2 weeks", month: "In 1–3 months", exploring: "Just researching",
  yes: "Ready to decide within 7 days", partner: "Needs partner/director on the call", notyet: "Not ready — gathering information",
};
// Website-only applications quote a one-off project budget, not a monthly fee.
const WEB_BUDGET = { low: "Under K7,500", starter: "K7,500–K15,000", growth: "K15,000–K35,000", premium: "K35,000–K75,000", elite: "K75,000+" };
const budgetLabel = (lead) => (lead.service === "website" ? (WEB_BUDGET[lead.budget] || lead.budget) + " one-off" : FIELD_LABELS[lead.budget] || lead.budget || "");`);

rep(`  ["bottleneck", "Bottleneck"], ["role", "Role"], ["plan", "Plan clicked"],
];`,
`  ["bottleneck", "Bottleneck"], ["site_job", "Site job"], ["site_content", "Content ready"], ["website", "Web/social"],
  ["readiness_label", "Readiness"], ["role", "Role"], ["plan", "Plan clicked"],
];`);

rep(`  lines.push(\`Fit: \${q.qualified === false ? "NOT A FIT — " + (q.fit_reason || "") : "qualified"}\`);`,
    `  lines.push(\`Fit: \${q.qualified === false ? "NOT A FIT — " + (q.fit_reason || "") : "qualified"}\`);\n  lines.push(\`Budget: \${budgetLabel(lead)} · Start: \${label(lead.timeline)}\`);`);
rep('  if (lead.pages) lines.push(`Web/social: ${lead.pages}`);', '  if (lead.pages) lines.push(`${lead.service === "website" ? "Pages/features" : "Web/social"}: ${lead.pages}`);');

rep('${row("Wants", label(lead.service))}${row("Budget", label(lead.budget))}${row("Timeline", label(lead.timeline))}',
    '${row("Wants", label(lead.service))}${row("Budget", budgetLabel(lead))}${row("Timeline", label(lead.timeline))}');
rep('${row("Lead sources", lead.source)}${row("Location", lead.audience)}${row("Web/social", lead.pages)}',
    '${row("Lead sources", lead.source)}${row("Location", lead.audience)}${row(lead.service === "website" ? "Pages/features" : "Web/social", lead.pages)}');

rep(`          bottleneck: body.bottleneck || null, role: body.role || null, plan: body.plan || null,`,
    `          bottleneck: body.bottleneck || null, role: body.role || null, plan: body.plan || null,
          site_job: body.site_job || null, site_content: body.site_content || null, website: body.website || null,
          readiness: body.readiness || null, readiness_label: FIELD_LABELS[body.readiness] || null,`);

fs.writeFileSync('workers/tgm-leads-api.js', w);
console.log('worker patched');

// Dashboard labels
let d = fs.readFileSync('public/leads.html', 'utf8');
d = d.replace('const BUDGET = { low:"Under K10,000/mo", starter:"K10,000–K20,000/mo", growth:"K20,000–K50,000/mo", premium:"K50,000+/mo" };',
  'const BUDGET = { low:"Under K10,000/mo", starter:"K10,000–K20,000/mo", growth:"K20,000–K50,000/mo", premium:"K50,000–K100,000/mo", elite:"K100,000+/mo" };\nconst WEB_BUDGET = { low:"Under K7,500", starter:"K7,500–K15,000", growth:"K15,000–K35,000", premium:"K35,000–K75,000", elite:"K75,000+" };');
d = d.replace('const SERVICE = { ads:"Ads", website:"Website", both:"Ads + Website", ecom:"E-commerce", system:"System" };',
  'const SERVICE = { ads:"Ads", website:"Website only", both:"Ads + Website", ecom:"E-commerce", system:"System", unsure:"Unsure" };');
d = d.replace(`+ '<td>'+esc(BUDGET[l.budget]||l.budget||"—")+'</td>'`, `+ '<td>'+esc((l.service==="website" ? (WEB_BUDGET[l.budget]||l.budget)+" once" : BUDGET[l.budget])||l.budget||"—")+'</td>'`);
fs.writeFileSync('public/leads.html', d);
console.log('dashboard patched', d.includes('WEB_BUDGET[l.budget]'));
