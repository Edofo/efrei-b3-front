import type { QuestContext } from "../engine/core.ts";
import type { Catalogue, Season, Title } from "../src/types.ts";
import { catalogue, title as titleById } from "./_data.ts";

export const title = "Naviguer dans la donnée";
export const file = "src/03-access.ts";

export const lesson = `
Ouvre \`data/catalogue.json\`. Prends une minute pour le lire. C'est un
objet avec \`version\`, \`generatedAt\`, \`rows\` et \`titles\` ; chaque titre a
des \`genres\` (tableau), des \`seasons\` (tableau d'objets) ou un \`runtime\`,
parfois des \`credits\` (objet), parfois pas de \`rating\`.

Ouvre maintenant \`src/types.ts\` : c'est la même chose, écrite en types.
Toute la quête consiste à **lire un chemin** dans cette structure.

## Chemins

\`\`\`
catalogue.titles[3].title                   // "Dark"
catalogue.titles[3].seasons[0].episodes     // compilateur : 'seasons' is possibly 'undefined'
catalogue.titles[3].credits?.director       // "Baran bo Odar"
\`\`\`

Un chemin, c'est une suite de \`.clé\` (objet) et de \`[index]\` (tableau).
Chaque étape optionnelle est déclarée avec \`?\` dans le type — et le
compilateur refuse de la traverser sans \`?.\` ou sans vérification. C'est
agaçant dix minutes et ça t'évite un plantage en production dans un mois.

## Ce qui manque

*Chef's Table* n'a ni \`rating\` ni \`credits\`. Un film n'a pas de
\`seasons\`. Ton code lit la donnée **telle qu'elle est**, pas telle que tu
voudrais qu'elle soit : \`?.\` et \`??\` pour les optionnels, \`title.kind ===
"movie"\` pour distinguer les cas. \`kind\` est un **type union**
(\`"movie" | "series"\`) : compare-le à autre chose et le compilateur râle.

## Chercher par id

Les \`rows\` ne contiennent que des \`ids\`. Pour retrouver un titre :

\`\`\`
catalogue.titles.find((t) => t.id === id)
\`\`\`

C'est une *jointure* faite à la main. Tu en feras une plus grosse à la
quête 6.
`;

export const mission = `
Dans \`src/03-access.ts\` (\`catalogue\` est l'objet complet, \`title\` un élément de \`titles\`) :
- \`titleNameOf(catalogue, id)\` → le champ \`title\`, ou \`undefined\`
- \`episodeCount(title)\` → la somme des épisodes de toutes les saisons ; \`0\` pour un film
- \`directorOf(title)\` → le nom, ou \`"Inconnu"\`
- \`leadCast(title)\` → les deux premiers acteurs, ou \`[]\`
- \`formatLabel(title)\` → \`"136 min"\` pour un film, \`"3 saisons"\` / \`"1 saison"\` pour une série
`;

interface Module {
  titleNameOf(catalogue: Catalogue, id: string): string | undefined;
  episodeCount(title: Title): number;
  directorOf(title: Title): string;
  leadCast(title: Title): string[];
  formatLabel(title: Title): string;
  lastSeason(title: Title): Season | null;
}

export default function ({ test, challenge, expect }: QuestContext, m: Module): void {
  test('titleNameOf(catalogue, "dark") renvoie "Dark"', () => {
    expect(m.titleNameOf(catalogue(), "dark")).toBe("Dark");
    expect(m.titleNameOf(catalogue(), "casa")).toBe("La Casa de Papel");
  });

  test('titleNameOf(catalogue, "ghost") renvoie undefined', () => {
    expect(m.titleNameOf(catalogue(), "ghost")).toBeUndefined();
  });

  test("episodeCount(Dark) renvoie 26, episodeCount(La Casa de Papel) renvoie 48", () => {
    expect(m.episodeCount(titleById("dark"))).toBe(26);
    expect(m.episodeCount(titleById("casa"))).toBe(48);
  });

  test("episodeCount(The Matrix) renvoie 0 — un film n'a pas de saisons", () => {
    expect(m.episodeCount(titleById("matrix"))).toBe(0);
  });

  test('directorOf(Dark) renvoie "Baran bo Odar", directorOf(Chef\'s Table) renvoie "Inconnu"', () => {
    expect(m.directorOf(titleById("dark"))).toBe("Baran bo Odar");
    expect(m.directorOf(titleById("chef"))).toBe("Inconnu");
    expect(m.directorOf({ ...titleById("dark"), credits: {} })).toBe("Inconnu");
  });

  test("leadCast(Dark) renvoie les deux premiers, leadCast(Chef's Table) renvoie []", () => {
    expect(m.leadCast(titleById("dark"))).toEqual(["Louis Hofmann", "Lisa Vicari"]);
    expect(m.leadCast(titleById("chef"))).toEqual([]);
    expect(m.leadCast({ ...titleById("dark"), credits: { cast: ["Seul"] } })).toEqual(["Seul"]);
  });

  test('formatLabel : "136 min", "3 saisons", "1 saison"', () => {
    expect(m.formatLabel(titleById("matrix"))).toBe("136 min");
    expect(m.formatLabel(titleById("dark"))).toBe("3 saisons");
    expect(m.formatLabel({ ...titleById("dark"), seasons: [{ number: 1, episodes: 8 }] })).toBe(
      "1 saison",
    );
  });

  challenge(
    "lastSeason(title) renvoie { number: 3, episodes: 8 } pour Dark, null pour un film",
    () => {
      expect(m.lastSeason(titleById("dark"))).toEqual({ number: 3, episodes: 8 });
      expect(m.lastSeason(titleById("casa"))).toEqual({ number: 5, episodes: 10 });
      expect(m.lastSeason(titleById("matrix"))).toBeNull();
      expect(m.lastSeason({ ...titleById("dark"), seasons: [] })).toBeNull();
    },
  );
}
