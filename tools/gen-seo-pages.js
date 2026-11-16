// One-off generator for the search-targeted pages (services hub, service pages, guides).
// Run once: node tools/gen-seo-pages.js  → writes src/pages/<slug>.html. After that, edit the
// generated files in src/pages directly (or edit the data here and re-run; it overwrites them).
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, '..', 'src', 'pages');
const check = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
const arrow = '<span class="arrow">→</span>';

const SERVICES = [
  ['facebook-ads-zambia', 'Facebook &amp; Instagram ads', 'Campaigns on Facebook and Instagram that bring enquiries from people who can actually buy.'],
  ['google-ads-zambia', 'Google Ads', 'Show up when someone in Zambia searches for exactly what you sell.'],
  ['tiktok-ads-zambia', 'TikTok ads', 'Short video ads that turn views into enquiries and orders.'],
  ['website-design-zambia', 'Website design', 'Websites and online stores built to turn visitors into customers.'],
  ['software-development-zambia', 'Custom software', 'Systems built around how your business runs, like SchoolFlow, GymFlow and Sitolo.'],
  ['ai-automation-zambia', 'AI automation', 'AI assistants that reply to every enquiry in seconds and qualify the lead for you.'],
];
const GUIDES = [
  ['facebook-ads-cost-zambia', 'How much do Facebook ads cost in Zambia?'],
  ['website-cost-zambia', 'How much does a website cost in Zambia?'],
];

const related = (skip) => `
<section class="s-paper pad-sm">
  <div class="container">
    <div class="section-head"><span class="eyebrow rv">More from The Great Media</span><h2 class="rv rv-d1">Everything connects into one system.</h2></div>
    <div class="svc-grid three">
      ${SERVICES.filter(s => s[0] !== skip).map(([slug, name, d], i) => `<a class="svc rv${i ? ' rv-d' + i : ''}" href="/${slug}"><h3>${name}</h3><p>${d}</p><span class="link">Learn more ${arrow}</span></a>`).join('\n      ')}
    </div>
    <p class="mt-lg rv">Guides: ${GUIDES.map(([s, t]) => `<a class="link" href="/${s}">${t}</a>`).join(' &nbsp;·&nbsp; ')}</p>
  </div>
</section>`;

const finalCta = (h, p) => `
<section class="final s-dark">
  <div class="bg" aria-hidden="true"><img src="/img/art/cta-ripple.webp" alt="" loading="lazy"></div>
  <div class="container">
    <span class="eyebrow rv" style="justify-content:center">Next step</span>
    <h2 class="rv rv-d1">${h}</h2>
    <p class="lead rv rv-d2" style="text-align:center">${p}</p>
    <p class="rv rv-d3"><a class="btn btn-primary btn-lg" href="/apply" data-place="final">Apply to Work With Us ${arrow}</a></p>
    <p class="cta-note rv rv-d4">Takes about 4 minutes to apply. We reply on WhatsApp within a few hours, every working day. <span data-slots-line></span></p>
  </div>
</section>`;

const faq = (items) => `<div class="faq rv">
      ${items.map(([q, a]) => `<details><summary>${q}<i>+</i></summary><div class="a">${a}</div></details>`).join('\n      ')}
    </div>`;

function service(p) {
  const meta = { title: p.title, desc: p.desc, crumb: p.crumb, parent: ['Services', '/services'], jsonld: { '@context': 'https://schema.org', '@type': 'Service', name: p.schemaName, serviceType: p.schemaName, description: p.desc, areaServed: { '@type': 'Country', name: 'Zambia' }, provider: { '@id': 'https://thegreatmediazm.com/#org' }, url: `https://thegreatmediazm.com/${p.slug}`, ...(p.offer ? { offers: p.offer } : {}) } };
  return `<!--meta ${JSON.stringify(meta)} -->

<section class="page-hero s-dark">
  <div class="hero-glow" aria-hidden="true"></div>
  <div class="container">
    <span class="eyebrow rv">${p.eyebrow}</span>
    <h1 class="rv rv-d1" style="max-width:19ch">${p.h1}</h1>
    <p class="lead rv rv-d2" style="max-width:56ch">${p.lead}</p>
    <div class="cta-row rv rv-d3" data-hero-cta>
      <a class="btn btn-primary btn-lg" href="${p.applyHref || '/apply'}" data-place="hero">${p.cta || 'Apply to Work With Us'} ${arrow}</a>
      <a class="btn btn-ghost btn-lg" href="{{WA}}" target="_blank" rel="noopener">Ask on WhatsApp</a>
    </div>
    <p class="cta-note rv rv-d4">${p.note}</p>
  </div>
</section>

<section class="s-paper pad">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow rv">What you get</span>
      <h2 class="rv rv-d1">${p.incH2}</h2>
      <p class="lead rv rv-d2">${p.incLead}</p>
    </div>
    <ul class="checks rv">
      ${p.includes.map(([t, s]) => `<li>${check}<span>${t}<small>${s}</small></span></li>`).join('\n      ')}
    </ul>
  </div>
</section>

<section class="s-dark pad">
  <div class="container">
    <div class="grid-2">
      <div>
        <span class="eyebrow rv">${p.whyEyebrow}</span>
        <h2 class="rv rv-d1">${p.whyH2}</h2>
        ${p.whyBody.map(t => `<p class="rv rv-d2 muted">${t}</p>`).join('\n        ')}
      </div>
      <div>
        <ol class="num-list rv rv-d2">
          ${p.steps.map((t, i) => `<li><b>0${i + 1}</b><span>${t}</span></li>`).join('\n          ')}
        </ol>
      </div>
    </div>
  </div>
</section>

<section class="s-paper pad-sm">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow rv">Proof</span>
      <h2 class="rv rv-d1">${p.proofH2}</h2>
    </div>
    <div class="grid-2">
      ${p.proof.map(([q, who, sub, ini], i) => `<div class="quote rv${i ? ' rv-d1' : ''}"><p>${q}</p><div class="who"><i>${ini}</i><span><b>${who}</b>${sub}</span></div></div>`).join('\n      ')}
    </div>
    <p class="mt-lg rv"><a class="link" href="/results">See all results and case studies ${arrow}</a></p>
  </div>
</section>

<section class="s-dark pad-sm">
  <div class="container narrow">
    <span class="eyebrow rv">Cost</span>
    <h2 class="rv rv-d1">${p.costH2}</h2>
    ${p.cost.map(t => `<p class="rv rv-d2 muted" style="max-width:66ch">${t}</p>`).join('\n    ')}
    <p class="rv rv-d3"><a class="link" href="/apply">Apply to work with us ${arrow}</a></p>
  </div>
</section>

<section class="s-paper pad">
  <div class="container narrow">
    <div class="section-head"><span class="eyebrow rv">Questions</span><h2 class="rv rv-d1">${p.faqH2}</h2></div>
    ${faq(p.faq)}
  </div>
</section>
${related(p.slug)}
${finalCta(p.finalH, p.finalP)}
`;
}

