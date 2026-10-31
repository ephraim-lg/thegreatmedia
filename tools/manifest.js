// Build the Workers static-assets manifest: { "/path": { hash, size } }
// hash = first 32 hex chars of blake3(base64(contents) + extension) — same as wrangler.
const { blake3 } = require('C:/Users/HP/Downloads/margin/node_modules/@noble/hashes/blake3');
const { bytesToHex } = require('C:/Users/HP/Downloads/margin/node_modules/@noble/hashes/utils');
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', 'public');
const SKIP = new Set(['_headers', '_redirects']);
const manifest = {}, files = {};
(function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f); const st = fs.statSync(full);
    if (st.isDirectory()) { walk(full); continue; }
    if (SKIP.has(f)) continue;
    const rel = '/' + path.relative(root, full).split(path.sep).join('/');
    const buf = fs.readFileSync(full);
    const ext = path.extname(full).substring(1);
    const hash = bytesToHex(blake3(buf.toString('base64') + ext)).slice(0, 32);
    manifest[rel] = { hash, size: buf.length }; files[hash] = rel;
  }
})(root);
fs.writeFileSync(path.join(__dirname, 'manifest.json'), JSON.stringify(manifest));
fs.writeFileSync(path.join(__dirname, 'hash-to-file.json'), JSON.stringify(files));
console.log(Object.keys(manifest).length, 'files,', Object.values(manifest).reduce((a, b) => a + b.size, 0), 'bytes');
console.log(Object.keys(manifest).join('\n'));
