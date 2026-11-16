// Generator for the v3 home page and the Work page (src/pages/index.html, src/pages/results.html).
// The showcase list lives here so both pages stay in sync. Run: node tools/gen-v3.js && node tools/build.js
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, '..', 'src', 'pages');
const check = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
const arrow = '<span class="arrow">→</span>';
const CTA = 'Apply to Work With Us';

// cat: web = client website, soft = software we built, demo = demo build
const WORK = [
  ['schoolflow', 'soft', 'School management software', 'SchoolFlow', 'Fees, attendance and results for schools, with a parent portal. Every payment and every learner accounted for.', 'https://schoolflow-v2.vercel.app/', 'Try the demo'],
  ['sitolo', 'soft', 'Point of sale app', 'Sitolo', 'Sell, track stock and send receipts from a phone. Keeps working when the network drops.', 'https://sitolo.vercel.app/', 'Open the app'],
  ['plumbit', 'web', 'Online store · Plumbing &amp; boreholes', 'Plumbit', 'Product catalogue with WhatsApp ordering and a free-inspection lead path.', 'https://plumbitonline.com/', 'View live site'],
  ['kwendura', 'web', 'Construction &amp; real estate', 'Kwendura', 'A site with a quote path built for high-value building projects.', 'https://kwendura.com/', 'View live site'],
  ['gymflow', 'soft', 'Gym management software', 'GymFlow', 'Member subscriptions, expiries, revenue and renewal reminders, so owners run the gym and not a spreadsheet.', 'https://getgymflow.com/', 'View live site'],
  ['betrworkr', 'demo', 'AI lead assistant', 'Betrworkr', 'AI that replies to every hiring lead in seconds, qualifies the company and books the call.', 'https://betrworkr-demo.vercel.app/', 'Try the demo'],
  ['claz', 'web', 'Event registration · Non-profit', 'CLAZ Marathon 2026', 'Registration, payment and confirmation funnel for a national marathon.', 'https://clazmarathon.org/', 'View live site'],
  ['kopala', 'web', 'Event registration · Corporate', 'KCM Kopala ICR 2026', 'Registration and payment funnel for a corporate relay, with automated confirmations.', 'https://kopalaicr.org/', 'View live site'],
  ['swthair', 'web', 'Online store · Beauty &amp; hair', 'Swt. Hair', 'Luxury storefront for virgin hair and lace wigs, built to turn browsers into WhatsApp orders.', 'https://customerexample1.netlify.app/', 'View live site'],
  ['icr', 'web', 'Corporate services', 'Intercompany Relay', 'An authoritative corporate site built for credibility and enquiries.', 'https://intercompanyrelay.org/', 'View live site'],
  ['ziva', 'web', 'Education · Course enrolment', 'Ziva School', 'Finance academy landing page with enrolment capture and a founder-led offer.', 'https://zivaschool.com/', 'View live site'],
  ['claudine', 'web', 'Beauty · Bookings', 'Hair by Claudine', 'Personal-brand site for a stylist, built around bookings and WhatsApp enquiries.', 'https://hairbyclaudine.com/', 'View live site'],
  ['mhhm', 'web', 'Event · Cause-driven', 'Mental Health Half Marathon', 'Event site designed to drive registrations and share the message.', 'https://mentalhealthhalfmarathon.org/', 'View live site'],
  ['tifa', 'demo', 'Local service website', 'TIFA Pest Control', 'A service site that turns a worried search into a WhatsApp booking in one tap.', 'https://tifa-pest-control.vercel.app/', 'View the demo'],
  ['jci', 'demo', 'Membership web app', 'JCI Zambia', 'An installable web app for a leadership movement: join, follow projects and stay connected.', 'https://jci-zambia-pwa.vercel.app/', 'View the demo'],
];
const card = ([slug, cat, kind, name, desc, url, go]) => `<a class="x-card rv" data-cat="${cat}" href="${url}" target="_blank" rel="noopener"><div class="shot"><div class="d"><img src="/img/work/${slug}-desktop.webp" alt="${name} on desktop" loading="lazy" width="1200" height="750"></div><div class="m"><img src="/img/work/${slug}-mobile.webp" alt="" loading="lazy"></div></div><div class="info"><h3>${name}</h3><span class="kind">${kind}</span><p>${desc}</p><span class="go">${go} ↗</span></div></a>`;
const count = (c) => WORK.filter((w) => w[1] === c).length;
const tabs = `<div class="x-tabs rv" role="group" aria-label="Filter projects">
      <button type="button" data-filter="all" aria-pressed="true">All work<small>${WORK.length}</small></button>
      <button type="button" data-filter="web" aria-pressed="false">Client websites<small>${count('web')}</small></button>
      <button type="button" data-filter="soft" aria-pressed="false">Software<small>${count('soft')}</small></button>
      <button type="button" data-filter="demo" aria-pressed="false">Demos<small>${count('demo')}</small></button>
    </div>`;
