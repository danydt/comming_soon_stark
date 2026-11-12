# CLAUDE.md — Fondation Stark Hold Solutions (fondationstarkhold.org)

Site bilingue FR/EN d'une ASBL congolaise (RDC). Brief complet : `PROMPT-CLAUDE-CODE.md`. Travail **par phases**, avec validation du client à la fin de chaque phase.

## État des phases

| Phase | Objet | État |
|---|---|---|
| 0 | Page de lancement `coming-soon/` (LWS) | **Validée** le 12/11/2026 |
| 1 | Mise en place Next.js + Payload + Supabase (`web/`) | **Validée** le 12/11/2026 |
| 2 | Modèle de contenu et seed | À faire |
| 3 | Front-end | À faire |
| 4 | Conversion (rappel, WhatsApp) | À faire |
| 5 | SEO, performance, mise en production | À faire |

## Hébergement

- **Page de lancement** (`coming-soon/`) : déposée **à la main** dans le gestionnaire de fichiers **LWS** (Apache). Pas sur Vercel. Configuration serveur dans `.htaccess`.
- **Site principal** (phases 1 à 5, dossier `web/`) : **Vercel** (Root Directory = `web`) + **un seul projet Supabase** (Postgres via le pooler, Storage S3). Données de test pendant le dev, remise à zéro au passage en prod (phase 5). Bascule du domaine le 20/11/2026 : seuls A et CNAME `www` changent, **jamais les MX**. Procédure dans `coming-soon/README.md`.

## Structure

```
docs/contenu-source.md     SEULE source de vérité pour le contenu
docs/captures/phase-N/     captures et rapports Lighthouse de chaque phase
brand/                     logo source JPEG, svg/ (logos vectorisés), png/ (favicons, OG), compare-logo.png
photos/                    photos de l'hôpital (sources 1280×960)
coming-soon/               page de lancement statique (HTML/CSS/JS en scripts classiques, aucune dépendance)
tools/                     outillage de dev (jamais déployé) : logo, polices, rendus PNG, tests Playwright
web/                       site principal Next.js 16 + Payload 3 (voir web/README.md)
  src/app/(frontend)/[locale]/  pages publiques /fr, /en
  src/app/(payload)/            admin (/admin) et API Payload
  src/access/ collections/ lib/ i18n/ scripts/ migrations/ components/{ui,site,admin}
  src/proxy.ts                  redirection / → /fr|/en (Next 16 : ex-middleware)
  messages/{fr,en}.json         textes d'interface next-intl
dist/                      archives générées (ignoré par git)
```

## Commandes du site (depuis `web/`)

`pnpm dev` · `pnpm build` · `pnpm lint` · `pnpm format` · `pnpm typecheck` · `pnpm test:unit` (Vitest) · `pnpm test:e2e` (Playwright, .env requis) · `pnpm generate:types` · `pnpm generate:importmap` · `pnpm migrate:create <nom>` · `pnpm migrate:prod` (pooler session 5432) · `pnpm seed:admin` · `pnpm check:supabase`. Détails : `web/README.md`.

## Commandes de la page de lancement (depuis `tools/`)

| Commande | Effet |
|---|---|
| `pnpm install` | Dépendances de l'outillage (opentype.js, Fontsource, Playwright, Lighthouse) |
| `pnpm serve:cs` | Sert `coming-soon/` sur http://localhost:4173 (gzip, `no-cache`) |
| `pnpm test:cs` | Tests Playwright de la page + captures dans `docs/captures/phase-0/` |
| `pnpm logo` | Régénère les SVG (`brand/svg`, `coming-soon/assets/logo`) et le logo en ligne de `index.html` |
| `pnpm fonts` | Copie les woff2 Fontsource dans `coming-soon/assets/fonts` |
| `pnpm assets` | Rend favicons PNG (32/180/512) et `og-default.png` (1200×630) |
| `pnpm zip:cs` | Construit `dist/coming-soon.zip` à extraire à la racine web LWS |

Lighthouse : `CHROME_PATH=".../chrome.exe" npx lighthouse http://localhost:4173/ --form-factor=mobile --throttling.cpuSlowdownMultiplier=1`. Voir la décision D6 plus bas.

## Charte (design tokens)

`--brand-red #C00000` (CTA, accents) · `--brand-red-deep #8B0000` (survol) · `--brand-black #0C0C0C` · `--brand-grey #8A8A8A` (décor et grands textes uniquement) · `--text-muted #595959` (petit texte secondaire, AA) · `--surface #FFF` · `--surface-warm #F5F3F0` · `--success #2E7D32` · `--warning #B26A00`.
Polices : Roboto Slab 800 (titres), Josefin Sans 300 en capitales et `letter-spacing 0.3em` (sur-titres), Inter 400/600 (texte). Le rouge reste un accent, jamais un fond de section.

## Règles de contenu (non négociables)

- N'inventer **aucun** chiffre, nom, date ou témoignage. S'il manque une information, mettre `[À FOURNIR : …]` et la lister dans le résumé de phase.
- Ne publier ni montant ni information marqués « non publiés » (Fistula Foundation : en négociation), ni les coordonnées personnelles des dirigeants.
- Périmètre v1 : Santé, Agriculture, Élevage, Pêche & pisciculture, Intrants piscicoles. Génie civil, affaires sociales, environnement et gouvernance sont hors périmètre, mais le modèle doit permettre de les ajouter.
- Pas de paiement en ligne, pas de panier.
- Microcopie d'interface (boutons, messages préremplis) : rédigée par nous, et signalée au client.

## Conventions

