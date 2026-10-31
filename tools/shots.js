// Screenshot real client sites (desktop + mobile) for the Results section.
const { chromium } = require('C:/Users/HP/Downloads/boardflow/node_modules/playwright');
const sites = [
  ['cutrite',   'https://thegreatmediazm.com'],           // placeholder; Cutrite has no site — replaced below if not used
  ['swthair',   'https://customerexample1.netlify.app/'],
  ['plumbit',   'https://plumbitonline.com/'],
  ['kopala',    'https://kopalaicr.org/'],
  ['claz',      'https://clazmarathon.org/'],
  ['ziva',      'https://zivaschool.com/'],
  ['icr',       'https://intercompanyrelay.org/'],
  ['kwendura',  'https://kwendura.com/'],
  ['claudine',  'https://hairbyclaudine.com/'],
  ['mhhm',      'https://mentalhealthhalfmarathon.org/'],
];
(async () => {
  const browser = await chromium.launch();
  for (const [name, url] of sites) {
    for (const [tag, vp, mobile] of [['desktop', {width:1440,height:900}, false], ['mobile', {width:390,height:844}, true]]) {
      const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, isMobile: mobile, hasTouch: mobile,
        userAgent: mobile ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' : undefined });
      const page = await ctx.newPage();
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
        await page.waitForTimeout(1500);
        // dismiss cookie bars if any
        await page.evaluate(() => { document.querySelectorAll('[class*=cookie],[id*=cookie]').forEach(e => e.remove()); });
        await page.screenshot({ path: `public/img/work/${name}-${tag}.jpg`, type: 'jpeg', quality: 82 });
        console.log('ok', name, tag);
      } catch (e) { console.log('FAIL', name, tag, e.message.split('\n')[0]); }
      await ctx.close();
    }
  }
  await browser.close();
})();
