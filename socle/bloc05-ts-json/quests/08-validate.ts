import type { QuestContext } from "../engine/core.ts";
import type { ValidationReport } from "../src/types.ts";
import { title as titleById, titles } from "./_data.ts";

export const title = "Le contrôle qualité";
export const file = "src/08-validate.ts";

export const lesson = `
Le JSON était **valide** — \`JSON.parse\` n'a pas bronché. Ça ne veut pas
dire que la donnée est **bonne** : une année \`"2017"\` (chaîne), une note
à 7, un titre sans genres, tout ça est du JSON parfaitement valide, et
tout ça casse la page.

Et le compilateur ne peut pas t'aider : les types sont effacés à
l'exécution. \`as Title\` (quête 2) était une promesse ; c'est ici que tu
la tiens. Entre le fichier et ton code, il faut un **contrôle** : une
fonction qui regarde une valeur \`unknown\` et liste ce qui ne va pas.

## Un tableau d'erreurs, pas un booléen

\`validate(input)\` renvoie \`[]\` si tout va bien, sinon une liste de
messages. On accumule, on ne s'arrête pas à la première : l'utilisateur
veut tout savoir d'un coup.

\`\`\`
const errors: string[] = [];
if (typeof input.title !== "string" || input.title.trim() === "") {
  errors.push("missing title");
}
// …
return errors;
\`\`\`

## Lire un unknown

\`input.title\` ne compile pas sur \`unknown\`. Réduis-le d'abord à « un
objet avec des clés chaînes » :

\`\`\`
const record = input as Record<string, unknown>;    // après typeof input === "object" && input !== null
\`\`\`

Ensuite chaque champ est \`unknown\` à son tour, et tu les vérifies un par un.

## Les vérifications utiles

\`\`\`
typeof x === "string"            // une chaîne (attention : "" en est une)
Number.isInteger(x)              // un entier (pas "2017", pas 2017.5, pas NaN)
typeof x === "number" && !Number.isNaN(x)
Array.isArray(x)                 // un tableau ({} n'en est pas un)
x.every((g) => typeof g === "string")
["movie", "series"].includes(x)  // une valeur parmi une liste
\`\`\`

## Optionnel ≠ invalide

Un titre **sans** note est normal (*Chef's Table*). Un titre avec une
note à 7 ne l'est pas. On vérifie une propriété optionnelle seulement
si elle est présente : \`if (rating !== undefined && rating !== null)\`.
`;

export const mission = `
Dans \`src/08-validate.ts\` :
- \`validate(input)\` → les erreurs, dans cet ordre : \`"missing id"\`, \`"missing title"\`, \`"invalid kind"\` (ni movie ni series), \`"invalid year"\` (pas un entier entre 1895 et 2030), \`"invalid rating"\` (présente mais pas un nombre entre 0 et 5), \`"invalid genres"\` (pas un tableau non vide de chaînes)
- \`validateCatalogue(inputs)\` → \`{ valid: n, errors: { <id ou "#index">: [...] } }\`
`;

interface Module {
  validate(input: unknown): string[];
  validateCatalogue(inputs: unknown[]): ValidationReport;
}

export default function ({ test, challenge, expect }: QuestContext, m: Module): void {
  test("validate(Dark) renvoie [] — et tous les titres du catalogue passent", () => {
    expect(m.validate(titleById("dark"))).toEqual([]);
    for (const t of titles())
      expect(m.validate(t), `le titre ${t.id} devrait être valide`).toEqual([]);
  });

  test("validate({}) liste 5 erreurs, dans l'ordre (la note absente n'en est pas une)", () => {
    expect(m.validate({})).toEqual([
      "missing id",
      "missing title",
      "invalid kind",
      "invalid year",
      "invalid genres",
    ]);
  });

  test("missing title : absent, vide, ou pas une chaîne", () => {
    expect(m.validate({ ...titleById("dark"), title: "" })).toEqual(["missing title"]);
    expect(m.validate({ ...titleById("dark"), title: "   " })).toEqual(["missing title"]);
    expect(m.validate({ ...titleById("dark"), title: 42 })).toEqual(["missing title"]);
  });

  test('invalid year : "2017" (chaîne), 2017.5, 1800, 2100', () => {
    for (const year of ["2017", 2017.5, 1800, 2100, undefined, Number.NaN]) {
      expect(m.validate({ ...titleById("dark"), year }), `year = ${String(year)}`).toEqual([
        "invalid year",
      ]);
    }
    expect(m.validate({ ...titleById("dark"), year: 1895 })).toEqual([]);
    expect(m.validate({ ...titleById("dark"), year: 2030 })).toEqual([]);
  });

  test('invalid rating : 7, -1, "4.5" ; mais undefined, null, 0 et 5 sont acceptés', () => {
    for (const rating of [7, -1, "4.5", Number.NaN]) {
      expect(m.validate({ ...titleById("dark"), rating }), `rating = ${String(rating)}`).toEqual([
        "invalid rating",
      ]);
    }
    for (const rating of [undefined, null, 0, 5, 4.5]) {
      expect(m.validate({ ...titleById("dark"), rating }), `rating = ${String(rating)}`).toEqual(
        [],
      );
    }
  });

  test("invalid genres : absent, vide, pas un tableau, ou contenant autre chose que des chaînes", () => {
    for (const genres of [undefined, [], "drame", [1], ["drame", null]]) {
      expect(
        m.validate({ ...titleById("dark"), genres }),
        `genres = ${JSON.stringify(genres)}`,
      ).toEqual(["invalid genres"]);
    }
  });

  test('invalid kind : "série", "film", absent', () => {
    for (const kind of ["série", "film", undefined]) {
      expect(m.validate({ ...titleById("dark"), kind }), `kind = ${String(kind)}`).toEqual([
        "invalid kind",
      ]);
    }
  });

  test("validate survit à n'importe quoi : null, un nombre, une chaîne", () => {
    expect(m.validate(null)).toEqual([
      "missing id",
      "missing title",
      "invalid kind",
      "invalid year",
      "invalid genres",
    ]);
    expect(m.validate(42).length).toBeGreaterThan(0);
    expect(m.validate("Dark").length).toBeGreaterThan(0);
  });

  test("validateCatalogue(titles) → { valid: 12, errors: {} }", () => {
    expect(m.validateCatalogue(titles())).toEqual({ valid: 12, errors: {} });
  });

  test("validateCatalogue avec un titre cassé : erreurs indexées par id, ou par #index sans id", () => {
    const list: unknown[] = titles();
    (list[3] as { rating: number }).rating = 7;
    list.push({ title: "Sans id", kind: "movie", year: 2020, genres: ["drame"] });
    expect(m.validateCatalogue(list)).toEqual({
      valid: 11,
      errors: { dark: ["invalid rating"], "#12": ["missing id"] },
    });
  });

  challenge(
    'validateCatalogue signale "duplicate id" : [dark, dark] → { valid: 1, errors: { dark: ["duplicate id"] } }',
    () => {
      expect(m.validateCatalogue([titleById("dark"), titleById("dark")])).toEqual({
        valid: 1,
        errors: { dark: ["duplicate id"] },
      });
      expect(m.validateCatalogue([titleById("dark"), { ...titleById("dark"), rating: 9 }])).toEqual(
        { valid: 1, errors: { dark: ["invalid rating", "duplicate id"] } },
      );
    },
  );
}