function guide(p) {
  const meta = { title: p.title, desc: p.desc, crumb: p.crumb, parent: ['Guides', '/services#guides'], jsonld: { '@context': 'https://schema.org', '@type': 'Article', headline: p.h1.replace(/&amp;/g, '&'), description: p.desc, datePublished: p.date, dateModified: p.date, author: { '@type': 'Person', name: 'Ephraim Banda', url: 'https://thegreatmediazm.com/about' }, publisher: { '@id': 'https://thegreatmediazm.com/#org' }, mainEntityOfPage: `https://thegreatmediazm.com/${p.slug}` } };
  return `<!--meta ${JSON.stringify(meta)} -->

<section class="page-hero s-dark">
  <div class="hero-glow" aria-hidden="true"></div>
  <div class="container narrow">
    <span class="eyebrow rv">Guide · Zambia</span>
    <h1 class="rv rv-d1" style="max-width:20ch">${p.h1}</h1>
    <p class="lead rv rv-d2" style="max-width:60ch">${p.lead}</p>
    <p class="cta-note rv rv-d3">By Ephraim Banda, founder of The Great Media · Lusaka · Updated ${p.dateText}</p>
  </div>
</section>

<section class="s-paper pad-sm">
  <div class="container narrow prose">
    <div class="answer rv"><b>The short answer</b><p>${p.short}</p></div>
${p.body}
    <div class="prose-cta rv">
      <h3>${p.ctaH}</h3>
      <p>${p.ctaP}</p>
      <a class="btn btn-primary" href="${p.applyHref || '/apply'}" data-place="guide">${p.ctaBtn} ${arrow}</a>
    </div>
  </div>
</section>

<section class="s-paper pad-sm" style="padding-top:0">
  <div class="container narrow">
    <div class="section-head"><span class="eyebrow rv">Questions</span><h2 class="rv rv-d1">Quick answers</h2></div>
    ${faq(p.faq)}
  </div>
</section>
${related('')}
${finalCta(p.finalH, p.finalP)}
`;
}

const cutrite = ['"The Great Media completely transformed how our business gets customers. Within weeks our enquiries went through the roof."', 'Cutrite Windows &amp; Glass', 'Windows &amp; glazing · Zambia · K100,000+ in sales from Facebook &amp; Instagram enquiries', 'CW'];
const janice = ['"I sold over 50 wigs in just 2 months. I\'ve never had results like this before."', 'Janice Wigs', 'Beauty · Zambia · 50+ wigs sold in 2 months from social media ads', 'JW'];
const relay = ['"Professional, fast and delivers. Our website has been bringing in leads consistently since launch. Best investment we\'ve made in our business."', 'Intercompany Relay', 'Corporate services · Zambia', 'IR'];

const pages = {};

