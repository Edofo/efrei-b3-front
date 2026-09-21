import type { QuestContext } from "../engine/core.ts";
import type { Title } from "../src/types.ts";

export const title = "Les doublons";
export const file = "src/05-duplicates.ts";

export const lesson = `
*La Casa de Papel* est dans « Tendances » **et** dans « Populaires ». Quand
on construit la liste de tous les titres de la page, elle y apparaît deux
fois. Il faut dédoublonner.

## Set : un ensemble sans doublon

\`\`\`
const s = new Set(["a", "b", "a"]);   // Set { "a", "b" }
s.has("a")           // true
s.add("c");
s.size               // 3
[...s]               // ["a", "b", "c"]  — retour au tableau, ordre d'insertion
\`\`\`

\`[...new Set(list)]\` dédoublonne un tableau de valeurs simples en une
ligne, en gardant l'ordre de première apparition.

## Et pour des objets ?

Deux objets \`{ id: "casa" }\` ne sont **pas égaux** pour JavaScript (deux
références différentes) : un \`Set\` les garderait tous les deux. Il faut
choisir *ce qui rend deux titres identiques* — ici, l'\`id\` — et se souvenir
des ids déjà vus :

\`\`\`
const seen = new Set<string>();
const result: Title[] = [];
for (const title of titles) {
  if (seen.has(title.id)) continue;     // déjà passé : on saute
  seen.add(title.id);
  result.push(title);
}
\`\`\`

\`new Set<string>()\` : le paramètre de type dit ce qui va dedans. Sans lui,
un Set vide est un \`Set<unknown>\` et le compilateur ne peut plus t'aider.

## Pourquoi pas includes ?

\`result.some((t) => t.id === title.id)\` marche aussi… en relisant tout
le résultat à chaque titre. Pour 12 titres, personne ne verra la
différence. Pour 100 000, c'est 10 milliards de comparaisons.
\`Set.has\` répond en temps constant. C'est **la** raison d'être des Set
et des Map.
`;

export const mission = `
Dans \`src/05-duplicates.ts\` :
- \`unique(list)\` → sans doublon, ordre de première apparition conservé
- \`uniqueTitles(titles)\` → un seul titre par \`id\` (le premier rencontré)
- \`intersection(a, b)\` → les valeurs présentes dans les deux, dans l'ordre de \`a\`
- \`difference(a, b)\` → les valeurs de \`a\` absentes de \`b\`
`;

interface Module {
  unique<T>(list: readonly T[]): T[];
  uniqueTitles(titles: readonly Title[]): Title[];
  intersection<T>(a: readonly T[], b: readonly T[]): T[];
  difference<T>(a: readonly T[], b: readonly T[]): T[];
  duplicates<T>(list: readonly T[]): T[];
}

const withId = (id: string, rating = 4): Title => ({
  id,
  title: id,
  kind: "series",
  year: 2020,
  genres: [],
  rating,
  minimumAge: 0,
});

export default function ({ test, challenge, expect }: QuestContext, m: Module): void {
  test('unique(["a", "b", "a", "c", "b"]) renvoie ["a", "b", "c"]', () => {
    expect(m.unique(["a", "b", "a", "c", "b"])).toEqual(["a", "b", "c"]);
    expect(m.unique([3, 1, 3, 3])).toEqual([3, 1]);
    expect(m.unique([])).toEqual([]);
  });

  test("unique ne modifie pas la liste reçue", () => {
    const list = ["a", "a"];
    m.unique(list);
    expect(list).toEqual(["a", "a"]);
  });

  test("uniqueTitles garde un seul titre par id, le premier", () => {
    const titles = [withId("casa", 4), withId("dark", 4.5), withId("casa", 1)];
    expect(m.uniqueTitles(titles).map((t) => [t.id, t.rating])).toEqual([
      ["casa", 4],
      ["dark", 4.5],
    ]);
  });

  test("uniqueTitles distingue deux objets différents avec le même id (un Set d'objets ne suffit pas)", () => {
    expect(m.uniqueTitles([withId("dark"), withId("dark"), withId("dark")])).toHaveLength(1);
  });

  test('intersection(["a", "b", "c"], ["c", "a", "z"]) renvoie ["a", "c"] — dans l\'ordre du premier', () => {
    expect(m.intersection(["a", "b", "c"], ["c", "a", "z"])).toEqual(["a", "c"]);
    expect(m.intersection(["a"], ["b"])).toEqual([]);
    expect(m.intersection([], ["b"])).toEqual([]);
  });

  test('difference(["a", "b", "c"], ["b"]) renvoie ["a", "c"]', () => {
    expect(m.difference(["a", "b", "c"], ["b"])).toEqual(["a", "c"]);
    expect(m.difference(["a", "b"], [])).toEqual(["a", "b"]);
    expect(m.difference(["a"], ["a"])).toEqual([]);
  });

  test("unique et uniqueTitles utilisent un Set (pas includes/some dans une boucle)", () => {
    const source = [m.unique, m.uniqueTitles].map((fn) => fn.toString()).join("\n");
    expect(source, "on veut voir `new Set` ou `new Map` dans ces deux fonctions").toMatch(
      /new (Set|Map)\b/,
    );
    expect(source, "pas de includes/some : c'est ce qui rend l'algorithme quadratique").not.toMatch(
      /\.includes\(|\.some\(/,
    );
  });

  challenge(
    'duplicates(["a", "b", "a", "c", "b", "a"]) renvoie ["a", "b"] — les valeurs vues plus d\'une fois, chacune une fois, dans l\'ordre de leur première répétition',
    () => {
      expect(m.duplicates(["a", "b", "a", "c", "b", "a"])).toEqual(["a", "b"]);
      expect(m.duplicates([1, 2, 3])).toEqual([]);
      expect(m.duplicates(["x", "y", "y", "x"])).toEqual(["y", "x"]);
    },
  );
}
