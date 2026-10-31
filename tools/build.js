// Build: wraps every src/pages/*.html in the shared layout (nav, footer, pixel,
// JSON-LD) and writes public/*.html. Run: node tools/build.js
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src', 'pages'), OUT = path.join(ROOT, 'public');
const SITE = 'https://thegreatmediazm.com';
const PIXEL = '747349564977817'; // real, working pixel — do not replace
const WA = 'https://wa.me/260964576875';

const NAV = [
  ['index', '/', 'Home'],
  ['how-it-works', '/how-it-works', 'How It Works'],
  ['results', '/results', 'Results'],
  ['about', '/about', 'About'],
];

const waIcon = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1s-.5-.1-.7.1-.8 1-.9 1.2-.3.2-.6.1c-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1s0-.5.1-.6l.5-.6c.2-.2.2-.3.3-.5s0-.4 0-.5-.7-1.6-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4s-1 1-1 2.5 1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.4c1.5.8 3.1 1.2 4.8 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3.1.8.8-3-.2-.3C4 15 3.7 13.5 3.7 12c0-4.6 3.7-8.3 8.3-8.3s8.3 3.7 8.3 8.3-3.7 8.2-8.3 8.2z"/></svg>`;

function layout(meta, body) {
  const title = meta.title, desc = meta.desc, slug = meta.slug;
  const canonical = slug === 'index' ? SITE + '/' : `${SITE}/${slug}`;
  const navLinks = NAV.map(([k, href, label]) => `<li><a href="${href}" data-nav="${k}">${label}</a></li>`).join('');
  const drawerLinks = NAV.map(([k, href, label]) => `<a class="dl" href="${href}" data-nav="${k}">${label}</a>`).join('') + `<a class="dl" href="/faq" data-nav="faq">FAQ</a><a class="dl" href="/audit" data-nav="audit">Free Ad Audit</a>`;
  const sticky = meta.sticky === false ? '' : `<div class="sticky-cta" id="sticky-cta"><a class="btn btn-primary" href="/apply" data-place="sticky">Apply to Work With Us <span class="arrow">→</span></a></div>`;
  const jsonld = meta.jsonld ? `<script type="application/ld+json">${JSON.stringify(meta.jsonld)}</script>` : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${canonical}">
<meta name="robots" content="${meta.noindex ? 'noindex, nofollow' : 'index, follow'}">
<meta name="theme-color" content="#0b0b0c">
<meta property="og:type" content="website">
<meta property="og:site_name" content="The Great Media">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE}/img/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${SITE}/img/og.jpg">
<link rel="icon" href="/img/logo.jpg">
<link rel="apple-touch-icon" href="/img/logo.jpg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/site.css?v=${meta.v}">
${jsonld}
<!-- Meta Pixel — ${PIXEL} is the live pixel for this site -->
<script>
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${PIXEL}');fbq('track','PageView');
</script>
<noscript><img height="1" width="1" style="display:none" alt="" src="https://www.facebook.com/tr?id=${PIXEL}&ev=PageView&noscript=1"></noscript>
</head>
<body class="${meta.bodyClass || ''}">
<a class="sr-only" href="#main">Skip to content</a>
<header class="nav" id="nav">
  <div class="container nav-inner">
    <a class="brand" href="/" aria-label="The Great Media — home"><span>The Great Media<small>Ads that sell</small></span></a>
    <nav aria-label="Primary"><ul class="nav-links">${navLinks}</ul></nav>
    <div class="nav-cta">
      <a class="wa-quiet" href="/audit" data-place="nav-audit">Free audit</a>
      <a class="wa-quiet" href="${WA}" target="_blank" rel="noopener">${waIcon} WhatsApp</a>
      <a class="btn btn-primary" href="/apply" data-place="nav">Apply to Work With Us</a>
      <button class="burger" id="burger" aria-label="Menu" aria-expanded="false" aria-controls="drawer"><span></span><span></span><span></span></button>
    </div>
  </div>
</header>
<div class="drawer" id="drawer">
  ${drawerLinks}
  <div class="drawer-foot">
    <a class="btn btn-primary btn-lg" href="/apply" data-place="drawer">Apply to Work With Us <span class="arrow">→</span></a>
    <a class="btn btn-ghost" href="${WA}" target="_blank" rel="noopener">${waIcon}&nbsp; WhatsApp us</a>
  </div>
</div>
<main id="main">
${body}
</main>
<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <a class="brand" href="/"><span>The Great Media<small>Ads that sell</small></span></a>
        <p class="ident">We build and manage the system that turns advertising attention into qualified enquiries, appointments and sales — for businesses where one customer is worth real money.</p>
      </div>
      <div><h5>Company</h5><ul><li><a href="/how-it-works">How it works</a></li><li><a href="/results">Results</a></li><li><a href="/about">About</a></li><li><a href="/faq">FAQ</a></li></ul></div>
      <div><h5>Start</h5><ul><li><a href="/apply">Apply to work with us</a></li><li><a href="${WA}" target="_blank" rel="noopener">WhatsApp +260 964 576 875</a></li></ul></div>
      <div><h5>Business identity</h5><ul><li>The Great Media Advertising Agency</li><li>Registered with PACRA · Zambia</li><li>Lusaka, Zambia · Est. 2023</li><li>Founder: Ephraim Banda</li></ul></div>
    </div>
    <div class="footer-bottom">
      <span>© ${new Date().getFullYear()} The Great Media Advertising Agency. All rights reserved.</span>
      <span><a href="/privacy">Privacy</a> &nbsp;·&nbsp; <a href="/terms">Terms</a> &nbsp;·&nbsp; <a href="https://www.facebook.com/profile.php?id=100089516337648" target="_blank" rel="noopener">Facebook</a> &nbsp;·&nbsp; <a href="https://www.instagram.com/the.greatmedia" target="_blank" rel="noopener">Instagram</a> &nbsp;·&nbsp; <a href="https://www.tiktok.com/@the.great.media3" target="_blank" rel="noopener">TikTok</a></span>
    </div>
  </div>
</footer>
${sticky}
<div class="cookie" id="cookie"><span>We use cookies and the Meta pixel to measure this site — the same tracking we build for clients. <a href="/privacy" style="text-decoration:underline">Privacy</a></span><button class="btn btn-ghost">OK</button></div>
<script src="/js/site.js?v=${meta.v}"></script>
${meta.scripts || ''}
</body>
</html>
`;
}

const v = Date.now().toString(36);
let count = 0;
for (const f of fs.readdirSync(SRC)) {
  if (!f.endsWith('.html')) continue;
  const raw = fs.readFileSync(path.join(SRC, f), 'utf8');
  const m = raw.match(/^<!--meta\s*([\s\S]*?)-->/);
  if (!m) throw new Error('missing meta block in ' + f);
  const meta = JSON.parse(m[1]);
  meta.slug = f.replace('.html', ''); meta.v = v;
  const body = raw.slice(m[0].length).replace(/\{\{WA\}\}/g, WA);
  if (meta.scripts) meta.scripts = meta.scripts.replace(/\?v=\d+/g, '?v=' + v); // js/* is cached immutable
  fs.writeFileSync(path.join(OUT, f), layout(meta, body));
  count++;
}
console.log('built', count, 'pages, v=' + v);
