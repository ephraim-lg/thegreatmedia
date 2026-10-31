// node tools/shot.js <path> <name> [mobile]
const { chromium } = require('C:/Users/HP/Downloads/boardflow/node_modules/playwright');
(async () => {
  let [,, p = '', name = 'home', mobile] = process.argv; p = '/' + p.replace(/^[/]+/, '');
  const b = await chromium.launch();
  const ctx = await b.newContext(mobile ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('http://localhost:8788' + p, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: '.rv{opacity:1!important;transform:none!important}' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `tools/shots/${name}${mobile ? '-m' : ''}.jpg`, fullPage: true, type: 'jpeg', quality: 60 });
  const w = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  console.log(name, mobile ? 'mobile' : 'desktop', 'scrollWidth/innerWidth', w.join('/'), 'errors:', errs.length ? errs : 'none');
  await b.close();
})();
