import type { QuestContext } from "../engine/core.ts";
import type { Movie } from "../src/types.ts";

export const title = "Quand ça casse";
export const file = "src/09-errors.ts";

export const lesson = `
Le catalogue vient d'une API. Parfois un film n'a pas de \`credits\`. Parfois
l'âge saisi est \`-3\`. Parfois la liste de notes est vide. Un programme
sérieux prévoit **l'absence** et **l'erreur**.

## undefined et null

\`undefined\` : « personne n'a rien mis ». \`null\` : « on a mis exprès
rien ». Lire une propriété sur l'un ou l'autre **plante** :

\`\`\`
const movie: Movie = { title: "Dark", year: 2017 };
movie.credits.director   // compilateur : 'movie.credits' is possibly 'undefined'
\`\`\`

En TypeScript cette ligne ne compile même pas : le type dit que \`credits\`
peut manquer, donc le compilateur te demande de t'en occuper. C'est la
différence avec JavaScript, où tu l'apprendrais en production.

## ?. et ??

L'**optional chaining** \`?.\` s'arrête sans planter si ce qu'il y a avant
est \`null\` ou \`undefined\`. Le **nullish coalescing** \`??\` donne une valeur
de repli seulement dans ces deux cas (contrairement à \`||\` qui remplace
aussi \`0\` et \`""\`) :

\`\`\`
movie?.credits?.director ?? "Inconnu"
\`\`\`

## Lever une erreur

Quand une fonction reçoit quelque chose d'impossible, elle **lance** une
erreur plutôt que de renvoyer n'importe quoi. Le programme s'arrête là,
avec un message clair, au lieu de continuer avec une donnée fausse :

\`\`\`
if (!Number.isInteger(age) || age < 0) {
  throw new Error(\`Invalid age: \${age}\`);
}
\`\`\`

Les messages d'erreur sont pour les développeurs : en anglais. Ce que
l'utilisateur lit à l'écran est une autre chaîne, en français, choisie
ailleurs.

## unknown, le type honnête

\`assertAge(age: unknown)\` : la valeur vient d'un formulaire, ça peut être
n'importe quoi. \`unknown\` interdit toute opération tant que tu n'as pas
vérifié ce que c'est (\`typeof age === "number"\`). C'est un **type guard**,
et le compilateur affine le type juste après.

## Attraper une erreur

\`\`\`
try {
  return riskyComputation();
} catch (error) {
  console.error(error);
  return fallbackValue;
}
\`\`\`

Règle : on attrape une erreur seulement si on sait quoi en faire. Sinon on
la laisse remonter.

## Sa propre erreur

\`class MovieNotFoundError extends Error {}\` — puis \`throw new
MovieNotFoundError("…")\`. L'appelant peut alors distinguer *ce* problème
des autres avec \`instanceof\`.
`;

export const mission = `
Dans \`src/09-errors.ts\` :
- \`directorOf(movie)\` → \`movie.credits.director\`, ou \`"Inconnu"\` si quoi que ce soit manque
- \`assertAge(age)\` → renvoie \`age\` s'il est entier entre 0 et 130, sinon lance \`Error("Invalid age: …")\`
- \`averageRating(ratings)\` → la moyenne arrondie à 1 décimale ; lance \`Error("No ratings")\` si le tableau est vide
- \`safeAverageRating(ratings)\` → pareil, mais renvoie \`0\` au lieu de lancer
`;

interface Module {
  directorOf(movie: Movie | null | undefined): string;
  assertAge(age: unknown): number;
  averageRating(ratings: number[]): number;
  safeAverageRating(ratings: number[]): number;
  MovieNotFoundError: new (message: string) => Error;
  findOrThrow(movies: Movie[], title: string): Movie;
}

export default function ({ test, challenge, expect }: QuestContext, m: Module): void {
  test('directorOf({ credits: { director: "Baran bo Odar" } }) renvoie "Baran bo Odar"', () => {
    expect(
      m.directorOf({ title: "Dark", year: 2017, credits: { director: "Baran bo Odar" } }),
    ).toBe("Baran bo Odar");
  });

  test('directorOf(un film sans credits) renvoie "Inconnu" — sans planter', () => {
    expect(m.directorOf({ title: "Dark", year: 2017 })).toBe("Inconnu");
    expect(m.directorOf({ title: "Dark", year: 2017, credits: {} })).toBe("Inconnu");
  });

  test('directorOf(undefined) renvoie "Inconnu"', () => {
    expect(m.directorOf(undefined)).toBe("Inconnu");
    expect(m.directorOf(null)).toBe("Inconnu");
  });

  test("assertAge(16) renvoie 16", () => {
    expect(m.assertAge(16)).toBe(16);
    expect(m.assertAge(0)).toBe(0);
    expect(m.assertAge(130)).toBe(130);
  });

  test('assertAge(-3) lance "Invalid age: -3"', () => {
    expect(() => m.assertAge(-3)).toThrow("Invalid age: -3");
    expect(() => m.assertAge(131)).toThrow("Invalid age");
  });

  test('assertAge refuse 16.5, "16" et undefined', () => {
    expect(() => m.assertAge(16.5)).toThrow("Invalid age");
    expect(() => m.assertAge("16")).toThrow("Invalid age");
    expect(() => m.assertAge(undefined)).toThrow("Invalid age");
  });

  test("averageRating([4, 5, 3.5]) renvoie 4.2", () => {
    expect(m.averageRating([4, 5, 3.5])).toBe(4.2);
    expect(m.averageRating([4])).toBe(4);
    expect(m.averageRating([1, 2])).toBe(1.5);
  });

  test('averageRating([]) lance "No ratings"', () => {
    expect(() => m.averageRating([])).toThrow("No ratings");
  });

  test("safeAverageRating([]) renvoie 0, safeAverageRating([4, 5]) renvoie 4.5", () => {
    expect(m.safeAverageRating([])).toBe(0);
    expect(m.safeAverageRating([4, 5])).toBe(4.5);
  });

  challenge(
    "findOrThrow(movies, title) lance une MovieNotFoundError quand le titre n'existe pas",
    () => {
      const movies: Movie[] = [
        { title: "Dark", year: 2017 },
        { title: "Arcane", year: 2021 },
      ];
      expect(m.findOrThrow(movies, "Arcane")).toEqual({ title: "Arcane", year: 2021 });
      expect(() => m.findOrThrow(movies, "Matrix")).toThrow(m.MovieNotFoundError);
      expect(() => m.findOrThrow(movies, "Matrix")).toThrow('"Matrix" is not in the catalogue');
      let error: unknown;
      try {
        m.findOrThrow(movies, "Matrix");
      } catch (e) {
        error = e;
      }
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).name).toBe("MovieNotFoundError");
    },
  );
}
