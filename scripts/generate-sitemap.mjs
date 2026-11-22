// Generates dist/sitemap.xml for Google Search Console.
// Static pages are always included. Active job URLs are added by querying
// Supabase at build time when VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY exist.

import fs from 'node:fs';
import path from 'node:path';
import { loadEnv } from 'vite';

const fileEnv = loadEnv('production', process.cwd(), 'VITE_');
const SITE = (process.env.SITE_URL || 'https://vmwncrjob.in').replace(/\/$/, '');
const dist = path.resolve(process.cwd(), 'dist');

if (!fs.existsSync(path.join(dist, 'index.html'))) {
  console.error('dist/index.html not found. Run vite build first.');
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);

const staticPages = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/jobs', changefreq: 'daily', priority: '0.9' },
  { path: '/become-employer', changefreq: 'monthly', priority: '0.7' },
  { path: '/about', changefreq: 'monthly', priority: '0.4' },
  { path: '/contact', changefreq: 'monthly', priority: '0.5' },
  { path: '/download', changefreq: 'monthly', priority: '0.5' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.2' },
  { path: '/terms', changefreq: 'yearly', priority: '0.2' },
  { path: '/disclaimer', changefreq: 'yearly', priority: '0.2' },
];

const qualificationPages = [
  '10th-pass-jobs',
  '12th-pass-jobs',
  'iti-jobs',
  'diploma-jobs',
  'graduate-jobs',
  'btech-mtech-jobs',
].map((slug) => ({ path: `/${slug}`, changefreq: 'weekly', priority: '0.7' }));

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry(entry) {
  return [
    '  <url>',
    `    <loc>${escapeXml(SITE + entry.path)}</loc>`,
    entry.lastmod ? `    <lastmod>${escapeXml(entry.lastmod)}</lastmod>` : null,
    `    <changefreq>${entry.changefreq}</changefreq>`,
    `    <priority>${entry.priority}</priority>`,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n');
}

let jobs = [];
const supabaseUrl = process.env.VITE_SUPABASE_URL || fileEnv.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || fileEnv.VITE_SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseKey) {
  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/jobs?select=id,updated_at&status=eq.active&order=created_at.desc&limit=10000`,
      {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
        signal: AbortSignal.timeout(20000),
      },
    );
    if (response.ok) {
      jobs = await response.json();
    } else {
      console.warn(`Sitemap: jobs query returned HTTP ${response.status}`);
    }
  } catch (error) {
    console.warn(`Sitemap: could not fetch jobs (${error.message}); writing static sitemap only.`);
  }
} else {
  console.warn('Sitemap: Supabase env vars missing; writing static sitemap only.');
}

const jobPages = jobs.map((job) => ({
  path: `/jobs/${job.id}`,
  changefreq: 'weekly',
  priority: '0.6',
  lastmod: (job.updated_at || today).slice(0, 10),
}));

const entries = [...staticPages, ...qualificationPages, ...jobPages];
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.map(urlEntry).join('\n')}\n</urlset>\n`;

fs.writeFileSync(path.join(dist, 'sitemap.xml'), xml);

console.log(`Sitemap: ${entries.length} URLs (${jobPages.length} job pages) -> dist/sitemap.xml`);