const reel = (slugs, rev) => `<div class="x-row${rev ? ' rev' : ''}">${[...slugs, ...slugs].map((x) => `<img src="/img/work/${x}-desktop.webp" alt="" loading="eager" width="1200" height="750">`).join('')}</div>`;
const CLIENTS = ['Cutrite Windows &amp; Glass', 'Janice Wigs', 'Intercompany Relay', 'Plumbit', 'KCM Kopala ICR', 'Kwendura', 'Swt. Hair', 'CLAZ Marathon', 'Ziva School', 'Hair by Claudine', 'Mental Health Half Marathon'];
const marquee = `<div class="marquee"><div class="marquee-track" aria-hidden="true">${[...CLIENTS, ...CLIENTS].map((c) => `<span>${c}</span>`).join('')}</div></div>`;
const it = (t) => `<span class="x-it">${t}</span>`;

const results = `<div class="x-results">
      <article class="x-res rv">
        <div class="num">K100,000+</div>
        <p class="what">in sales for Cutrite Windows &amp; Glass, from Facebook and Instagram enquiries.</p>
        <blockquote>"Within weeks our enquiries went through the roof. Ephraim and his team are the real deal."</blockquote>
        <p class="who">Cutrite Windows &amp; Glass<span>Windows and glazing, Zambia</span></p>
        <small>Client-reported sales from enquiries generated by campaigns we managed. Sales were closed by the client.</small>
      </article>
      <article class="x-res rv rv-d1">
        <div class="num">50+</div>
        <p class="what">wigs sold in two months for Janice Wigs, from social media ads.</p>
        <blockquote>"I've never had results like this before. My business has completely changed."</blockquote>
        <p class="who">Janice Wigs<span>Beauty, Zambia</span></p>
        <small>Client-reported orders from ad-generated WhatsApp enquiries over two months of campaigns.</small>
      </article>
    </div>`;

const end = `
<section class="x-sec x-night x-end" id="apply-cta">
  <div class="x-wrap">
    <h2 class="rv">Let's find your next ${it('customers.')}</h2>
    <div class="x-end-foot rv rv-d1">
      <a class="x-btn acc" href="/apply" data-place="final">${CTA} <i>→</i></a>
      <p>Free, about 30 minutes, no pressure. We look at your numbers and show you exactly what we would build. <span data-slots-line></span></p>
    </div>
  </div>
</section>`;

