// Convert renders to web-sized WebP (keep PNG originals in tools/originals for re-cuts).
const sharp = require('C:/Users/HP/Downloads/boardflow/node_modules/sharp');
const fs = require('fs'), path = require('path');
const art = 'public/img/art', work = 'public/img/work';
fs.mkdirSync('tools/originals', { recursive: true });
(async () => {
  const specs = {
    'hero-system': 1800, 'leak': 900, 'founder': 1000, 'cta-ripple': 2000,
    'stage-attract': 520, 'stage-capture': 520, 'stage-qualify': 520, 'stage-followup': 520, 'stage-convert': 520, 'stage-measure': 520,
  };
  for (const [n, w] of Object.entries(specs)) {
    const src = `${art}/${n}.png`;
    if (!fs.existsSync(src)) continue;
    await sharp(src).resize({ width: w, withoutEnlargement: true }).webp({ quality: 82 }).toFile(`${art}/${n}.webp`);
    fs.renameSync(src, `tools/originals/${n}.png`);
    console.log(n, fs.statSync(`${art}/${n}.webp`).size);
  }
  for (const f of fs.readdirSync(work)) {
    if (!f.endsWith('.jpg')) continue;
    const isMobile = f.includes('mobile');
    await sharp(`${work}/${f}`).resize({ width: isMobile ? 600 : 1400 }).webp({ quality: 80 }).toFile(`${work}/${f.replace('.jpg', '.webp')}`);
    fs.unlinkSync(`${work}/${f}`);
  }
  console.log(fs.readdirSync(work).map(f => f + ' ' + fs.statSync(`${work}/${f}`).size).join('\n'));
})();
