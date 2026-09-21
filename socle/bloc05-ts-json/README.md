# 📦 Le JSON

Jusqu'ici le catalogue vivait dans les tests. Dans la vraie vie il vit
**ailleurs** — une base, une API, un fichier — et il arrive sous forme de
texte. Ce bloc, c'est tout ce qui se passe entre ce texte et ta page :
lire, vérifier, transformer, regrouper, joindre, exporter. Sans jamais
casser l'original. Et avec un compilateur qui, pour une fois, ne peut pas
t'aider à la frontière : les types sont effacés à l'exécution, c'est à
toi de vérifier ce qui entre.

Ouvre `data/catalogue.json`. Douze titres, trois rangées, une affiche
par titre. Ouvre `data/profiles.json`. Trois profils, avec un historique
qui pointe vers le catalogue par `id`. Ouvre `src/types.ts` : c'est la
même chose, écrite en types. C'est ta matière première pour dix quêtes.

Même jeu qu'aux blocs 3 et 4 :

```bash
npm install
npm run play
```

## Les dix quêtes

| #   | Quête                         | Ce que tu apprends                                                                                   |
| --- | ----------------------------- | ---------------------------------------------------------------------------------------------------- |
| 1   | Le format d'échange           | `JSON.parse` / `JSON.stringify`, ce que JSON n'est pas, `try / catch`, `unknown`                     |
| 2   | Sur le disque                 | `readFileSync` / `writeFileSync`, `import.meta.url`, des erreurs qui parlent, `as` (la promesse)     |
| 3   | Naviguer dans la donnée       | lire un chemin, `?.` `??`, un type union (`"movie" \| "series"`)                                     |
| 4   | Le modèle de vue              | transformer la donnée brute en `Card`, un type guard pour filtrer les trous                          |
| 5   | Ranger par étagère            | regrouper par clé, `Record<string, string[]>`                                                        |
| 6   | La jointure                   | joindre deux fichiers par `id`, les orphelins, trier des dates ISO                                   |
| 7   | Ne touche pas à l'original    | immutabilité : spread, `map`/`filter`, `structuredClone`, `Readonly<T>` — les tests gèlent la donnée |
| 8   | Le contrôle qualité           | valider un `unknown` : un tableau d'erreurs, optionnel ≠ invalide                                    |
| 9   | Le deuxième argument          | replacer et reviver ; `Omit` pour dire que les dates sont devenues des `Date`                        |
| 10  | **BOSS** · L'API du catalogue | filtrer → trier → paginer → transformer, comme un vrai endpoint                                      |

Compte trois heures. Le boss importe ton `toCard` de la quête 4.

## Les fichiers

- `data/catalogue.json` — le catalogue. **Ne le modifie pas** : les tests
  connaissent son contenu.
- `data/profiles.json` — trois profils et leur historique.
- `data/broken.json` — du JSON invalide, exprès, pour la quête 2.
- `src/types.ts` — les types du domaine. Fournis, à importer, pas à éditer.
- `src/` — tes fichiers. `quests/` — les tests. `engine/` — le jeu.

Les tests de la quête 2 écrivent dans un dossier temporaire du système,
jamais dans `data/`.

## Les commandes

```bash
npm run play          # le jeu, en continu
npm test              # une passe, sans leçon
npm run check         # typecheck + lint + format:check + test
node play.ts 7        # rejouer la quête 7
node play.ts --all    # tout rejouer, défis compris
npm run reset         # repartir de zéro
```

## Les règles

Celles des blocs 3 et 4. Et une qui devient centrale ici : **une fonction
qui reçoit une donnée ne la modifie pas**, sauf si son nom le dit. Les
paramètres sont `Readonly<Catalogue>` à partir de la quête 7, et les tests
gèlent le catalogue avec `Object.freeze` ; toute écriture dessus lance une
`TypeError`.

## Ce qui n'est pas demandé

Un vrai serveur. Une base de données. Une bibliothèque de validation
(zod, valibot — plus tard, quand tu sauras ce qu'elles t'épargnent).
Modifier les fichiers de `data/`.
