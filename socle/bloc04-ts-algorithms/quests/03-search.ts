import type { QuestContext } from "../engine/core.ts";
import type { Title } from "../src/types.ts";

export const title = "La barre de recherche";
export const file = "src/03-search.ts";

export const lesson = `
On tape « dark » dans la barre du haut, et la page doit trouver *Dark*.
Chercher dans une liste, c'est la parcourir jusqu'à tomber dessus.

## La recherche linéaire

\`indexOf\` et \`includes\` font ça très bien. Tu vas les réécrire une fois,
parce que le motif est partout :

\`\`\`
for (let i = 0; i < list.length; i++) {
  if (list[i] === value) return i;    // trouvé : on sort tout de suite
}
return -1;                            // la boucle a fini : pas trouvé
\`\`\`

Note le \`return\` **dans** la boucle : dès qu'on a trouvé, inutile de
continuer. Et le \`-1\` après la boucle : on n'y arrive que si rien n'a
matché.

## Les génériques, pour de vrai

\`positionOf<T>(list: readonly T[], value: T)\` : ça marche pour des
chaînes, des nombres, n'importe quoi — et le compilateur refuse
\`positionOf([1, 2], "1")\` parce que \`"1"\` n'est pas un \`number\`. Le test
qui vérifie la comparaison stricte force le type exprès ; ton code doit
quand même comparer avec \`===\`.

## Comparer des textes « à peu près »

« DARK », « dark », « Dark » désignent le même titre. On ne compare jamais
deux textes bruts : on les **normalise** d'abord, tous les deux de la
même façon, puis on compare les versions normalisées.

\`\`\`
const normalize = (text: string): string => text.toLowerCase();
normalize(title.title).includes(normalize(query))
\`\`\`

Écris \`normalize\` comme une fonction à part : tu l'enrichiras (accents,
espaces) sans toucher au reste.
`;

export const mission = `
Dans \`src/03-search.ts\` :
- \`positionOf(list, value)\` → l'index de la première occurrence, ou \`-1\` — sans \`indexOf\`, \`includes\`, \`find\`, \`findIndex\`
- \`count(list, value)\` → le nombre d'occurrences
- \`searchTitles(titles, query)\` → les titres dont le nom contient la requête, sans tenir compte de la casse ; requête vide → tous
`;

interface Module {
  positionOf<T>(list: readonly T[], value: T): number;
  count<T>(list: readonly T[], value: T): number;
  searchTitles(titles: readonly Title[], query: string): Title[];
}

const named = (title: string): Title => ({
  id: title,
  title,
  kind: "series",
  year: 2020,
  genres: [],
  minimumAge: 0,
});

export default function ({ test, challenge, expect }: QuestContext, m: Module): void {
  const titles = (): Title[] =>
    ["Dark", "Élite", "Elite Squad", "Amélie", "La Casa de Papel"].map(named);

  test('positionOf(["a", "b", "c"], "b") renvoie 1', () => {
    expect(m.positionOf(["a", "b", "c"], "b")).toBe(1);
    expect(m.positionOf([5, 3, 8], 5)).toBe(0);
  });

  test("positionOf renvoie -1 quand la valeur est absente, et le PREMIER index quand elle est répétée", () => {
    expect(m.positionOf(["a", "b"], "z")).toBe(-1);
    expect(m.positionOf([], "a")).toBe(-1);
    expect(m.positionOf([7, 1, 7], 7)).toBe(0);
  });

  test('positionOf compare strictement : positionOf([1, 2], "1") renvoie -1', () => {
    expect(m.positionOf<unknown>([1, 2], "1")).toBe(-1);
  });

  test("count([1, 7, 7, 2, 7], 7) renvoie 3", () => {
    expect(m.count([1, 7, 7, 2, 7], 7)).toBe(3);
    expect(m.count(["a"], "b")).toBe(0);
    expect(m.count([], 1)).toBe(0);
  });

  test('searchTitles(titles, "dark") trouve Dark, quelle que soit la casse', () => {
    expect(m.searchTitles(titles(), "dark").map((t) => t.title)).toEqual(["Dark"]);
    expect(m.searchTitles(titles(), "DARK").map((t) => t.title)).toEqual(["Dark"]);
  });

  test('searchTitles(titles, "casa") trouve au milieu du nom ; "xyz" ne trouve rien', () => {
    expect(m.searchTitles(titles(), "casa").map((t) => t.title)).toEqual(["La Casa de Papel"]);
    expect(m.searchTitles(titles(), "xyz")).toEqual([]);
  });

  test('searchTitles(titles, "") renvoie tous les titres', () => {
    expect(m.searchTitles(titles(), "")).toHaveLength(5);
  });

  test("positionOf et count n'utilisent ni indexOf, ni includes, ni find/findIndex", () => {
    const source = [m.positionOf, m.count].map((fn) => fn.toString()).join("\n");
    expect(source).not.toMatch(/indexOf|includes|findIndex|\.find\(|lastIndexOf/);
  });

  challenge(
    'searchTitles ignore les accents : "elite" trouve Élite et Elite Squad, "AMELIE" trouve Amélie',
    () => {
      expect(m.searchTitles(titles(), "elite").map((t) => t.title)).toEqual([
        "Élite",
        "Elite Squad",
      ]);
      expect(m.searchTitles(titles(), "AMELIE").map((t) => t.title)).toEqual(["Amélie"]);
      expect(m.searchTitles(titles(), "élite").map((t) => t.title)).toEqual([
        "Élite",
        "Elite Squad",
      ]);
    },
  );
}
