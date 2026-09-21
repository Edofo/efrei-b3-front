import type { QuestContext } from "../engine/core.ts";
import type { Title } from "../src/types.ts";
import { catalogue } from "./_catalogue.ts";

export const title = "Le classement";
export const file = "src/06-sorting.ts";

export const lesson = `
« Populaires sur NOLANFLIX » : les titres du catalogue, du mieux noté au
moins bien noté. À égalité, par ordre alphabétique. C'est un **tri à deux
critères**.

## Le contrat du comparateur

\`sort\` appelle ta fonction avec deux éléments et attend un nombre :

- **négatif** : \`a\` passe avant \`b\`
- **positif** : \`b\` passe avant \`a\`
- **zéro** : égaux, on ne les bouge pas

\`\`\`
titles.sort((a, b) => a.year - b.year)   // croissant
titles.sort((a, b) => b.year - a.year)   // décroissant : on inverse
\`\`\`

## Deux critères

Si le premier critère dit « égaux » (zéro), on départage avec le second :

\`\`\`
(a, b) => {
  const byRating = (b.rating ?? 0) - (a.rating ?? 0);
  if (byRating !== 0) return byRating;
  return a.title.localeCompare(b.title);
}
\`\`\`

## Trier des textes : localeCompare

\`"Élite" < "Dark"\` compare des codes de caractères : « É » (U+00C9)
vient *après* « Z ». Avec \`a.localeCompare(b)\` on trie comme un
dictionnaire : Amélie, Dark, Élite, Ozark. Toujours \`localeCompare\`
pour du texte.

## Ne pas trier les données des autres

\`sort\` trie **sur place**. Une fonction qui reçoit \`titles\` et le trie
modifie le catalogue de l'appelant sans prévenir. On trie une copie :
\`[...titles].sort(…)\`, ou \`titles.toSorted(…)\` (Node ≥ 20, navigateurs
récents). Le paramètre est \`readonly Title[]\` : le compilateur ne te
laissera même pas appeler \`.sort\` dessus.
`;

export const mission = `
Dans \`src/06-sorting.ts\`, sans jamais modifier le tableau reçu :
- \`sortByRating(titles)\` → note décroissante, puis titre alphabétique
- \`sortByTitle(titles)\` → alphabétique, accents compris
- \`topTitles(titles, n)\` → les \`n\` premiers noms (chaînes) du classement par note
`;

interface Module {
  sortByRating(titles: readonly Title[]): Title[];
  sortByTitle(titles: readonly Title[]): Title[];
  topTitles(titles: readonly Title[], n: number): string[];
  sortBy<T>(items: readonly T[], key: keyof T, order?: "asc" | "desc"): T[];
}

const rated = (title: string, rating: number): Title => ({
  id: title,
  title,
  kind: "series",
  year: 2020,
  genres: [],
  rating,
  minimumAge: 0,
});
const named = (title: string): Title => ({
  id: title,
  title,
  kind: "series",
  year: 2020,
  genres: [],
  minimumAge: 0,
});

export default function ({ test, challenge, expect }: QuestContext, m: Module): void {
  test("sortByRating classe par note décroissante", () => {
    const titles = [rated("A", 3), rated("B", 5), rated("C", 4)];
    expect(m.sortByRating(titles).map((t) => t.title)).toEqual(["B", "C", "A"]);
  });

  test("sortByRating : à note égale, l'ordre alphabétique (Narcos avant Ozark)", () => {
    const names = m.sortByRating(catalogue()).map((t) => t.title);
    expect(names.slice(0, 5)).toEqual([
      "Arcane",
      "The Matrix",
      "Dark",
      "Stranger Things",
      "Narcos",
    ]);
    expect(names[5]).toBe("Ozark");
  });

  test("sortByRating ne modifie pas le tableau reçu", () => {
    const titles = catalogue();
    const before = titles.map((t) => t.title);
    m.sortByRating(titles);
    expect(
      titles.map((t) => t.title),
      "le catalogue a été trié sur place",
    ).toEqual(before);
  });

  test("sortByTitle : Amélie, Dark, Élite, Ozark — pas Élite à la fin", () => {
    const titles = ["Ozark", "Élite", "Dark", "Amélie"].map(named);
    expect(m.sortByTitle(titles).map((t) => t.title)).toEqual(["Amélie", "Dark", "Élite", "Ozark"]);
  });

  test("sortByTitle ne modifie pas le tableau reçu", () => {
    const titles = ["B", "A"].map(named);
    m.sortByTitle(titles);
    expect(titles.map((t) => t.title)).toEqual(["B", "A"]);
  });

  test('topTitles(catalogue, 3) renvoie ["Arcane", "The Matrix", "Dark"]', () => {
    expect(m.topTitles(catalogue(), 3)).toEqual(["Arcane", "The Matrix", "Dark"]);
    expect(m.topTitles(catalogue(), 0)).toEqual([]);
    expect(m.topTitles([rated("Seul", 1)], 5)).toEqual(["Seul"]);
  });

  challenge(
    'sortBy(items, "year") et sortBy(items, "title", "desc") : un tri générique, nombres ou textes',
    () => {
      const items = [
        { title: "Ozark", year: 2017 },
        { title: "Élite", year: 2018 },
        { title: "Amélie", year: 2001 },
      ];
      expect(m.sortBy(items, "year").map((t) => t.title)).toEqual(["Amélie", "Ozark", "Élite"]);
      expect(m.sortBy(items, "year", "desc").map((t) => t.title)).toEqual([
        "Élite",
        "Ozark",
        "Amélie",
      ]);
      expect(m.sortBy(items, "title").map((t) => t.title)).toEqual(["Amélie", "Élite", "Ozark"]);
      expect(m.sortBy(items, "title", "desc").map((t) => t.title)).toEqual([
        "Ozark",
        "Élite",
        "Amélie",
      ]);
      expect(
        items.map((t) => t.title),
        "le tableau reçu a été modifié",
      ).toEqual(["Ozark", "Élite", "Amélie"]);
    },
  );
}
