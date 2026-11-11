# Mission : site web de la Fondation Stark Hold Solutions (fondationstarkhold.org)

Tu es le développeur principal de ce projet. Tu construis le site **bilingue FR/EN** d'une ASBL congolaise (RDC) dont le contenu est **piloté par un CMS**. Tu travailles **par phases**. À la fin de chaque phase, tu t'arrêtes, tu fais un résumé (ce qui est fait, comment le tester, les décisions prises, les points ouverts) et tu attends ma validation avant de passer à la suivante.

## Fichiers fournis dans le dépôt

- `docs/contenu-source.md` : **la seule source de vérité pour le contenu**. N'invente aucun chiffre, nom, date ou témoignage. S'il manque quelque chose, mets un placeholder explicite `[À FOURNIR : …]` et liste-le dans ton résumé.
- `brand/logo-starkhold-source.jpg` : le logo (JPEG 1080×1013, fond blanc).
- `photos/hopital-1..5.png` : les photos du bâtiment hospitalier.

Commence par lire ces fichiers, puis crée un `CLAUDE.md` à la racine. Il résume la stack, les conventions, les commandes, la structure du projet et les règles de contenu ci-dessous. Tiens-le à jour à chaque phase.

---

## Charte graphique (tirée du logo)

Définis-la comme design tokens (variables CSS dans `@theme` de Tailwind v4). La page de lancement réutilise les mêmes valeurs.

| Token | Valeur | Usage |
|---|---|---|
| `--brand-red` | `#C00000` | CTA, accents, liens actifs |
| `--brand-red-deep` | `#8B0000` | Survol, dégradés, sections fortes |
| `--brand-black` | `#0C0C0C` | Titres, texte du logo |
| `--brand-grey` | `#8A8A8A` | Textes secondaires, légendes |
| `--surface` | `#FFFFFF` | Fond principal |
| `--surface-warm` | `#F5F3F0` | Sections alternées |
| `--success` / `--warning` | vert et orange sobres | États des formulaires (jamais le rouge de marque) |

**Typographie** (Google Fonts, chargées via `next/font`) :
- Titres : **Roboto Slab** 800/900. Elle rappelle la slab serif grasse du mot « StarkHold ».
- Sur-titres et étiquettes : **Josefin Sans** 300, en capitales avec un espacement large (`letter-spacing ~0.3em`). Elle rappelle le slogan.
- Texte courant : **Inter** 400/600.

**Logo** : le symbole est un « S » formé de deux parallélogrammes rouges en dégradé (`#C00000` → `#8B0000`), reliés par un pli noir dégradé. Sous le symbole, le mot « StarkHold » en slab serif et le slogan « GO FURTHER TOGETHER ». **Vectorise-le en SVG propre**, sans incruster de bitmap :
- `logo-mark.svg` : le symbole seul ;
- `logo-full.svg` : le symbole, le nom et le slogan ;
- `logo-mark-white.svg` et `logo-full-white.svg` : versions pour fonds sombres ;
- le favicon (`icon.svg` et PNG 32/180/512) et `og-default.png` (1200×630).

Montre-moi le SVG à côté du JPEG source pour validation.

**Signature** : « Go further together » / « Aller plus loin ensemble ».
**Ton visuel** : institutionnel, chaleureux et crédible (une ONG de santé et de développement, pas une startup). Beaucoup d'espace, de grandes photos et des chiffres clés mis en avant. Le rouge reste un accent : il ne doit pas envahir les fonds.

---

## PHASE 0 — Page de lancement avec compte à rebours (PRIORITAIRE, livrable autonome)

L'ouverture est fixée au **20 novembre 2026 à 00:00, heure de Kinshasa (UTC+01:00)**, soit `2026-11-20T00:00:00+01:00`. Le calcul doit être correct quel que soit le fuseau du visiteur.

