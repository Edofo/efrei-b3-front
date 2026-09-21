import type { QuestContext } from "../engine/core.ts";
import type { ImportedCatalogue, Profile, Title } from "../src/types.ts";
import { catalogue, profile, title as titleById } from "./_data.ts";

export const title = "Le deuxième argument";
export const file = "src/09-replacer-reviver.ts";

export const lesson = `
\`JSON.stringify\` et \`JSON.parse\` ont chacun un deuxième argument que
presque personne n'utilise, et qui règle trois problèmes réels :
exporter *une partie* d'un objet, cacher une donnée sensible, et
retrouver des \`Date\` à la lecture.

## replacer : filtrer à l'écriture

Un **tableau de clés** ne garde que celles-là :

\`\`\`
JSON.stringify(title, ["id", "title"], 2)
// { "id": "dark", "title": "Dark" }
\`\`\`

Une **fonction** \`(key, value) => …\` est appelée pour chaque propriété.
Elle renvoie la valeur à écrire ; renvoyer \`undefined\` **supprime** la
propriété :

\`\`\`
JSON.stringify(profile, (key, value) => {
  if (key === "age") return undefined;      // disparaît
  if (key === "email") return "***";        // masqué
  return value;                             // tout le reste passe
}, 2)
\`\`\`

## reviver : transformer à la lecture

JSON n'a pas de type date : \`"2026-09-01"\` est une chaîne. Le reviver de
\`parse\` reçoit chaque paire et peut renvoyer autre chose :

\`\`\`
JSON.parse(text, (key, value) =>
  key === "addedOn" ? new Date(value) : value
)
\`\`\`

Le reviver est appelé de l'intérieur vers l'extérieur : les feuilles
d'abord, la racine en dernier (avec \`key === ""\`).

## Les types suivent la donnée

Après le reviver, \`addedOn\` est une \`Date\`, pas une \`string\`. \`Title\`
serait un mensonge. \`ImportedCatalogue\` (voir \`src/types.ts\`) est
construit à partir de \`Catalogue\` avec \`Omit\` et les deux champs
remplacés : le type dit exactement ce que le reviver a fait. Les types
utilitaires (\`Omit\`, \`Pick\`, \`Partial\`, \`Readonly\`) existent pour ça :
dériver une forme d'une autre au lieu de la recopier.

## Pourquoi pas map + delete ?

Ça marche aussi, en deux passes et une copie. Le replacer fait le travail
pendant la sérialisation, sans jamais construire l'objet intermédiaire.
Et surtout : il s'applique **à tous les niveaux** d'imbrication d'un coup.
`;

export const mission = `
Dans \`src/09-replacer-reviver.ts\` :
- \`exportFields(titles, fields)\` → le JSON (2 espaces) des titres réduits aux \`fields\` demandés
- \`importCatalogue(text)\` → un \`ImportedCatalogue\`, où \`addedOn\` et \`generatedAt\` sont devenus des \`Date\`
- \`anonymize(profile)\` → le JSON (2 espaces) du profil avec \`email\` remplacé par \`"***"\` et sans \`age\`
`;

interface Module {
  exportFields(titles: Title[], fields: (keyof Title)[]): string;
  importCatalogue(text: string): ImportedCatalogue;
  anonymize(profile: Profile): string;
  toNdjson(items: unknown[]): string;
  fromNdjson(text: string): unknown[];
}

export default function ({ test, challenge, expect }: QuestContext, m: Module): void {
  test('exportFields([dark], ["id", "title"]) ne garde que ces deux champs', () => {
    const text = m.exportFields([titleById("dark")], ["id", "title"]);
    expect(typeof text).toBe("string");
    expect(JSON.parse(text)).toEqual([{ id: "dark", title: "Dark" }]);
  });

  test("exportFields est indenté de 2 espaces", () => {
    expect(m.exportFields([titleById("dark")], ["id"])).toBe('[\n  {\n    "id": "dark"\n  }\n]');
  });

  test('exportFields(catalogue.titles, ["id", "rating"]) : 12 entrées, Chef\'s Table sans note', () => {
    const list = JSON.parse(m.exportFields(catalogue().titles, ["id", "rating"])) as unknown[];
    expect(list).toHaveLength(12);
    expect(list[3]).toEqual({ id: "dark", rating: 4.5 });
    expect(list[6]).toEqual({ id: "chef" });
  });

  test("importCatalogue transforme addedOn et generatedAt en Date", () => {
    const imported = m.importCatalogue(JSON.stringify(catalogue()));
    expect(imported.generatedAt).toBeInstanceOf(Date);
    expect(imported.generatedAt.toISOString()).toBe("2026-09-01T06:00:00.000Z");
    expect(imported.titles[3].addedOn).toBeInstanceOf(Date);
    expect(imported.titles[3].addedOn.getFullYear()).toBe(2026);
  });

  test("importCatalogue laisse tout le reste intact", () => {
    const imported = m.importCatalogue(JSON.stringify(catalogue()));
    expect(imported.titles[3].title).toBe("Dark");
    expect(imported.titles[3].genres).toEqual(["drame", "science-fiction", "thriller"]);
    expect(imported.rows).toHaveLength(3);
  });

  test('anonymize(nolan) : email "***", pas d\'age, le reste intact', () => {
    const text = m.anonymize(profile("nolan"));
    const p = JSON.parse(text) as Record<string, unknown>;
    expect(p.email).toBe("***");
    expect("age" in p).toBe(false);
    expect(p.name).toBe("Nolan");
    expect(p.history).toHaveLength(5);
    expect(text).toMatch(/\n {2}"id": "nolan"/);
  });

  test("exportFields et anonymize n'utilisent pas delete (c'est le replacer qui filtre)", () => {
    expect([m.exportFields, m.anonymize].map((fn) => fn.toString()).join("\n")).not.toMatch(
      /\bdelete\b/,
    );
  });

  challenge(
    "toNdjson(items) écrit un JSON compact par ligne ; fromNdjson(text) fait l'inverse",
    () => {
      const text = m.toNdjson([
        { id: "a", n: 1 },
        { id: "b", n: 2 },
      ]);
      expect(text).toBe('{"id":"a","n":1}\n{"id":"b","n":2}');
      expect(m.fromNdjson(text)).toEqual([
        { id: "a", n: 1 },
        { id: "b", n: 2 },
      ]);
      expect(m.fromNdjson("")).toEqual([]);
      expect(m.fromNdjson(m.toNdjson(catalogue().titles))).toEqual(catalogue().titles);
    },
  );
}