pages['facebook-ads-zambia'] = service({
  slug: 'facebook-ads-zambia', crumb: 'Facebook & Instagram ads', schemaName: 'Facebook and Instagram advertising management',
  title: 'Facebook & Instagram Ads Agency in Zambia | The Great Media',
  desc: 'Facebook and Instagram ads management for Zambian businesses. We plan, build and run your campaigns, landing page and WhatsApp follow-up as one system. Based in Lusaka.',
  eyebrow: 'Facebook &amp; Instagram ads · Zambia',
  h1: 'Facebook ads in Zambia that bring <em>customers</em>, not just likes.',
  lead: 'We are a Lusaka advertising agency that plans, builds and manages Facebook and Instagram campaigns for Zambian businesses, then connects them to a landing page, WhatsApp follow-up and tracking, so enquiries turn into sales.',
  note: 'Ad spend is paid directly to Meta from your own ad account, so you always own the data.',
  incH2: 'More than boosting posts.', incLead: 'A boosted post buys attention. A managed campaign buys enquiries from the right people, and a way to turn them into customers.',
  includes: [
    ['Strategy and offer', 'Who to reach, what to say and what to offer, based on what one customer is worth to you.'],
    ['Ad creative and copy', 'Images, videos and words made for your business, tested against each other every week.'],
    ['Targeting across Zambia', 'Lusaka, the Copperbelt or the whole country, aimed at the people most likely to buy.'],
    ['Landing page or lead form', 'One clear page with one job: turn the click into a real enquiry with a name and a number.'],
    ['WhatsApp follow-up', 'Reply templates, reminders and a routine, so no enquiry is left unanswered.'],
    ['Meta pixel and tracking', 'You see which ad produced which enquiry and which sale.'],
    ['Weekly optimisation', 'Budgets move to what works. What does not work is switched off.'],
    ['Plain-English weekly report', 'Spend, enquiries, cost per enquiry and sales. No jargon.'],
  ],
  whyEyebrow: 'Why most ads fail', whyH2: 'The ad is rarely the problem. What happens after the click is.',
  whyBody: ['Most Zambian businesses that say "Facebook ads don\'t work" got enquiries. The enquiries sat on WhatsApp for hours, nobody followed up, and nobody could say which ad was working.', 'So we build the whole path: ad, enquiry, qualification, follow-up, sale and measurement.'],
  steps: ['<strong>Diagnose.</strong> We look at your offer, your numbers and where enquiries leak today.', '<strong>Build.</strong> Campaigns, landing page, lead capture and follow-up, live in 21 working days from access.', '<strong>Launch.</strong> Ads go live with tracking in place from day one.', '<strong>Optimise.</strong> Weekly changes to creative, targeting and follow-up, based on numbers.', '<strong>Scale.</strong> Put more budget behind what is working.'],
  proofH2: 'Results from Facebook and Instagram campaigns we manage.', proof: [cutrite, janice],
  costH2: 'What do Facebook ads cost in Zambia?',
  cost: ['There are two costs. <strong>Ad spend</strong> goes straight to Meta from your own ad account, and you set the budget. <strong>Management</strong> is a fixed monthly fee that covers strategy, creative, the landing page, follow-up, tracking and reporting.', 'If your application is accepted, we recommend a budget based on what one customer is worth to you, then send a clear proposal. <a class="link" href="/facebook-ads-cost-zambia">Read the budget guide</a>.'],
  faqH2: 'Facebook ads in Zambia: common questions.',
  faq: [
    ['Do Facebook ads work in Zambia?', 'Yes, when the offer is clear and enquiries are followed up quickly. Cutrite Windows &amp; Glass made K100,000+ in sales from enquiries our campaigns generated, and Janice Wigs sold 50+ wigs in two months.'],
    ['How much should I spend on Facebook ads?', 'Enough to get clear data within weeks. The right number depends on what one customer is worth to you. Higher-value sales such as construction, real estate and vehicles usually justify more. We recommend a specific budget once we have looked at your numbers.'],
    ['Can I just boost posts myself?', 'You can, and for awareness it is fine. Boosting is built to get reactions. Campaigns built in Ads Manager can be optimised for enquiries and sales, tested properly and tracked to revenue.'],
    ['How do I pay for Facebook ads from Zambia?', 'Ad spend is paid from your own ad account, directly to Meta, with your own card. You own the account and the data, and you can see every kwacha spent. Our fee is separate.'],
    ['How fast will I see results?', 'Campaigns go live within 21 working days of getting access. Enquiries usually start in the first days after launch, and the first month is about finding which audience, offer and creative work best. We ask for a 90-day commitment so there is time to optimise.'],
    ['Do you also run Instagram ads?', 'Yes. Facebook and Instagram run from the same Meta Ads Manager, so your campaigns appear on both, as well as Messenger and WhatsApp click-to-chat ads.'],
  ],
  finalH: 'Want Facebook ads that pay for themselves?', finalP: 'Tell us what you sell, what a customer is worth and how you handle enquiries today. If there is a fit, we will show you exactly what we would build.',
});

pages['google-ads-zambia'] = service({
  slug: 'google-ads-zambia', crumb: 'Google Ads', schemaName: 'Google Ads management',
  title: 'Google Ads Agency in Zambia | Search Ads Management | The Great Media',
  desc: 'Google Ads management in Zambia. Appear when customers search for what you sell, send them to a page built to convert, and track every enquiry to a sale. Lusaka-based agency.',
  eyebrow: 'Google Ads · Zambia',
  h1: 'Google Ads in Zambia: be there when they <em>search</em>.',
  lead: 'When someone in Lusaka types "aluminium windows near me" or "solar installer Zambia", they are ready to buy. We put your business in front of that search, send the click to a page built to convert, and track it through to the sale.',
  note: 'Ad spend is paid directly to Google from your own account. You only pay Google when someone clicks.',
  incH2: 'Search campaigns, built and managed.', incLead: 'Facebook ads find people who might want what you sell. Google Ads catches the people already looking for it.',
  includes: [
    ['Keyword research for Zambia', 'The real words your customers type, in your town and your trade.'],
    ['Search campaigns', 'Ads that appear at the top of Google for the searches that matter.'],
    ['Negative keywords', 'We block the searches that waste money: job seekers, students, free downloads.'],
    ['Landing page', 'A fast mobile page that answers the search and makes calling or WhatsApp one tap.'],
    ['Call and WhatsApp tracking', 'Know which keyword made the phone ring.'],
    ['Google Business Profile check', 'So you also show up on the map for local searches.'],
    ['Weekly optimisation', 'Bids, keywords and ad copy adjusted on real numbers.'],
    ['Plain-English weekly report', 'Spend, clicks, enquiries, cost per enquiry and sales.'],
  ],
  whyEyebrow: 'When Google Ads fits', whyH2: 'Best for things people search for when they need them.',
  whyBody: ['Google Ads works best for services and products with clear search demand: construction, windows and doors, solar, vehicle services, real estate, professional services and urgent repairs.', 'In many Zambian industries few competitors advertise on Google yet, which can keep costs reasonable. We will tell you honestly in the diagnostic if search volume for your business is too low to be worth it.'],
  steps: ['<strong>Diagnose.</strong> We check how many people search for what you sell and what a customer is worth.', '<strong>Build.</strong> Account, campaigns, landing page and tracking, live in 21 working days from access.', '<strong>Launch.</strong> Ads go live on the searches most likely to become customers.', '<strong>Optimise.</strong> Weekly search-term reviews so the budget stops leaking to bad clicks.', '<strong>Scale.</strong> Expand to more keywords, towns and services.'],
  proofH2: 'The same system behind our client results.', proof: [cutrite, relay],
  costH2: 'What do Google Ads cost in Zambia?',
  cost: ['You pay Google only when someone clicks your ad, from your own account. The right budget depends on how many people search for your service; we recommend a number once we have looked at your numbers. Management is a fixed monthly fee, set out in your proposal.'],
  faqH2: 'Google Ads in Zambia: common questions.',
  faq: [
    ['Do Google Ads work in Zambia?', 'Yes, for products and services people actively search for. In many Zambian industries few competitors advertise on Google yet. We check the search demand for your business before recommending it.'],
    ['Google Ads or Facebook ads: which is better?', 'They do different jobs. Google catches people already searching for what you sell. Facebook and Instagram create demand among people who were not searching yet. Most businesses start with one and add the other once the first is profitable.'],
    ['How do I pay Google from Zambia?', 'With your own card, in your own Google Ads account. You own the account and the data. Our management fee is separate.'],
    ['How long before Google Ads bring enquiries?', 'Search ads can bring enquiries from the first week, because the people clicking are already looking. The first month is spent cutting wasted searches and improving cost per enquiry.'],
    ['Do I need a website for Google Ads?', 'You need a page to send people to. If your current site is slow or unclear, we build a landing page for the campaign as part of the work.'],
  ],
  finalH: 'Want to be the first result your customers see?', finalP: 'Tell us what you sell and where. We will check the search demand and show you what we would build.',
});

