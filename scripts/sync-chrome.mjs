#!/usr/bin/env node
// Keeps the shared header and footer identical across pages.
// Edit them ONCE in index.html (between the "chrome:" marker comments), then run:
//   node scripts/sync-chrome.mjs           rewrite privacy.html, terms.html, 404.html
//   node scripts/sync-chrome.mjs --check   exit 1 if any page is out of sync (used by check.mjs)
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'https://abhayak47.github.io/onjaal/';
const check = process.argv.includes('--check');
const read = f => readFileSync(join(root, f), 'utf8');
const marker = name => new RegExp(`<!-- chrome:${name}:start -->[\\s\\S]*?<!-- chrome:${name}:end -->`);

const index = read('index.html');
const ids = new Set([...index.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));

// target page -> how to rewrite in-page links so they work from that page
const targets = {
  'privacy.html': { anchor: id => (id === 'top' ? 'index.html' : `index.html#${id}`), file: f => f },
  'terms.html':   { anchor: id => (id === 'top' ? 'index.html' : `index.html#${id}`), file: f => f },
  '404.html':     { anchor: id => (id === 'top' ? BASE : `${BASE}#${id}`), file: f => BASE + f },
};

let drift = 0;
for (const [page, t] of Object.entries(targets)) {
  let html = read(page);
  for (const name of ['header', 'footer']) {
    let block = index.match(marker(name))[0];
    block = block
      .replace(/(<a [^>]*?href=")#([\w-]*)"/g, (m, pre, id) => (id === 'main' || !ids.has(id) ? m : `${pre}${t.anchor(id)}"`))
      .replace(/(<a [^>]*?href=")(privacy|terms)\.html"/g, (m, pre, f) => `${pre}${t.file(f + '.html')}"`);
    const current = html.match(marker(name));
    if (!current) { console.error(`${page}: missing chrome:${name} markers`); process.exit(1); }
    if (current[0] !== block) { drift++; html = html.replace(marker(name), () => block); }
  }
  if (drift && !check) writeFileSync(join(root, page), html);
}
if (check && drift) { console.error('Header/footer out of sync. Run: node scripts/sync-chrome.mjs'); process.exit(1); }
console.log(check ? 'OK: header/footer in sync' : `synced (${drift} block(s) updated)`);