**Contraintes**
- Dossier `launch/` **indépendant** : HTML, CSS et JavaScript seuls (ES modules), aucun framework, aucune dépendance npm, aucune étape de build. Il doit pouvoir être déployé tel quel comme projet statique Vercel (Root Directory = `launch`).
- Fichiers : `index.html`, `styles.css`, `main.js`, `i18n.js`, `assets/` (logos SVG, favicon, image OG).
- Poids total inférieur à 300 Ko hors polices. Lighthouse : 95 ou plus dans les 4 catégories, sur mobile.

**Contenu**
- Le logo complet, avec une animation d'entrée sobre du « S » (les deux parallélogrammes qui glissent, puis le pli qui apparaît). Sans animation si `prefers-reduced-motion` est activé.
- Le titre « Notre nouveau site arrive » / « Our new website is coming ».
- Le compte à rebours jours, heures, minutes et secondes, avec des chiffres à largeur fixe (`font-variant-numeric: tabular-nums`, sans saut de mise en page) et une région `aria-live="polite"` mise à jour au plus une fois par minute pour les lecteurs d'écran.
- Une phrase de présentation et les **5 domaines** en icônes SVG inline : Santé maternelle, Agriculture, Élevage, Pêche & pisciculture, Intrants piscicoles.
- Les actions de contact :
  - **WhatsApp** : `https://wa.me/243904947476?text=…`, avec un message prérempli dans la langue active ;
  - **Appeler** : `tel:+243904947476` ;
  - **E-mail** : `mailto:contact@fondationstarkhold.org`.
- Les icônes X, LinkedIn et Facebook. Les URLs sont dans un objet de config en haut de `main.js`. Une icône dont l'URL est vide est masquée.
- Le pied de page : nom légal, adresse du siège et © 2026.

**Comportement**
- **Langue** : détection via `navigator.language` (fr par défaut, en sinon). Un sélecteur FR | EN met à jour `<html lang>` et le texte sans recharger la page. Le choix est mémorisé dans `localStorage`, entouré de try/catch.
- **À l'échéance** : le compteur est remplacé par « Le site est en ligne » / « We're live », avec un bouton « Découvrir le site » qui recharge la racine du domaine.
- **Métadonnées** : `<title>`, description, Open Graph et Twitter Card en FR (`og:locale` `fr_FR` et `og:locale:alternate` `en_US`), `theme-color` `#C00000`.
- **Responsive** : conçu d'abord pour le mobile (360 px), puis la tablette et le bureau. Aucun défilement horizontal.
- **Accessibilité** : contrastes AA, focus visibles, cibles tactiles de 44 px minimum, HTML sémantique.

**Livraison de la phase 0**
Une capture mobile et une capture bureau (Playwright), en FR et en EN, plus le test de l'état « échéance passée » (date simulée via un paramètre `?now=` actif uniquement en développement). Ajoute un `launch/README.md` qui explique le déploiement sur Vercel et la bascule du domaine vers le site principal le 20 novembre.

**STOP : attends ma validation.**

---

## Stack du site principal (phases 1 à 5)

- **Next.js**, App Router, TypeScript strict : prends la dernière version stable supportée officiellement par Payload 3, et vérifie la compatibilité dans la doc avant d'installer.
- **Payload CMS 3**, intégré à l'application Next.js (groupes de routes `(frontend)` et `(payload)`, administration sur `/admin`).
- **Base de données : Supabase Postgres**, via `@payloadcms/db-postgres`.
  - Vercel est serverless et la connexion directe Supabase est en IPv6 : à l'exécution, utilise **l'URL du pooler Supavisor en mode transaction (port 6543)** dans `DATABASE_URI`.
  - Pour les migrations, utilise l'URL du **pooler en mode session (port 5432)** dans `DATABASE_URI_MIGRATIONS`, avec un script `migrate:prod` dédié.
  - Mets les tables Payload dans un schéma dédié (`schemaName: 'payload'`) pour qu'elles ne soient pas exposées par l'API REST auto-générée de Supabase (PostgREST). Vérifie ce point.
  - `push` n'est autorisé qu'en développement. En production, les migrations sont versionnées dans `src/migrations` et lancées par `payload migrate` pendant le build Vercel.
