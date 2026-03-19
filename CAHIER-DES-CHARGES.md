# CAHIER DES CHARGES — artisanpeintre-toulouse.fr

## Site vitrine 2PC Peinture — Artisan Peintre à Toulouse

---

## 1. IDENTITÉ DU PARTENAIRE

| Champ | Valeur |
|---|---|
| Entreprise | 2PC Peinture |
| Dirigeant | Kevin PEREZ |
| SIREN | 851 420 661 |
| TVA | FR86851420661 |
| Adresse | 156 Rue Dominique Clos, 31300 Toulouse |
| Téléphone | 06 50 07 29 69 |
| Email | 2pc.peinture@gmail.com |
| Secteur | Artisan peintre en bâtiment |
| Domaine | artisanpeintre-toulouse.fr |
| Hébergeur | EasyHoster |

---

## 2. OBJECTIF DU SITE

Générer un maximum de demandes de devis (appels + formulaires) pour des particuliers et professionnels de Toulouse et sa périphérie cherchant un artisan peintre. Le site doit être une machine à conversion, pas un simple catalogue.

**KPIs cibles :**
- Taux de conversion visiteur → contact > 5%
- Temps de chargement < 1.5s (Lighthouse 90+)
- Positionnement SEO local : top 3 sur "peintre toulouse" et variantes

---

## 3. STACK TECHNIQUE

| Composant | Technologie |
|---|---|
| Structure | HTML5 sémantique, multi-pages |
| Style | CSS3 vanilla (variables CSS, clamp(), grid, flexbox) |
| JavaScript | Vanilla ES6+, modules Vite |
| Build | Vite 6 (minification HTML/CSS/JS, tree-shaking) |
| Formulaires | Supabase (stockage) + Resend (notifications email) |
| Fonts | Google Fonts (Merriweather + DM Sans, préchargées) |
| Hébergement | EasyHoster (upload manuel /dist) |

---

## 4. ARBORESCENCE DU SITE

### 4.1 Pages structurelles (14 pages)

| Page | URL | Rôle SEO |
|---|---|---|
| Accueil | `/index.html` | Page principale — "artisan peintre toulouse" |
| Prestations | `/prestations.html` | Hub des 4 services |
| Peinture intérieure | `/peinture-interieure.html` | "peinture intérieure toulouse" |
| Peinture extérieure | `/peinture-exterieure-ravalement.html` | "ravalement facade toulouse" |
| Rénovation supports | `/renovation-supports.html` | "rénovation supports toulouse" |
| Remise en état | `/remise-en-etat-logement.html` | "remise en état logement toulouse" |
| Réalisations | `/realisations.html` | Portfolio — preuve sociale |
| Chantier détail | `/chantier.html` | Étude de cas — longue traîne |
| À propos | `/apropos.html` | Confiance — "qui sommes-nous" |
| Avis | `/avis.html` | Preuve sociale — "avis peintre toulouse" |
| Contact | `/contact.html` | Conversion — "devis peintre toulouse" |
| Plan du site | `/plan-du-site.html` | Maillage interne (noindex) |
| Mentions légales | `/mentions-legales.html` | Obligation légale (noindex) |
| Politique confidentialité | `/politique-confidentialite.html` | RGPD (noindex) |

### 4.2 Pages villes — SEO local (10 communes prioritaires)

Chaque page cible une commune dans un rayon de 30 km autour de Toulouse. Contenu 100% unique, minimum 800 mots, avec données locales spécifiques.

| Commune | URL | Population | Distance |
|---|---|---|---|
| Blagnac | `/villes/peintre-blagnac.html` | ~24 000 | 8 km |
| Colomiers | `/villes/peintre-colomiers.html` | ~40 000 | 12 km |
| Tournefeuille | `/villes/peintre-tournefeuille.html` | ~28 000 | 10 km |
| Muret | `/villes/peintre-muret.html` | ~27 000 | 22 km |
| Balma | `/villes/peintre-balma.html` | ~17 000 | 7 km |
| Ramonville-Saint-Agne | `/villes/peintre-ramonville.html` | ~14 000 | 8 km |
| Cugnaux | `/villes/peintre-cugnaux.html` | ~18 000 | 13 km |
| Plaisance-du-Touch | `/villes/peintre-plaisance-du-touch.html` | ~19 000 | 15 km |
| Saint-Orens-de-Gameville | `/villes/peintre-saint-orens.html` | ~13 000 | 10 km |
| Portet-sur-Garonne | `/villes/peintre-portet-sur-garonne.html` | ~10 000 | 11 km |

---

## 5. OPTIMISATIONS SEO

### 5.1 On-page

- **Title** : `[Prestation] à Toulouse | 2PC Peinture — Devis Gratuit`
- **Meta description** : 150-160 chars, mot-clé principal + ville + CTA
- **H1** : Unique par page, contient le mot-clé cible + localité
- **Canonical** : Auto-référencé sur chaque page
- **Robots** : `index, follow` (sauf utilitaires → `noindex, follow`)
- **Sitemap XML** : Toutes les pages indexables avec priorités
- **Robots.txt** : Autorise tout, pointe vers le sitemap

### 5.2 Données structurées (JSON-LD)

| Page | Schema | Données |
|---|---|---|
| Accueil | `LocalBusiness` + `FAQPage` | NAP complet, horaires, catalogue services, FAQ |
| Avis | `LocalBusiness` + `AggregateRating` | Note, nombre d'avis |
| Pages villes | `LocalBusiness` + `areaServed` | Zone géographique |
| Chantier | `Article` | Détail projet |

### 5.3 Technique

