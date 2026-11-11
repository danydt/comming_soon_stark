# Page de lancement — fondationstarkhold.org

Page statique avec compte à rebours jusqu'à l'ouverture du site, le **20 novembre 2026 à 00:00, heure de Kinshasa** (`2026-11-20T00:00:00+01:00`).
Elle contient uniquement du HTML, du CSS et du JavaScript (ES modules), sans framework, sans dépendance et sans étape de build. Elle est hébergée **chez LWS** et déposée à la main.

## Contenu du dossier

| Fichier | Rôle |
|---|---|
| `index.html` | Page (logo SVG en ligne, métadonnées, Open Graph) |
| `styles.css` | Styles, design tokens, animation du logo |
| `main.js` | **Configuration** (en haut du fichier), compte à rebours, langue, liens |
| `i18n.js` | Textes FR / EN |
| `site.webmanifest` | Icônes et couleur de thème |
| `.htaccess` | HTTPS, redirection `www`, compression, cache, en-têtes de sécurité (Apache) |
| `assets/` | Logos SVG, favicons, image OG, polices woff2 (licence OFL) |

## Modifier les réglages

Tout se règle dans l'objet `CONFIG`, en haut de `main.js` :

- `social.x`, `social.linkedin`, `social.facebook` : collez l'URL d'un compte pour faire apparaître son icône. Si elles sont toutes vides, le bloc « Suivez-nous » est masqué.
- `launchAt` : date et heure d'ouverture, avec le fuseau.
- `whatsappNumber`, `phone`, `email` : coordonnées.

Les textes se modifient dans `i18n.js`. Pensez à modifier aussi le texte français écrit directement dans `index.html`, qui sert au référencement et quand JavaScript est désactivé.

## Déposer la page sur LWS

1. Dans l'espace client LWS, activez le **certificat SSL** (Let's Encrypt, gratuit) pour `fondationstarkhold.org` **et** `www.fondationstarkhold.org`. Attendez qu'il soit actif.
2. Récupérez l'archive `dist/coming-soon.zip`. Pour la générer depuis `tools/` : `pnpm zip:cs`.
3. Ouvrez le **gestionnaire de fichiers** LWS et allez dans le dossier web racine (en général `htdocs/` ou `www/`).
4. Si le dossier contient une ancienne page (`index.php`, `index.html` par défaut, etc.), supprimez-la ou renommez-la.
5. Envoyez `coming-soon.zip`, faites un clic droit puis **Extraire** à la racine. Supprimez ensuite le zip.
   - À la racine, vous devez voir `index.html`, `main.js`, `assets/`… et **pas** un sous-dossier `coming-soon/`.
   - `.htaccess` est un fichier caché : vérifiez qu'il est bien présent (option « afficher les fichiers cachés »).
6. Vérifiez :
   - `http://fondationstarkhold.org` et `https://www.fondationstarkhold.org` redirigent vers `https://fondationstarkhold.org/` ;
   - le compte à rebours tourne et le sélecteur FR | EN fonctionne ;
   - l'aperçu de partage est correct, avec le [Sharing Debugger Facebook](https://developers.facebook.com/tools/debug/) et le [Post Inspector LinkedIn](https://www.linkedin.com/post-inspector/) ;
   - le score Lighthouse, sur [PageSpeed Insights](https://pagespeed.web.dev/?url=https%3A%2F%2Ffondationstarkhold.org%2F) en version mobile.

> En cas d'erreur 500 après l'envoi du `.htaccess`, c'est qu'une directive n'est pas acceptée par l'offre LWS. Renommez le fichier en `_htaccess` pour confirmer, puis signalez-le : on retirera la directive en cause.

## Bascule vers le site principal le 20 novembre

Le site principal (Next.js + Payload) sera hébergé sur **Vercel**. La bascule consiste à faire pointer le domaine vers Vercel. **Seuls les enregistrements web changent.**

**J-2 (18 novembre)**
1. Dans la zone DNS LWS, **baissez le TTL** des enregistrements `A` de `@` et `CNAME`/`A` de `www` à **300 s** (5 min). Le changement du 20 novembre se propagera ainsi en quelques minutes.
2. Dans Vercel, ouvrez le projet puis **Settings → Domains** et ajoutez `fondationstarkhold.org` et `www.fondationstarkhold.org`. Choisissez `fondationstarkhold.org` comme domaine principal et redirigez `www` vers lui. Notez les valeurs que Vercel affiche : elles **sont propres au projet**, donc ne recopiez pas des valeurs trouvées ailleurs.
3. Vérifiez que le site de production fonctionne déjà sur son URL `*.vercel.app`.

**Jour J (20 novembre, peu après 00:00 heure de Kinshasa)**
1. Dans la zone DNS LWS :
   - `@` → type **A**, valeur indiquée par Vercel ;
   - `www` → type **CNAME**, valeur indiquée par Vercel ;
   - **supprimez** les éventuels enregistrements **AAAA** de `@` et `www`, qui entreraient en conflit.
2. **Ne touchez pas** aux enregistrements **MX**, **SPF/DKIM** (TXT) ni aux sous-domaines de messagerie : la boîte `contact@fondationstarkhold.org` doit continuer à recevoir des e-mails.
3. Attendez que Vercel affiche « Valid Configuration ». Le certificat HTTPS est émis automatiquement.
4. Les visiteurs qui ont gardé la page ouverte voient « Le site est en ligne ». Le bouton « Découvrir le site » recharge `/`, servi désormais par Vercel. HTML, CSS et JS sont en `Cache-Control: no-cache`, donc aucune ancienne version ne reste bloquée.
5. Une fois la bascule confirmée, remettez le TTL à sa valeur habituelle (par exemple 3600 s) et laissez les fichiers sur LWS pendant quelques jours, en solution de secours.

## Développement local

Depuis `tools/` (Node 22+ et pnpm) :

```bash
pnpm install
pnpm serve:cs            # http://localhost:4173
```

- **Date simulée** : `http://localhost:4173/?now=2026-11-19T23:59:50%2B01:00`, ou un horodatage en millisecondes. Ce paramètre ne fonctionne que sur `localhost`, `127.0.0.1` ou `file://`. Il est ignoré en production.
- **Tests et captures** : `pnpm test:cs`. Les captures sont écrites dans `docs/captures/phase-0/`.
- **Régénérer les logos** (SVG et logo en ligne dans `index.html`) : `pnpm logo`. Puis les favicons et l'image OG : `pnpm assets`.
