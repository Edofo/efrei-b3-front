import type { QuestContext } from "../engine/core.ts";
import type { Title } from "../src/types.ts";

export const title = "La note du public";
export const file = "src/02-averages.ts";

export const lesson = `
Sur la page d'un titre, on affiche « 4,3 / 5 ». D'où vient ce nombre ?
D'une moyenne, ou mieux, d'une médiane.

## Arrondir à une décimale

\`Math.round\` arrondit à l'entier. Pour une décimale, on décale :

\`\`\`
Math.round(4.26 * 10) / 10     // 4.3
\`\`\`

## La médiane et le piège de sort

La médiane, c'est la valeur du milieu une fois les notes **triées**. Deux
pièges dans cette phrase :

\`\`\`
[10, 9, 1].sort()                   // [1, 10, 9]  — trié comme du TEXTE
[10, 9, 1].sort((a, b) => a - b)    // [1, 9, 10]  — trié comme des nombres
\`\`\`

Sans fonction de comparaison, \`sort\` convertit tout en chaînes. Toujours
lui en donner une pour des nombres.

Et \`sort\` **modifie le tableau** sur lequel on l'appelle. Si la fonction
reçoit les notes de quelqu'un d'autre, elle n'a pas le droit de les
mélanger en douce : on trie une **copie**.

\`\`\`
const sorted = [...ratings].sort((a, b) => a - b);
\`\`\`

## Le milieu

Pour \`n\` éléments triés : si \`n\` est impair, la médiane est l'élément
d'index \`Math.floor(n / 2)\`. Si \`n\` est pair, c'est la moyenne des deux
du milieu, aux index \`n / 2 - 1\` et \`n / 2\`.

## readonly, la promesse qu'on ne peut pas trahir

\`median(ratings: readonly number[])\` : le paramètre est déclaré en lecture
seule. \`ratings.sort()\` ne compile même pas. C'est comme ça qu'une
signature dit à l'appelant « je ne toucherai pas à tes données » — et
que le compilateur t'y tient.
`;

export const mission = `
Dans \`src/02-averages.ts\` :
- \`average(ratings)\` → arrondie à 1 décimale, \`0\` si vide
- \`median(ratings)\` → la médiane, sans modifier le tableau reçu, \`0\` si vide
- \`catalogueAverage(titles)\` → la moyenne des notes des titres **qui en ont une**
`;

interface Module {
  average(ratings: readonly number[]): number;
  median(ratings: readonly number[]): number;
  catalogueAverage(titles: readonly Title[]): number;
  standardDeviation(ratings: readonly number[]): number;
}

const rated = (rating: number | null | undefined): Title => ({
  id: "x",
  title: "X",
  kind: "movie",
  year: 2000,
  genres: [],
  rating,
  minimumAge: 0,
});

export default function ({ test, challenge, expect }: QuestContext, m: Module): void {
  test("average([4, 5, 3.5]) renvoie 4.2", () => {
    expect(m.average([4, 5, 3.5])).toBe(4.2);
    expect(m.average([4.26])).toBe(4.3);
    expect(m.average([1, 2])).toBe(1.5);
  });

  test("average([]) renvoie 0", () => {
    expect(m.average([])).toBe(0);
  });

  test("median([3, 1, 2]) renvoie 2 — impair : la valeur du milieu", () => {
    expect(m.median([3, 1, 2])).toBe(2);
    expect(m.median([5])).toBe(5);
  });

  test("median([4, 1, 3, 2]) renvoie 2.5 — pair : la moyenne des deux du milieu", () => {
    expect(m.median([4, 1, 3, 2])).toBe(2.5);
    expect(m.median([1, 10, 9, 100]), "trié comme du texte, 10 passe avant 9").toBe(9.5);
  });

  test("median ne modifie pas le tableau reçu", () => {
    const ratings = [3, 1, 2];
    m.median(ratings);
    expect(ratings, "le tableau a été trié sur place : copie-le d'abord").toEqual([3, 1, 2]);
  });

  test("median([]) renvoie 0", () => {
    expect(m.median([])).toBe(0);
  });

  test("catalogueAverage ignore les titres sans note", () => {
    expect(m.catalogueAverage([rated(4), rated(null), rated(5), rated(undefined), rated(3)])).toBe(
      4,
    );
    expect(m.catalogueAverage([rated(0), rated(5)]), "0 est une note").toBe(2.5);
  });

  test("catalogueAverage renvoie 0 si aucun titre n'a de note", () => {
    expect(m.catalogueAverage([rated(undefined), rated(null)])).toBe(0);
    expect(m.catalogueAverage([])).toBe(0);
  });

  challenge(
    "standardDeviation([2, 4, 4, 4, 5, 5, 7, 9]) renvoie 2 — écart-type de population, arrondi à 2 décimales",
    () => {
      expect(m.standardDeviation([2, 4, 4, 4, 5, 5, 7, 9])).toBe(2);
      expect(m.standardDeviation([1, 2, 3, 4])).toBe(1.12);
      expect(m.standardDeviation([])).toBe(0);
    },
  );
}
