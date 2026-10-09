#!/usr/bin/env node
// The site has no compile step. "Build" = make shared parts consistent, stamp assets, verify.
// Run this before every commit that touches html, css or js:  node scripts/build.mjs
import { execFileSync } from 'node:child_process';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = dirname(fileURLToPath(import.meta.url));
for (const s of ['sync-chrome.mjs', 'stamp-assets.mjs', 'check.mjs'])
  process.stdout.write(execFileSync('node', [join(dir, s)], { encoding: 'utf8' }));
