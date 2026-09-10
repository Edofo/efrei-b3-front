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

Chaque atelier a son `README.md` : lis-le en entier avant de coder, la
consigne y tient en une page.

## Sur ton poste

Le socle ne demande **rien à installer** : un navigateur et un éditeur.
Ouvre le `index.html` de l'atelier et travaille dedans.

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
