// Creates the self-hosted live update bundle served from the deployed site:
//   /app-update.json  -> manifest consumed by the native LiveUpdate plugin
//   /app-update.zip   -> a zip of dist/ (the built SPA)
//
// Run after `vite build`. Both files land in dist/ so they are deployed with the site.
// Publish a new zip only when you actually change the web app; the version is a Unix
// timestamp and the sha256 makes downloads verifiable and de-duplicable.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { ZipArchive } = require('archiver');

const root = process.cwd();
const dist = path.join(root, 'dist');
const zipPath = path.join(dist, 'app-update.zip');
const manifestPath = path.join(dist, 'app-update.json');

if (!fs.existsSync(path.join(dist, 'index.html'))) {
  console.error('dist/index.html not found. Run `npm run build` first.');
  process.exit(1);
}

const files = [];
function walk(dir, relative = '') {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = relative ? `${relative}/${entry.name}` : entry.name;
    if (rel === 'app-update.zip' || rel === 'app-update.json') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, rel);
    else if (entry.isFile()) files.push({ full, rel });
  }
}
walk(dist);
files.sort((a, b) => a.rel.localeCompare(b.rel));

const zipBuffer = await new Promise((resolve, reject) => {
  const archive = new ZipArchive({ zlib: { level: 9 } });
  const chunks = [];
  archive.on('data', (chunk) => chunks.push(chunk));
  archive.on('error', reject);
  archive.on('end', () => resolve(Buffer.concat(chunks)));
  for (const file of files) {
    archive.file(file.full, { name: file.rel, date: new Date(0) });
  }
  archive.finalize();
});

fs.writeFileSync(zipPath, zipBuffer);

const manifest = {
  version: Math.floor(Date.now() / 1000),
  generatedAt: new Date().toISOString(),
  sha256: crypto.createHash('sha256').update(zipBuffer).digest('hex'),
  size: zipBuffer.length,
  url: 'app-update.zip',
  files: files.length,
};

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

console.log(`Live update bundle: ${manifest.files} files, ${(manifest.size / 1024).toFixed(0)} KB`);
console.log(`Manifest version:   ${manifest.version}`);
console.log(`SHA-256:            ${manifest.sha256}`);
console.log('Deploy dist/ to your website to publish this update.');
