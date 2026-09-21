import type { QuestContext } from "../engine/core.ts";

export const title = "Le compteur de temps";
export const file = "src/02-durations.ts";

export const lesson = `
Deuxième ticket : sous chaque jaquette, afficher la durée du film et la
part déjà regardée. Il va falloir calculer.

## Les nombres

JavaScript n'a qu'un seul type de nombre : \`42\`, \`3.14\`, \`-7\` sont tous
des \`number\`. Les opérateurs classiques sont là, \`+ - * /\`, et un moins
connu qui va te servir tout le temps, le **modulo** \`%\` — le reste de la
division entière :

\`\`\`
92 / 60      // 1.5333…   la division n'arrondit rien
92 % 60      // 32        ce qui reste quand on a enlevé les heures
Math.floor(92 / 60)   // 1     arrondi vers le bas
Math.round(2.5)       // 3     arrondi au plus proche
\`\`\`

## Construire une chaîne pas à pas

Une chaîne peut grandir avec \`+=\`, ou se choisir selon une condition. Un
\`if\` sans \`else\` suffit souvent :

\`\`\`
let text = "";
if (hours > 0) {
  text += \`\${hours} h\`;
}
\`\`\`

Attention au piège : \`"1" + 2\` donne \`"12"\` (une chaîne), pas 3. Quand un
des deux côtés est une chaîne, \`+\` colle au lieu d'additionner. TypeScript
laisse passer — \`string + number\` est légal — alors reste éveillé.
`;

export const mission = `
Dans \`src/02-durations.ts\` :
- \`toMinutes(hours, minutes)\` → le total en minutes
- \`formatDuration(minutes)\` → \`"1 h 32 min"\`, \`"45 min"\`, \`"2 h"\` (pas de « 0 min » derrière les heures rondes)
- \`percentWatched(position, duration)\` → un entier arrondi, en pourcents
`;

interface Module {
  toMinutes(hours: number, minutes: number): number;
  formatDuration(minutes: number): string;
  percentWatched(position: number, duration: number): number;
}

export default function ({ test, challenge, expect }: QuestContext, m: Module): void {
  test("toMinutes(1, 32) renvoie 92", () => {
    expect(m.toMinutes(1, 32)).toBe(92);
    expect(m.toMinutes(0, 45)).toBe(45);
    expect(m.toMinutes(2, 0)).toBe(120);
  });

  test('formatDuration(92) renvoie "1 h 32 min"', () => {
    expect(m.formatDuration(92)).toBe("1 h 32 min");
    expect(m.formatDuration(136)).toBe("2 h 16 min");
  });

  test('formatDuration(45) renvoie "45 min" — pas de "0 h"', () => {
    expect(m.formatDuration(45)).toBe("45 min");
    expect(m.formatDuration(0)).toBe("0 min");
  });

  test('formatDuration(120) renvoie "2 h" — pas de "0 min"', () => {
    expect(m.formatDuration(120)).toBe("2 h");
    expect(m.formatDuration(60)).toBe("1 h");
  });

  test("percentWatched(30, 120) renvoie 25", () => {
    expect(m.percentWatched(30, 120)).toBe(25);
    expect(m.percentWatched(120, 120)).toBe(100);
    expect(m.percentWatched(0, 120)).toBe(0);
  });

  test("percentWatched arrondit à l'entier : (50, 150) → 33, (100, 150) → 67", () => {
    expect(m.percentWatched(50, 150)).toBe(33);
    expect(m.percentWatched(100, 150)).toBe(67);
  });

  challenge("percentWatched ne dépasse jamais 100 et survit à une durée de 0", () => {
    expect(m.percentWatched(200, 100)).toBe(100);
    expect(m.percentWatched(10, 0)).toBe(0);
  });
}