pages['ai-automation-zambia'] = service({
  slug: 'ai-automation-zambia', crumb: 'AI automation', schemaName: 'AI automation and AI assistants for business',
  title: 'AI Automation for Businesses in Zambia | The Great Media',
  desc: 'AI automation for Zambian businesses. AI assistants that reply to enquiries in seconds, qualify leads, answer common questions and follow up, built around how your business works. Lusaka-based agency.',
  eyebrow: 'AI automation · Zambia',
  h1: 'AI for your business that answers every enquiry in <em>seconds.</em>',
  lead: 'Most enquiries are lost in the first hour, while everyone is busy. We build AI assistants for Zambian businesses that reply at once, ask the right questions and hand your team buyers who are ready to talk.',
  note: 'Built around your business, your products and the way you already talk to customers.',
  incH2: 'What an AI assistant does for you.', incLead: 'It does the repetitive part of sales and customer service, at any hour, so your people spend their time on customers who are ready.',
  includes: [
    ['Instant replies, day and night', 'Every enquiry gets an answer in seconds, including evenings and weekends.'],
    ['Lead qualification', 'It asks what they need, when and where, so you know who is serious before you call.'],
    ['Answers to common questions', 'Opening hours, services, locations and how to order, answered from your own information.'],
    ['Hand-over to a person', 'Serious buyers and anything unusual go to your team, with the details already collected.'],
    ['Follow-up that never forgets', 'Reminders and check-ins for people who went quiet after asking.'],
    ['Booking and enquiry capture', 'Names, numbers and requests recorded in one place, not lost in a chat.'],
    ['Trained on your business', 'It uses your offers, your tone and your rules. It says when it does not know.'],
    ['Reports you can read', 'How many enquiries came in, what people asked, and how many became leads.'],
  ],
  whyEyebrow: 'Why it matters', whyH2: 'Speed wins the customer.',
  whyBody: ['When someone messages three businesses, the first helpful reply usually gets the sale. A person cannot answer every message in seconds. An AI assistant can.', 'It works best next to advertising: the ads bring the enquiries, and the assistant makes sure none of them is wasted.'],
  steps: ['<strong>Map.</strong> We list the questions your customers ask and what a good lead looks like.', '<strong>Build.</strong> We set up the assistant with your information, tone and rules.', '<strong>Test.</strong> You try to break it before any customer sees it.', '<strong>Launch.</strong> It goes live where your enquiries arrive.', '<strong>Improve.</strong> We review real conversations and tighten the answers.'],
  proofH2: 'See one working.', proof: [['Betrworkr is an AI lead assistant we built as a demo: it replies to every hiring lead in seconds, qualifies the company and books the call. You can try it on the projects page.', 'Betrworkr demo', 'AI lead assistant', 'BW'], cutrite],
  costH2: 'What does AI automation cost?',
  cost: ['It depends on what the assistant has to do and where it runs. If your application is accepted, you get a clear proposal with a fixed fee before any work starts.'],
  faqH2: 'AI for business in Zambia: common questions.',
  faq: [
    ['What can AI do for a small or medium business?', 'Reply to enquiries in seconds, answer common questions, collect the details of what a customer needs, qualify leads, follow up with people who went quiet and pass serious buyers to your team.'],
    ['Will customers know they are talking to AI?', 'We recommend being open about it. Customers mostly care that they get a fast, correct answer and can reach a person when they need one.'],
    ['What if the AI gives a wrong answer?', 'It is set up to answer only from your information and to hand over to a person when it is unsure. We test it with you before launch and review real conversations afterwards.'],
    ['Do I need new software or a new phone number?', 'Usually not. We build around the channels your customers already use and tell you clearly if anything new is needed.'],
    ['Does AI replace my staff?', 'No. It takes the repetitive first replies off their hands so they can spend time on customers who are ready to buy.'],
  ],
  finalH: 'Want every enquiry answered in seconds?', finalP: 'Tell us how enquiries reach you today. If there is a fit, we will show you exactly what we would build.',
});

