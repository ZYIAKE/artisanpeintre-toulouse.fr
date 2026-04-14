/**
 * Apply SEO patches to every HTML page of the site in one pass.
 *
 * What it does:
 *   1. Removes the Clarity placeholder script (nothing to track until
 *      Tom configures a real Clarity project ID)
 *   2. Adds <link rel="apple-touch-icon" href="/apple-touch-icon.png">
 *   3. Rewrites the inline GA4 loader so GA4 only loads after user consent
 *      (exposes window.__loadGA4 which cookie-consent.js calls)
 *   4. Injects cookie-consent.js reference + banner HTML before </body>
 *
 * Idempotent: running multiple times produces the same output.
 *
 * Run:
 *   node scripts/apply-seo-patches.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Skip templates (excluded from Vite build) and non-HTML files
const SKIP = new Set(['ville.html', 'chantier.html']);

function findHtmlFiles(dir, out = []) {
  for (const name of readdirSync(dir)) {
    // Skip build output + deps + hidden dirs
    if (name === 'node_modules' || name === 'dist' || name === '.git' || name.startsWith('.')) continue;
    const full = join(dir, name);
    const s = statSync(full);
    if (s.isDirectory()) {
      findHtmlFiles(full, out);
    } else if (name.endsWith('.html') && !SKIP.has(name)) {
      out.push(full);
    }
  }
  return out;
}

// ── Patch 1: install Microsoft Clarity (gated on cookie consent) ──
// The real Clarity project ID for artisanpeintre-toulouse.fr, retrieved from
// Bing Webmaster Tools → Microsoft Clarity → Complete setup.
// Stored on crm_clients.clarity_project_id in Supabase (source of truth).
const CLARITY_ID = 'wbkx4842k1';

// Remove the old placeholder (if any), then install a gated loader that
// exposes window.__loadClarity — called by cookie-consent.js on accept.
function installClarity(html) {
  // Strip the old placeholder (auto-loaded Clarity, unconfigured)
  let out = html.replace(
    /\s*<script>\(function\(c,l,a,r,i,t,y\)\{[^<]*?\}\)\(window,document,"clarity","script","PLACEHOLDER_CLARITY_ID"\);<\/script>\n?/g,
    '',
  );
  // Strip any previously-installed gated Clarity (idempotent re-run)
  out = out.replace(
    /\s*<!-- COOKIE-CONSENT GATED CLARITY -->[\s\S]*?<\/script>\n?/g,
    '',
  );
  // Install the gated loader right before </head>
  const block =
    `\n  <!-- COOKIE-CONSENT GATED CLARITY — loaded by cookie-consent.js on user accept -->\n` +
    `  <script>window.__loadClarity=function(){if(window.clarity&&window.clarity.q)return;(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i+"?ref=bwt";y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script","${CLARITY_ID}")};</script>\n`;
  return out.replace(/<\/head>/, block + '</head>');
}

// ── Patch 2: add apple-touch-icon link ──
function addAppleTouchIcon(html) {
  if (html.includes('apple-touch-icon')) return html;
  // Insert right after the manifest link
  return html.replace(
    /(<link rel="manifest"[^>]*>)/,
    '$1\n  <link rel="apple-touch-icon" href="/apple-touch-icon.png">',
  );
}

// ── Patch 3: rewrite GA4 to gate loading on consent ──
// Before: an inline IIFE that schedules loadGtag via requestIdleCallback
// After:  expose window.__loadGA4 and do nothing until cookie-consent.js calls it
function gateGA4OnConsent(html) {
  // Pattern: <!-- Google tag (gtag.js) … --> <script>…loadGtag…</script>
  // Replace the scheduling block (requestIdleCallback/setTimeout) with a no-op
  // and expose the function globally.
  //
  // Heuristic: if already patched (marker comment), skip.
  if (html.includes('COOKIE-CONSENT GATED GA4')) return html;

  const gaRe = /(<script>\s*window\.dataLayer = window\.dataLayer \|\| \[\];\s*function gtag\(\)\{dataLayer\.push\(arguments\);\}\s*function loadGtag\(\)\{[^}]+\})\s*(if\('requestIdleCallback' in window\)\{requestIdleCallback\(loadGtag\)\}\s*else\{setTimeout\(loadGtag,3000\)\}\s*<\/script>)/;

  if (!gaRe.test(html)) return html;
  return html.replace(
    gaRe,
    (_m, p1) =>
      p1.trim() +
      '\n  // ── COOKIE-CONSENT GATED GA4 ── only load after user accepts via cookie-consent.js\n' +
      '  window.__loadGA4 = loadGtag;\n' +
      '</script>',
  );
}

// ── Patch 4: cookie banner HTML + script before </body> ──
function injectCookieBanner(html) {
  if (html.includes('id="cookie-consent-banner"')) return html;
  const banner = `
  <!-- ══ COOKIE CONSENT BANNER (RGPD) ══ -->
  <div id="cookie-consent-banner" hidden role="dialog" aria-labelledby="cookie-title" aria-describedby="cookie-desc">
    <p id="cookie-title"><strong>Cookies analytiques</strong></p>
    <p id="cookie-desc">
      Nous utilisons Google Analytics pour comprendre comment vous utilisez notre site et améliorer votre expérience. Aucune donnée personnelle n'est vendue.
      <a href="/politique-confidentialite">En savoir plus</a>.
    </p>
    <div class="cookie-actions">
      <button type="button" id="cookie-refuse">Refuser</button>
      <button type="button" id="cookie-accept">Accepter</button>
    </div>
  </div>
  <script type="module" src="/src/js/cookie-consent.js"></script>
`;
  return html.replace(/<\/body>/, banner + '</body>');
}

function patch(html) {
  let out = html;
  out = installClarity(out);
  out = addAppleTouchIcon(out);
  out = gateGA4OnConsent(out);
  out = injectCookieBanner(out);
  return out;
}

// ── Main ──
const files = findHtmlFiles(ROOT);
let modified = 0;
for (const file of files) {
  const before = readFileSync(file, 'utf8');
  const after = patch(before);
  if (before !== after) {
    writeFileSync(file, after, 'utf8');
    modified++;
    console.log('  patched', relative(ROOT, file).replace(/\\/g, '/'));
  }
}
console.log(`\nDone — ${modified}/${files.length} files modified.`);
