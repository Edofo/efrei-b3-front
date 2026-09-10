# 🎨 CSS zéro

Le HTML est là. Il est propre, sémantique, accessible — c'est celui que tu as
écrit hier. Ouvre `index.html` : **du texte noir sur fond blanc et des images
empilées.** Il n'y a pas une ligne de style.

Ton travail : écrire toute la CSS.

## La cible

`../bloc01-html-nul/index.html`. Ouvre-la dans un autre onglet, à la même
largeur de fenêtre : c'est *exactement* ce que ta page doit devenir.

> **Oui, sa CSS est dans la page, et tu peux la copier.**
>
> Personne ne t'en empêchera. Mais la défense orale porte sur **tes** choix,
> fichier par fichier : « pourquoi `flex: 0 0 236px` et pas `width: 236px` ? »
> Une réponse copiée s'entend au premier mot. C'est le même contrat que pour
> l'IA : autorisée, et défendue.

Sers-t'en comme d'une maquette : on regarde, on mesure, on écrit soi-même.

## Ce que le designer te donne

Les valeurs qu'on ne devine pas à l'œil. Le reste, tu l'obtiens en comparant.

| | |
| --- | --- |
| Fond de page | `#141414` |
| Texte | `#ffffff`, secondaire `#b3b3b3` |
| Rouge de marque | `#e50914` |
| Vert « nouveauté » | `#46d369` |
| Gris du squelette | `#2a2a2a` |
| Police | `"Helvetica Neue", Helvetica, Arial, sans-serif` |
| Gouttière latérale | 60 px, partout |
| Barre du haut | `padding: 18px 60px`, dégradé noir 85 % → transparent |
| Bandeau d'accueil | `78vh`, jamais moins de 520 px |
| Carte | 236 × 133, rayon 4 px, 8 px entre deux cartes |
| Titre de rangée | 21 px, gras, 34 px sous la rangée |
| Flèches | 52 px de large, fond noir à 60 % |
| Pied de page | 4 colonnes, 14 px / 20 px d'écart |

> La page n'est **pas** responsive : le contenu a une largeur minimale de
> 1100 px et déborde sur mobile. C'est volontaire, c'est le sujet du bloc
> suivant. Ne perds pas de temps à écrire des media queries.

## Ce qui t'est fourni

- `index.html` — n'y touche pas. Aucune classe à ajouter, aucune balise à
  changer : tout ce dont tu as besoin est déjà là.
- Le **reset** en haut de `css/styles.css` : il neutralise les styles natifs
  des balises et pose `.sr-only`. De la plomberie, pas du design.
- Le **JavaScript** : les flèches défilent, l'avatar ouvre le menu, la classe
  `.topbar-scrolled` s'ajoute au défilement, le squelette de chargement laisse
  la place aux vraies cartes après 1,2 s. Rien à écrire.

Chaque fichier de `css/` porte en commentaire **la liste exacte des sélecteurs
à y écrire**. Rien d'autre : une règle dans le mauvais fichier, c'est une
règle qu'on ne retrouvera pas.

## Les six étapes

Fais-les dans l'ordre. Chacune rend la page un peu plus présentable, et tu
peux t'arrêter à n'importe quel jalon avec quelque chose à montrer.

### 1 · `styles.css` — le fond et les boutons *(~15 min)*

- [ ] fond `#141414`, texte blanc, la bonne police sur toute la page
- [ ] les deux boutons du bandeau côte à côte : un blanc, un gris translucide
- [ ] leur icône et leur texte alignés verticalement, avec un écart régulier

### 2 · `header.css` — la barre du haut *(~30 min)*

- [ ] la barre reste collée en haut quand on descend
- [ ] logo à gauche, menu juste à sa droite ; recherche, cloche et avatar
      poussés contre le bord droit — **sans marge calculée à la main**
- [ ] le dégradé noir vers transparent, pour que le texte reste lisible
      par-dessus l'image
- [ ] le menu profil est invisible au départ et apparaît sous l'avatar

**Le piège** : la barre doit passer *au-dessus* du bandeau, pas dessous.

### 3 · `hero.css` — le bandeau d'accueil *(~30 min)*

- [ ] l'image occupe 78 % de la hauteur de la fenêtre, recadrée **sans être
      déformée**