pages['software-development-zambia'] = service({
  slug: 'software-development-zambia', crumb: 'Custom software', schemaName: 'Custom software and web application development',
  title: 'Custom Software Development in Zambia | The Great Media',
  desc: 'Custom software development in Lusaka, Zambia. Web apps and business systems for schools, gyms and shops: payments, records and bookings in one place.',
  eyebrow: 'Custom software · Zambia',
  h1: 'Custom software for Zambian businesses, built around how you <em>work.</em>',
  lead: 'When a business outgrows paper registers and spreadsheets, things start to slip: payments, stock, bookings, records. We design and build web apps and business systems that keep all of it in one place, on any phone.',
  note: 'Built to work on phones and on slow internet, because that is how your team and customers use it.',
  incH2: 'Software that fits the business.', incLead: 'Off-the-shelf tools make you change how you work. We build around the way you already run things, and remove the parts that waste time.',
  includes: [
    ['Design around your process', 'We map how work moves through your business before writing any code.'],
    ['Works on any phone', 'Runs in the browser and can be added to the home screen like an app.'],
    ['Payments and records', 'Who paid, who owes and what was sold, without a spreadsheet.'],
    ['Bookings and registrations', 'Customers book, register and pay without calling you.'],
    ['Dashboards and reports', 'The numbers an owner needs, on one screen.'],
    ['Roles and permissions', 'Staff see what they need. Owners see everything.'],
    ['Built for slow networks', 'Fast on mobile data, and able to keep working when the connection drops.'],
    ['Support after launch', 'Fixes, improvements and new features as the business grows.'],
  ],
  whyEyebrow: 'How a build runs', whyH2: 'From a messy process to a working system.',
  whyBody: ['You explain how the work is done today and where it goes wrong. We turn that into a simple system your team can learn in an afternoon.', 'You see working software early and often, not a long wait followed by a surprise.'],
  steps: ['<strong>Understand.</strong> We learn the process, the people and the problems.', '<strong>Design.</strong> Screens and flows you can click through before the build.', '<strong>Build.</strong> In stages, with something working to test at each one.', '<strong>Launch.</strong> Set-up, data and a walkthrough for your team.', '<strong>Support.</strong> We stay on to fix, improve and extend it.'],
  proofH2: 'Software we have built.', proof: [['SchoolFlow handles fees, attendance and results for schools, with a parent portal. GymFlow tracks memberships, expiries and renewals for gyms. Sitolo lets a shop sell, track stock and send receipts from a phone.', 'SchoolFlow, GymFlow and Sitolo', 'All three are live on the projects page', 'GM'], ['Registration and payment systems for the CLAZ Marathon and the KCM Kopala ICR, with automated confirmations for every entrant.', 'Event systems', 'Registration, payment and confirmation', 'EV']],
  costH2: 'What does custom software cost?',
  cost: ['It depends on the size of the system: the number of screens, users and features. If your application is accepted, we scope it with you and give a fixed quote before work starts.'],
  faqH2: 'Custom software in Zambia: common questions.',
  faq: [
    ['How long does it take to build custom software?', 'A focused system usually takes a few weeks to a few months, depending on its size. We build in stages so you can use the first part while the rest is being finished.'],
    ['Do I need an app from the app store?', 'Usually not. We build web apps that open in any phone browser and can be added to the home screen, which avoids app-store delays and works on older phones.'],
    ['Will it work with poor internet?', 'We design for slow and unreliable connections. Where it matters, the system keeps working offline and syncs when the connection returns, as Sitolo does.'],
    ['Who owns the software?', 'That is agreed in writing before the build starts, so there are no surprises later.'],
    ['Can you improve a system we already have?', 'Often, yes. We look at what you have first and tell you honestly whether to improve it or replace it.'],
  ],
  finalH: 'Ready to replace the spreadsheet?', finalP: 'Tell us how your business runs today and where it slows down. If there is a fit, we will show you exactly what we would build.',
});

pages['tiktok-ads-zambia'] = service({
  slug: 'tiktok-ads-zambia', crumb: 'TikTok ads', schemaName: 'TikTok advertising management',
  title: 'TikTok Ads Agency in Zambia | The Great Media',
  desc: 'TikTok ads management for Zambian businesses. Short video ads, built and run for you, connected to WhatsApp follow-up and tracking so views turn into enquiries and sales.',
  eyebrow: 'TikTok ads · Zambia',
  h1: 'TikTok ads in Zambia that turn views into <em>enquiries</em>.',
  lead: 'More and more Zambian buyers discover products on TikTok. We plan and manage short video ad campaigns for your business and connect them to a landing page, WhatsApp follow-up and tracking.',
  note: 'Ad spend is paid directly to TikTok from your own account.',
  incH2: 'Video ads, done properly.', incLead: 'Going viral is luck. Paid TikTok campaigns are a repeatable way to reach the right people every day.',
  includes: [
    ['Video ad concepts and scripts', 'Hooks and scripts written for your product and your customer.'],
    ['Video editing', 'Captions, pacing and sound that hold attention in the first three seconds.'],
    ['Campaign setup in TikTok Ads Manager', 'Objectives, audiences and budgets set for enquiries, not just views.'],
    ['Landing page or lead form', 'A clear next step after the video: WhatsApp, form or call.'],
    ['WhatsApp follow-up', 'Templates and reminders so every enquiry gets an answer.'],
    ['TikTok pixel and tracking', 'See which video produced which enquiry.'],
    ['Weekly creative testing', 'New videos tested every week; winners get the budget.'],
    ['Plain-English weekly report', 'Spend, views, enquiries and sales.'],
  ],
  whyEyebrow: 'When TikTok fits', whyH2: 'Best for products you can show.',
  whyBody: ['TikTok works well for beauty, fashion, food, events, vehicles, property walk-throughs and any product or service that looks good on video.', 'It usually works best alongside Facebook and Instagram, with the same videos adapted for each platform.'],
  steps: ['<strong>Diagnose.</strong> Your offer, your customer and whether TikTok is the right platform.', '<strong>Build.</strong> Video ads, campaign, landing page and follow-up, live in 21 working days from access.', '<strong>Launch.</strong> Ads go live with tracking from day one.', '<strong>Optimise.</strong> Fresh videos and audiences tested every week.', '<strong>Scale.</strong> More budget behind the videos that sell.'],
  proofH2: 'Social media ads that sold.', proof: [janice, cutrite],
  costH2: 'What do TikTok ads cost in Zambia?',
  cost: ['Ad spend is paid directly to TikTok and you set the budget. Management is a fixed monthly fee, set out in your proposal.'],
  faqH2: 'TikTok ads in Zambia: common questions.',
  faq: [
    ['Can you advertise on TikTok in Zambia?', 'Yes. Zambian businesses can run paid campaigns through TikTok Ads Manager and target people in Zambia by location, age and interests.'],
    ['Do I need to appear in the videos myself?', 'No. Product demonstrations, customer stories, before-and-after footage and voice-over videos all work. We help you plan what to film with a phone.'],
    ['Is TikTok only for young people?', 'The audience is younger on average than Facebook\'s, though people of all ages use it. If your buyers are mostly older decision-makers, we may recommend Facebook or Google first.'],
    ['Do I need lots of followers?', 'No. Paid ads reach people who do not follow you. A new account can run ads from day one.'],
  ],
  finalH: 'Want your product in front of Zambia on TikTok?', finalP: 'Tell us what you sell. If TikTok is the right place for it, we will show you what we would build.',
});

