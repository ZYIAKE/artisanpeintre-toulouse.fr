# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
npm run dev       # Dev server on port 3000 (HMR enabled)
npm run build     # Production build → /dist
npm run preview   # Preview production build locally
```

Dev server also configured in `.claude/launch.json` (port 5173, autoPort).

Supabase Edge Function deployment:
```bash
npx supabase functions deploy site-google-reviews --project-ref slcksfqbsbcmvqupbhox
npx supabase functions deploy site-form-submit --project-ref slcksfqbsbcmvqupbhox
```

## Architecture

**Static multi-page site** for 2PC Peinture (artisan peintre à Toulouse). Vanilla HTML/CSS/JS — no frameworks. Vite 6 as build tool with Terser minification.

### Pages
- **14 root HTML pages**: index, prestations, peinture-interieure, peinture-exterieure-ravalement, renovation-supports, remise-en-etat-logement, realisations, chantier, apropos, avis, contact, plan-du-site, mentions-legales, politique-confidentialite
- **50 city pages** in `villes/` (format: `peintre-[city].html`) for local SEO
- `vite.config.js` auto-discovers all HTML entry points (excluding `ville.html` and `chantier.html` templates)

### JavaScript Modules (`src/js/`)
- **main.js** — Shared: hamburger nav, active link detection, Intersection Observer reveal animations, smooth scroll, FAQ accordion, realizações carousel, image gallery
- **form-handler.js** — Form submission to Supabase Edge Function (`site-form-submit`), honeypot spam prevention, success/error UX
- **reviews.js** — Google Reviews widget with lazy loading (IntersectionObserver), responsive carousel (3/2/1 cards per page)

### Supabase Backend
- **Edge Functions** (Deno runtime) at `https://slcksfqbsbcmvqupbhox.supabase.co`
- `site-google-reviews/index.ts` — Dual strategy: Google Maps HTML scraping → Places API fallback (5 review limit)
- `site-form-submit` — Processes contact forms, sends email via Resend, stores in DB
- Auth: Supabase anon key as Bearer token (hardcoded in JS, safe with RLS)

### Styling (`style.css`)
- CSS variables: `--green: #3A5A40`, `--green-dark: #2D4832`, `--charcoal: #2C3E34`
- Fonts: Merriweather (headings), DM Sans (body) via Google Fonts
- Mobile-first responsive with `clamp()` for fluid sizing
- Key component classes: `.reveal`, `.hamburger`, `.hero-form`, `.real-carousel`, `.avis-*`, `.faq-q/.faq-a`

## Deployment

- **Host:** EasyHoster (manual FTP upload of `dist/` contents to `public_html/`)
- **`.htaccess`** in `public/` handles: HTTPS force, www force, .html extension removal, trailing slash removal, security headers (HSTS, XSS, nosniff, SAMEORIGIN), GZIP, cache (1yr for hashed assets, no-cache for HTML)
- **Clean URLs:** `/prestations` serves `prestations.html` — all internal links, sitemap, and canonicals use extensionless URLs without trailing slash

## SEO

- JSON-LD structured data on each page (LocalBusiness, FAQPage, BreadcrumbList)
- Google Analytics GA4: `G-070RDMJKHE` (lazy loaded via `requestIdleCallback`)
- Google Search Console verification meta tag
- Sitemap at `/sitemap.xml`, robots at `/robots.txt`
- Meta titles format: `[Service] à [Ville] | 2PC Peinture — Devis Gratuit`
- Canonical URLs: self-referencing, extensionless, no trailing slash

## Key Patterns

- **Bulk page edits:** When modifying all 50 ville pages or all root pages, use Node.js scripts (fs.readFileSync/writeFileSync with regex replace) rather than editing one by one
- **Carousel structure:** `.carousel > .carousel-viewport (overflow:hidden) > .carousel-track (translateX) > .slide (min-width: calc(100%/N))`
- **Form submission requires** Authorization Bearer header with Supabase anon key
- **After code changes:** Always `npm run build` then upload `dist/` — the live site serves static files only
