import type { QuestContext } from "../engine/core.ts";

export const title = "Le format d'échange";
export const file = "src/01-parse-stringify.ts";

export const lesson = `
Le catalogue de NOLANFLIX vit dans une base de données, à des kilomètres
du navigateur. Entre les deux, tout voyage sous forme de **texte**. Ce
texte a un format : **JSON** (JavaScript Object Notation).

## JSON n'est pas JavaScript

Ça ressemble à un objet JS, mais c'est un texte avec des règles strictes :

\`\`\`
{ "title": "Dark", "year": 2017, "genres": ["drame"], "rating": null }
\`\`\`

- les clés sont **toujours entre guillemets doubles**
- pas de guillemets simples, pas de virgule finale, pas de commentaires
- valeurs possibles : chaîne, nombre, \`true\`/\`false\`, \`null\`, tableau, objet
- **pas** de \`undefined\`, pas de fonction, pas de \`Date\` (elle devient une chaîne)

## Les deux fonctions

\`\`\`
JSON.parse('{"a":1}')                 // { a: 1 }        texte → valeur JS
JSON.stringify({ a: 1 })              // '{"a":1}'       valeur JS → texte
JSON.stringify({ a: 1 }, null, 2)     // idem, indenté de 2 espaces, lisible
\`\`\`

\`stringify\` **ignore** silencieusement les propriétés \`undefined\` et les
fonctions. \`parse\` **lance** une \`SyntaxError\` dès que le texte n'est pas
du JSON valide — et un texte qui vient du réseau n'est jamais garanti
valide.

\`\`\`
try {
  return JSON.parse(text);
} catch {
  return null;
}
\`\`\`

## unknown, encore

\`JSON.parse\` renvoie \`any\` dans la bibliothèque standard : « fais-moi
confiance ». Non. Ton \`parse\` renvoie \`unknown\` : l'appelant doit
vérifier ce qu'il a reçu avant de s'en servir. C'est le type honnête pour
une donnée que tu n'as pas produite, et la quête 8 montrera à quoi
ressemble une vérification.
`;

export const mission = `
Dans \`src/01-parse-stringify.ts\` :
- \`parse(text)\` → la valeur JavaScript
- \`stringify(value)\` → le texte JSON indenté de 2 espaces
- \`safeParse(text)\` → la valeur, ou \`null\` si le texte est invalide
- \`isValidJson(text)\` → \`true\` / \`false\`
`;

interface Module {
  parse(text: string): unknown;
  stringify(value: unknown): string;
  safeParse(text: string): unknown;
  isValidJson(text: string): boolean;
  stringifyCompact(value: unknown): string;
}

export default function ({ test, challenge, expect }: QuestContext, m: Module): void {
  test('parse(\'{"title":"Dark","year":2017}\') renvoie l\'objet', () => {
    expect(m.parse('{"title":"Dark","year":2017}')).toEqual({ title: "Dark", year: 2017 });
    expect(m.parse("[1, 2, 3]")).toEqual([1, 2, 3]);
    expect(m.parse('"texte"')).toBe("texte");
    expect(m.parse("null")).toBeNull();
  });

  test("stringify({ a: 1, b: [1, 2] }) renvoie le JSON indenté de 2 espaces", () => {
    expect(m.stringify({ a: 1, b: [1, 2] })).toBe('{\n  "a": 1,\n  "b": [\n    1,\n    2\n  ]\n}');
  });

  test("stringify laisse tomber undefined et les fonctions, garde null", () => {
    expect(m.stringify({ a: undefined, b: 1, c: () => 1, d: null })).toBe(
      '{\n  "b": 1,\n  "d": null\n}',
    );
  });

  test("parse(stringify(x)) redonne x — l'aller-retour", () => {
    const x = {
      title: "Dark",
      genres: ["drame", "thriller"],
      rating: 4.5,
      watched: false,
      credits: { director: "Baran bo Odar" },
    };
    expect(m.parse(m.stringify(x))).toEqual(x);
  });

  test("safeParse renvoie null sur un JSON cassé, sans planter", () => {
    expect(m.safeParse("{oops")).toBeNull();
    expect(m.safeParse("{'key': 1}")).toBeNull();
    expect(m.safeParse('{"a": 1,}')).toBeNull();
    expect(m.safeParse("")).toBeNull();
  });

  test("safeParse('{\"a\":1}') renvoie { a: 1 }", () => {
    expect(m.safeParse('{"a":1}')).toEqual({ a: 1 });
    expect(m.safeParse("0")).toBe(0);
  });

  test("isValidJson", () => {
    expect(m.isValidJson('{"a":1}')).toBe(true);
    expect(m.isValidJson("[]")).toBe(true);
    expect(m.isValidJson("{a:1}")).toBe(false);
    expect(m.isValidJson("undefined")).toBe(false);
  });

  challenge(
    'stringifyCompact({ a: 1, b: [1, 2] }) renvoie \'{"a":1,"b":[1,2]}\' — sans aucun espace',
    () => {
      expect(m.stringifyCompact({ a: 1, b: [1, 2] })).toBe('{"a":1,"b":[1,2]}');
      expect(m.stringifyCompact({ title: "La Casa de Papel" })).toBe(
        '{"title":"La Casa de Papel"}',
      );
    },
  );
}
