# EFREI B3 · Conception et développement front-end

Les supports et ateliers du module, distribués au fur et à mesure de la
progression. **Si le dossier du jour n'est pas encore là, fais un `git pull`.**

## Organisation

| Dossier | Contenu |
| --- | --- |
| `socle/` | HTML, CSS, JavaScript — les fondations, sans framework |
| `framework/` | React et son écosystème |

## Socle

| Bloc | Atelier | Dossier |
| --- | --- | --- |
| 1 | 🕶️ L'écran noir — sémantique, ARIA, SEO | `socle/bloc01-html-nul/` |
| 2 | 🎨 CSS zéro — intégration complète, flex, grid, animations | `socle/bloc02-css-zero/` |

Les corrigés arrivent **après** l'atelier concerné, dans un sous-dossier
`correction/`. Le point de départ reste intact à côté : tu peux refaire
l'exercice depuis zéro à tout moment.

Chaque atelier a son `README.md` : lis-le en entier avant de coder, la
consigne y tient en une page.

## Sur ton poste

Le socle ne demande **rien à installer** : un navigateur et un éditeur.
Ouvre le `index.html` de l'atelier et travaille dedans.

À partir du bloc 2, les feuilles de style sont dans des fichiers séparés :
sers-toi d'un petit serveur statique plutôt que d'ouvrir le fichier à la main.

```bash
npx serve            # puis http://localhost:3000
```

(*Live Server* dans VS Code fait la même chose en un clic.)

Deux outils utiles, à lancer sans installation (ils demandent Node) :

```bash
npx @axe-core/cli index.html
npx lighthouse index.html --only-categories=accessibility,seo --view
```

Le reste du module (partie `framework/`) demandera **Node 26** et **pnpm** —
on le posera le moment venu.

## Rendre son travail

Un dépôt par personne, le lien déposé sur Teams. Ton historique Git fait
partie du rendu : des commits lisibles valent mieux qu'un `final_v2_ok`.
