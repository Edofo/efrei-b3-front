import type { QuestContext } from "../engine/core.ts";
import type { Title } from "../src/types.ts";
import { catalogue } from "./_catalogue.ts";

export const title = "Les compteurs";
export const file = "src/04-counters.ts";

export const lesson = `
« Quel genre regarde-t-on le plus sur NOLANFLIX ? » Pour répondre, il faut
**compter par catégorie** : un compteur par genre.

## Un objet comme dictionnaire

Un objet dont les clés ne sont pas connues d'avance, c'est un
dictionnaire. On y lit et on y écrit avec les crochets :

\`\`\`
const counts: Record<string, number> = {};
for (const genre of genres) {
  counts[genre] = (counts[genre] ?? 0) + 1;
}
// { drame: 3, thriller: 2 }
\`\`\`

La ligne du milieu est **le** motif de la quête : « prends le compteur
s'il existe, sinon 0, et ajoute 1 ». Sans le \`?? 0\`, la première fois on
ferait \`undefined + 1\`, qui vaut \`NaN\`.

\`Record<string, number>\` est le type d'un tel dictionnaire : des clés
chaînes, des valeurs nombres. Lire une clé peut-être absente donne
\`number\` (pas \`number | undefined\`) — TypeScript te fait confiance ici.
Le \`?? 0\`, c'est ta part du contrat.

## Parcourir un dictionnaire

\`\`\`
Object.keys(counts)      // ["drame", "thriller"]
Object.values(counts)    // [3, 2]
Object.entries(counts)   // [["drame", 3], ["thriller", 2]]
\`\`\`

Avec \`entries\`, on retombe sur un tableau, et tout ce que tu sais faire
avec un tableau (trier, chercher le champion) s'applique.

## Map, le dictionnaire de luxe

\`new Map<string, number>()\` fait pareil avec \`get\`, \`set\`, \`has\`, et
accepte n'importe quoi comme clé (un objet, un nombre qui reste un
nombre). Pour des clés qui sont des textes, l'objet suffit.
`;

export const mission = `
Dans \`src/04-counters.ts\` :
- \`countGenres(titles)\` → \`{ drame: 3, thriller: 2, … }\` à partir de \`title.genres\`
- \`mostFrequentGenre(titles)\` → le genre le plus présent (en cas d'égalité, le premier par ordre alphabétique) ; \`null\` si aucun titre
- \`ratingDistribution(titles)\` → \`{ "1": n, "2": n, "3": n, "4": n, "5": n }\`, chaque note arrondie à l'entier, toutes les clés présentes
`;

interface Module {
  countGenres(titles: readonly Title[]): Record<string, number>;
  mostFrequentGenre(titles: readonly Title[]): string | null;
  ratingDistribution(titles: readonly Title[]): Record<string, number>;
  top(counts: Record<string, number>, n: number): [string, number][];
}

const withGenres = (genres: string[], rating = 4): Title => ({
  id: "x",
  title: "X",
  kind: "series",
  year: 2020,
  genres,
  rating,
  minimumAge: 0,
});

export default function ({ test, challenge, expect }: QuestContext, m: Module): void {
  test("countGenres compte chaque genre de chaque titre", () => {
    const titles = [
      withGenres(["drame", "thriller"]),
      withGenres(["drame"]),
      withGenres(["comédie", "drame"]),
    ];
    expect(m.countGenres(titles)).toEqual({ drame: 3, thriller: 1, comédie: 1 });
  });

  test("countGenres([]) renvoie {}", () => {
    expect(m.countGenres([])).toEqual({});
  });

  test("countGenres sur le catalogue : drame 6, thriller 6, science-fiction 4, action 4", () => {
    const counts = m.countGenres(catalogue());
    expect(counts.drame).toBe(6);
    expect(counts.thriller).toBe(6);
    expect(counts["science-fiction"]).toBe(4);
    expect(counts.action).toBe(4);
    expect(counts.documentaire).toBe(1);
  });

  test('mostFrequentGenre renvoie "drame" pour [drame×2, comédie×1]', () => {
    expect(m.mostFrequentGenre([withGenres(["comédie", "drame"]), withGenres(["drame"])])).toBe(
      "drame",
    );
  });

  test('mostFrequentGenre : égalité drame/thriller sur le catalogue → "drame" (ordre alphabétique)', () => {
    expect(m.mostFrequentGenre(catalogue())).toBe("drame");
    expect(m.mostFrequentGenre([withGenres(["thriller"]), withGenres(["action"])])).toBe("action");
  });

  test("mostFrequentGenre([]) renvoie null", () => {
    expect(m.mostFrequentGenre([])).toBeNull();
  });

  test("ratingDistribution arrondit et remplit les cinq clés", () => {
    const titles = [
      withGenres([], 4.5),
      withGenres([], 4.4),
      withGenres([], 3.9),
      withGenres([], 1),
    ];
    expect(m.ratingDistribution(titles)).toEqual({ 1: 1, 2: 0, 3: 0, 4: 2, 5: 1 });
    expect(m.ratingDistribution([])).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  });

  challenge(
    'top(counts, 2) renvoie [["drame", 6], ["thriller", 6]] — les n plus fréquents, par nombre décroissant puis nom',
    () => {
      expect(m.top({ drame: 6, action: 4, thriller: 6, documentaire: 1 }, 2)).toEqual([
        ["drame", 6],
        ["thriller", 6],
      ]);
      expect(m.top({ drame: 6, action: 4, thriller: 6, documentaire: 1 }, 3)).toEqual([
        ["drame", 6],
        ["thriller", 6],
        ["action", 4],
      ]);
      expect(m.top({}, 3)).toEqual([]);
    },
  );
}