// ───────────────────────── HOME ─────────────────────────
const home = `<!--meta ${JSON.stringify({ title: 'The Great Media | Meta Ads, Business Systems & AI Agency in Lusaka, Zambia', desc: 'We help businesses scale with Meta ads, custom-built systems and AI. More customers, faster replies and less chasing. Advertising agency in Lusaka, Zambia. Apply to work with us.', })} -->

<section class="x-hero" id="hero">
  <div class="x-wrap">
    <h1 class="rv"><span>More customers.</span><span>${it('Less chasing.')}</span></h1>
    <div class="x-hero-foot rv rv-d1">
      <p class="x-lede">We help ambitious businesses scale with <b>Meta ads</b>, <b>custom-built systems</b> and <b>AI</b> that answers every enquiry in seconds. Based in Lusaka, working across Zambia and beyond.</p>
      <div class="x-hero-cta" data-hero-cta>
        <a class="x-btn" href="/apply" data-place="hero">${CTA} <i>→</i></a>
        <a class="x-text" href="/results">See our projects</a>
      </div>
    </div>
  </div>
</section>

<section class="x-names" aria-label="Businesses we have worked with">
  ${marquee}
</section>

<section id="results">
  <div class="x-wrap">
    <div class="x-facts rv">
      <div class="x-fact"><b>K100,000+</b><span>in sales for one client, from Meta ads we managed</span></div>
      <div class="x-fact"><b>50+</b><span>orders in two months for a beauty brand</span></div>
      <div class="x-fact"><b>${WORK.length}</b><span>websites, apps and systems designed and built</span></div>
      <div class="x-fact"><b>21</b><span>working days from access to launch</span></div>
    </div>
  </div>
</section>

<section class="x-sec" id="services">
  <div class="x-wrap">
    <div class="x-split">
      <h2 class="x-h2 rv">Three things grow a business. We do ${it('all three.')}</h2>
      <p class="x-lede rv rv-d1">Most agencies sell you ads and stop there. We bring the customers in, build what handles them, and automate the work that slows you down.</p>
    </div>
    <div class="x-svcs">
      <a class="x-svc rv" href="/facebook-ads-zambia"><span class="n">01</span><h3>Meta ads</h3><div><p>Facebook and Instagram campaigns built to bring you people who are ready to buy. Not likes. Not empty clicks.</p><ul><li>Strategy and an offer people want</li><li>Ads that stop the scroll, tested every week</li><li>Every kwacha tracked from click to sale</li></ul></div><span class="ar">→</span></a>
      <a class="x-svc rv" href="/website-design-zambia"><span class="n">02</span><h3>Systems</h3><div><p>Websites, online stores, booking and payment flows, and full software. Built for your business, so nothing depends on memory or a spreadsheet.</p><ul><li>Websites and stores that sell</li><li>Registration, booking and payments</li><li>Custom software, like SchoolFlow and Sitolo</li></ul></div><span class="ar">→</span></a>
      <a class="x-svc rv" href="/how-it-works"><span class="n">03</span><h3>AI</h3><div><p>AI assistants that reply to every enquiry in seconds, ask the right questions and hand you buyers who are ready to talk.</p><ul><li>Instant replies, day and night</li><li>Leads qualified before they reach you</li><li>Follow-up that never forgets</li></ul></div><span class="ar">→</span></a>
    </div>
  </div>
</section>

<section class="x-sec x-night" id="problem">
  <div class="x-wrap">
    <p class="x-state rv">You don't have a marketing problem. You have a ${it('leak.')}</p>
    <div class="x-cols">
      <div class="x-col rv"><b>1</b><h3>Slow replies</h3><p>An enquiry sits on WhatsApp for three hours. By then they have messaged two of your competitors.</p></div>
      <div class="x-col rv rv-d1"><b>2</b><h3>No follow-up</h3><p>The quote goes out and nobody chases it. The customer was interested. They just got busy.</p></div>
      <div class="x-col rv rv-d2"><b>3</b><h3>No tracking</h3><p>Nobody knows which ad made the sale, so the budget keeps going to the ones that don't.</p></div>
    </div>
    <p class="x-after rv">We fix all three. That is where the growth is.</p>
  </div>
</section>

<section class="x-sec" id="proof">
  <div class="x-wrap">
    <div class="x-split"><h2 class="x-h2 rv">Real businesses. ${it('Real numbers.')}</h2><span></span></div>
    ${results}
    <p class="x-more rv" style="justify-content:flex-start"><a class="x-text" href="/results">See all ${WORK.length} projects we have built</a></p>
  </div>
</section>

<section class="x-sec" id="process" style="padding-top:0">
  <div class="x-wrap">
    <div class="x-split"><h2 class="x-h2 rv">From first call to first customers, ${it('in weeks.')}</h2><span></span></div>
    <div class="x-steps">
      <div class="x-step rv"><h3>Free growth call</h3><p>We look at your offer, your numbers and where customers are slipping away. You leave with a clear plan.</p></div>
      <div class="x-step rv rv-d1"><h3>We build it</h3><p>Ads, pages, systems and AI, built for your business and live within 21 working days of getting access.</p></div>
      <div class="x-step rv rv-d2"><h3>Launch and improve</h3><p>We watch the numbers every week, keep what works and cut what does not. You get a plain-English report.</p></div>
      <div class="x-step rv rv-d3"><h3>Scale</h3><p>Once it is profitable, we put more behind it and open the next channel.</p></div>
    </div>
  </div>
</section>

<section class="x-sec x-offer-sec" id="offer">
  <div class="x-wrap x-offer">
    <div>
      <h2 class="x-h2 rv">One team. Everything you need to ${it('grow.')}</h2>
      <p class="x-lede rv rv-d1">You don't hire an ads person, a web designer, a developer and an AI consultant, then hope they talk to each other. You get one team that builds it, runs it and answers for the result.</p>
      <p class="x-promise rv rv-d2">Live within 21 working days of getting access, or your first month of management is on us.</p>
      <a class="x-btn dark rv rv-d3" href="/apply" data-place="offer">${CTA} <i>→</i></a>
      <p class="x-cap rv"><span data-slots-line></span></p>
    </div>
    <ul class="x-list rv rv-d1">
      <li><i>a</i><div><b>Growth strategy and offer</b><span>Who to reach, what to say and what to offer them.</span></div></li>
      <li><i>b</i><div><b>Meta ads, created and managed</b><span>Creative, copy, targeting and weekly testing on Facebook and Instagram.</span></div></li>
      <li><i>c</i><div><b>A page or site built to convert</b><span>Fast on phones, clear in seconds, one tap to enquire.</span></div></li>
      <li><i>d</i><div><b>AI and follow-up</b><span>Instant replies, lead qualification and reminders, so nobody is forgotten.</span></div></li>
      <li><i>e</i><div><b>Tracking from ad to sale</b><span>You always know what a customer costs and where to spend next.</span></div></li>
      <li><i>f</i><div><b>A weekly report in plain English</b><span>What we spent, what came in, what we are changing.</span></div></li>
    </ul>
  </div>
</section>

<section class="x-sec" id="founder">
  <div class="x-wrap x-founder">
    <img class="rv" src="/img/ephraim.jpg" alt="Ephraim Banda, founder of The Great Media" loading="lazy" width="800" height="653">
    <div>
      <blockquote class="rv rv-d1">"I kept seeing good Zambian businesses pay for adverts and get nothing back. The advert was never the problem. Everything around it was."</blockquote>
      <p class="sig rv rv-d2"><b>Ephraim Banda</b>Founder, The Great Media</p>
      <a class="x-text rv rv-d3" href="/about">About us</a>
    </div>
  </div>
</section>

<section class="x-sec" id="faq" style="padding-top:0">
  <div class="x-wrap">
    <div class="x-split"><h2 class="x-h2 rv">Straight ${it('answers.')}</h2><span></span></div>
    <div class="x-faq faq rv">
      <details><summary>What does it cost?<i>+</i></summary><div class="a">It depends on what your business needs, so we do not publish a price list. After the free growth call you get a clear proposal with a fixed fee and a recommended ad budget. No surprises.</div></details>
      <details><summary>Is the growth call really free?<i>+</i></summary><div class="a">Yes. We look at your numbers together and show you what we would build. If we are not the right fit, we tell you, and you keep the plan.</div></details>
      <details><summary>How quickly can we launch?<i>+</i></summary><div class="a">Within 21 working days of getting access to your accounts and content. Enquiries usually start in the first days after launch.</div></details>
      <details><summary>Do you guarantee customers?<i>+</i></summary><div class="a">No, and be careful of anyone who does. We guarantee the work we control: the strategy, the build, the launch date, the weekly optimisation and the reporting. Sales also depend on your offer, your market and your follow-up.</div></details>
      <details><summary>What can AI actually do for my business?<i>+</i></summary><div class="a">Reply to enquiries in seconds at any hour, ask the questions your team would ask, answer common questions about your products, and pass serious buyers to you with the details already collected.</div></details>
      <details><summary>Do you build websites and software on their own?<i>+</i></summary><div class="a">Yes. We build websites, online stores, booking and payment flows and custom software as stand-alone projects. See <a href="/results">our work</a> for live examples.</div></details>
      <details><summary>Do you work outside Lusaka?<i>+</i></summary><div class="a">Yes. We are based in Lusaka and work with businesses across Zambia and beyond. Everything runs remotely, with weekly reporting.</div></details>
    </div>
  </div>
</section>
${end}
`;