- [ ] deux dégradés superposés : un depuis la gauche, un depuis le bas, qui
      fondent l'image dans le fond de la page
- [ ] le bloc de texte posé par-dessus, à 60 px du bord gauche

**Le piège** : `.hero-shade` est une boîte vide. Elle doit couvrir toute
l'image sans occuper de place dans le flux.

### 4 · `rows.css` — les rangées de cartes *(~40 min)*

C'est l'étape la plus longue, et celle qui contient le vrai sujet.

- [ ] les cartes d'une rangée défilent horizontalement
- [ ] la barre de défilement n'est pas visible
- [ ] une carte fait 236 px de large **quoi qu'il arrive** : elle ne se
      rétrécit pas quand la rangée est pleine
- [ ] les deux flèches sont plaquées sur les bords de la rangée, centrées
      verticalement
- [ ] le badge `TOP 10` dans le coin haut-gauche de la jaquette
- [ ] les blocs gris du squelette de chargement

**Le piège** : `width: 236px` sur une carte ne suffit pas. Cherche pourquoi,
et ce que `flex` a de plus à proposer.

### 5 · `footer.css` — le pied de page *(~15 min)*

- [ ] les douze liens répartis en quatre colonnes égales
- [ ] les icônes sociales en ligne, la mention légale encadrée

**Le piège** : c'est le seul endroit de la page où `grid` fait mieux que
`flex`. Demande-toi pourquoi.

### 6 · `animations.css` — donner vie à tout ça *(~30 min)*

Dernière étape, et **une seule règle : tu n'animes que `transform` et
`opacity`.** Ce sont les deux seules propriétés que le navigateur anime sans
recalculer la mise en page ; tout le reste fait ramer la page sur mobile.

**a. La carte qui grandit au survol.** La jaquette grossit d'environ 12 %, en
douceur — et **les cartes voisines ne bougent pas d'un pixel**. Si elles se
décalent, tu as animé la mauvaise propriété. Ça doit marcher au clavier aussi
(`Tab` jusqu'à une carte) : cherche `:focus-visible`.

**b. La barre du haut qui se remplit au défilement.** Le JavaScript ajoute
déjà `.topbar-scrolled` dès 40 px. À toi d'écrire ce que cette classe fait.
*Indice* : un dégradé ne s'interpole pas vers une couleur — une transition de
`linear-gradient(…)` vers `#141414` ne produit rien, elle saute. Fais plutôt
**apparaître** un fond opaque par-dessus, avec un pseudo-élément.

**c. Le squelette qui respire.** Les blocs gris pulsent en boucle, sans
à-coup au bouclage. C'est le seul endroit où tu écriras des `@keyframes`.
Le délai est réglable en haut du `<script>` : mets-le à `0` pendant que tu
travailles sur autre chose.

**d. Le menu profil qui apparaît.** En fondu, avec un léger glissement.
*Le piège, et c'est le vrai cours de l'étape* : le menu est caché avec
`display`, et **`display` ne s'anime pas**. Il va falloir changer de
stratégie. Quand le menu est fermé, `Tab` ne doit **pas** s'arrêter dessus.

**e. Et la dernière ligne, obligatoire.** Certaines personnes ont le mal des
transports devant une page qui bouge. Le système le sait, le navigateur le
transmet :

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Teste-le : macOS → Réglages → Accessibilité → Affichage → Réduire les
animations. La page redevient figée, et reste utilisable.

## Vérifier

Ouvre ta page et la cible dans deux fenêtres de **même largeur**, et alterne.
L'œil repère les décalages beaucoup mieux qu'une lecture de code.

```bash
npx serve            # puis http://localhost:3000
```

Et pour l'étape 6, Chrome DevTools → `⌘⇧P` → « Rendering » → coche **Paint
flashing**. Survole tes cartes : si des rectangles verts clignotent partout,
tu as animé une propriété de mise en page.

## Ce qui n'est pas demandé

Toucher au HTML ou au JavaScript. Des media queries. Une bibliothèque (Tailwind,
Bootstrap, GSAP). Du SCSS. Une septième feuille. Un pixel-perfect au dixième :
on veut la même page, pas la même capture d'écran.
