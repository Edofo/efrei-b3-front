import type { QuestContext } from "../engine/core.ts";
import type { Title } from "../src/types.ts";

export const title = "Le champion";
export const file = "src/01-champion.ts";

export const lesson = `
Le moteur de recommandation de NOLANFLIX est tombé en panne, et personne
ne sait le réparer : celui qui l'a écrit est parti. Tu vas le réécrire,
brique par brique. Première brique : trouver **le meilleur**.

## Sans Math.max

\`Math.max(...ratings)\` existe. Tu n'y as pas droit dans cette quête, parce
que le but est d'écrire une fois dans ta vie ce qu'il fait — c'est le
squelette de la moitié des algorithmes que tu croiseras.

## Le motif du champion

On garde en mémoire *le meilleur vu jusqu'ici*, et on parcourt la liste
en le remettant en cause à chaque élément :

\`\`\`
let champion = list[0];
for (const x of list) {
  if (x > champion) champion = x;
}
return champion;
\`\`\`

Deux détails qui séparent le code juste du code presque juste :

- **Le point de départ.** Partir de \`0\` casse avec des nombres négatifs.
  On part du **premier élément**.
- **La liste vide.** Il n'y a pas de champion : on renvoie \`undefined\`,
  et on le décide *avant* de lire \`list[0]\`. Le type de retour le dit :
  \`number | undefined\`. Le compilateur forcera l'appelant à s'en occuper.

## Une passe, pas deux

Ce code lit chaque élément **une seule fois**. On dit qu'il est en
\`O(n)\` : deux fois plus de titres, deux fois plus de temps, pas plus.
Garde cette question en tête pour tout le bloc : « combien de fois je
touche chaque élément ? »
`;

export const mission = `
Dans \`src/01-champion.ts\`, sans \`Math.max\`, \`Math.min\` ni \`sort\` :
- \`maximum(numbers)\` et \`minimum(numbers)\` → la valeur, ou \`undefined\` si vide
- \`bestTitle(titles)\` → le titre dont la note est la plus haute (le premier en cas d'égalité)
`;

interface Module {
  maximum(numbers: number[]): number | undefined;
  minimum(numbers: number[]): number | undefined;
  bestTitle(titles: Title[]): Title | undefined;
  positionOfMaximum(numbers: number[]): number;
}

const rated = (title: string, rating: number): Title => ({
  id: title.toLowerCase(),
  title,
  kind: "series",
  year: 2020,
  genres: [],
  rating,
  minimumAge: 0,
});

export default function ({ test, challenge, expect }: QuestContext, m: Module): void {
  test("maximum([3, 9, 2]) renvoie 9", () => {
    expect(m.maximum([3, 9, 2])).toBe(9);
    expect(m.maximum([4])).toBe(4);
  });

  test("maximum marche avec des négatifs : maximum([-5, -1, -9]) renvoie -1", () => {
    expect(m.maximum([-5, -1, -9])).toBe(-1);
  });

  test("maximum([]) renvoie undefined", () => {
    expect(m.maximum([])).toBeUndefined();
  });

  test("minimum([3, 9, 2]) renvoie 2, minimum([]) renvoie undefined", () => {
    expect(m.minimum([3, 9, 2])).toBe(2);
    expect(m.minimum([-5, -1, -9])).toBe(-9);
    expect(m.minimum([])).toBeUndefined();
  });

  test("bestTitle renvoie le titre le mieux noté", () => {
    const titles = [rated("Dark", 4.5), rated("Arcane", 4.8), rated("Narcos", 4.3)];
    expect(m.bestTitle(titles)?.title).toBe("Arcane");
  });

  test("bestTitle : en cas d'égalité, le premier gagne ; liste vide → undefined", () => {
    const titles = [rated("Ozark", 4.3), rated("Narcos", 4.3)];
    expect(m.bestTitle(titles)?.title).toBe("Ozark");
    expect(m.bestTitle([])).toBeUndefined();
  });

  test("ni Math.max, ni Math.min, ni sort dans ce fichier", () => {
    const source = [m.maximum, m.minimum, m.bestTitle].map((fn) => fn.toString()).join("\n");
    expect(source).not.toMatch(/Math\.(max|min)|\.sort\(|toSorted/);
  });

  challenge(
    "positionOfMaximum([3, 9, 2, 9]) renvoie 1 — l'index de la première occurrence, -1 si vide",
    () => {
      expect(m.positionOfMaximum([3, 9, 2, 9])).toBe(1);
      expect(m.positionOfMaximum([-2, -7])).toBe(0);
      expect(m.positionOfMaximum([])).toBe(-1);
    },
  );
}