- **Médias : Supabase Storage**, via `@payloadcms/storage-s3`. Il faut l'endpoint S3 de Supabase et `forcePathStyle: true` (le système de fichiers de Vercel n'est pas persistant). Bucket public `media`. Payload génère les tailles d'image et les sert via `next/image`.
- **E-mail** : `@payloadcms/email-resend`, avec le domaine `fondationstarkhold.org` à vérifier (DNS SPF/DKIM). Expéditeur `noreply@fondationstarkhold.org`, destinataire `contact@fondationstarkhold.org`. L'adaptateur doit pouvoir être remplacé par Nodemailer/SMTP via les variables d'environnement.
- **i18n** :
  - **Localisation Payload** au niveau des champs, avec `locales: ['fr','en']`, `defaultLocale: 'fr'` et `fallback: true`.
  - **Routes** `/fr/...` et `/en/...` : un middleware redirige `/` selon `Accept-Language` ou un cookie. Les textes d'interface passent par `next-intl`.
  - **Slugs localisés.** `hreflang` et `x-default`, et un sélecteur de langue qui renvoie vers la page équivalente.
  - L'administration Payload est **en français**.
- **UI** : Tailwind CSS v4, shadcn/ui (composants copiés et adaptés aux tokens) et lucide-react pour les icônes.
- **Validation** : zod, partagée entre client et serveur.
- **Qualité** : ESLint et Prettier, Vitest pour la logique, Playwright pour les parcours critiques.
- **Hébergement** : **Vercel** pour l'application et **Supabase** pour la base de données et les médias. Pas de Docker. Fournis un `.env.example` exhaustif et commenté.

---

## PHASE 1 — Mise en place

- Initialise le projet Next.js et Payload 3 avec la structure de dossiers documentée dans `CLAUDE.md`.
- Connecte Supabase : base de données (pooler), schéma `payload`, stockage S3.
- Configure la localisation FR/EN, l'administration en français et les design tokens de la charte. Intègre les logos SVG de la phase 0.
- Crée une collection `users` (rôles `admin` et `editor`) et le premier utilisateur admin via un script de seed.
- Écris un `README.md` qui couvre l'installation locale, les variables d'environnement, la création du projet Supabase (bucket, clés S3, URLs du pooler), le déploiement sur Vercel et les migrations.

**STOP.**

## PHASE 2 — Modèle de contenu et données initiales

Tous les champs textuels visibles sont **localisés**. Chaque collection publique a des **brouillons et des versions**, un **slug localisé** et un groupe **SEO** (titre méta, description, image OG).

- **`pages`** : constructeur de pages à blocs.
  - Blocs : Hero, Texte riche, Chiffres clés, Grille de secteurs, Grille de projets, Équipe, Partenaires, Galerie, Appel à l'action, FAQ.
  - Pages créées : Accueil, À propos, Contact.
- **`sectors`** : titre, accroche, description riche, icône, image de couverture, points clés, ordre.
  - Les 5 secteurs de la v1 : Santé maternelle et fistules obstétricales, Agriculture, Élevage, Pêche et pisciculture, Intrants piscicoles.
- **`projects`** (réalisations) : titre, lieu, province, secteur (relation), bailleur ou partenaire, montant (nombre et devise, affichage facultatif), nombre de bénéficiaires ou de cas, période, résumé, galerie.
- **`products`** (catalogue, **sans paiement**) : nom, marque (relation `brands`), catégorie (aliments pour poissons, équipements, intrants), description, caractéristiques, photos, statut de disponibilité, et un bouton « Demander un devis » qui pré-remplit le formulaire de rappel.
- **`brands`** : nom, logo, site web.
- **`posts`** (actualités) : titre, extrait, contenu, couverture, catégorie, date, auteur.
- **`team`** : nom, fonction, biographie courte, photo, ordre, groupe (Direction, Chirurgiens, etc.).
- **`partners`** : nom, logo, type (bailleur, hôpital, partenaire), URL.
- **`callback-requests`** : voir la phase 4.
- **`media`** : texte alternatif localisé et **obligatoire**.
- **Globals** :
  - `site-settings` : nom, slogan, téléphone, numéro WhatsApp, e-mail, adresses du siège et de l'antenne, URLs X/LinkedIn/Facebook, message WhatsApp prérempli en FR et en EN ;
  - `header` (navigation) et `footer`.

