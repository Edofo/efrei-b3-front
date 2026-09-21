import type { QuestContext } from "../engine/core.ts";

export const title = "Le marathon";
export const file = "src/07-windows.ts";

export const lesson = `
NOLANFLIX veut afficher « 🔥 12 jours d'affilée » et « ta meilleure
semaine : 14 h ». Les données : les jours où on a regardé quelque chose,
et les minutes par jour. Deux algorithmes classiques : la **série** et la
**fenêtre glissante**.

## Compter une série

On avance dans la liste en comparant chaque élément au précédent. Si
c'est le jour suivant, la série courante s'allonge ; sinon elle repart à
1. Et on garde le champion :

\`\`\`
let current = 1;
let record = 1;
for (let i = 1; i < days.length; i++) {
  current = days[i] === days[i - 1] + 1 ? current + 1 : 1;
  if (current > record) record = current;
}
\`\`\`

(Et si la liste est vide ? Décide-le avant la boucle.)

## La fenêtre glissante

« La meilleure semaine » = la plus grande somme de 7 jours consécutifs.
Recalculer la somme de chaque fenêtre coûte 7 opérations par position.
Faire **glisser** la fenêtre en coûte 2 : on ajoute l'élément qui entre,
on retire celui qui sort.

\`\`\`
let sum = 0;
for (let i = 0; i < minutes.length; i++) {
  sum += minutes[i];                     // entre par la droite
  if (i >= 7) sum -= minutes[i - 7];     // sort par la gauche
  // dès que i >= 6, sum est celle d'une fenêtre de 7
}
\`\`\`

## Fusionner deux listes triées

Deux rangées déjà classées par note, et on veut la liste globale classée.
Pas besoin de re-trier : deux index, un par liste, et on prend toujours
le plus petit des deux en tête. C'est le cœur du tri fusion.
`;

export const mission = `
Dans \`src/07-windows.ts\` :
- \`longestStreak(days)\` → la plus longue suite de jours consécutifs (\`days\` trié, sans doublon)
- \`bestWeek(minutesPerDay)\` → la plus grande somme sur 7 jours consécutifs (toute la liste si elle fait moins de 7)
- \`merge(a, b)\` → les deux listes triées fusionnées en une liste triée, **sans** \`sort\`
`;

interface Module {
  longestStreak(days: readonly number[]): number;
  bestWeek(minutesPerDay: readonly number[]): number;
  merge(a: readonly number[], b: readonly number[]): number[];
  bestWeekDetail(minutesPerDay: readonly number[]): { start: number; total: number };
}

export default function ({ test, challenge, expect }: QuestContext, m: Module): void {
  test("longestStreak([1, 2, 3, 5, 6]) renvoie 3", () => {
    expect(m.longestStreak([1, 2, 3, 5, 6])).toBe(3);
    expect(m.longestStreak([1, 3, 5])).toBe(1);
  });

  test("longestStreak : la meilleure série n'est pas forcément la première", () => {
    expect(m.longestStreak([1, 2, 10, 11, 12, 13, 20])).toBe(4);
    expect(m.longestStreak([4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])).toBe(12);
  });

  test("longestStreak([]) renvoie 0, longestStreak([4]) renvoie 1", () => {
    expect(m.longestStreak([])).toBe(0);
    expect(m.longestStreak([4])).toBe(1);
  });

  test("bestWeek([10, 0, 0, 0, 0, 0, 0, 50, 60]) renvoie 110", () => {
    expect(m.bestWeek([10, 0, 0, 0, 0, 0, 0, 50, 60])).toBe(110);
    expect(m.bestWeek([1, 1, 1, 1, 1, 1, 1])).toBe(7);
  });

  test("bestWeek avec moins de 7 jours renvoie la somme de tout ; [] → 0", () => {
    expect(m.bestWeek([30, 40, 50])).toBe(120);
    expect(m.bestWeek([])).toBe(0);
  });

  test("bestWeek sur 365 jours : la bonne fenêtre, ni la première ni la dernière", () => {
    const year = Array.from({ length: 365 }, (_, i) => (i >= 100 && i < 107 ? 120 : 10));
    expect(m.bestWeek(year)).toBe(840);
  });

  test("merge([1, 4, 9], [2, 3, 10, 11]) renvoie [1, 2, 3, 4, 9, 10, 11]", () => {
    expect(m.merge([1, 4, 9], [2, 3, 10, 11])).toEqual([1, 2, 3, 4, 9, 10, 11]);
    expect(m.merge([], [1, 2])).toEqual([1, 2]);
    expect(m.merge([1, 2], [])).toEqual([1, 2]);
    expect(m.merge([1, 1], [1])).toEqual([1, 1, 1]);
  });

  test("merge n'appelle pas sort : c'est une fusion, pas un tri", () => {
    expect(m.merge.toString()).not.toMatch(/\.sort\(|toSorted/);
  });

  challenge(
    "bestWeekDetail(minutes) renvoie { start, total } — l'index du premier jour de la meilleure fenêtre",
    () => {
      expect(m.bestWeekDetail([10, 0, 0, 0, 0, 0, 0, 50, 60])).toEqual({ start: 2, total: 110 });
      expect(m.bestWeekDetail([1, 1, 1])).toEqual({ start: 0, total: 3 });
      expect(m.bestWeekDetail([])).toEqual({ start: 0, total: 0 });
    },
  );
}
