import type { QuestContext } from "../engine/core.ts";
import type { Movie } from "../src/types.ts";

export const title = "BOSS · La fiche complète";
export const file = "src/10-boss-sheet.ts";

export const lesson = `
Dernière quête du bloc. Pas de nouvelle notion : tu assembles tout ce que
tu as écrit pour produire la fiche texte d'un titre, celle que le support
client colle dans ses e-mails.

\`\`\`
DARK (2017) · 16+
★★★★★ 4.5/5 · 3 saisons · 26 épisodes
Drame, Science-fiction
Réalisé par Baran bo Odar
\`\`\`

## Réutiliser, pas recopier

Tu as déjà \`stars\`, \`formatDuration\`, \`totalEpisodes\`. Le fichier de
cette quête les **importe** depuis tes fichiers précédents :

\`\`\`
import { stars, totalEpisodes } from "./04-loops.ts";
import { formatDuration } from "./02-durations.ts";
\`\`\`

(L'extension \`.ts\` dans le chemin est obligatoire : Node exécute ces
fichiers tels quels, sans étape de build.)

C'est le vrai sujet du boss : si tu casses \`stars\` en le modifiant, la
quête 4 repasse au rouge **et** celle-ci aussi. Les tests te protègent
dans les deux sens.

## Les règles de la fiche

- ligne 1 : le titre en capitales, l'année entre parenthèses, puis
  \`Tout public\` si \`minimumAge\` vaut 0, sinon \`16+\`
- ligne 2 : les étoiles de la note **arrondie**, la note sur 5, puis
  soit \`3 saisons · 26 épisodes\` (si \`seasons\`), soit la durée formatée
  (si \`runtime\`). Sans note : \`Non noté\` à la place des étoiles et de la note
- ligne 3 : les genres avec une majuscule initiale, séparés par \`, \`
- ligne 4 : \`Réalisé par X\`, ou \`Réalisation inconnue\`

Les lignes sont séparées par \`"\\n"\`. Pas de ligne vide, pas d'espace en
bout de ligne.
`;

export const mission = `
Dans \`src/10-boss-sheet.ts\` :
- \`sheet(title)\` → la fiche sur 4 lignes
- \`catalogueText(titles)\` → toutes les fiches, séparées par une ligne vide
`;

const DARK: Movie = {
  title: "Dark",
  year: 2017,
  minimumAge: 16,
  rating: 4.5,
  genres: ["drame", "science-fiction"],
  seasons: [10, 8, 8],
  credits: { director: "Baran bo Odar" },
};
const AMELIE: Movie = {
  title: "Amélie",
  year: 2001,
  minimumAge: 0,
  rating: 4,
  genres: ["comédie", "romance"],
  runtime: 122,
  credits: { director: "Jean-Pierre Jeunet" },
};
const MYSTERY: Movie = {
  title: "Le film mystère",
  year: 2026,
  minimumAge: 12,
  genres: ["thriller"],
  runtime: 95,
};

interface Module {
  sheet(title: Movie): string;
  catalogueText(titles: Movie[]): string;
}

export default function ({ test, challenge, expect }: QuestContext, m: Module): void {
  const lines = (title: Movie): string[] => m.sheet(structuredClone(title)).split("\n");

  test('ligne 1 : "DARK (2017) · 16+"', () => {
    expect(lines(DARK)[0]).toBe("DARK (2017) · 16+");
  });

  test('ligne 1 : "AMÉLIE (2001) · Tout public" quand minimumAge vaut 0', () => {
    expect(lines(AMELIE)[0]).toBe("AMÉLIE (2001) · Tout public");
  });

  test('ligne 2 d\'une série : "★★★★★ 4.5/5 · 3 saisons · 26 épisodes" (note arrondie pour les étoiles)', () => {
    expect(lines(DARK)[1]).toBe("★★★★★ 4.5/5 · 3 saisons · 26 épisodes");
  });

  test('ligne 2 d\'un film : "★★★★☆ 4/5 · 2 h 2 min"', () => {
    expect(lines(AMELIE)[1]).toBe("★★★★☆ 4/5 · 2 h 2 min");
  });

  test('ligne 2 sans note : "Non noté · 1 h 35 min"', () => {
    expect(lines(MYSTERY)[1]).toBe("Non noté · 1 h 35 min");
  });

  test('ligne 3 : "Drame, Science-fiction" — majuscule initiale sur chaque genre', () => {
    expect(lines(DARK)[2]).toBe("Drame, Science-fiction");
    expect(lines(AMELIE)[2]).toBe("Comédie, Romance");
    expect(lines(MYSTERY)[2]).toBe("Thriller");
  });

  test('ligne 4 : "Réalisé par Baran bo Odar", ou "Réalisation inconnue"', () => {
    expect(lines(DARK)[3]).toBe("Réalisé par Baran bo Odar");
    expect(lines(MYSTERY)[3]).toBe("Réalisation inconnue");
  });

  test("la fiche fait exactement 4 lignes, sans espace en bout de ligne", () => {
    for (const title of [DARK, AMELIE, MYSTERY]) {
      const text = m.sheet(structuredClone(title));
      expect(text.split("\n")).toHaveLength(4);
      expect(text, "un espace traîne en fin de ligne").not.toMatch(/ \n| $/);
    }
  });

  test("sheet réutilise tes fonctions des quêtes 2 et 4 (import), au lieu de les réécrire", () => {
    expect(
      m.sheet.toString(),
      "on ne veut pas voir de ★ en dur dans sheet : importe stars",
    ).not.toMatch(/[★☆]/);
  });

  test("catalogueText([dark, amelie]) sépare les fiches par une ligne vide", () => {
    const text = m.catalogueText([structuredClone(DARK), structuredClone(AMELIE)]);
    expect(text).toBe(`${m.sheet(structuredClone(DARK))}\n\n${m.sheet(structuredClone(AMELIE))}`);
    expect(m.catalogueText([])).toBe("");
  });

  challenge("une série d'une saison s'écrit \"1 saison · 8 épisodes\", au singulier", () => {
    expect(lines({ ...structuredClone(DARK), seasons: [8] })[1]).toBe(
      "★★★★★ 4.5/5 · 1 saison · 8 épisodes",
    );
    expect(lines({ ...structuredClone(DARK), seasons: [1] })[1]).toBe(
      "★★★★★ 4.5/5 · 1 saison · 1 épisode",
    );
  });
}