**Seed idempotent** (`pnpm seed`), à partir de `docs/contenu-source.md` :
- contenu **en français et en anglais** : rédige la traduction anglaise toi-même, avec un ton professionnel d'ONG ;
- les 5 secteurs, les projets de santé publiés, les projets hors périmètre en **brouillon**, la Fistula Foundation **non publiée** ;
- l'équipe : Direction et Chirurgiens ;
- les chiffres clés ;
- les photos de l'hôpital ;
- les produits et marques « exemple » en **brouillon**, clairement marqués `[EXEMPLE]`.

**Contrôle d'accès** : lecture publique uniquement pour le contenu publié. L'écriture est réservée aux rôles admin et editor. `callback-requests` n'est jamais lisible publiquement.

Revalidation : un hook `afterChange` ou `afterDelete` appelle `revalidateTag`/`revalidatePath` pour la locale concernée, pour que toute publication soit visible immédiatement.

**STOP.**

## PHASE 3 — Front-end

**Pages**
- **Accueil** : hero, chiffres clés, secteurs, projet phare « Fistules obstétricales — Kasangulu », réalisations, partenaires, dernières actualités, appel à l'action.
- **À propos** : mission, statut légal, zones d'intervention avec une carte simple en SVG des provinces de la RDC, direction.
- **Secteurs** : liste et détail.
- **Santé** : page renforcée avec l'équipe chirurgicale, la méthodologie en 4 étapes, les chiffres, la liste d'attente et un appel au soutien.
- **Réalisations** : liste filtrable par secteur ou province, et détail.
- **Produits** : catalogue filtrable par catégorie ou marque, et détail. Pas de panier.
- **Actualités** : liste paginée et article.
- **Contact** : coordonnées, carte (un lien ou un iframe OpenStreetMap, pas de clé API) et formulaire.
- **Pages légales** : mentions légales et politique de confidentialité, avec placeholders.
- **Erreur 404** localisée.

**Règles**
- Rendu serveur (Server Components) partout. Les composants client sont réservés à l'interactivité.
- Les contenus sont mis en cache et revalidés par tags (pas de `no-store` global).
- Mobile d'abord et rapide sur les réseaux 3G de RDC : images AVIF/WebP, chargement différé, pas de carrousel lourd et moins de 150 Ko de JavaScript sur l'accueil.
- Accessibilité WCAG 2.1 AA.
- Le menu mobile est accessible : focus piégé dans le menu et fermeture avec Échap.

**STOP.**

## PHASE 4 — Conversion : « Être rappelé » et « Discuter avec nous »

**1. Bouton « Être rappelé »** (« Request a call back »)
- **Visible sur toutes les pages** : un bouton dans l'en-tête sur ordinateur, et une barre d'action collante en bas d'écran sur mobile.
- Il ouvre une **modale** (shadcn Dialog) contenant le formulaire. Le même formulaire est intégré à la page Contact.
- **Champs** :
  - nom complet\* ;
  - téléphone\* : préfixe +243 par défaut, mais les numéros internationaux sont acceptés ;
  - e-mail (facultatif) ;
  - sujet\* : Santé / Agriculture / Élevage / Pêche & pisciculture / Produits & devis / Partenariat & dons / Autre ;
  - message (facultatif, 1 000 caractères maximum) ;
  - créneau préféré (facultatif) ;
  - consentement\*.
  - Champs cachés : la locale, la page d'origine et le produit concerné le cas échéant.
- **Traitement** : une Server Action valide les données avec zod, crée une entrée `callback-requests` (statut `new`, `contacted` ou `closed`, note interne, assignation) et envoie **deux e-mails** :
  - une notification à `contact@fondationstarkhold.org`, avec un lien direct vers l'entrée dans `/admin` ;
  - un accusé de réception au demandeur dans sa langue, s'il a laissé un e-mail.