- **Fonts** : Préchargement via `preconnect` + `preload`
- **Images** : `loading="lazy"`, attributs `width`/`height`, format WebP quand disponible
- **HTML sémantique** : `<header>`, `<main>`, `<section>`, `<footer>`, `<nav>` avec ARIA
- **CSS minifié** : Via Vite build
- **Pas de render-blocking JS** : Scripts en `type="module"` (defer par défaut)

### 5.4 Maillage interne

- Nav → toutes pages principales
- Footer → 4 colonnes de liens (prestations, infos, zones)
- Breadcrumb → hiérarchie sur chaque page
- CTA → pointent vers `/contact.html`
- Pages villes → liées entre elles via section "Zone d'intervention"
- Plan du site → liens vers TOUTES les pages

---

## 6. STRATÉGIE DE CONVERSION

### 6.1 Points de contact (par page)

Chaque page offre minimum 4 points de conversion :
1. **Top bar** : Téléphone + "Devis gratuit"
2. **Nav CTA** : Bouton vert "Demander un devis"
3. **Bouton flottant desktop** : Téléphone sticky bas-droite
4. **Barre CTA mobile** : Appeler + Devis (sticky bas)
5. **CTA dans le contenu** : Bandeau vert entre sections

### 6.2 Réassurance

- Stats chiffrées (années d'expérience, chantiers réalisés, délai devis)
- Avis clients authentiques (nom, date, projet, note)
- Méthode de travail en 4 étapes
- "Devis sous 24h" + "100% gratuit"
- Mentions "artisan local" + "intervention [Ville]"

### 6.3 Formulaires

| Type | Champs | Emplacement |
|---|---|---|
| Formulaire rapide | nom, tél, email, prestation, message | Hero accueil + hero villes |
| Formulaire complet | nom, tél, email, ville, prestation, message | Page contact + bas de pages |

**Backend** : Supabase (stockage en base) + Resend (email au partenaire)

---

## 7. CONTENU À PERSONNALISER

### 7.1 Textes

Chaque page doit avoir un contenu 100% unique, rédigé pour 2PC Peinture :
- Ton professionnel mais accessible
- Ancrage local fort (mentions de Toulouse, quartiers, communes)
- Vocabulaire métier précis (peinture, ravalement, rénovation)
- FAQ spécifiques au métier et à la localité

### 7.2 Données à injecter

| Placeholder | Valeur 2PC Peinture |
|---|---|
| `[Ville]` | Toulouse |
| `[Nom de l'entreprise]` | 2PC Peinture |
| `[Adresse]` | 156 Rue Dominique Clos |
| `[Code postal]` | 31300 |
| Téléphone | 06 50 07 29 69 / +33650072969 |
| Email | 2pc.peinture@gmail.com |
| Domaine | https://www.artisanpeintre-toulouse.fr |
| Logo texte | 2PC / Peinture |
| SIREN | 851 420 661 |
| TVA | FR86851420661 |

### 7.3 Éléments visuels

- Images placeholder (pas de vraies photos fournies — utiliser des placeholders descriptifs)
- Icônes SVG inline (conservées du template)
- OG Image (à créer : 1200x630)

---

## 8. PAGES VILLES — SPÉCIFICATIONS SEO LOCAL

Chaque page ville doit :
1. **H1 unique** : "Peintre en Bâtiment à [Ville] — 2PC Peinture"
2. **Contenu unique** (800+ mots) mentionnant :
   - Caractéristiques architecturales locales
   - Types de logements courants
   - Quartiers ou secteurs de la commune
   - Distance depuis Toulouse et temps d'intervention
3. **Section prestations** adaptée au contexte local
4. **3 témoignages fictifs localisés** (prénom + initiale nom + commune)
5. **2 réalisations locales** (avec carrousel placeholder)
6. **FAQ locale** (5 questions spécifiques à la commune)
7. **Zone d'intervention** : liens vers les autres pages villes
8. **JSON-LD** : LocalBusiness avec `areaServed: [Ville]`

---

## 9. BUILD & DÉPLOIEMENT

### 9.1 Commandes

```bash
npm run dev      # Serveur de dev (port 3000, hot reload)
npm run build    # Build production → /dist
npm run preview  # Prévisualise le build
```

### 9.2 Structure /dist

```
dist/
├── index.html
├── prestations.html
├── peinture-interieure.html
├── peinture-exterieure-ravalement.html
├── renovation-supports.html
├── remise-en-etat-logement.html
├── realisations.html
├── chantier.html
├── apropos.html
├── avis.html
├── contact.html
├── plan-du-site.html
├── mentions-legales.html
├── politique-confidentialite.html
├── villes/
│   ├── peintre-blagnac.html
│   ├── peintre-colomiers.html
│   └── ... (10 fichiers)
├── assets/
│   ├── style-[hash].css
│   └── main-[hash].js
├── robots.txt
├── sitemap.xml
└── images/
    └── og-default.jpg
```

### 9.3 Déploiement

Upload manuel du dossier `/dist` sur EasyHoster par Thomas.

---

## 10. CHECKLIST FINALE

- [ ] Toutes les pages personnalisées avec données 2PC Peinture
- [ ] Page politique-confidentialite.html créée
- [ ] Mentions légales complètes (section Intervenant)
- [ ] Formulaires connectés à Supabase + Resend
- [ ] 10 pages villes avec contenu unique (800+ mots chacune)
- [ ] JSON-LD sur toutes les pages pertinentes
- [ ] Sitemap XML à jour avec toutes les URLs
- [ ] Robots.txt correct
- [ ] Tous les liens internes fonctionnels
- [ ] Responsive testé (mobile, tablette, desktop)
- [ ] Build Vite sans erreur
- [ ] Lighthouse > 90 (Performance, SEO, Accessibilité)
- [ ] Crédit atlinker présent dans le footer
