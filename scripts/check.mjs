#!/usr/bin/env node
// Static integrity check for the Onjaal site. No dependencies.
// Usage: node scripts/check.mjs   (exit code 1 on any problem)
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pages = readdirSync(root).filter(f => f.endsWith('.html'));
const BASE = 'https://abhayak47.github.io/onjaal/';
const problems = [];
const idsOf = html => new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
const cache = Object.fromEntries(pages.map(p => [p, readFileSync(join(root, p), 'utf8')]));

for (const page of pages) {
  const html = cache[page];
  const ids = idsOf(html);
  const all = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
  all.filter((x, i) => all.indexOf(x) !== i).forEach(x => problems.push(`${page}: duplicate id "${x}"`));
  if (!/<title>[^<]+<\/title>/.test(html)) problems.push(`${page}: missing <title>`);
  if (!/<meta name="description"/.test(html)) problems.push(`${page}: missing meta description`);
  if (!/<html lang=/.test(html)) problems.push(`${page}: missing html lang`);
  if ((html.match(/<h1[\s>]/g) || []).length !== 1) problems.push(`${page}: expected exactly one <h1>`);
  for (const m of html.matchAll(/<img\b(?![^>]*\balt=)[^>]*>/g)) problems.push(`${page}: <img> without alt`);

  for (const m of html.matchAll(/\s(?:href|src)="([^"]*)"/g)) {
    let url = m[1];
    if (!url || url.startsWith('mailto:') || url.startsWith('data:')) continue;
    let absolute = false;
    if (url.startsWith(BASE)) { url = url.slice(BASE.length) || 'index.html'; absolute = true; }
    else if (/^https?:\/\//.test(url)) continue; // external: not checked offline
    const [file, hash] = url.split('#');
    const target = file === '' ? (absolute ? 'index.html' : page) : file === '.' ? 'index.html' : file;
    const path = join(root, target);
    if (!existsSync(path)) { problems.push(`${page}: missing file "${url}"`); continue; }
    if (hash && target.endsWith('.html')) {
      const tids = target === page ? ids : idsOf(cache[target] ?? readFileSync(path, 'utf8'));
      if (!tids.has(hash)) problems.push(`${page}: missing anchor "${url}"`);
    }
  }
}
for (const f of ['robots.txt', 'sitemap.xml', 'site.webmanifest', '404.html', 'assets/og-image.png', 'assets/apple-touch-icon.png'])
  if (!existsSync(join(root, f))) problems.push(`missing ${f}`);

try { execFileSync('node', [join(root, 'scripts/sync-chrome.mjs'), '--check'], { stdio: 'pipe' }); }
catch (e) { problems.push('header/footer out of sync: run node scripts/sync-chrome.mjs'); }

if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log(`OK: ${pages.length} pages checked (${pages.join(', ')})`);