- **Anti-spam** :
  - un champ piège invisible ;
  - un délai minimum avant envoi ;
  - une **limite par IP** (5 envois par heure), stockée en base sous forme de hash d'IP, sans stocker l'IP en clair.
- **Retour utilisateur** : un message de succès localisé (« Nous vous rappelons rapidement »), et des erreurs affichées champ par champ.
- **Administration** : une vue liste avec filtres par statut et par sujet, et un export CSV.

**2. « Discuter avec nous »**
- Un bouton flottant WhatsApp **toujours visible**, en bas à droite, qui ne doit pas masquer le bouton de rappel sur mobile.
- Il ouvre `wa.me/<numéro>` avec un message prérempli dans la langue active. Le numéro et les messages viennent de `site-settings`.
- Prévois une interface `ChatProvider` pour pouvoir brancher plus tard Crisp ou Tawk.to via une variable d'environnement, sans refonte.

**Tests** : Playwright couvre l'envoi du formulaire (cas valide, invalide et limite atteinte) dans les deux langues, ainsi que la présence des deux boutons sur toutes les pages.

**STOP.**

## PHASE 5 — Référencement, réseaux sociaux, performance et mise en production

- **Métadonnées** via `generateMetadata`, avec les champs SEO de Payload et une valeur de repli. Images OG dynamiques (`next/og`) aux couleurs de la charte.
- **Indexation** : `sitemap.xml` multilingue avec `hreflang`, et `robots.txt`.
- **Données structurées** : JSON-LD `NGO`/`Organization` (avec `sameAs` vers les réseaux), `BreadcrumbList`, `Article` pour les actualités et `Product` pour le catalogue, sans prix.
- **Réseaux sociaux** : liens X, LinkedIn et Facebook dans l'en-tête et le pied de page, modifiables depuis `site-settings`. Ajoute des boutons de partage (liens natifs, sans script tiers) sur les actualités et les projets.
- **Mesure d'audience** : intègre Vercel Analytics et Speed Insights.
- **Sécurité** :
  - en-têtes CSP, HSTS et Referrer-Policy ;
  - `/admin` est exclu de l'indexation et une limite de tentatives protège la connexion ;
  - aucun secret côté client.
- **Validation finale** :
  - Lighthouse mobile ≥ 90 en performance et ≥ 95 dans les trois autres catégories, sur l'accueil, une page secteur et la page Contact ;
  - `pnpm build` passe sans aucune erreur TypeScript ni ESLint.
- **Checklist de mise en production** dans le README :
  - variables d'environnement Vercel ;
  - migrations ;
  - DNS du domaine et de Resend ;
  - création des comptes réseaux sociaux et saisie de leurs URLs ;
  - bascule du domaine de la page de lancement vers le site le 20 novembre ;
  - premier compte éditeur pour la fondation, et un guide « Comment publier une actualité / un produit » pour un éditeur non technique.

**STOP : livraison finale.**

---

## Règles transverses

- **Contenu** : n'invente rien, et marque tout placeholder `[À FOURNIR : …]`. Ne publie **ni montant ni information marqués « non publiés »**, ni les coordonnées personnelles des dirigeants.
- **Périmètre v1** : seulement Santé, Agriculture, Élevage, Pêche & pisciculture et Intrants piscicoles. Le génie civil, les affaires sociales, l'environnement et la gouvernance sont **hors périmètre**, mais le modèle doit permettre de les ajouter sans modifier le code.
- **Pas de paiement en ligne.** Pas de panier.
- **Code** : TypeScript strict et aucun `any` non justifié. Petits commits clairs (Conventional Commits). Les types Payload sont générés (`payload generate:types`) et utilisés partout.
- **Doutes** : face à une ambiguïté de documentation ou de version (Payload, Next.js, Supabase), **vérifie dans la documentation officielle à jour** avant de coder, et note la décision dans `CLAUDE.md`.
- **Fin de phase** : chaque phase se termine par un résumé, les commandes pour tester, des captures si c'est visuel, et la liste des `[À FOURNIR]` restants.
