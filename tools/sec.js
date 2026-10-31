// node tools/sec.js <path> <selector> <name> [mobile]
const { chromium } = require('C:/Users/HP/Downloads/boardflow/node_modules/playwright');
(async () => {
  let [,, p = '', sel = 'body', name = 'sec', mobile] = process.argv; p = '/' + p.replace(/^[/]+/, '');
  const b = await chromium.launch();
  const ctx = await b.newContext(mobile ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('http://localhost:8788' + p, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: '.rv{opacity:1!important;transform:none!important}' });
  await page.waitForTimeout(500);
  const el = await page.$(sel);
  await el.scrollIntoViewIfNeeded(); await page.waitForTimeout(1600);
  await el.screenshot({ path: `tools/shots/${name}${mobile ? '-m' : ''}.jpg`, type: 'jpeg', quality: 70 });
  await b.close();
})();
