import type { QuestContext } from "../engine/core.ts";
import type { Movie } from "../src/types.ts";

export const title = "La chaîne de montage";
export const file = "src/07-array-methods.ts";

export const lesson = `
Le catalogue est un tableau d'objets. Pour en tirer « les titres », « ceux
qui sont bien notés », « la durée totale », tu pourrais écrire une boucle
à chaque fois. Les tableaux ont mieux : des méthodes qui prennent une
**fonction** en paramètre.

## Les fonctions fléchées

Une façon courte d'écrire une fonction, faite pour être passée à une autre :

\`\`\`
const double = (n: number): number => n * 2;    // return implicite
const name = (movie: Movie): string => movie.title;
const long = (movie: Movie): number => {        // plusieurs lignes : accolades + return
  const total = (movie.runtime ?? 0) * 2;
  return total;
};
\`\`\`

Dans \`movies.map((movie) => …)\`, tu peux omettre le type de \`movie\` : le
compilateur le déduit du tableau. Type ce qui franchit une frontière,
laisse le compilateur remplir le reste.

## Les cinq à connaître

\`\`\`
movies.map((m) => m.title)                 // un nouveau tableau, transformé élément par élément
movies.filter((m) => (m.rating ?? 0) >= 4) // un nouveau tableau, avec ceux qui passent le test
movies.find((m) => m.title === "Dark")     // le PREMIER qui passe, ou undefined
movies.some((m) => m.isNew)                // true si AU MOINS UN passe
movies.every((m) => (m.minimumAge ?? 0) <= 10) // true si TOUS passent
\`\`\`

Et le couteau suisse, \`reduce\` : il replie le tableau sur une seule
valeur. Le premier paramètre est l'accumulateur, le second l'élément, et
la valeur de départ est le deuxième argument de \`reduce\` :

\`\`\`
movies.reduce((total, m) => total + (m.runtime ?? 0), 0)
\`\`\`

## Enchaîner

Comme \`map\` et \`filter\` renvoient un tableau, on les enchaîne :

\`\`\`
movies.filter((m) => (m.rating ?? 0) >= 4).map((m) => m.title).join(" · ")
\`\`\`

Aucune de ces méthodes ne modifie le tableau d'origine.

## Les champs optionnels, encore

\`rating\` peut manquer (\`number | null | undefined\`). \`m.rating >= 4\` ne
compile pas : le compilateur refuse de comparer \`undefined\` à un nombre.
\`m.rating ?? 0\` remplace une note absente par 0 — et là, ça compile.
C'est le compilateur qui fait son travail : te rappeler que la donnée
n'est pas toujours là.

## Paramètre par défaut

\`function wellRated(movies: Movie[], minimum = 4)\` : si on ne passe pas
\`minimum\`, il vaut 4, et son type est déduit : \`number\`.
`;

export const mission = `
Dans \`src/07-array-methods.ts\` (sans boucle \`for\` — c'est le but de la quête) :
- \`titles(movies)\` → le tableau des titres
- \`wellRated(movies, minimum = 4)\` → les films dont la note ≥ minimum
- \`totalRuntime(movies)\` → la somme des \`runtime\` (0 si absent)
- \`findByTitle(movies, title)\` → le film, ou \`undefined\`
- \`allKidFriendly(movies)\` → \`true\` si tous les \`minimumAge\` sont ≤ 10
- \`anyNew(movies)\` → \`true\` si un film au moins a \`isNew: true\`
`;

const CATALOGUE: readonly Movie[] = [
  { title: "Dark", year: 2017, rating: 4.5, runtime: 55, minimumAge: 16, isNew: false },
  { title: "Arcane", year: 2021, rating: 4.8, runtime: 42, minimumAge: 12, isNew: true },
  { title: "Amélie", year: 2001, rating: 4.0, runtime: 122, minimumAge: 0, isNew: false },
  { title: "Narcos", year: 2015, rating: 3.9, runtime: 50, minimumAge: 16, isNew: false },
  { title: "Chef's Table", year: 2015, rating: 3.2, runtime: 48, minimumAge: 0, isNew: false },
];

interface Module {
  titles(movies: Movie[]): string[];
  wellRated(movies: Movie[], minimum?: number): Movie[];
  totalRuntime(movies: Movie[]): number;
  findByTitle(movies: Movie[], title: string): Movie | undefined;
  allKidFriendly(movies: Movie[]): boolean;
  anyNew(movies: Movie[]): boolean;
  marquee(movies: Movie[]): string;
}

export default function ({ test, challenge, expect }: QuestContext, m: Module): void {
  const movies = (): Movie[] => CATALOGUE.map((movie) => ({ ...movie }));

  test('titles(movies) renvoie ["Dark", "Arcane", "Amélie", "Narcos", "Chef\'s Table"]', () => {
    expect(m.titles(movies())).toEqual(["Dark", "Arcane", "Amélie", "Narcos", "Chef's Table"]);
    expect(m.titles([])).toEqual([]);
  });

  test("wellRated(movies) garde ceux notés 4 ou plus", () => {
    expect(m.wellRated(movies()).map((movie) => movie.title)).toEqual(["Dark", "Arcane", "Amélie"]);
  });

  test("wellRated(movies, 4.5) accepte un seuil", () => {
    expect(m.wellRated(movies(), 4.5).map((movie) => movie.title)).toEqual(["Dark", "Arcane"]);
    expect(m.wellRated(movies(), 5)).toEqual([]);
  });

  test("totalRuntime(movies) renvoie 317", () => {
    expect(m.totalRuntime(movies())).toBe(317);
    expect(m.totalRuntime([])).toBe(0);
    expect(m.totalRuntime([{ title: "X", year: 2000 }]), "une durée absente compte pour 0").toBe(0);
  });

  test('findByTitle(movies, "Amélie") renvoie le film, findByTitle(movies, "Matrix") renvoie undefined', () => {
    expect(m.findByTitle(movies(), "Amélie")).toEqual(CATALOGUE[2]);
    expect(m.findByTitle(movies(), "Matrix")).toBeUndefined();
  });

  test("allKidFriendly et anyNew", () => {
    expect(m.allKidFriendly(movies())).toBe(false);
    expect(m.allKidFriendly(movies().filter((movie) => movie.minimumAge === 0))).toBe(true);
    expect(m.anyNew(movies())).toBe(true);
    expect(m.anyNew(movies().filter((movie) => !movie.isNew))).toBe(false);
  });

  test("aucune boucle for/while : cette quête se joue avec map, filter, reduce…", () => {
    const source = [
      m.titles,
      m.wellRated,
      m.totalRuntime,
      m.findByTitle,
      m.allKidFriendly,
      m.anyNew,
    ]
      .map((fn) => fn.toString())
      .join("\n");
    expect(source, "une boucle for ou while traîne dans le fichier").not.toMatch(
      /\b(for|while)\s*\(/,
    );
  });

  challenge(
    'marquee(movies) renvoie "DARK · ARCANE · AMÉLIE" — les bien notés, en capitales, séparés par " · "',
    () => {
      expect(m.marquee(movies())).toBe("DARK · ARCANE · AMÉLIE");
      expect(m.marquee([])).toBe("");
    },
  );
}
