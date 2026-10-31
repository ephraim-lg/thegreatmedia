// Upload asset buckets to the Workers assets upload endpoint (base64 multipart, one part per hash).
// usage: node tools/upload.js <session-jwt> '<buckets json>'
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const [,, jwt, bucketsJson] = process.argv;
const buckets = JSON.parse(bucketsJson);
const hashToFile = require('./hash-to-file.json');
const root = path.join(__dirname, '..', 'public');
const mime = { html: 'text/html', css: 'text/css', js: 'text/javascript', webp: 'image/webp', jpg: 'image/jpeg', png: 'image/png', xml: 'application/xml', txt: 'text/plain' };
const tmp = path.join(__dirname, 'b64'); fs.mkdirSync(tmp, { recursive: true });
let completion = null;
buckets.forEach((bucket, i) => {
  const args = ['-sS', '-X', 'POST', 'https://api.cloudflare.com/client/v4/accounts/0ca7f92d4dc4c1fd894db78982e63f77/workers/assets/upload?base64=true', '-H', 'Authorization: Bearer ' + jwt];
  for (const h of bucket) {
    const rel = hashToFile[h]; if (!rel) throw new Error('unknown hash ' + h);
    const b64file = path.join(tmp, h);
    fs.writeFileSync(b64file, fs.readFileSync(path.join(root, rel)).toString('base64'));
    args.push('-F', `${h}=@${b64file};filename=${h};type=${mime[rel.split('.').pop()] || 'application/octet-stream'}`);
  }
  const out = execFileSync('curl', args, { encoding: 'utf8', maxBuffer: 1 << 26 });
  const j = JSON.parse(out);
  console.log('bucket', i + 1, 'success', j.success, 'errors', JSON.stringify(j.errors), 'jwt?', !!(j.result && j.result.jwt));
  if (j.result && j.result.jwt) completion = j.result.jwt;
});
fs.writeFileSync(path.join(__dirname, 'completion.jwt'), completion || '');
console.log('completion jwt', completion ? 'captured' : 'MISSING');
