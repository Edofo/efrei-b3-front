import type { QuestContext } from "../engine/core.ts";

export const title = "Ma liste";
export const file = "src/05-arrays.ts";

export const lesson = `
« Ma liste » : les titres qu'on met de côté pour plus tard. En JavaScript,
une liste ordonnée s'appelle un **tableau** (array).

\`\`\`
const list: string[] = ["Dark", "Arcane", "Ozark"];
list[0]                  // "Dark"     — les index commencent à 0
list[list.length - 1]    // "Ozark"    — le dernier
list.length              // 3
list[10]                 // undefined  — pas d'erreur, juste rien
\`\`\`

\`string[]\` se lit « un tableau de chaînes ». Le compilateur sait alors
que \`list[0].toUpperCase()\` est légal et que \`list.push(42)\` ne l'est pas.

## Ajouter, chercher

\`\`\`
list.push("Narcos");       // ajoute à la fin, MODIFIE list, renvoie la nouvelle taille
list.includes("Dark")      // true
list.indexOf("Arcane")     // 1 ; -1 si absent
\`\`\`

## Copier, pas modifier

Certaines méthodes **modifient** le tableau (\`push\`, \`pop\`, \`reverse\`,
\`sort\`, \`splice\`). D'autres en **renvoient un nouveau** (\`slice\`,
\`concat\`, \`map\`, \`filter\`). Confondre les deux est la deuxième source de
bugs du débutant, juste après le \`return\` oublié.

Pour copier un tableau : \`const copy = [...list];\` (l'opérateur **spread**).
Ensuite tu fais ce que tu veux de la copie.

\`\`\`
const backwards = [...list].reverse();   // list n'a pas bougé
\`\`\`

## Les génériques, en douceur

\`first(list)\` doit marcher pour des chaînes, des nombres, des films.
\`function first<T>(list: T[]): T | undefined\` dit : « quel que soit \`T\`,
je prends un tableau de \`T\` et j'en rends un ». Le fichier à trous l'écrit
déjà pour toi — lis-le.
`;

export const mission = `
Dans \`src/05-arrays.ts\` :
- \`first(list)\` et \`last(list)\` → l'élément, ou \`undefined\` si la liste est vide
- \`add(list, title)\` → la liste avec le titre en plus, à la fin
- \`contains(list, title)\` → \`true\` / \`false\`
- \`positionOf(list, title)\` → l'index, ou \`-1\`
- \`reversed(list)\` → un **nouveau** tableau à l'envers
`;

interface Module {
  first<T>(list: T[]): T | undefined;
  last<T>(list: T[]): T | undefined;
  add(list: string[], title: string): string[];
  contains(list: string[], title: string): boolean;
  positionOf(list: string[], title: string): number;
  reversed<T>(list: T[]): T[];
}

export default function ({ test, challenge, expect }: QuestContext, m: Module): void {
  const list = (): string[] => ["Dark", "Arcane", "Ozark"];

  test('first(["Dark", "Arcane", "Ozark"]) renvoie "Dark"', () => {
    expect(m.first(list())).toBe("Dark");
    expect(m.first([4, 5])).toBe(4);
  });

  test('last(["Dark", "Arcane", "Ozark"]) renvoie "Ozark"', () => {
    expect(m.last(list())).toBe("Ozark");
    expect(m.last(["Seul"])).toBe("Seul");
  });

  test("first([]) et last([]) renvoient undefined", () => {
    expect(m.first([])).toBeUndefined();
    expect(m.last([])).toBeUndefined();
  });

  test('add(list, "Narcos") renvoie la liste avec "Narcos" à la fin', () => {
    expect(m.add(list(), "Narcos")).toEqual(["Dark", "Arcane", "Ozark", "Narcos"]);
  });

  test("add renvoie bien un tableau, pas sa taille (le piège de push)", () => {
    expect(Array.isArray(m.add([], "Dark"))).toBe(true);
    expect(m.add([], "Dark")).toEqual(["Dark"]);
  });

  test('contains(list, "Arcane") renvoie true, contains(list, "Narcos") renvoie false', () => {
    expect(m.contains(list(), "Arcane")).toBe(true);
    expect(m.contains(list(), "Narcos")).toBe(false);
  });

  test('positionOf(list, "Ozark") renvoie 2, positionOf(list, "Narcos") renvoie -1', () => {
    expect(m.positionOf(list(), "Ozark")).toBe(2);
    expect(m.positionOf(list(), "Dark")).toBe(0);
    expect(m.positionOf(list(), "Narcos")).toBe(-1);
  });

  test('reversed(list) renvoie ["Ozark", "Arcane", "Dark"]', () => {
    expect(m.reversed(list())).toEqual(["Ozark", "Arcane", "Dark"]);
    expect(m.reversed([])).toEqual([]);
  });

  challenge("reversed ne modifie PAS le tableau d'origine", () => {
    const original = list();
    expect(m.reversed(original)).toEqual(["Ozark", "Arcane", "Dark"]);
    expect(original, "le tableau passé en paramètre a été modifié").toEqual([
      "Dark",
      "Arcane",
      "Ozark",
    ]);
  });
}