pages['website-design-zambia'] = service({
  slug: 'website-design-zambia', crumb: 'Website design', schemaName: 'Website design and development',
  title: 'Website Design in Zambia | The Great Media',
  desc: 'Website design in Lusaka, Zambia. Fast, mobile-first websites, landing pages and online stores built to turn visitors into enquiries. Fixed quote before work starts.',
  eyebrow: 'Website design · Zambia',
  h1: 'Website design in Zambia, built to bring you <em>enquiries</em>.',
  lead: 'A website should do a job: make the right visitor call, WhatsApp or request a quote. We design and build fast, mobile-first websites, landing pages and online stores for Zambian businesses.',
  cta: 'Get a Website Quote', applyHref: '/apply?plan=website',
  note: 'A one-off project with a fixed quote. No monthly fee required.',
  incH2: 'Every site is built as a sales tool.', incLead: 'Most visitors in Zambia arrive on a phone, on mobile data. So the site has to load fast, say what you do in seconds and make the next step one tap.',
  includes: [
    ['Custom design', 'Designed around your brand and your customer. No recycled templates.'],
    ['Mobile-first and fast', 'Built for phones and slow connections first, then desktop.'],
    ['Copywriting', 'Clear words that explain what you do and why to choose you.'],
    ['WhatsApp, call and quote buttons', 'The next step is always one tap away.'],
    ['Search engine basics (SEO)', 'Titles, descriptions, structure and speed so Google can find and rank you.'],
    ['Tracking installed', 'Meta pixel and analytics, so you know where enquiries come from.'],
    ['Online store or booking, if needed', 'Sell products or take bookings directly from the site.'],
    ['Hosting and domain setup', 'We set up your .com or .co.zm domain and hosting, and hand you the keys.'],
  ],
  whyEyebrow: 'How a project runs', whyH2: 'From brief to live site, without the usual delays.',
  whyBody: ['You tell us the job the site must do. We handle structure, design, words and build, and show you progress along the way.', 'If you later want advertising, the site is already built to convert the traffic.'],
  steps: ['<strong>Brief.</strong> Your business, your customer and the one job the site must do.', '<strong>Structure and copy.</strong> Pages, sections and words agreed before design starts.', '<strong>Design and build.</strong> Mobile-first, fast and on brand.', '<strong>Review.</strong> You check it on your own phone and we refine it.', '<strong>Launch.</strong> Domain, hosting, tracking and a walkthrough of how to use it.'],
  proofH2: 'Websites we have built in Zambia.', proof: [relay, ['Online stores for Plumbit and Swt. Hair. Registration and payment funnels for the CLAZ Marathon and KCM Kopala ICR. Business sites for Kwendura, Ziva School and Hair by Claudine.', 'Sites we designed and built', 'Screenshots and live links are on the results page', 'GM']],
  costH2: 'How much does a website cost in Zambia?',
  cost: ['It depends on the number of pages and the features you need: a focused business site costs less than an online store or a booking system. You get a fixed quote before work starts, with no surprises after. <a class="link" href="/website-cost-zambia">Read the full website cost guide</a>.'],
  faqH2: 'Website design in Zambia: common questions.',
  faq: [
    ['How much does a website cost in Zambia?', 'The price depends on the number of pages, whether you need an online store or booking, and how much content we create for you. You get a fixed quote before we start.'],
    ['How long does it take to build a website?', 'Most business websites take two to four weeks from the day we have your content and access. Online stores and larger sites take longer.'],
    ['Do you build online stores?', 'Yes. We build online stores where customers can browse products, order and pay, as well as booking and registration sites for events.'],
    ['Will my website show up on Google?', 'We build every site with the SEO basics in place: fast loading, clear page titles, proper structure and a sitemap submitted to Google. Ranking for competitive searches takes time and content, and we will be honest about what to expect.'],
    ['Can you redesign my existing website?', 'Yes. We often rebuild sites that look fine but do not bring enquiries. We keep what works, fix the structure and make the next step obvious.'],
    ['Do I need to pay monthly?', 'No. A website is a one-off project. Your only ongoing costs are your domain and hosting, which you own.'],
  ],
  finalH: 'Need a website that brings in business?', finalP: 'Tell us about your business and what the site needs to do. You will get an honest answer and a fixed quote.',
});

