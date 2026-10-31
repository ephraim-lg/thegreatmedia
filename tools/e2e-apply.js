// E2E: walk the qualifier on a 390px phone through every flow/outcome, API stubbed.
// node tools/e2e-apply.js [baseUrl]   (default http://localhost:8788; pass https://thegreatmediazm.com for live — then delete the rows)
const { chromium } = require('C:/Users/HP/Downloads/boardflow/node_modules/playwright');
const assert = require('assert');
const BASE = process.argv[2] || 'http://localhost:8788';
const LIVE = !BASE.includes('localhost');

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  let posted = null, apiStatus = null;
  if (LIVE) {
    page.on('request', r => { if (r.url().endsWith('/lead') && r.method() === 'POST') posted = JSON.parse(r.postData()); });
    page.on('response', async r => { if (r.url().endsWith('/lead') && r.request().method() === 'POST') apiStatus = r.status() + ' ' + (await r.text()); });
  } else {
    await page.route('**/tgm-leads-api.ephraimbanda888.workers.dev/lead', r => { posted = JSON.parse(r.request().postData()); r.fulfill({ status: 201, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ ok: true, id: 'stub', score: 70 }) }); });
  }
  await page.addInitScript(() => { window.fbq = function () { (window.__ev = window.__ev || []).push([].slice.call(arguments)); }; });
  const active = () => page.evaluate(() => document.querySelector('.step.active')?.id);
  const opt = t => page.click('.step.active label.opt:has-text("' + t + '")');
  const next = () => page.click('.step.active [data-next]');

  async function run(name, o) {
    posted = null; apiStatus = null;
    await page.goto(BASE + '/apply?plan=' + (o.plan || '') + '&utm_campaign=e2e2', { waitUntil: 'networkidle' });
    assert.equal(await active(), 'step-need');
    await opt(o.need); await next();
    assert.equal(await active(), 'step-1');
    await opt('Aluminium'); await page.fill('#f-company', 'E2E ' + name); await page.fill('#f-location', 'Kitwe, Zambia'); await next();
    await opt('K5,000 – K20,000'); await opt('K100,000 – K500,000'); await next();
    if (o.need.startsWith('A website')) {
      assert.equal(await active(), 'step-web', 'website flow skips acquisition');
      await opt('Generate enquiries'); await page.fill('#f-pages', 'Home, gallery, quote form, WhatsApp'); await opt('Some'); await next();
    } else {
      assert.equal(await active(), 'step-3');
      await opt('Referrals'); await opt('5 – 20'); await opt('Under K5,000'); await next();
      await opt('Same day'); await opt('Me (the owner)'); await next();
    }
    assert.equal(await active(), 'step-5');
    await page.fill('#f-goal', '20 qualified enquiries a month and 5 installs'); await next();
    assert.equal(await active(), 'step-6');
    const title = await page.textContent('#budget-title');
    if (o.need.startsWith('A website')) assert(title.includes('website'), 'website budget wording: ' + title);
    if (o.budget) await page.click('.step.active [name="budget"][value="' + o.budget + '"] >> xpath=..');
    await opt(o.timeline || 'Right now'); await opt(o.ready || 'Yes — I'); await next();
    assert.equal(await active(), 'step-7');
    await page.fill('#f-name', 'E2E ' + name); await page.fill('#f-phone', o.phone); await page.fill('#f-email', 'e2e@example.com'); await next();
    assert(await page.locator('#evaluating').isVisible(), 'evaluating screen shows');
    await page.waitForSelector('#result-fit.show, #result-nofit.show', { timeout: 40000 });
    const fit = await page.locator('#result-fit').isVisible();
    assert.equal(fit, o.expectFit, name + ': expected fit=' + o.expectFit);
    const ev = await page.evaluate(() => window.__ev.map(e => e[1]));
    assert.equal(ev.includes('Lead'), o.expectFit, 'Lead event only for fit');
    assert.equal(posted.qualified, o.expectFit); assert.equal(posted.utm_campaign, 'e2e2');
    if (!fit) console.log('   reason:', await page.textContent('#nofit-reason'));
    console.log('OK', name, '| fit', fit, '| service', posted.service, '| budget', posted.budget, '| readiness', posted.readiness, LIVE ? '| api ' + apiStatus : '');
  }

  await run('system-fit',     { need: 'The full customer', phone: '0977200100', expectFit: true, plan: 'scale' });
  await run('website-fit',    { need: 'A website or landing', phone: '0977200200', expectFit: true, budget: 'growth' });
  await run('low-budget',     { need: 'The full customer', phone: '0977200300', budget: 'low', expectFit: false });
  await run('researching',    { need: 'Not sure', phone: '0977200400', budget: 'growth', timeline: 'Just researching', expectFit: false });
  await run('not-ready',      { need: 'The full customer', phone: '0977200500', budget: 'elite', ready: 'Not yet', expectFit: false });
  console.log('page errors:', errs.length ? errs : 'none');
  await b.close();
})().catch(e => { console.error('E2E FAIL', e.message); process.exit(1); });
