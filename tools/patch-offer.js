// Patch 3: grand-slam offer section, capacity/urgency lines, website-only card, faster-start copy.
const fs = require('fs');
function patch(file, pairs) {
  let h = fs.readFileSync(file, 'utf8');
  for (const [a, b] of pairs) { if (!h.includes(a)) throw new Error(file + ' missing: ' + a.slice(0, 70)); h = h.replace(a, b); }
  fs.writeFileSync(file, h); console.log('patched', file);
}

const OFFER = `<!-- ═══════════════════ 7. THE OFFER ═══════════════════ -->
<section class="s-paper pad" id="offer">
  <div class="container">
    <div class="offer">
      <div class="offer-head">
        <span class="eyebrow rv">The offer</span>
        <h2 class="rv rv-d1">The 90-Day Customer Acquisition System.</h2>
        <p class="lead rv rv-d2">Everything below is included. You don't assemble it from five suppliers — we build it, launch it and run it for you, and you see the numbers every week.</p>
        <div class="offer-guarantee rv rv-d3">
          <b>Live in 21 working days</b> from the day we get access — or your first month's management fee is on us.
        </div>
      </div>
      <ul class="stack rv">
        <li><span>Diagnostic, acquisition strategy &amp; offer design</span><b>K8,000</b></li>
        <li><span>Conversion landing page — designed, built, hosted</span><b>K15,000</b></li>
        <li><span>Meta + Google campaigns, creative &amp; copy included</span><b>K12,000<small>/mo</small></b></li>
        <li><span>Lead qualification + WhatsApp follow-up system, templates &amp; reminders</span><b>K10,000</b></li>
        <li><span>Tracking from ad to sale + weekly plain-English report</span><b>K6,000<small>/mo</small></b></li>
        <li class="bonus"><span><em>Bonus</em> Sales script &amp; quote-chasing templates</span><b>K4,000</b></li>
        <li class="bonus"><span><em>Bonus</em> 30-day post-launch optimisation sprint</span><b>K8,000</b></li>
        <li class="total"><span>Bought separately</span><b>K63,000+</b></li>
        <li class="price"><span>Growth — everything above, managed monthly</span><b>from K10,000<small>/mo</small></b></li>
      </ul>
      <div class="offer-foot rv">
        <div class="capacity"><i></i><span data-slots-line></span></div>
        <p class="delay">Every month without a system is a month of enquiries you already paid for going cold. The build takes three weeks; the decision takes one call.</p>
        <div class="cta-row"><a class="btn btn-primary btn-lg" href="/apply" data-place="offer">Apply to Work With Us <span class="arrow">→</span></a><a class="btn btn-ghost btn-lg" href="/pricing">See pricing</a></div>
        <p class="cta-note">Just need a website? <a class="link" href="/apply?plan=website">Apply for a website only <span class="arrow">→</span></a> — conversion-built, from K7,500.</p>
      </div>
    </div>
  </div>
</section>

`;

// ---- Home: replace "What clients get" with the offer; add capacity line under hero CTA and in final CTA
let idx = fs.readFileSync('src/pages/index.html', 'utf8');
const start = idx.indexOf('<!-- ═══════════════════ 7. WHAT CLIENTS GET ═══════════════════ -->');
const end = idx.indexOf('<!-- ═══════════════════ 8. PRICING ═══════════════════ -->');
if (start < 0 || end < 0) throw new Error('home markers');
idx = idx.slice(0, start) + OFFER + idx.slice(end);
fs.writeFileSync('src/pages/index.html', idx);
patch('src/pages/index.html', [
  ['<p class="cta-note rv rv-d4">For businesses where one customer is worth real money. Engagements start at K10,000/month plus ad spend.</p>',
   '<p class="cta-note rv rv-d4">For businesses where one customer is worth real money. Engagements start at K10,000/month plus ad spend. <span class="slots-pill" data-slots-pill></span></p>'],
  ['<p class="cta-note rv rv-d4">Takes about 4 minutes. We reply on WhatsApp within a few hours, every working day.</p>',
   '<p class="cta-note rv rv-d4">Takes about 4 minutes. We reply on WhatsApp within a few hours, every working day. <span data-slots-line></span></p>'],
  ['<p class="lead rv rv-d2">No mystery, no "we\'ll see". You\'ll know what\'s being built, when it launches and what we\'re changing each week.</p>',
   '<p class="lead rv rv-d2">No mystery, no "we\'ll see". Live in 21 working days from access, and you\'ll know what\'s being built, when it launches and what we\'re changing each week.</p>'],
]);

