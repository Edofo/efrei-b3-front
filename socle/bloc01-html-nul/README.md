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

### Ce qu'on ne te demande PAS : supprimer les `<div>`

Une `<div>` n'est pas une faute. C'est une boîte sans signification, et c'est
exactement ce qu'il faut quand on a besoin d'une boîte sans signification :
grouper trois éléments pour les aligner, poser un dégradé par-dessus une image.

La faute, c'est la `<div>` **là où un élément signifiant existe**. Le corrigé
en garde 44 sur 146 — toutes des boîtes de mise en page. Ne cherche pas le zéro.

### La checklist

**Les méta essentiels**

- [ ] `<html lang="fr">`
- [ ] un `<title>` unique et descriptif — c'est le texte bleu dans Google
- [ ] `<meta name="description">` — le texte gris juste en dessous
- [ ] `<meta name="viewport">`
- [ ] `<link rel="canonical">` — l'URL de référence de cette page
- [ ] `<meta name="robots">`

**Le partage sur les réseaux (Open Graph)**

- [ ] `og:type`, `og:site_name`, `og:locale`, `og:url`
- [ ] `og:title`, `og:description`
- [ ] `og:image` avec ses `og:image:width`, `og:image:height`, `og:image:alt`
- [ ] `twitter:card` en `summary_large_image`

> ⚠️ **`og:image` exige une URL absolue** (`https://…/cover.jpg`), pas un
> chemin relatif ni une `data:` URI : c'est un serveur distant qui va la
> chercher, il n'a pas ta page sous les yeux. Format attendu : 1200 × 630.

**Les données structurées**

- [ ] un bloc `<script type="application/ld+json">` décrivant le site
      (`@type: "WebSite"`), avec la `SearchAction` qui pointe vers ta
      recherche interne. C'est ce qui donne une barre de recherche
      directement dans les résultats Google.

**Les URL parlantes**

- [ ] plus aucun `href="#"` — `/series`, `/titres/dark`, `/mentions-legales`
- [ ] le formulaire de recherche a une `action` et son champ un `name`
      (`/recherche?q=…`), cohérents avec la `SearchAction` ci-dessus

**La structure**

- [ ] `<header>`, `<nav>`, `<main>`, `<footer>` à la place des `<div>`
- [ ] **un seul `<h1>`**, puis `<h2>` pour les titres de rangées, puis `<h3>`
      pour le titre de chaque carte : un plan de document se lit comme une
      table des matières
- [ ] chaque rangée dans une `<section>`
- [ ] les cartes et les liens du pied de page dans des `<ul>` / `<li>`
- [ ] l'année de sortie dans un `<time datetime="2017">`

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
