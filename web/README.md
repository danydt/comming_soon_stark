# Site FSHS — Next.js + Payload CMS

Site bilingue (FR/EN) de la **Fondation Stark Hold Solutions**. Le contenu est géré dans Payload CMS (`/admin`).

- **Application** : Next.js 16 (App Router), Payload 3, TypeScript strict, Tailwind CSS v4, next-intl.
- **Hébergement** : **Vercel** pour l'application, **Supabase** pour la base Postgres et le stockage des médias.

## Sommaire

1. [Installation locale](#1-installation-locale)
2. [Créer le projet Supabase](#2-créer-le-projet-supabase)
3. [Variables d'environnement](#3-variables-denvironnement)
4. [Base de données et migrations](#4-base-de-données-et-migrations)
5. [Déployer sur Vercel](#5-déployer-sur-vercel)
6. [Commandes](#6-commandes)

---

## 1. Installation locale

Prérequis : **Node.js 24** ou plus, et **pnpm 10** ou plus (`npm i -g pnpm`).

```bash
cd web
pnpm install
cp .env.example .env      # puis remplir .env (voir sections 2 et 3)
pnpm dev                  # http://localhost:3000  → redirige vers /fr ou /en
pnpm seed:admin           # crée le premier administrateur (ADMIN_EMAIL / ADMIN_PASSWORD)
pnpm seed                 # charge le contenu initial FR/EN (idempotent, ~5 min)
```

L'administration se trouve sur http://localhost:3000/admin.

## 2. Créer le projet Supabase

Le site utilise **un seul projet Supabase**. Pendant le développement, la base contient des données de test. Elle sera remise à zéro au passage en production : voir la section 4.

1. Sur https://supabase.com/dashboard, cliquez sur **New project**.
   - Nom : `fshs` ; région : **Europe (Frankfurt)**, la plus proche de Kinshasa parmi les régions proposées.
   - Notez le **mot de passe de la base** : il sert dans les URLs de connexion.
2. Récupérez les **URLs de connexion** avec le bouton **Connect**, en haut du tableau de bord, puis l'onglet **Connection string**.
   - **Transaction pooler** (port **6543**) → `DATABASE_URI`. C'est la connexion utilisée par le site sur Vercel.
   - **Session pooler** (port **5432**) → `DATABASE_URI_MIGRATIONS`. Elle sert aux migrations.
   - Remplacez `[YOUR-PASSWORD]` par le mot de passe de la base, **sans les crochets**.
   - Si le mot de passe contient des caractères spéciaux, encodez-les : `/` → `%2F`, `@` → `%40`, `:` → `%3A`, `#` → `%23`, `?` → `%3F`, `%` → `%25`. Sinon l'URL est illisible (`Invalid URL`). Plus simple : générer un mot de passe uniquement alphanumérique.
   - Le préfixe de l'hôte du pooler (`aws-0-…` ou `aws-1-…`) dépend du projet : copiez-le tel quel depuis **Connect**, ne le devinez pas.
   - Pourquoi passer par le pooler : la connexion directe de Supabase est en IPv6, ce que les fonctions serverless de Vercel ne supportent pas.
3. Récupérez la **clé API** dans **Project Settings → API**.
   - `Project URL` → `SUPABASE_URL`.
   - Clé `anon` `public` → `SUPABASE_ANON_KEY`. Elle sert seulement à la vérification `pnpm check:supabase`.
   - Ne copiez **jamais** la clé `service_role` dans ce projet.
4. Créez le **bucket des médias** dans **Storage → New bucket**.
   - Nom : `media` par défaut, à cocher **Public bucket**. Un autre nom est possible (ici `stark_hold`) : le reporter dans `S3_BUCKET`.
   - Un bucket **privé** accepte les envois mais son URL publique répond `Bucket not found` (404) : les images ne s'afficheraient pas sur le site.
5. Générez les **clés S3** dans **Storage → Settings → S3 Connection**.
   - Notez l'`Endpoint` (→ `S3_ENDPOINT`) et la `Region` (→ `S3_REGION`).
   - Sous **S3 Access Keys**, cliquez sur **New access key**, puis notez `Access key ID` (→ `S3_ACCESS_KEY_ID`) et `Secret access key` (→ `S3_SECRET_ACCESS_KEY`).
6. Vérifiez que l'API REST n'expose pas les tables. Les tables Payload sont dans un schéma dédié, `payload`. L'API REST générée par Supabase (PostgREST) n'expose que les schémas listés dans **Project Settings → API → Exposed schemas**, par défaut `public` et `graphql_public`. **N'y ajoutez jamais `payload`.** Après le premier lancement (`pnpm dev`) :
   ```bash
   pnpm check:supabase
   ```
   Le script doit afficher deux ✓.

## 3. Variables d'environnement

La liste complète et commentée est dans [`.env.example`](.env.example). L'essentiel :

| Variable                     | Rôle                                                                                                                                  |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SERVER_URL`     | URL publique du site (`https://fondationstarkhold.org` en production)                                                                 |
| `PAYLOAD_SECRET`             | Secret aléatoire de 32 caractères ou plus. Générez-le avec `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `DATABASE_URI`               | Pooler en mode transaction (port 6543)                                                                                                |
| `DATABASE_URI_MIGRATIONS`    | Pooler en mode session (port 5432)                                                                                                    |
| `S3_*`, `SUPABASE_URL`       | Stockage des médias (bucket `media`)                                                                                                  |
| `RESEND_API_KEY` ou `SMTP_*` | Envoi des e-mails. Sans configuration, les e-mails s'affichent dans la console                                                        |
| `ADMIN_*`                    | Premier administrateur (`pnpm seed:admin`)                                                                                            |

> **Médias en local sans S3** : laissez `S3_ENDPOINT` vide et les fichiers seront écrits dans `web/media/`. C'est interdit en production, où le site refuse de démarrer.
>
> **Taille des fichiers** : Vercel limite les envois à **4,5 Mo par requête**. Compressez les photos avant de les envoyer dans l'admin ; Payload génère ensuite les tailles d'affichage en WebP.

## 4. Base de données et migrations

Le site n'utilise qu'une seule base. Son mode de gestion change au passage en production.

**Phases 1 à 4 (développement)**

- `pnpm dev` synchronise automatiquement le schéma (`push`) dans la base Supabase.
- Le build Vercel ne lance **pas** de migrations.

**Passage en production (phase 5)**

1. Remise à zéro des données de test : suppression du schéma `payload` et vidage du bucket `media`. Un script dédié, avec confirmation, sera fourni.
2. `pnpm migrate:create initial`, qui produit une migration versionnée dans `src/migrations/`, à committer.
3. `pnpm migrate:prod`, qui applique les migrations via le pooler en mode session (`DATABASE_URI_MIGRATIONS`).
4. `pnpm seed:admin`, puis le chargement du contenu réel.

**Ensuite (production)**

- Toute modification du modèle passe par `pnpm migrate:create <nom>`, puis un commit.
- La commande de build Vercel devient `pnpm migrate:prod && pnpm build`.
- `push` reste réservé au développement : il n'est jamais actif quand `NODE_ENV=production`.

## 5. Déployer sur Vercel

1. Sur https://vercel.com/new, importez le dépôt GitHub.
2. **Root Directory** : `web`. Le framework (Next.js) est détecté automatiquement.
3. **Node.js** : 24.x, dans Project Settings → General.
4. **Environment Variables** : saisissez toutes les variables de la section 3, pour _Production_ et _Preview_. `NEXT_PUBLIC_SERVER_URL` doit valoir l'URL de l'environnement concerné.
5. Lancez le déploiement, puis vérifiez `/fr`, `/en` et `/admin` sur l'URL `*.vercel.app`.
6. Domaine `fondationstarkhold.org` : la bascule a lieu le 20 novembre 2026, selon la procédure de [`../coming-soon/README.md`](../coming-soon/README.md). Seuls les enregistrements A et CNAME `www` changent ; ne touchez jamais aux MX.

## 6. Commandes

| Commande                             | Effet                                                                    |
| ------------------------------------ | ------------------------------------------------------------------------ |
| `pnpm dev`                           | Serveur de développement (http://localhost:3000)                         |
| `pnpm build` / `pnpm start`          | Build de production / démarrage                                          |
| `pnpm lint` / `pnpm format`          | ESLint / Prettier                                                        |
| `pnpm typecheck`                     | Vérification TypeScript                                                  |
| `pnpm test:unit`                     | Tests Vitest (règles d'accès, environnement, e-mail)                     |
| `pnpm test:e2e`                      | Tests Playwright (nécessitent `.env` rempli)                             |
| `pnpm generate:types`                | Régénère `src/payload-types.ts` après chaque changement de modèle        |
| `pnpm generate:importmap`            | Régénère la carte des composants de l'admin                              |
| `pnpm migrate:create <nom>`          | Crée une migration                                                       |
| `pnpm migrate` / `pnpm migrate:prod` | Applique les migrations (connexion normale / pooler en mode session)     |
| `pnpm seed:admin`                    | Crée ou promeut le premier administrateur (idempotent)                   |
| `pnpm seed`                          | Contenu initial FR/EN depuis `docs/contenu-source.md` (idempotent)       |
| `pnpm check:supabase`                | Vérifie que le schéma `payload` n'est pas exposé par l'API REST Supabase |

## Structure

```
src/
  app/(frontend)/[locale]/   pages publiques (/fr, /en)
  app/(payload)/             administration (/admin) et API Payload (/api)
  access/                    règles d'accès (admin, editor, public)
  collections/               collections Payload (users, media… puis phase 2)
  components/ui/             composants shadcn/ui adaptés à la charte
  components/site/           composants du site (sélecteur de langue…)
  components/admin/          logo et icône de l'administration
  i18n/                      routage next-intl (fr/en)
  lib/                       env, e-mail, stockage, polices, utilitaires
  migrations/                migrations versionnées (à partir de la phase 5)
  scripts/                   seed-admin, check-supabase
  proxy.ts                   redirection / → /fr ou /en (Next 16 : ex-middleware.ts)
messages/                    textes d'interface FR/EN (next-intl)
```