// ---- Pricing: offer guarantee + website-only card + capacity
patch('src/pages/pricing.html', [
  [`    <div class="spend-note rv">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
      <div><b>Ad spend is separate from the management fee.</b>`,
   `    <div class="offer-guarantee dark rv"><b>Live in 21 working days</b> from the day we get access — or your first month's management fee is on us. <span data-slots-line></span></div>
    <div class="website-card rv">
      <div>
        <span class="eyebrow">Website only</span>
        <h3>Just need a website or landing page?</h3>
        <p>We build them as conversion assets, not brochures: one job per page, WhatsApp and quote paths, mobile-first, fast, tracked. Delivered in 10–14 working days from content sign-off. Add the system later when you're ready for traffic.</p>
      </div>
      <div class="website-price">
        <div class="price"><span class="from">From</span>K7,500<small>once</small></div>
        <ul><li>Landing page or up to 5 pages</li><li>Quote / booking / WhatsApp path</li><li>Tracking &amp; pixel installed</li><li>Hosting setup, basic SEO</li></ul>
        <a class="btn btn-primary" href="/apply?plan=website" data-place="pricing-website">Apply for a website <span class="arrow">→</span></a>
        <p class="adnote">Full business sites from K15,000 · online stores and custom builds from K35,000.</p>
      </div>
    </div>
    <div class="spend-note rv">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
      <div><b>Ad spend is separate from the management fee.</b>`],
  ['<details><summary>Can we start with just a website or just ads?<i>+</i></summary><div class="a">We build websites and run ads — but only as parts of a system, because a website without traffic and ads without follow-up both waste money. If you genuinely only need one component, apply anyway and tell us; we\'ll say honestly whether it makes sense.</div></details>',
   '<details><summary>Can we start with just a website?<i>+</i></summary><div class="a">Yes — websites and landing pages are available on their own, from K7,500, built the same way we build them inside the system (one job per page, tracked, mobile-first). Ads on their own we don\'t do: ads without a page and follow-up behind them waste money.</div></details>'],
]);

// ---- FAQ page: same answer
patch('src/pages/faq.html', [
  ['<details><summary>Do you build landing pages and websites?<i>+</i></summary><div class="a">Yes, as part of the system. Landing pages, full websites and online stores are conversion assets — we build them when the system needs them, not as a separate product line.</div></details>',
   '<details><summary>Do you build landing pages and websites?<i>+</i></summary><div class="a">Yes — inside the system, and on their own from K7,500. Every site is built as a conversion asset: one job per page, a WhatsApp or quote path, tracking installed, mobile-first. Choose "website only" on the application.</div></details>'],
]);

// ---- How it works: mention timeline
patch('src/pages/how-it-works.html', [
  ['<div class="tl"><div class="k">02</div><div><h3>Build</h3><p>The acquisition path and every asset it needs — campaigns, landing page, capture, qualification, follow-up flow, tracking. Usually two to three weeks.</p></div></div>',
   '<div class="tl"><div class="k">02</div><div><h3>Build</h3><p>The acquisition path and every asset it needs — campaigns, landing page, capture, qualification, follow-up flow, tracking. Live in 21 working days from access, or your first month\'s management fee is on us.</p></div></div>'],
]);

