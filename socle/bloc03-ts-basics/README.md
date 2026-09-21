# 🎮 TypeScript, les bases

Le site est là. Tu l'as écrit (blocs 1 et 2) : il est beau, il est
accessible, et **il ne fait rien**. Pas de recherche, pas de notes, des
cartes recopiées à la main. NOLANFLIX vient de t'embaucher comme
stagiaire pour y remédier.

Ce bloc est un jeu. Dix quêtes, verrouillées les unes derrière les
autres. Chaque quête te donne une leçon, une mission, et une batterie de
tests **rouges**. Tu écris du code jusqu'à ce qu'ils passent au **vert** —
et jusqu'à ce que le compilateur soit d'accord. Tu gagnes de l'XP, tu
montes en grade. Le corrigé a été joué contre exactement les mêmes tests,
et il passe le même `npm run check` que toi.

## Lancer le jeu

Node ≥ 22.18 (`node --version`) — il exécute le TypeScript nativement,
sans étape de build. Puis, dans ce dossier :

```bash
npm install     # une fois : TypeScript, ESLint, Prettier
npm run play    # le jeu, rejoué à chaque fichier enregistré
```

Laisse le jeu tourner dans un onglet, ton éditeur dans l'autre.

## La boucle

C'est du **TDD** (test-driven development), et c'est la seule façon de
travailler dans ce bloc :

1. **Rouge.** Lis la leçon, lis le premier test qui échoue. Il te dit
   exactement ce qu'il attend et ce qu'il a reçu.
2. **Vert.** Ouvre le fichier indiqué dans `src/`, écris le minimum pour
   faire passer ce test. Enregistre. Regarde le suivant.
3. **Refactor.** Quand tout est vert, relis ton code. Nettoie. Les tests
   te disent si tu as cassé quelque chose.

Une quête est terminée quand ses tests obligatoires sont verts **et** que
`tsc` n'a aucune erreur dans ton fichier — le jeu lance la vérification
des types pour toi (section `🔎 Types`). Les **défis ⭐** sont des bonus,
25 XP chacun, et ne bloquent jamais la quête suivante.

Les tests sont dans `quests/`. **Lis-les** : ils sont la spécification,
plus précise que n'importe quelle consigne. L'`interface Module` en haut
de chacun est le contrat que ton fichier doit honorer.

## Le code parle anglais, le produit parle français

Noms de fonctions, variables, types, commentaires, messages de commit :
en anglais, comme dans n'importe quelle équipe. Ce que l'utilisateur lit
à l'écran — « Bienvenue sur NOLANFLIX », « Coup de cœur », les genres du
catalogue — reste en français, parce que le produit est français. Tenir
les deux séparés est une compétence quotidienne dans une boîte française ;
ce bloc l'entraîne dès la première quête.

## Les dix quêtes

| #   | Quête                        | Ce que tu apprends                                                                                |
| --- | ---------------------------- | ------------------------------------------------------------------------------------------------- |
| 1   | Le premier mot               | fonctions, `return`, types des paramètres et du retour, template literals, `export`               |
| 2   | Le compteur de temps         | nombres, `%`, `Math.floor`, `Math.round`, `+=`                                                    |
| 3   | Tout public ?                | `if / else if / else`, `===`, `&&` `\|\|` `!`, truthy / falsy, propriétés optionnelles            |
| 4   | Encore, encore, encore       | `for`, `for…of`, `while`, l'accumulateur, `let` vs `const`                                        |
| 5   | Ma liste                     | tableaux, `string[]`, `push`, `includes`, `indexOf`, copier vs modifier, un premier `<T>`         |
| 6   | La fiche du film             | objets, interfaces, `.` et `[]`, `Object.keys`, la référence partagée                             |
| 7   | La chaîne de montage         | fonctions fléchées, `map` `filter` `reduce` `find` `some` `every`, `??` sur les champs optionnels |
| 8   | L'atelier des chaînes        | `slice` `split` `join` `trim` `replace`, regex, `normalize`                                       |
| 9   | Quand ça casse               | `undefined` / `null`, `?.` `??`, `throw`, `try / catch`, `unknown`, une `Error` à soi             |
| 10  | **BOSS** · La fiche complète | `import` de tes propres modules, assembler                                                        |

Compte trois à quatre heures. Le boss réutilise tes quêtes 2 et 4 :
casse-les en refactorant et elles repassent au rouge — c'est le but.

## Les commandes

```bash
npm run play          # le jeu, en continu
npm test              # une passe sur toutes les quêtes déverrouillées, sans leçon
npm run typecheck     # tsc --noEmit, tout le projet
npm run lint          # ESLint
npm run format        # Prettier, réécrit les fichiers
npm run check         # typecheck + lint + format:check + test — ce qu'une CI ferait
npm run reset         # repartir de zéro

node play.ts 4        # rejouer la quête 4 (si déverrouillée)
node play.ts --all    # rejouer toutes les quêtes, défis compris
node play.ts --no-lesson
```

Ta progression est dans `.progress.json`. Ce fichier est à toi ; il n'est
pas un livrable. `npm run check` vert, si.

## Les rangs

| XP   | Rang                                          |
| ---- | --------------------------------------------- |
| 0    | 🐣 Intern                                     |
| 200  | 🌱 Junior                                     |
| 450  | ⚡ Mid-level                                  |
| 700  | 🔥 Senior                                     |
| 950  | 🚀 Lead                                       |
| 1200 | 👑 Legend — toutes les quêtes, tous les défis |

## Les règles

- **Tu écris dans `src/`, et seulement là.** `quests/`, `engine/`, les
  fichiers de config sont le jeu ; les modifier pour passer au vert, c'est
  tricher contre toi-même, et ça se voit à la défense orale en une question.
- **TypeScript strict, sans échappatoire.** Pas de `any`, pas de
  `as unknown as`, pas de `!`, pas de `// @ts-ignore`. Si le compilateur
  râle, il a une raison ; trouve-la.
- **Pas de bibliothèque.** Que du TypeScript, sur Node 22.
- **L'IA est autorisée, et défendue.** Tu peux demander à ChatGPT. Tu
  devras expliquer chaque ligne, à l'oral, sans notes. « Pourquoi
  `Math.round(x * 10) / 10` et pas `x.toFixed(1)` ? » Une réponse copiée
  s'entend au premier mot.
- **Un test n'est pas une énigme.** Si tu ne comprends pas ce qu'un test
  attend, ouvre `quests/` et lis-le. Si tu ne comprends toujours pas,
  demande — c'est le test qui est mal écrit, pas toi.

## Ce qui n'est pas demandé

Un site. Une interface. Du CSS. Modifier `play.ts`, `engine/` ou
`quests/`. Faire tous les défis (mais Legend, ça se mérite).
