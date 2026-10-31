// E2E: walk the qualifier on a 390px phone, both outcomes, with the API stubbed.
const { chromium } = require('C:/Users/HP/Downloads/boardflow/node_modules/playwright');
const assert = require('assert');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  let posted = null;
  page.on('request', r => { if (r.url().endsWith('/lead') && r.method() === 'POST') posted = JSON.parse(r.postData()); }); page.on('response', async r => { if (r.url().endsWith('/lead') && r.request().method() === 'POST') console.log('API', r.status(), await r.text()); });
  const events = []; await page.addInitScript(() => { window.fbq = function () { window.__ev = (window.__ev || []); window.__ev.push([].slice.call(arguments)); }; });

  async function run(qualified) {
    await page.goto('https://thegreatmediazm.com/apply?plan=growth&utm_campaign=e2e', { waitUntil: 'networkidle' });
    // Validation: press Continue with nothing → error must be inside the viewport
    await page.click('[data-next="1"]');
    const err = page.locator('#err-1');
    assert(await err.isVisible(), 'error visible');
    const box = await err.boundingBox(); assert(box.y >= 0 && box.y < 844, 'error on screen, y=' + box.y);
    await page.click('label.opt:has-text("Aluminium")'); await page.fill('#f-company', 'LIVE E2E Windows Ltd'); await page.fill('#f-location', 'Kitwe, Zambia');
    await page.click('[data-next="1"]');
    await page.click('label.opt:has-text("K5,000 – K20,000")'); await page.click('label.opt:has-text("K100,000 – K500,000")'); await page.click('[data-next="2"]');
    await page.click('label.opt:has-text("Referrals")'); await page.click('label.opt:has-text("Facebook / Instagram")'); await page.click('label.opt:has-text("5 – 20")'); await page.click('label.opt:has-text("Under K5,000")'); await page.click('[data-next="3"]');
    await page.click('label.opt:has-text("Same day")'); await page.click('label.opt:has-text("Me (the owner)")'); await page.fill('#f-bottleneck', 'Quotes go quiet.'); await page.click('[data-next="4"]');
    await page.click('[data-next="5"]'); assert(await page.locator('#err-5').isVisible(), 'goal required');
    await page.fill('#f-goal', '20 qualified enquiries a month and 5 installs'); await page.click('[data-next="5"]');
    console.log('after step5:', await page.evaluate(() => document.querySelector('.step.active').id + ' ' + [...document.querySelectorAll('.step-error.show')].map(e=>e.textContent).join('|')));
    // plan=growth should have preselected the starter band
    assert(await page.isChecked('[name="budget"][value="starter"]'), 'plan preselect');
    if (!qualified) await page.click('label.opt:has-text("Under K10,000")');
    await page.click('label.opt:has-text("This month")'); await page.click('[data-next="6"]');
    await page.fill('#f-name', 'Live E2E Tester'); await page.fill('#f-phone', qualified ? '0977100200' : '0977100300'); await page.fill('#f-email', 'e2e@example.com'); await page.click('[data-next="7"]');
    await page.waitForSelector('.result.show', { timeout: 40000 });
    const fit = await page.locator('#result-fit').isVisible(), nofit = await page.locator('#result-nofit').isVisible();
    assert.equal(fit, qualified, 'fit result shown'); assert.equal(nofit, !qualified, 'nofit result shown');
    assert.equal(posted.qualified, qualified); assert.equal(posted.businessType, 'Aluminium, windows & doors'); assert.equal(posted.utm_campaign, 'e2e'); assert.equal(posted.customer_value, 'K5,000 – K20,000'); assert.equal(posted.plan, 'growth');
    const ev = await page.evaluate(() => window.__ev.map(e => e[1]));
    console.log(qualified ? 'FIT' : 'NOFIT', 'events:', ev.join(','), '| budget:', posted.budget, '| notes-ish:', posted.response_time, posted.follow_up_owner);
    if (qualified) { const href = await page.getAttribute('#wa-link', 'href'); assert(href.includes('wa.me/260964576875') && decodeURIComponent(href).includes('LIVE E2E Windows Ltd'), 'WA link prefilled'); assert(ev.includes('Lead'), 'Lead fired'); }
    else assert(!ev.includes('Lead'), 'no Lead for unqualified');
  }
  await run(true); await run(false);
  console.log('page errors:', errs.length ? errs : 'none');
  await b.close();
})().catch(e => { console.error('E2E FAIL', e.message); process.exit(1); });
