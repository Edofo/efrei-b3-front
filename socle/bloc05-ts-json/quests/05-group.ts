import type { QuestContext } from "../engine/core.ts";
import type { Title } from "../src/types.ts";
import { titles } from "./_data.ts";

export const title = "Ranger par étagère";
export const file = "src/05-group.ts";

export const lesson = `
« Tous les drames », « les années 2010 », « combien de films, combien de
séries ». Trois questions, un seul mouvement : **regrouper** une liste
selon une clé calculée sur chaque élément.

## Le motif

Un objet-dictionnaire dont chaque valeur est un tableau :

\`\`\`
const groups: Record<string, string[]> = {};
for (const title of titles) {
  const key = computeKey(title);
  if (!groups[key]) groups[key] = [];
  groups[key].push(title.id);
}
\`\`\`

Tu as écrit presque la même chose au bloc 4 avec un compteur. Ici, au
lieu de \`+ 1\`, on \`push\`. \`(groups[key] ??= []).push(title.id)\` fait les
deux lignes en une, si tu aimes.

## Une clé par élément… ou plusieurs

Un titre a **plusieurs** genres : il apparaît dans plusieurs groupes.
Boucle sur \`title.genres\` à l'intérieur de la boucle sur les titres.

## Calculer une décennie

\`Math.floor(2017 / 10) * 10\` donne \`2010\`. Comme clé d'objet, un nombre
devient une chaîne : \`groups[2010]\` et \`groups["2010"]\` sont la même
entrée. Les tests attendent des clés \`"1990"\`, \`"2000"\`… — c'est
automatique.

## Object.groupBy

Node ≥ 21 et les navigateurs récents ont \`Object.groupBy(list, fn)\`, qui
fait exactement ça pour une clé simple. Écris-le toi-même une fois, tu
sauras ce qu'il fait.
`;

export const mission = `
Dans \`src/05-group.ts\` (\`titles\` est le tableau) :
- \`byGenre(titles)\` → \`{ drame: ["elite", "dark", …], thriller: […], … }\` (des ids, dans l'ordre du catalogue)
- \`byDecade(titles)\` → \`{ "1990": ["matrix"], "2000": […], … }\`
- \`countByKind(titles)\` → \`{ movie: 3, series: 9 }\`
`;

interface Module {
  byGenre(titles: Title[]): Record<string, string[]>;
  byDecade(titles: Title[]): Record<string, string[]>;
  countByKind(titles: Title[]): Record<string, number>;
  indexById(titles: Title[]): Record<string, Title>;
}

export default function ({ test, challenge, expect }: QuestContext, m: Module): void {
  test("byGenre : drame contient les 6 ids, dans l'ordre du catalogue", () => {
    expect(m.byGenre(titles()).drame).toEqual([
      "elite",
      "dark",
      "arcane",
      "sense8",
      "ozark",
      "narcos",
    ]);
  });

  test("byGenre : un titre à trois genres apparaît dans les trois", () => {
    const groups = m.byGenre(titles());
    expect(groups.drame).toContain("dark");
    expect(groups["science-fiction"]).toContain("dark");
    expect(groups.thriller).toContain("dark");
    expect(groups.documentaire).toEqual(["chef"]);
  });

  test("byGenre a exactement 9 genres, byGenre([]) renvoie {}", () => {
    expect(Object.keys(m.byGenre(titles())).sort()).toEqual([
      "action",
      "animation",
      "comédie",
      "documentaire",
      "drame",
      "horreur",
      "romance",
      "science-fiction",
      "thriller",
    ]);
    expect(m.byGenre([])).toEqual({});
  });

  test("byDecade regroupe par tranche de 10 ans", () => {
    expect(m.byDecade(titles())).toEqual({
      1990: ["matrix"],
      2000: ["amelie", "squad"],
      2010: ["elite", "dark", "casa", "chef", "sense8", "ozark", "stranger", "narcos"],
      2020: ["arcane"],
    });
  });

  test("countByKind(titles) renvoie { movie: 3, series: 9 }", () => {
    expect(m.countByKind(titles())).toEqual({ movie: 3, series: 9 });
    expect(m.countByKind([])).toEqual({});
  });

  challenge(
    "indexById(titles) renvoie un objet { dark: {…}, … } pour retrouver un titre sans find",
    () => {
      const index = m.indexById(titles());
      expect(index.dark.title).toBe("Dark");
      expect(index.casa.year).toBe(2017);
      expect(Object.keys(index)).toHaveLength(12);
      expect(index.ghost).toBeUndefined();
    },
  );
}