- Commits en Conventional Commits, petits et clairs.
- TypeScript strict à partir de la phase 1, sans `any` non justifié. Types Payload générés.
- Accessibilité : AA, focus visibles, cibles tactiles ≥ 44 px, `prefers-reduced-motion` respecté.
- En cas de doute de version ou de doc : vérifier la doc officielle à jour et noter la décision ci-dessous.

## Décisions

- **D1 — Logo vectorisé.** La géométrie du « S » est relevée au pixel sur le JPEG (parallélogrammes, pli, reflets courbes). La police du mot « StarkHold » n'est pas identifiée : le texte est converti en tracés à partir de **Roboto Slab 900**, légèrement agrandi et espacé pour couvrir la même emprise. Le résultat est proche, pas identique. Le slogan utilise Josefin Sans 300. Si le fichier vectoriel d'origine ou la police exacte sont fournis, relancer `pnpm logo` après adaptation.
- **D2 — Polices auto-hébergées** (woff2 latin de Fontsource, licence OFL), plutôt que le CDN Google : pas de CSS bloquant, pas de tiers, meilleur sur la 3G.
- **D3 — Langue de la page de lancement.** Le français est choisi pour `fr`, mais aussi pour `ln`, `sw`, `kg` et `lu` (langues de RDC), et quand la langue est inconnue. L'anglais est choisi sinon.
- **D4 — `?now=`** n'est actif que sur `localhost`, `127.0.0.1`, `[::1]` et `file://`. Un test vérifie qu'il est ignoré sur le domaine de production.
- **D5 — Cache LWS.** HTML, CSS et JS sont en `no-cache` (revalidation à chaque visite), pour que la bascule du 20/11 soit immédiate. Les URL inconnues sont redirigées en 302 vers `/`.
- **D6 — Lighthouse en local.** La machine de dev a un `benchmarkIndex` d'environ 250. Le ralentissement par défaut (×4) simulerait alors un appareil 4 fois plus lent qu'un mobile d'entrée de gamme et donnerait un score de 74 qui ne reflète pas la page. On utilise donc `cpuSlowdownMultiplier=1`, conformément à la doc Lighthouse pour les machines lentes. Mesure de référence après mise en ligne : PageSpeed Insights.
- **D7 — DNS Vercel.** Les valeurs A et CNAME sont propres à chaque projet : les relever dans Vercel → Settings → Domains (doc vérifiée le 11/11/2026).
- **D8 — pnpm 12** est installé globalement (corepack absent de Node 26).
- **D9 — Scripts classiques sur la page de lancement.** Les ES modules sont bloqués par Chrome quand `index.html` est ouvert directement (`file://`) : le compte à rebours et le switch FR/EN ne tournaient pas. `i18n.js` expose `window.FSHS_I18N` et `main.js` est un IIFE, chargés tous deux en `defer`. Ça marche en ligne comme en local. Écart assumé avec le brief (« ES modules »).
- **D10 — Charte et switch FR/EN validés par le client** sur la page de lancement : les reprendre tels quels pour le site principal (tokens, polices, sélecteur FR | EN souligné en rouge, `aria-pressed`).
- **D11 — Versions du site.** Next.js **16.4.6** et Payload **3.93.0**, dont le peer accepte `next >=16.3.3 <17`, vérifié sur npm le 12/11/2026. React 19.2, Node ≥ 24.22 (exigé par Payload). Le squelette vient de `create-payload-app` (template blank), nettoyé : pas de Docker.
- **D12 — `proxy.ts`.** Next 16 renomme `middleware.ts` en `proxy.ts`, et next-intl 4 le prend en charge (doc vérifiée). Le matcher exclut `api`, `admin`, `_next`, `_vercel` et les fichiers.
- **D13 — Un seul Supabase.** `push` actif en dev seulement (`NODE_ENV=development`, désactivable avec `PAYLOAD_DB_PUSH=false`). Pas de `payload migrate` dans le build Vercel avant la phase 5. En phase 5 : remise à zéro, migration initiale, `migrate:prod` (pooler session 5432), puis seed réel.
- **D14 — Schéma `payload`.** `schemaName: 'payload'` est marqué « expérimental » dans la doc Payload. PostgREST n'expose que les schémas listés dans *Exposed schemas* (`public`, `graphql_public`). La vérification se fait avec `pnpm check:supabase`, qui attend PGRST106 avec la clé anon.
- **D15 — Médias.** Supabase Storage via S3 (`forcePathStyle`), bucket public `media`. Les URLs publiques Supabase sont générées par `generateFileURL` et `disablePayloadAccessControl`, et servies via `next/image` (`remotePatterns *.supabase.co`). Envois côté serveur limités à 4,5 Mo par Vercel. Sans `S3_ENDPOINT`, les fichiers vont sur le disque local, en dev uniquement.
- **D16 — E-mail.** `EMAIL_PROVIDER` vaut resend, smtp ou console. À défaut, le choix est automatique selon `RESEND_API_KEY` ou `SMTP_HOST`, sinon console (logs Payload).
- **D17 — Sélecteur de langue du site.** Même rendu que la page de lancement (D10), mais avec des **liens** vers la page équivalente (`aria-current`), et non des boutons `aria-pressed`, car on change d'URL. Le cookie `NEXT_LOCALE` mémorise le choix.
- **D18 — Connexion admin.** `maxLoginAttempts: 5` et `lockTime: 15 min` sont posés dès la phase 1 (exigence de la phase 5). Admin Payload en français uniquement (`supportedLanguages: { fr }`).
- **D19 — Projet Supabase.** Région eu-west-1 (Irlande). Pooler `aws-1-eu-west-1.pooler.supabase.com` (le préfixe `aws-0` ne connaît pas ce projet). Mot de passe URL-encodé dans les `DATABASE_URI*`. Bucket public `stark_hold` (`S3_BUCKET`). Le CDN Supabase garde une image supprimée quelques minutes en cache.