pages['facebook-ads-cost-zambia'] = guide({
  slug: 'facebook-ads-cost-zambia', crumb: 'Facebook ads cost in Zambia', date: '2026-11-16', dateText: 'November 2026',
  title: 'How Much Do Facebook Ads Cost in Zambia? | The Great Media',
  desc: 'What Facebook and Instagram ads really cost in Zambia: ad spend, agency management fees, how to set a budget from your customer value, and how to stop wasting money.',
  h1: 'How much do Facebook ads cost in Zambia?',
  lead: 'A plain guide to what you will actually pay: the ad spend, the management fee, and how to work out the right budget for your business.',
  short: 'There is no fixed price. You choose your own budget, pay Meta directly, and can change or stop it at any time. The right budget comes from what one customer is worth to you. If you hire an agency, management is a separate fee.',
  body: `
    <h2 class="rv">The two costs: ad spend and management</h2>
    <p class="rv"><strong>Ad spend</strong> is the money that goes to Meta (Facebook and Instagram) to show your ads. You set a daily or monthly budget and you can change or stop it at any time. It is paid with your own card from your own ad account.</p>
    <p class="rv"><strong>Management</strong> is what you pay a person or agency to plan, create, run and improve the ads. If you run the ads yourself, this cost is your own time.</p>

    <h2 class="rv">How Facebook decides what you pay</h2>
    <p class="rv">Facebook ads are sold by auction. You are charged for showing your ad to people, and the price moves with:</p>
    <ul class="rv">
      <li><strong>Who you target.</strong> Small, high-value audiences cost more to reach than broad ones.</li>
      <li><strong>How good the ad is.</strong> Ads that people stop for and respond to are rewarded with lower costs.</li>
      <li><strong>What you ask for.</strong> A campaign optimised for messages or leads costs more per result than one optimised for views, but the results are worth more.</li>
      <li><strong>Time of year.</strong> Costs rise when many advertisers compete, such as before holidays.</li>
    </ul>

    <h2 class="rv">How to set your budget from your own numbers</h2>
    <p class="rv">Start from what one customer is worth, not from what feels affordable:</p>
    <ol class="rv">
      <li>Work out your profit from one sale. Say a windows job leaves you K8,000.</li>
      <li>Decide how much of that you would pay to win the customer. Say K1,500.</li>
      <li>Estimate how many enquiries become customers. Say 1 in 10.</li>
      <li>That means you can afford about K150 per enquiry.</li>
    </ol>
    <p class="rv">If your ads bring enquiries for less than that, they are profitable and you can spend more. If they cost more, the offer, the ad or the follow-up needs fixing before the budget goes up. This is why a business selling K10,000 jobs can spend far more on ads than one selling K100 items.</p>

    <h2 class="rv">What we recommend to start</h2>
    <p class="rv">Start with enough to test several audiences and ads and get clear data within weeks. A budget that is too small takes months to tell you anything. Higher-value sales such as construction, real estate and vehicles usually justify more.</p>

    <h2 class="rv">Boosting posts vs proper campaigns</h2>
    <p class="rv">Boosting a post is the cheapest way to start, and it is built to get likes and reach. Campaigns built in Ads Manager can be aimed at enquiries and sales, tested properly and tracked. If you have boosted posts and got likes but no customers, this is usually why.</p>

    <h2 class="rv">Where the money is really wasted</h2>
    <p class="rv">In our experience the biggest waste is not the ad price. It is what happens after the click:</p>
    <ul class="rv">
      <li>Enquiries sit on WhatsApp for hours and the buyer calls someone else.</li>
      <li>Nobody follows up after sending a quote.</li>
      <li>Nobody tracks which ad produced the sale, so the budget cannot move to what works.</li>
    </ul>
    <p class="rv">Fixing these three things often does more than doubling the ad budget. It is how <a href="/results">Cutrite Windows &amp; Glass turned Facebook enquiries into K100,000+ of sales</a>.</p>`,
  ctaH: 'Want a budget worked out for your business?', ctaP: 'In our diagnostic we look at your customer value and capacity, and recommend a specific monthly ad spend.', ctaBtn: 'Apply to Work With Us',
  faq: [
    ['What is the minimum budget for Facebook ads in Zambia?', 'Meta lets you start with a very small daily budget. In practice, very small budgets take a long time to produce useful data.'],
    ['How do I pay for Facebook ads in Zambia?', 'With a debit or credit card added to your own Meta ad account. You are charged by Meta directly.'],
    ['Is ad spend included in an agency fee?', 'With us, no. Ad spend is paid by you directly to Meta so you own the account and can see every kwacha. Our management fee is separate and fixed in your proposal.'],
    ['Are Instagram ads priced differently?', 'Instagram and Facebook ads are bought from the same Meta account and budget. Meta shows your ad on whichever placement gets the best result for the money.'],
  ],
  finalH: 'Ready to make ad spend predictable?', finalP: 'Tell us your numbers. If there is a fit, we will show you exactly what we would build and what it would cost.',
});

pages['website-cost-zambia'] = guide({
  slug: 'website-cost-zambia', crumb: 'Website cost in Zambia', date: '2026-11-16', dateText: 'November 2026', applyHref: '/apply?plan=website',
  title: 'How Much Does a Website Cost in Zambia? (2026 Guide) | The Great Media',
  desc: 'What a business website costs in Zambia: what drives the price, the ongoing costs of a domain and hosting, what to ask a web designer, and and how to get a fixed quote.',
  h1: 'How much does a website cost in Zambia?',
  lead: 'What you are really paying for, the costs people forget, and the questions to ask before you hire anyone.',
  short: 'It depends on what the site has to do. A focused business site costs less than an online store or a booking system. On top of the build you pay yearly for a domain and hosting. Always ask for a fixed quote before work starts.',
  body: `
    <h2 class="rv">What drives the price</h2>
    <ul class="rv">
      <li><strong>Number of pages.</strong> A one-page site costs less than a ten-page site.</li>
      <li><strong>Features.</strong> Online payments, a product catalogue, bookings, registration forms or member logins all add work.</li>
      <li><strong>Content.</strong> Writing the words and preparing photos takes time. If the designer does it for you, it is part of the price.</li>
      <li><strong>Custom design or template.</strong> A template is cheaper. A custom design is built around your brand and your customer.</li>
      <li><strong>Who builds it.</strong> A freelancer, an agency and a do-it-yourself builder all price differently and deliver different levels of support.</li>
    </ul>

    <h2 class="rv">The ongoing costs people forget</h2>
    <ul class="rv">
      <li><strong>Domain name.</strong> Your address, such as yourbusiness.com or yourbusiness.co.zm, renewed every year.</li>
      <li><strong>Hosting.</strong> Where the site lives. Paid monthly or yearly.</li>
      <li><strong>Maintenance.</strong> Updates, security and changes to content.</li>
    </ul>
    <p class="rv">Ask who owns the domain and hosting accounts. They should be in your name, so you are never locked out of your own website.</p>

    <h2 class="rv">Cheap website or sales tool?</h2>
    <p class="rv">Two sites can look similar and perform very differently. A site built only to "be online" tells people you exist. A site built as a sales tool loads fast on a phone, says what you do in seconds, answers the buyer's questions and makes calling or WhatsApp one tap. The second kind costs more to plan, and it is the one that brings enquiries.</p>

    <h2 class="rv">Questions to ask before you hire a web designer</h2>
    <ol class="rv">
      <li>Can I see live sites you built, on my phone?</li>
      <li>Who writes the words: you or me?</li>
      <li>Will I own the domain, the hosting and the site files?</li>
      <li>Is it fast on mobile data?</li>
      <li>Will Google be able to find it (titles, descriptions, sitemap)?</li>
      <li>Is tracking installed so I know where enquiries come from?</li>
      <li>What does it cost each year after launch?</li>
    </ol>

    <h2 class="rv">How we quote</h2>
    <p class="rv">We quote every project by scope. Every site is mobile-first and built to convert, with WhatsApp or quote buttons, SEO basics and tracking installed. You always get a fixed quote before work starts. See <a href="/website-design-zambia">website design in Zambia</a> for what is included and <a href="/results">examples of sites we have built</a>.</p>`,
  ctaH: 'Want a fixed quote for your website?', ctaP: 'Tell us what the site needs to do. You will get an honest answer and a price before any work starts.', ctaBtn: 'Get a Website Quote',
  faq: [
    ['Can I get a website for free?', 'Free website builders exist and can work for a hobby or a very new business. They usually come with the builder\'s branding, limited features and an address that is not your own domain.'],
    ['Should I choose .com or .co.zm?', 'Either works. A .co.zm domain signals a Zambian business. A .com is more familiar internationally. Pick the one your customers will remember, and make sure it is registered in your name.'],
    ['How long does a website take?', 'Most business websites take two to four weeks once the content is ready. Stores and larger sites take longer.'],
    ['Do I pay monthly for a website?', 'Not for the build. With us it is a one-off project. Your ongoing costs are the domain and hosting.'],
  ],
  finalH: 'Need a website that brings in business?', finalP: 'Tell us about your business and what the site needs to do. You will get an honest answer and a fixed quote.',
});

