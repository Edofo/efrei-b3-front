# 🧠 Mini algos

Le moteur de recommandation de NOLANFLIX est tombé en panne, et la
personne qui l'avait écrit est partie sans laisser une ligne de
documentation. Tu vas le réécrire, brique par brique : trouver le
meilleur, compter, chercher, trier, couper en deux, parcourir un arbre.
Puis assembler.

Même jeu qu'au bloc 3 : dix quêtes verrouillées, des tests rouges à
passer au vert, une vérification des types à chaque quête, de l'XP, des
défis ⭐. Si tu n'as pas fait le bloc 3, lis son README d'abord : tout y
est expliqué.

```bash
npm install
npm run play
```

## Ce qui change

Ce bloc **interdit** des choses, une quête à la fois : `Math.max`,
`indexOf`, `includes`, `sort`. Pas parce qu'elles sont mauvaises — parce
qu'écrire une fois ce qu'elles font est le seul moyen de savoir ce
qu'elles coûtent. La quête suivante te les rend.

Les tests de ce bloc **comptent tes lectures** (quête 8), **vérifient que
tu ne modifies pas ce qu'on te donne** (quêtes 2, 6, 10), et **lisent ton
code source** pour repérer un `.sort(` là où il est interdit. Ce n'est
pas de la surveillance, c'est la définition de l'exercice.

Et TypeScript va un cran plus loin : les paramètres sont `readonly` quand
tu ne dois pas y toucher (`sorted: readonly T[]` — `.sort()` ne compile
même pas), et les génériques sont contraints quand l'algorithme l'exige
(`T extends string | number`, parce que `<` n'a de sens que là).

## Les dix quêtes

| #   | Quête                                  | Ce que tu apprends                                                                                       |
| --- | -------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 1   | Le champion                            | le motif « meilleur vu jusqu'ici », le point de départ, la liste vide, O(n)                              |
| 2   | La note du public                      | moyenne, médiane, `sort` sur une **copie** avec comparateur numérique, `readonly`                        |
| 3   | La barre de recherche                  | recherche linéaire, `return` dans la boucle, normaliser avant de comparer, génériques                    |
| 4   | Les compteurs                          | l'objet-dictionnaire, `(x[k] ?? 0) + 1`, `Record<string, number>`, `Object.entries`                      |
| 5   | Les doublons                           | `Set<T>`, `Map`, pourquoi `includes` dans une boucle est quadratique                                     |
| 6   | Le classement                          | le contrat du comparateur, deux critères, `localeCompare`, immutabilité                                  |
| 7   | Le marathon                            | série consécutive, fenêtre glissante, fusion de deux listes triées                                       |
| 8   | Couper en deux                         | recherche dichotomique, l'invariant, O(log n) — les lectures sont comptées, `T extends string \| number` |
| 9   | L'arbre des univers                    | récursion : cas de base, appel récursif, un type récursif                                                |
| 10  | **BOSS** · Le moteur de recommandation | filtrer → scorer → trier → couper, rien de modifié, des constantes nommées                               |

Compte trois heures. Le boss importe ton `intersection` de la quête 5.

## Les commandes

```bash
npm run play          # le jeu, en continu
npm test              # une passe, sans leçon
npm run check         # typecheck + lint + format:check + test
node play.ts 8        # rejouer la quête 8
node play.ts --all    # tout rejouer, défis compris
npm run reset         # repartir de zéro
```

## Les règles

Les mêmes qu'au bloc 3 : tu écris dans `src/` et nulle part ailleurs ;
TypeScript strict sans échappatoire ; pas de bibliothèque ; l'IA est
autorisée et défendue. Une de plus : **quand un test dit « sans `sort` »,
c'est sans `sort`.** Le contourner (`toSorted`, une copie triée ailleurs)
ne trompe que toi.

## Ce qui n'est pas demandé

La performance au dixième de milliseconde. Des algorithmes qu'on ne t'a
pas demandés (pas de tri fusion complet, pas de tas). Du code « malin » :
un `for` lisible vaut mieux qu'un `reduce` à trois niveaux.
