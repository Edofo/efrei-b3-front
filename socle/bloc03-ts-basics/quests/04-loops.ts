import type { QuestContext } from "../engine/core.ts";

export const title = "Encore, encore, encore";
export const file = "src/04-loops.ts";

export const lesson = `
Une note s'affiche en étoiles : ★★★★☆. Cinq caractères, choisis un par
un. Quand on répète, on **boucle**.

## for

\`\`\`
for (let i = 0; i < 5; i++) {
  console.log(i);          // 0, 1, 2, 3, 4
}
\`\`\`

Trois parties : le départ, la condition pour continuer, le pas.

## for…of

Pour parcourir un tableau élément par élément, sans se soucier des index :

\`\`\`
const seasons = [10, 8, 8];
for (const episodes of seasons) {
  console.log(episodes);    // 10, puis 8, puis 8
}
\`\`\`

## L'accumulateur

Le motif que tu écriras cent fois : une variable qui part vide, et que la
boucle remplit.

\`\`\`
let total = 0;
for (const n of numbers) {
  total += n;
}
return total;
\`\`\`

Ça marche avec un nombre (\`total += n\`), une chaîne (\`text += "★"\`),
un tableau (\`list.push(x)\`). Note le \`let\` : une \`const\` ne peut pas
être réassignée, et TypeScript te le dira.

## while

Quand on ne sait pas d'avance combien de tours : \`while (condition) { … }\`.
Assure-toi que la condition finit par devenir fausse, sinon le programme
ne rend jamais la main — le jeu coupe un test après 3 secondes et te le dit.
`;

export const mission = `
Dans \`src/04-loops.ts\` :
- \`stars(rating)\` → \`"★★★★☆"\` pour 4, toujours 5 caractères (note entière de 0 à 5)
- \`totalEpisodes(seasons)\` → la somme d'un tableau de nombres
- \`countdown(n)\` → \`"3, 2, 1, Action !"\` ; pour 0, juste \`"Action !"\`
`;

interface Module {
  stars(rating: number): string;
  totalEpisodes(seasons: number[]): number;
  countdown(n: number): string;
}

export default function ({ test, challenge, expect }: QuestContext, m: Module): void {
  test('stars(4) renvoie "★★★★☆"', () => {
    expect(m.stars(4)).toBe("★★★★☆");
  });

  test("stars fait toujours 5 caractères : 0 → ☆☆☆☆☆, 5 → ★★★★★", () => {
    expect(m.stars(0)).toBe("☆☆☆☆☆");
    expect(m.stars(5)).toBe("★★★★★");
    expect(m.stars(2)).toBe("★★☆☆☆");
  });

  test("totalEpisodes([10, 8, 8]) renvoie 26", () => {
    expect(m.totalEpisodes([10, 8, 8])).toBe(26);
    expect(m.totalEpisodes([8])).toBe(8);
  });

  test("totalEpisodes([]) renvoie 0", () => {
    expect(m.totalEpisodes([])).toBe(0);
  });

  test('countdown(3) renvoie "3, 2, 1, Action !"', () => {
    expect(m.countdown(3)).toBe("3, 2, 1, Action !");
    expect(m.countdown(5)).toBe("5, 4, 3, 2, 1, Action !");
  });

  test('countdown(0) renvoie "Action !"', () => {
    expect(m.countdown(0)).toBe("Action !");
    expect(m.countdown(1)).toBe("1, Action !");
  });

  challenge('stars gère les demi-notes : stars(3.5) → "★★★½☆", stars(4.5) → "★★★★½"', () => {
    expect(m.stars(3.5)).toBe("★★★½☆");
    expect(m.stars(4.5)).toBe("★★★★½");
    expect(m.stars(0.5)).toBe("½☆☆☆☆");
    expect(m.stars(4)).toBe("★★★★☆");
  });
}