// Services hub
pages['services'] = `<!--meta ${JSON.stringify({ title: 'Digital Marketing, Software & AI Services in Zambia | The Great Media', desc: 'Advertising agency in Lusaka, Zambia. Meta ads, Google Ads, TikTok ads, website design, custom software and AI automation, from one team that turns enquiries into paying customers.', crumb: 'Services' })} -->

<section class="page-hero s-dark">
  <div class="hero-glow" aria-hidden="true"></div>
  <div class="container">
    <span class="eyebrow rv">Services · Lusaka, Zambia</span>
    <h1 class="rv rv-d1" style="max-width:18ch">Digital marketing services for Zambian businesses.</h1>
    <p class="lead rv rv-d2" style="max-width:56ch">The Great Media is an advertising and digital marketing agency in Lusaka. We run the ads, build the pages and set up the follow-up, and connect them so advertising turns into paying customers.</p>
    <div class="cta-row rv rv-d3" data-hero-cta>
      <a class="btn btn-primary btn-lg" href="/apply" data-place="hero">Apply to Work With Us ${arrow}</a>
      <a class="btn btn-ghost btn-lg" href="/results">See our work</a>
    </div>
  </div>
</section>

<section class="s-paper pad">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow rv">What we do</span>
      <h2 class="rv rv-d1">Six services. One team.</h2>
      <p class="lead rv rv-d2">You can start with the part you need most. They work best together.</p>
    </div>
    <div class="svc-grid three">
      ${SERVICES.map(([slug, name, d], i) => `<a class="svc rv${i ? ' rv-d' + i : ''}" href="/${slug}"><h3>${name}</h3><p>${d}</p><span class="link">Learn more ${arrow}</span></a>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="s-dark pad">
  <div class="container">
    <div class="grid-2">
      <div>
        <span class="eyebrow rv">Also included</span>
        <h2 class="rv rv-d1">The parts most agencies leave out.</h2>
        <p class="rv rv-d2 muted">Ads bring attention. These are what turn it into money.</p>
        <p class="rv rv-d3"><a class="link" href="/how-it-works">See how the full system works ${arrow}</a></p>
      </div>
      <ul class="checks rv rv-d2" style="grid-template-columns:1fr">
        <li>${check}<span>Landing pages and lead capture<small>One page, one job: turn a click into an enquiry.</small></span></li>
        <li>${check}<span>Lead qualification<small>Questions that separate serious buyers from browsers.</small></span></li>
        <li>${check}<span>WhatsApp follow-up systems<small>Templates, reminders and a routine so no quote is forgotten.</small></span></li>
        <li>${check}<span>Tracking and weekly reporting<small>From the ad to the sale, in plain English.</small></span></li>
      </ul>
    </div>
  </div>
</section>

<section class="s-paper pad-sm" id="guides">
  <div class="container">
    <div class="section-head"><span class="eyebrow rv">Guides</span><h2 class="rv rv-d1">Straight answers on cost.</h2></div>
    <div class="svc-grid two">
      ${GUIDES.map(([s, t], i) => `<a class="svc rv${i ? ' rv-d1' : ''}" href="/${s}"><h3>${t}</h3><p>${i ? 'What drives the price, the ongoing costs, and what to ask a web designer.' : 'Ad spend, management fees and how to set a budget from your own numbers.'}</p><span class="link">Read the guide ${arrow}</span></a>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="s-paper pad-sm" style="padding-top:0">
  <div class="container narrow">
    <div class="section-head"><span class="eyebrow rv">Questions</span><h2 class="rv rv-d1">About our services.</h2></div>
    ${faq([
      ['What does a digital marketing agency in Zambia do?', 'It plans and runs your online advertising and the assets around it. At The Great Media that means Facebook, Instagram, TikTok and Google ads, websites and landing pages, WhatsApp follow-up systems, and tracking that shows which advert produced which sale.'],
      ['Which service should I start with?', 'If you have no clear place to send customers, start with a website or landing page. If you have one and need more enquiries, start with Facebook and Instagram ads. We recommend the right starting point in the diagnostic.'],
      ['Do you work with businesses outside Lusaka?', 'Yes. We are based in Lusaka and work with businesses across Zambia, including the Copperbelt, and with clients outside the country. Everything is run remotely with weekly reporting.'],
      ['How much do your services cost?', 'It depends on what your business needs, so we do not publish a price list. If your application is accepted, you get a clear proposal with a fixed fee.'],
    ])}
  </div>
</section>
${finalCta('If your business can profit from more customers, let\'s look at the numbers.', 'Tell us about your offer, your acquisition process and your growth target. If there is a fit, we will show you exactly what we would build.')}
`;

for (const [slug, html] of Object.entries(pages)) fs.writeFileSync(path.join(OUT, slug + '.html'), html);
console.log('wrote', Object.keys(pages).length, 'pages');
