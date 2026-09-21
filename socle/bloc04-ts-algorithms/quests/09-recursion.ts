import type { QuestContext } from "../engine/core.ts";
import type { CollectionNode } from "../src/types.ts";

export const title = "L'arbre des univers";
export const file = "src/09-recursion.ts";

export const lesson = `
Le catalogue n'est pas plat. Il y a des **univers** (« Matrix »), qui
contiennent des sagas, qui contiennent des films. Un dossier qui contient
des dossiers qui contiennent des fichiers : c'est un **arbre**, et on le
parcourt par **récursion**.

## Un nœud

\`\`\`
{
  title: "Univers Matrix",
  children: [
    { title: "The Matrix", episodes: 1 },
    { title: "Trilogie", children: [ { title: "Reloaded", episodes: 1 }, … ] },
  ],
}
\`\`\`

Une **feuille** a des \`episodes\`. Un **nœud interne** a des \`children\`.
Le type \`CollectionNode\` (voir \`src/types.ts\`) est **récursif** : il se
cite lui-même. TypeScript n'a rien contre.

## La fonction qui s'appelle elle-même

Pour compter les épisodes d'un nœud : si c'est une feuille, c'est son
nombre. Sinon, c'est la somme des épisodes de ses enfants — et pour
compter ceux d'un enfant, on utilise… la même fonction.

\`\`\`
function total(node: CollectionNode): number {
  if (node.episodes !== undefined) return node.episodes;   // cas de base
  let sum = 0;
  for (const child of node.children ?? []) sum += total(child);  // récursion
  return sum;
}
\`\`\`

Deux règles, toujours les mêmes :

1. **Le cas de base** vient en premier, et ne rappelle pas la fonction.
   Sans lui : \`Maximum call stack size exceeded\`.
2. **Fais confiance à l'appel récursif.** Tu n'as pas à imaginer les
   poupées russes : \`total(child)\` renvoie le bon total, point.

## Accumuler à travers la récursion

Pour rassembler tous les noms, chaque appel renvoie un tableau, et le
parent concatène : \`[node.title, ...children.flatMap(flatten)]\`.
`;

export const mission = `
Dans \`src/09-recursion.ts\` :
- \`totalEpisodes(node)\` → la somme des \`episodes\` de toutes les feuilles
- \`flatten(node)\` → tous les noms, parents avant enfants, de gauche à droite
- \`depth(node)\` → \`1\` pour une feuille, \`1 +\` la plus grande profondeur des enfants sinon
`;

interface Module {
  totalEpisodes(node: CollectionNode): number;
  flatten(node: CollectionNode): string[];
  depth(node: CollectionNode): number;
  pathTo(node: CollectionNode, title: string): string[] | null;
}

const TREE = (): CollectionNode => ({
  title: "NOLANFLIX",
  children: [
    { title: "Dark", episodes: 26 },
    {
      title: "Univers Matrix",
      children: [
        { title: "The Matrix", episodes: 1 },
        {
          title: "Les suites",
          children: [
            { title: "Reloaded", episodes: 1 },
            { title: "Revolutions", episodes: 1 },
          ],
        },
      ],
    },
    { title: "Arcane", episodes: 18 },
  ],
});

export default function ({ test, challenge, expect }: QuestContext, m: Module): void {
  test("totalEpisodes d'une feuille renvoie ses épisodes", () => {
    expect(m.totalEpisodes({ title: "Dark", episodes: 26 })).toBe(26);
  });

  test("totalEpisodes d'un nœud à un niveau additionne ses enfants", () => {
    expect(
      m.totalEpisodes({
        title: "Duo",
        children: [
          { title: "a", episodes: 2 },
          { title: "b", episodes: 3 },
        ],
      }),
    ).toBe(5);
  });

  test("totalEpisodes(TREE) renvoie 47 — trois niveaux", () => {
    expect(m.totalEpisodes(TREE())).toBe(47);
    expect(m.totalEpisodes({ title: "vide", children: [] })).toBe(0);
  });

  test("flatten(TREE) liste les 8 noms, parents d'abord", () => {
    expect(m.flatten(TREE())).toEqual([
      "NOLANFLIX",
      "Dark",
      "Univers Matrix",
      "The Matrix",
      "Les suites",
      "Reloaded",
      "Revolutions",
      "Arcane",
    ]);
    expect(m.flatten({ title: "Seul", episodes: 1 })).toEqual(["Seul"]);
  });

  test("depth : feuille → 1, TREE → 4", () => {
    expect(m.depth({ title: "Dark", episodes: 26 })).toBe(1);
    expect(m.depth({ title: "Duo", children: [{ title: "a", episodes: 2 }] })).toBe(2);
    expect(m.depth(TREE())).toBe(4);
  });

  test("ça tient sur un arbre profond de 500 niveaux", () => {
    let node: CollectionNode = { title: "feuille", episodes: 1 };
    for (let i = 0; i < 500; i++) node = { title: `n${i}`, children: [node] };
    expect(m.totalEpisodes(node)).toBe(1);
    expect(m.depth(node)).toBe(501);
  });

  challenge(
    'pathTo(TREE, "Reloaded") renvoie ["NOLANFLIX", "Univers Matrix", "Les suites", "Reloaded"] ; null si absent',
    () => {
      expect(m.pathTo(TREE(), "Reloaded")).toEqual([
        "NOLANFLIX",
        "Univers Matrix",
        "Les suites",
        "Reloaded",
      ]);
      expect(m.pathTo(TREE(), "Dark")).toEqual(["NOLANFLIX", "Dark"]);
      expect(m.pathTo(TREE(), "NOLANFLIX")).toEqual(["NOLANFLIX"]);
      expect(m.pathTo(TREE(), "Ozark")).toBeNull();
    },
  );
}
