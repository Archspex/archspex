#!/usr/bin/env node
/**
 * build-seo.js
 * ────────────────────────────────────────────────────────────────────────────
 * Runs on every Netlify deploy. Reads the SPA shell (index.html) and writes:
 *
 *   ./products/index.html
 *   ./manufacturers/index.html
 *   ./projects/index.html
 *   ./professionals/index.html
 *   ./resources/index.html
 *   ./for-brands/index.html
 *   ./news/index.html
 *   ./sitemap.xml
 *   ./robots.txt
 *   ./_redirects        (only if missing — won't clobber user edits)
 *
 * Each per-route file reuses the shell but injects a unique <title>,
 * <meta name="description">, self-referencing canonical, Open Graph / Twitter
 * tags, and a small bootstrap <script> setting window._initialRoute so ax2.js
 * paints the correct page immediately (no home-page flash).
 *
 * Additionally, for the Products and Manufacturers routes, the script fetches
 * a small first-page snapshot from Supabase at build time and injects it as
 * hidden crawlable content — Googlebot with JavaScript disabled still sees
 * real product/brand names and can index them.
 *
 * Zero npm dependencies — uses only Node built-ins (fs, path, fetch on 18+).
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ── CONFIG ───────────────────────────────────────────────────────────────────
const REPO_ROOT   = __dirname;
const SHELL_PATH  = path.join(REPO_ROOT, 'index.html');
const SITE_URL    = 'https://archspex.com';
const OG_IMAGE    = `${SITE_URL}/archspex-logo.png`;

// Supabase (public anon key — safe to expose; RLS enforces access)
const SUPABASE_URL = 'https://jmmmexoykswsophzmytg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptbW1leG95a3N3c29waHpteXRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMzI4MjgsImV4cCI6MjA5MTkwODgyOH0.xnuesdbOt6rFYMFUxt3GVF034VdL7-FAOQWYbIrnxfw';

// ── ROUTES ───────────────────────────────────────────────────────────────────
// path  → URL segment (also the folder name + browser URL)
// page  → internal SPA page id used by ax2.js showPage()
// title → <title> (keep ≤ 60 chars where possible for Google SERP)
// desc  → <meta name="description"> (≤ 160 chars)
const ROUTES = [
  {
    path:  'products',
    page:  'products',
    title: 'Building Materials & Products for GCC Projects | ArchSpex',
    desc:  'Browse specification-ready building materials from verified international brands. Structural, envelope, interiors, finishes, FF&E and systems for UAE, Saudi Arabia and the wider GCC.',
    ssrKind: 'products',  // fetch snapshot from Supabase
  },
  {
    path:  'manufacturers',
    page:  'manufacturers',
    title: 'Verified Building Materials Brands & Manufacturers | ArchSpex',
    desc:  'Discover international manufacturers and brands specifying products across GCC construction projects. Access technical documentation, BIM files and certifications.',
    ssrKind: 'manufacturers',
  },
  {
    path:  'projects',
    page:  'projects',
    title: 'GCC Construction Projects & Case Studies | ArchSpex',
    desc:  'Explore architecture and construction projects across the UAE, Saudi Arabia and wider GCC. See specified materials, project timelines and case studies.',
    ssrKind: null,
  },
  {
    path:  'professionals',
    page:  'professionals',
    title: 'Architects, Designers & Construction Professionals | ArchSpex',
    desc:  'Connect with architects, interior designers, developers and contractors shaping the GCC construction market. Discover verified professionals across the region.',
    ssrKind: null,
  },
  {
    path:  'resources',
    page:  'guides',   // internal SPA page id
    title: 'Specification Resources, BIM Files & Technical Documents | ArchSpex',
    desc:  'Access BIM files, CAD drawings, technical datasheets and specification resources for building projects across UAE, Saudi Arabia and the GCC.',
    ssrKind: null,
  },
  {
    path:  'for-brands',
    page:  'forbrands',  // internal SPA page id
    title: 'List Your Brand & Reach GCC Specifiers | ArchSpex',
    desc:  "Get your building materials specified across UAE, Saudi Arabia and the wider GCC. Reach architects, developers and contractors on the region's leading specification platform.",
    ssrKind: null,
  },
  {
    path:  'news',
    page:  'news',
    title: 'Building Materials & GCC Construction News | ArchSpex',
    desc:  'Latest news, product launches and industry insights from the GCC building materials and construction sector.',
    ssrKind: null,
  },
];

const HOME_META = {
  title: 'ArchSpex — Building Materials Specification Platform | UAE & GCC',
  desc:  'The specification platform where GCC building materials meet the architects, developers and contractors who specify them. Browse products, brands, projects and resources across UAE, Saudi Arabia and the wider region.',
  canonical: `${SITE_URL}/`,
};

// ── HELPERS ──────────────────────────────────────────────────────────────────
function escHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Strip any existing SEO tags from the shell so we can inject clean ones per
// route. Uses simple regex — fine because index.html isn't user-authored
// markdown, just our own output.
function stripExistingSeo(html) {
  return html
    .replace(/<title>[^<]*<\/title>/i, '')
    .replace(/<meta\s+name="description"[^>]*>/gi, '')
    .replace(/<link\s+rel="canonical"[^>]*>/gi, '')
    .replace(/<meta\s+property="og:[^"]+"[^>]*>/gi, '')
    .replace(/<meta\s+name="twitter:[^"]+"[^>]*>/gi, '');
}

function buildHeadBlock({ title, desc, url, ogType = 'website', image = OG_IMAGE }) {
  const t = escHtml(title);
  const d = escHtml(desc);
  return [
    `<title>${t}</title>`,
    `  <meta name="description" content="${d}">`,
    `  <link rel="canonical" href="${url}">`,
    `  <meta property="og:type" content="${ogType}">`,
    `  <meta property="og:site_name" content="ArchSpex">`,
    `  <meta property="og:title" content="${t}">`,
    `  <meta property="og:description" content="${d}">`,
    `  <meta property="og:url" content="${url}">`,
    `  <meta property="og:image" content="${image}">`,
    `  <meta name="twitter:card" content="summary_large_image">`,
    `  <meta name="twitter:title" content="${t}">`,
    `  <meta name="twitter:description" content="${d}">`,
    `  <meta name="twitter:image" content="${image}">`,
  ].join('\n  ');
}

function injectHead(html, headBlock) {
  // Insert just after the viewport meta so the block sits near the top of
  // <head> for crawler-friendly ordering. Fallback: right after <head>.
  const viewportRe = /(<meta\s+name="viewport"[^>]*>)/i;
  if (viewportRe.test(html)) {
    return html.replace(viewportRe, `$1\n  ${headBlock}`);
  }
  return html.replace('<head>', `<head>\n  ${headBlock}`);
}

function injectInitialRoute(html, pageId) {
  const snippet = `<script>window._initialRoute = ${JSON.stringify(pageId)};</script>\n  `;
  // Insert just before <script src="ax2.js">…</script>
  if (html.includes('<script src="ax2.js"')) {
    return html.replace('<script src="ax2.js"', `${snippet}<script src="ax2.js"`);
  }
  return html.replace('</body>', `  ${snippet}</body>`);
}

function injectSsrContent(html, ssrHtml) {
  if (!ssrHtml) return html;
  // Inject inside <body>, at the very top, wrapped in a hidden container that
  // Google can still index but users don't see. `visibility:hidden` +
  // `height:0` keeps it out of the layout without triggering hidden-content
  // penalties (unlike `display:none`, which some crawlers discount).
  const wrapped =
    '<div id="_ssr-content" aria-hidden="true" ' +
    'style="position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:hidden">' +
    ssrHtml +
    '</div>';
  return html.replace('<body>', `<body>\n  ${wrapped}`);
}

// ── SUPABASE FETCH (build-time snapshot for SSR content) ─────────────────────
async function sbFetch(table, params = '') {
  const url = `${SUPABASE_URL}/rest/v1/${table}${params}`;
  try {
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });
    if (!res.ok) {
      console.warn(`[ssr] ${table} → HTTP ${res.status}`);
      return [];
    }
    return await res.json();
  } catch (e) {
    console.warn(`[ssr] ${table} fetch failed:`, e.message);
    return [];
  }
}

async function ssrProducts() {
  const rows = await sbFetch(
    'products',
    '?select=name,brand,category,country,description&order=created_at.desc&limit=24'
  );
  if (!rows.length) return '';
  const items = rows.map(p => {
    const name  = escHtml(p.name || '');
    const brand = escHtml(p.brand || '');
    const cat   = escHtml(p.category || '');
    const cty   = escHtml(p.country || '');
    const desc  = escHtml((p.description || '').slice(0, 200));
    return `<article><h2>${name}</h2><p><strong>${brand}</strong>${cty ? ` &middot; ${cty}` : ''}${cat ? ` &middot; ${cat}` : ''}</p><p>${desc}</p></article>`;
  }).join('');
  return `<h1>Specification-Ready Building Materials</h1><section>${items}</section>`;
}

async function ssrManufacturers() {
  const rows = await sbFetch(
    'manufacturers',
    '?select=name,country,category,description&order=created_at.desc&limit=24'
  );
  if (!rows.length) return '';
  const items = rows.map(m => {
    const name = escHtml(m.name || '');
    const cty  = escHtml(m.country || '');
    const cat  = escHtml(m.category || '');
    const desc = escHtml((m.description || '').slice(0, 200));
    return `<article><h2>${name}</h2><p>${cty}${cat ? ` &middot; ${cat}` : ''}</p><p>${desc}</p></article>`;
  }).join('');
  return `<h1>Verified Manufacturers &amp; Brands</h1><section>${items}</section>`;
}

async function getSsr(kind) {
  if (kind === 'products')      return ssrProducts();
  if (kind === 'manufacturers') return ssrManufacturers();
  return '';
}

// ── BUILDERS ─────────────────────────────────────────────────────────────────
function rebuildRoot(shell) {
  const stripped = stripExistingSeo(shell);
  const head = buildHeadBlock({
    title: HOME_META.title,
    desc:  HOME_META.desc,
    url:   HOME_META.canonical,
  });
  return injectHead(stripped, head);
}

async function writeRoute(route, shell) {
  const url = `${SITE_URL}/${route.path}/`;
  const stripped = stripExistingSeo(shell);
  const head = buildHeadBlock({ title: route.title, desc: route.desc, url });
  let html = injectHead(stripped, head);
  html = injectInitialRoute(html, route.page);
  if (route.ssrKind) {
    const ssr = await getSsr(route.ssrKind);
    if (ssr) html = injectSsrContent(html, ssr);
  }
  const dir = path.join(REPO_ROOT, route.path);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
  console.log(`[seo] ${route.path}/index.html  — ${route.title}`);
}

function writeSitemap() {
  const urls = [`${SITE_URL}/`, ...ROUTES.map(r => `${SITE_URL}/${r.path}/`)];
  const items = urls.map(u => {
    const priority = u === `${SITE_URL}/` ? '1.0' : '0.8';
    return `  <url><loc>${u}</loc><changefreq>weekly</changefreq><priority>${priority}</priority></url>`;
  }).join('\n');
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    items + '\n</urlset>\n';
  fs.writeFileSync(path.join(REPO_ROOT, 'sitemap.xml'), xml, 'utf8');
  console.log(`[seo] sitemap.xml (${urls.length} URLs)`);
}

function writeRobots() {
  const txt =
    'User-agent: *\n' +
    'Allow: /\n' +
    `\nSitemap: ${SITE_URL}/sitemap.xml\n`;
  fs.writeFileSync(path.join(REPO_ROOT, 'robots.txt'), txt, 'utf8');
  console.log('[seo] robots.txt');
}

function ensureRedirects() {
  const p = path.join(REPO_ROOT, '_redirects');
  if (fs.existsSync(p)) {
    console.log('[seo] _redirects — kept existing (not overwritten)');
    return;
  }
  const txt =
    '# Detail-page fallbacks — SPA resolves these client-side.\n' +
    '/product/*      /index.html   200\n' +
    '/brand/*        /index.html   200\n' +
    '/brand-*        /index.html   200\n' +
    '\n' +
    '# Catch-all — anything not matching a static file (including the 7\n' +
    '# pre-rendered folders) falls back to the root SPA shell.\n' +
    '/*              /index.html   200\n';
  fs.writeFileSync(p, txt, 'utf8');
  console.log('[seo] _redirects (created)');
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  if (!fs.existsSync(SHELL_PATH)) {
    console.error(`[seo] ERROR — ${SHELL_PATH} not found. Run this from the repo root.`);
    process.exit(1);
  }
  const shell = fs.readFileSync(SHELL_PATH, 'utf8');

  // 1) Rewrite root index.html with home SEO meta.
  fs.writeFileSync(SHELL_PATH, rebuildRoot(shell), 'utf8');
  console.log('[seo] Rewrote root index.html with home SEO meta');

  // 2) Generate per-route files (in parallel where possible).
  await Promise.all(ROUTES.map(r => writeRoute(r, shell)));

  // 3) Sitemap + robots + redirects.
  writeSitemap();
  writeRobots();
  ensureRedirects();

  console.log('[seo] Done.');
}

main().catch(err => {
  console.error('[seo] FATAL:', err);
  process.exit(1);
});
