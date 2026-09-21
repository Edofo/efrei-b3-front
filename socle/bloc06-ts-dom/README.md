# 🖱️ Le DOM

Ouvre `index.html`. C'est ta page du bloc 2 — la barre, le bandeau _Dark_,
le pied de page. Et à la place des rangées : **un squelette gris qui
pulse, pour toujours.** Les cartes ne sont plus dans le HTML. Elles sont
dans `data/catalogue.json`, et c'est ton TypeScript qui doit les
construire, les brancher, les faire réagir.

Même jeu qu'aux blocs 3, 4 et 5 — mais dans le **navigateur**, parce que
le DOM n'existe que là, et avec **Vite** pour servir la page et transpiler
le TypeScript à la volée.

## Lancer le jeu

```bash
npm install
npm run play        # Vite, puis http://localhost:3006/play.html
```

Double-cliquer sur le fichier, **non** : les modules, `fetch` et le
TypeScript exigent un serveur.

La page rejoue les tests **dès que tu enregistres** un fichier de `src/`
(Vite recharge la page). En bas, le **bac à sable** montre ce que tes
fonctions ont construit, test par test, avec la vraie CSS de la page. Et
`index.html`, dans un autre onglet, s'anime un peu plus à chaque quête
terminée — recharge-le.

Les types ne sont pas vérifiés par le jeu ici (Vite les efface sans les
lire) : `npm run typecheck` fait ce travail, et `npm run check` avant de
rendre.

## Les dix quêtes

| #   | Quête                      | Ce que tu apprends                                                                                  |
| --- | -------------------------- | --------------------------------------------------------------------------------------------------- |
| 1   | Trouver dans la page       | `querySelector(All)`, `Element \| null`, NodeList, `textContent`, `closest`, chercher depuis `root` |
| 2   | Fabriquer une carte        | `createElement` typé, `append`, attributs, `dataset` — la carte du bloc 2, en TS                    |
| 3   | Texte ou HTML ?            | `textContent` contre `innerHTML`, XSS en cinq lignes, mélanger texte et éléments                    |
| 4   | Remplir les rangées        | `replaceChildren`, `DocumentFragment`, réutiliser `createCard`, un type guard                       |
| 5   | Changer d'état             | `classList`, `aria-pressed`, `hidden`, `dataset`, opérations idempotentes                           |
| 6   | Réagir                     | `addEventListener`, `input` / `click` / `keydown`, événements typés, classe + ARIA ensemble         |
| 7   | Un seul écouteur           | la propagation, la délégation, `closest`, `preventDefault`, `focusin`                               |
| 8   | Le formulaire              | `submit`, `FormData`, messages d'erreur accessibles                                                 |
| 9   | Aller chercher la donnée   | `fetch`, `async / await`, `response.ok`, `unknown` dans un `catch`, trois états, timeout            |
| 10  | **BOSS** · La page qui vit | assembler : `start(document, "/data/catalogue.json")`                                               |

Compte quatre heures. Le boss importe tes quêtes 4, 6, 7 et 9.

## Les fichiers

- `index.html` — la vraie page. `app.ts` y appelle ton `start` (quête 10)
  et, en attendant, essaie tes briques une par une. **Ne modifie ni l'un
  ni l'autre.**
- `play.html` + `play.ts` — le jeu. `engine/` — son code. `quests/` — les tests.
- `src/` — tes dix fichiers, et `src/types.ts` (fourni).
- `css/` — la feuille du bloc 2, telle quelle. `data/` — le catalogue du
  bloc 5, tel quel.

## Les options

Dans l'URL de `play.html` :

- `?level=4` — rejouer la quête 4
- `?all=1` — tout rejouer, défis compris
- `?reset=1` — repartir de zéro (la progression est dans le
  `localStorage` du navigateur)

Et `index.html?solution=1`, si l'animateur a laissé le corrigé.

## Les commandes

```bash
npm run play          # Vite : le jeu et la vraie page
npm run typecheck     # tsc --noEmit
npm run lint          # ESLint
npm run format        # Prettier
npm run check         # typecheck + lint + format:check
```

## Les règles

Celles des blocs précédents. Et trois propres au DOM :

- **Toujours depuis `root`.** Les tests te passent un morceau de page.
  `document.querySelector` dans une de tes fonctions, c'est une fonction
  qui ne marche que sur une page — la tienne.
- **`textContent` pour la donnée, `createElement` pour la structure.**
  `innerHTML` avec une variable dedans, c'est une faille. La quête 3 te
  le montre, les suivantes le vérifient.
- **Une classe et un attribut ARIA, ensemble.** Ouvrir le menu, c'est
  `profile-menu-open` **et** `aria-expanded="true"`. Le bloc 1 n'est pas loin.

## Ce qui n'est pas demandé

Un framework. Du CSS. Modifier `index.html`, `app.ts`, `css/`, `data/`.
Faire marcher les liens `/titres/dark` (c'est une maquette : cliquer
sans JS mène à un 404, et c'est le sujet de la quête 7).