// ───────────────────────── WORK ─────────────────────────
const work = `<!--meta ${JSON.stringify({ title: 'Our Work: Websites, Software & Ad Results | The Great Media, Zambia', desc: `${WORK.length} live websites, apps and systems built by The Great Media in Zambia, plus client results from Meta ads: K100,000+ in sales for Cutrite Windows & Glass and 50+ orders in two months for Janice Wigs.`, crumb: 'Our work' })} -->

<section class="x-hero" style="padding-bottom:clamp(36px,5vw,70px)">
  <div class="x-wrap">
    <h1 class="rv"><span>Work you can</span><span>${it('click on.')}</span></h1>
    <div class="x-hero-foot rv rv-d1">
      <p class="x-lede">${WORK.length} projects, all live. Open any of them, try it on your phone, then picture what we could build for you.</p>
      <div class="x-hero-cta"><a class="x-btn" href="/apply" data-place="hero">${CTA} <i>→</i></a></div>
    </div>
  </div>
</section>

<section id="work" style="padding-bottom:clamp(84px,11vw,168px)">
  <div class="x-wrap">
    ${tabs}
    <div class="x-show three" data-show>
      ${WORK.map(card).join('\n      ')}
    </div>
  </div>
</section>

<section class="x-sec" id="cases" style="padding-top:0">
  <div class="x-wrap">
    <div class="x-split"><h2 class="x-h2 rv">What happened when we ran ${it('the ads.')}</h2><p class="x-lede rv rv-d1">Every figure says what it measures and who reported it.</p></div>
    ${results}
  </div>
</section>
${end}
`;

fs.writeFileSync(path.join(OUT, 'index.html'), home);
fs.writeFileSync(path.join(OUT, 'results.html'), work);
console.log('wrote index.html and results.html with', WORK.length, 'projects');