// ---- CSS for offer / capacity / website card
let css = fs.readFileSync('public/css/site.css', 'utf8');
if (!css.includes('.offer-guarantee')) {
  css += `
/* ---------- Offer (grand slam) ---------- */
.offer { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(28px, 5vw, 72px); align-items: start; }
@media (max-width: 960px) { .offer { grid-template-columns: 1fr; } }
.offer-guarantee { margin-top: 26px; border-radius: var(--radius); padding: 18px 20px; background: var(--ink); color: var(--text); border-left: 5px solid var(--gold); font-size: 1.02rem; line-height: 1.5; }
.offer-guarantee b { color: var(--gold); }
.offer-guarantee.dark { margin-top: 28px; background: var(--ink-2); border: 1px solid var(--line); border-left: 5px solid var(--gold); }
.stack { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--line-paper); }
.stack li { display: grid; grid-template-columns: 1fr auto; gap: 18px; align-items: center; padding: 15px 0; border-bottom: 1px solid var(--line-paper); font-size: 1.02rem; line-height: 1.35; }
.stack li b { font-family: var(--font-display); font-weight: 800; letter-spacing: -.02em; white-space: nowrap; font-size: 1.1rem; }
.stack li b small { font: 600 .8rem var(--font); color: var(--text-paper-dim); margin-left: 2px; }
.stack li.bonus em { font-style: normal; display: inline-block; font: 800 .68rem/1 var(--font); letter-spacing: .12em; text-transform: uppercase; background: var(--gold); color: var(--gold-ink); padding: 4px 7px; border-radius: 6px; margin-right: 8px; vertical-align: 2px; }
.stack li.total { color: var(--text-paper-dim); }
.stack li.total b { text-decoration: line-through; text-decoration-thickness: 2px; color: var(--text-paper-dim); }
.stack li.price { background: var(--ink); color: var(--text); margin-top: 10px; border-radius: var(--radius); padding: 18px 20px; border: 0; font-weight: 700; }
.stack li.price b { color: var(--gold); font-size: 1.5rem; }
.stack li.price b small { color: var(--text-dim); }
.offer-foot { grid-column: 1 / -1; margin-top: 10px; }
.capacity { display: inline-flex; align-items: center; gap: 10px; font-weight: 700; font-size: .95rem; padding: 10px 16px; border-radius: 999px; background: var(--ink); color: var(--text); margin-bottom: 18px; }
.capacity i { width: 9px; height: 9px; border-radius: 50%; background: var(--gold); box-shadow: 0 0 0 4px rgba(242,183,5,.2); animation: pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%,100% { box-shadow: 0 0 0 4px rgba(242,183,5,.2); } 50% { box-shadow: 0 0 0 8px rgba(242,183,5,.06); } }
@media (prefers-reduced-motion: reduce) { .capacity i { animation: none; } }
.delay { font-size: 1.05rem; max-width: 62ch; color: var(--text-paper-dim); }
.slots-pill { display: inline-block; margin-top: 8px; padding: 6px 12px; border-radius: 999px; border: 1px solid rgba(242,183,5,.45); color: var(--gold); font-weight: 700; font-size: .84rem; }
.slots-pill:empty { display: none; }
.website-card { margin-top: 28px; display: grid; grid-template-columns: 1.2fr .8fr; gap: 32px; border: 1px solid var(--line); border-radius: var(--radius-lg); padding: 30px; background: var(--ink-2); }
@media (max-width: 860px) { .website-card { grid-template-columns: 1fr; } }
.website-card h3 { margin-bottom: 10px; }
.website-card p { color: var(--text-dim); margin: 0; }
.website-price .price { font-family: var(--font-display); font-weight: 800; font-size: 2.4rem; letter-spacing: -.035em; line-height: 1; margin-bottom: 14px; }
.website-price .price small { font: 600 .95rem var(--font); letter-spacing: 0; color: var(--text-dim); margin-left: 6px; }
.website-price .price .from { display: block; font: 600 .8rem var(--font); letter-spacing: .12em; text-transform: uppercase; color: var(--text-faint); margin-bottom: 10px; }
.website-price ul { list-style: none; margin: 0 0 18px; padding: 0; display: grid; gap: 8px; color: var(--text-dim); font-size: .95rem; }
.website-price li::before { content: "✓"; color: var(--gold); margin-right: 10px; font-weight: 700; }
.website-price .adnote { font-size: .84rem; color: var(--text-faint); margin: 12px 0 0; }
`;
  fs.writeFileSync('public/css/site.css', css); console.log('css patched');
}

// ---- site.js: capacity config + renderer
let js = fs.readFileSync('public/js/site.js', 'utf8');
if (!js.includes('TGM_CAPACITY')) {
  js = js.replace("document.addEventListener('DOMContentLoaded', function () {",
`/* ── Capacity (real scarcity) ──────────────────────────────────────────────
   A lean agency can only build a few systems a month properly. Update this
   at the start of every month — it drives every "slots" line on the site.
   Set left to 0 to show a waitlist message instead of a countdown. */
window.TGM_CAPACITY = { max: 3, month: 'October 2026', left: 2 };

document.addEventListener('DOMContentLoaded', function () {
  var cap = window.TGM_CAPACITY;
  var line = cap.left > 0
    ? 'We onboard a maximum of ' + cap.max + ' new systems a month so every build gets done properly. ' + cap.month + ': ' + cap.left + ' of ' + cap.max + ' build slots still open.'
    : 'We onboard a maximum of ' + cap.max + ' new systems a month. ' + cap.month + ' is full — apply now for the next slot.';
  document.querySelectorAll('[data-slots-line]').forEach(function (el) { el.textContent = line; });
  document.querySelectorAll('[data-slots-pill]').forEach(function (el) { el.textContent = cap.left > 0 ? cap.left + ' build slot' + (cap.left === 1 ? '' : 's') + ' left for ' + cap.month : cap.month + ' is full — next slot on application'; });
`);
  fs.writeFileSync('public/js/site.js', js); console.log('site.js patched');
}
