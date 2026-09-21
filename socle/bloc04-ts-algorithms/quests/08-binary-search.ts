import type { QuestContext } from "../engine/core.ts";

export const title = "Couper en deux";
export const file = "src/08-binary-search.ts";

export const lesson = `
Le catalogue complet fait 100 000 titres, **triés par ordre
alphabétique**. Chercher « Ozark » en lisant depuis le début, c'est
50 000 comparaisons en moyenne. En coupant en deux à chaque fois, c'est
17. C'est la **recherche dichotomique** (binary search).

## Le principe

On regarde l'élément du **milieu**. S'il est trop petit, la cible est
forcément dans la moitié droite ; trop grand, dans la moitié gauche. On
recommence sur la moitié restante jusqu'à tomber dessus ou n'avoir plus
rien à regarder.

\`\`\`
let low = 0;
let high = list.length - 1;
while (low <= high) {
  const middle = Math.floor((low + high) / 2);
  if (list[middle] === target) return middle;
  if (list[middle] < target) low = middle + 1;
  else high = middle - 1;
}
return -1;
\`\`\`

L'invariant à garder en tête : « si la cible est dans la liste, elle est
entre \`low\` et \`high\` inclus ». Chaque tour réduit cet intervalle de
moitié. Quand \`low\` dépasse \`high\`, l'intervalle est vide.

## Combien de lectures ?

Chaque tour lit **un** élément et divise l'intervalle par deux. Pour
1 000 éléments, il faut au plus 10 tours ; pour un million, 20. C'est
\`O(log n)\`, et les tests de cette quête **comptent tes lectures** : une
recherche linéaire déguisée sera refusée.

## Ça ne marche que trié

Sur une liste non triée, la dichotomie renvoie n'importe quoi. Le tri
coûte cher une fois ; ensuite chaque recherche est presque gratuite.

## Le type qui dit « comparable »

\`binarySearch<T extends string | number>\` : le générique est contraint,
parce que \`<\` n'a de sens que sur des chaînes et des nombres. Essaie
\`binarySearch([{}], {})\` et le compilateur refuse — avant que
l'algorithme ait pu renvoyer n'importe quoi.
`;

export const mission = `
Dans \`src/08-binary-search.ts\` (comparaison avec \`<\` et \`>\` ; les noms de test sont en ASCII) :
- \`binarySearch(sorted, target)\` → l'index, ou \`-1\`, en \`O(log n)\` lectures
- \`insertSorted(sorted, value)\` → un **nouveau** tableau, toujours trié, avec la valeur en plus
`;

interface Module {
  binarySearch<T extends string | number>(sorted: readonly T[], target: T): number;
  insertSorted<T extends string | number>(sorted: readonly T[], value: T): T[];
  firstOccurrence<T extends string | number>(sorted: readonly T[], target: T): number;
}

function readCounter<T>(array: T[]): { proxy: T[]; reads: () => number } {
  let reads = 0;
  const proxy = new Proxy(array, {
    get(target, key) {
      if (typeof key === "string" && /^\d+$/.test(key)) reads++;
      return Reflect.get(target, key);
    },
  });
  return { proxy, reads: () => reads };
}

const NAMES = Array.from({ length: 1000 }, (_, i) => `title-${String(i).padStart(4, "0")}`);

export default function ({ test, challenge, expect }: QuestContext, m: Module): void {
  test('binarySearch(["a", "c", "e", "g"], "e") renvoie 2', () => {
    expect(m.binarySearch(["a", "c", "e", "g"], "e")).toBe(2);
    expect(m.binarySearch(["a", "c", "e", "g"], "a")).toBe(0);
    expect(m.binarySearch(["a", "c", "e", "g"], "g")).toBe(3);
  });

  test("binarySearch renvoie -1 pour une valeur absente (avant, entre, après), et sur une liste vide", () => {
    expect(m.binarySearch(["b", "d", "f"], "a")).toBe(-1);
    expect(m.binarySearch(["b", "d", "f"], "c")).toBe(-1);
    expect(m.binarySearch(["b", "d", "f"], "z")).toBe(-1);
    expect(m.binarySearch([], "a")).toBe(-1);
  });

  test("binarySearch marche avec des nombres et une liste d'un seul élément", () => {
    expect(m.binarySearch([1, 3, 5, 7, 9, 11], 7)).toBe(3);
    expect(m.binarySearch([5], 5)).toBe(0);
    expect(m.binarySearch([5], 4)).toBe(-1);
  });

  test("binarySearch trouve chacun des 1 000 noms", () => {
    for (const i of [0, 1, 499, 500, 998, 999]) {
      expect(m.binarySearch(NAMES, NAMES[i])).toBe(i);
    }
    expect(m.binarySearch(NAMES, "title-1000")).toBe(-1);
  });

  test("binarySearch lit au plus 12 éléments sur 1 000 (O(log n), pas une recherche linéaire)", () => {
    for (const target of ["title-0000", "title-0999", "title-0731", "zzz"]) {
      const { proxy, reads } = readCounter([...NAMES]);
      m.binarySearch(proxy, target);
      expect(reads(), `pour ${target}, trop de lectures`).toBeLessThanOrEqual(12);
    }
  });

  test('insertSorted(["a", "c", "e"], "b") renvoie ["a", "b", "c", "e"]', () => {
    expect(m.insertSorted(["a", "c", "e"], "b")).toEqual(["a", "b", "c", "e"]);
    expect(m.insertSorted(["a", "c", "e"], "z")).toEqual(["a", "c", "e", "z"]);
    expect(m.insertSorted(["a", "c", "e"], "0")).toEqual(["0", "a", "c", "e"]);
    expect(m.insertSorted([], "a")).toEqual(["a"]);
  });

  test("insertSorted ne modifie pas la liste reçue", () => {
    const list = ["a", "c"];
    m.insertSorted(list, "b");
    expect(list).toEqual(["a", "c"]);
  });

  challenge(
    "firstOccurrence([1, 2, 2, 2, 3], 2) renvoie 1 — l'index de la PREMIÈRE, toujours en O(log n)",
    () => {
      expect(m.firstOccurrence([1, 2, 2, 2, 3], 2)).toBe(1);
      expect(m.firstOccurrence([2, 2, 2], 2)).toBe(0);
      expect(m.firstOccurrence([1, 3], 2)).toBe(-1);
      const repeated = Array.from({ length: 1000 }, (_, i) =>
        i < 300 ? "a" : i < 800 ? "b" : "c",
      );
      const { proxy, reads } = readCounter(repeated);
      expect(m.firstOccurrence(proxy, "b")).toBe(300);
      expect(reads(), "trop de lectures").toBeLessThanOrEqual(13);
    },
  );
}
