# 🕶️ L'écran noir

Une page d'accueil de streaming. Elle est jolie. Elle est **inutilisable** dès
qu'on ne la regarde pas avec les yeux.

## La situation

Ouvre `index.html` dans ton navigateur. Puis, sans toucher à la souris :

1. Appuie sur `Tab`. Encore. Encore. **Rien ne se passe.**
2. Active le lecteur d'écran (macOS : `⌘F5` · Windows : `Ctrl+Win+Entrée`)
   et écoute la page. **Il n'y a rien à écouter.**

Cette page contient 37 éléments cliquables, 19 images et 0 titre. Pour un
lecteur d'écran, c'est une page vide. Pour Google aussi.

## Ta mission

Réécrire le HTML pour que la page dise **ce qu'elle est**, sans changer
d'un pixel ce qu'elle **montre**.

### La règle

> **Tu ne touches pas au CSS.**

La feuille de style n'utilise que des classes : tu peux remplacer n'importe
quelle balise par la bonne sans rien casser. Si ton rendu bouge, c'est que tu
as changé une classe — reviens en arrière.

### La checklist

**L'en-tête du document**

- [ ] `<html lang="fr">`
- [ ] un `<title>` qui décrit la page
- [ ] `<meta name="description">`
- [ ] `<meta name="viewport">`
- [ ] les balises Open Graph (`og:title`, `og:description`, `og:image`)

**La structure**

- [ ] `<header>`, `<nav>`, `<main>`, `<footer>` à la place des `<div>`
- [ ] **un seul `<h1>`**, puis `<h2>` pour les titres de rangées
- [ ] chaque rangée dans une `<section>`
- [ ] les liens du pied de page dans une `<ul>` / `<li>`

**Les éléments interactifs**

- [ ] tout ce qui est cliquable est un `<button>` ou un `<a>` — plus aucun
      `<div onclick>`
- [ ] chaque bouton sans texte visible (flèches, cloche, avatar) a un
      `aria-label`
- [ ] le champ de recherche a un `<label>` — la classe `.sr-only` est
      fournie dans la feuille de style pour le cacher à l'œil sans le
      cacher au lecteur d'écran
- [ ] le menu profil annonce son état avec `aria-expanded`

**Les images**

- [ ] chaque `<img>` a un `alt`
- [ ] les jaquettes décrivent le film, pas « image » ni « jaquette »
- [ ] les images purement décoratives ont `alt=""` (et non pas *pas d'alt*)
- [ ] les emojis décoratifs sont masqués : `aria-hidden="true"`

**Les détails qui piquent**

- [ ] `id="card"` n'existe qu'une fois dans un document (ou n'existe plus)
- [ ] la note en `★★★★☆` est lisible autrement que par les symboles
- [ ] `16+` dit à voix haute ce qu'il veut dire

## Vérifier

```bash
# navigation clavier : Tab doit atteindre TOUS les boutons, dans l'ordre
# et l'élément focalisé doit être visible

npx @axe-core/cli index.html
npx lighthouse index.html --only-categories=accessibility,seo --view
```

Objectif : **0 violation axe**, et les deux scores Lighthouse au vert.

Le vrai test reste le premier : refais l'exercice du début au lecteur d'écran.
Si tu comprends la page les yeux fermés, c'est gagné.

## Ce qui n'est pas demandé

Changer le design, ajouter des fonctionnalités, réécrire le JavaScript, ou
toucher au CSS. Le rendu final doit être **identique** à celui de départ.
