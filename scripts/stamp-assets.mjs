#!/usr/bin/env node
// Cache-busting: appends ?v=<content hash> to the stylesheet and script URLs in every page.
// GitHub Pages caches assets for ~10 minutes, so without this a browser can pair NEW html with OLD css
// (symptom: giant icons, stretched layout). With it, new html always requests the matching css/js.
//   node scripts/stamp-assets.mjs           rewrite the ?v= stamps
//   node scripts/stamp-assets.mjs --check   exit 1 if any stamp is stale
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');
const assets = ['assets/css/styles.css', 'assets/js/main.js'];
const hash = f => createHash('sha256').update(readFileSync(join(root, f))).digest('hex').slice(0, 10);
const stamps = Object.fromEntries(assets.map(f => [f, hash(f)]));

let stale = 0;
for (const page of readdirSync(root).filter(f => f.endsWith('.html'))) {
  let html = readFileSync(join(root, page), 'utf8');
  const next = assets.reduce((acc, f) => acc.replace(
    new RegExp(`(${f.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')})(\\?v=[0-9a-f]+)?(?=")`, 'g'), `$1?v=${stamps[f]}`), html);
  if (next !== html) { stale++; if (!check) writeFileSync(join(root, page), next); }
}
if (check && stale) { console.error(`Asset stamps are stale in ${stale} page(s). Run: node scripts/stamp-assets.mjs`); process.exit(1); }
console.log(check ? 'OK: asset stamps current' : `stamped (${stale} page(s) updated): ${assets.map(f => `${f}?v=${stamps[f]}`).join(', ')}`);
