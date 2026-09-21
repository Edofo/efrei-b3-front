import type { QuestContext } from "../engine/core.ts";
import type { Profile, Title } from "../src/types.ts";
import { catalogue, title as titleById } from "./_catalogue.ts";

export const title = "BOSS · Le moteur de recommandation";
export const file = "src/10-boss-recommendations.ts";

export const lesson = `
Tout est là. Il ne reste qu'à assembler le moteur : « parce que vous avez
aimé *Dark* ».

## Le score

Un profil dit ce qu'il aime et ce qu'il a déjà vu :

\`\`\`
const profile: Profile = { favoriteGenres: ["drame", "thriller"], watched: ["dark", "ozark"] };
\`\`\`

Le score d'un titre pour ce profil :

\`\`\`
score = (nombre de genres en commun) × 10 + note × 2
\`\`\`

Un titre sans note compte pour \`rating = 0\`. Pour les genres en commun,
tu as déjà écrit \`intersection\` (quête 5) : le fichier l'importe.

## Recommander

1. Écarter les titres déjà vus (par \`id\`).
2. Calculer le score de chacun.
3. Trier par score décroissant, puis par nom (\`localeCompare\`).
4. Garder les \`n\` premiers (3 par défaut).

Le résultat est une liste de **titres** (les objets du catalogue), pas de
noms ni de scores. Et le catalogue reçu ne doit pas être modifié :
\`readonly\` le dit, le test le vérifie.

## Ce qu'on regarde dans ton code

Pas la longueur. La **décomposition** : \`score\` à part, testable seule ;
\`recommend\` qui enchaîne filter → map → sort → slice, sans boucle
imbriquée ; aucune donnée d'entrée modifiée ; une constante nommée pour
chaque nombre magique.
`;

export const mission = `
Dans \`src/10-boss-recommendations.ts\` :
- \`score(title, profile)\` → le nombre
- \`recommend(titles, profile, n = 3)\` → les \`n\` titres recommandés, du meilleur score au moins bon
`;

interface Module {
  score(title: Title, profile: Profile): number;
  recommend(titles: readonly Title[], profile: Profile, n?: number): Title[];
  explain(title: Title, profile: Profile): string;
}

const PROFILE = (): Profile => ({
  favoriteGenres: ["drame", "thriller"],
  watched: ["dark", "ozark"],
});
const unrated = (genres: string[], rating?: number | null): Title => ({
  id: "x",
  title: "?",
  kind: "series",
  year: 2020,
  genres,
  rating,
  minimumAge: 0,
});

export default function ({ test, challenge, expect }: QuestContext, m: Module): void {
  test("score(Dark, profil) renvoie 29 : 2 genres en commun (20) + note 4.5 × 2 (9)", () => {
    expect(m.score(titleById("dark"), PROFILE())).toBe(29);
  });

  test("score(Amélie, profil) renvoie 8.4 : aucun genre en commun, note 4.2", () => {
    expect(m.score(titleById("amelie"), PROFILE())).toBeCloseTo(8.4, 5);
  });

  test("score d'un titre sans note : seulement les genres", () => {
    expect(m.score(unrated(["drame"]), PROFILE())).toBe(10);
    expect(m.score(unrated(["drame"], null), PROFILE())).toBe(10);
    expect(m.score(unrated([]), PROFILE())).toBe(0);
  });

  test("score utilise intersection (importée de la quête 5) plutôt que de la réécrire", () => {
    expect(m.score.toString()).toMatch(/intersection\(/);
  });

  test("recommend écarte les titres déjà vus", () => {
    const ids = m.recommend(catalogue(), PROFILE(), 12).map((t) => t.id);
    expect(ids).not.toContain("dark");
    expect(ids).not.toContain("ozark");
    expect(ids).toHaveLength(10);
  });

  test("recommend(catalogue, profil) renvoie Narcos (28.6), Élite (27.6), Arcane (19.6)", () => {
    expect(m.recommend(catalogue(), PROFILE()).map((t) => t.title)).toEqual([
      "Narcos",
      "Élite",
      "Arcane",
    ]);
  });

  test("recommend trie par score décroissant, puis par nom à score égal", () => {
    const actionFan: Profile = { favoriteGenres: ["action"], watched: [] };
    // matrix 10+9.4=19.4 · arcane 10+9.6=19.6 · casa 10+8=18 · squad 10+7.4=17.4
    expect(m.recommend(catalogue(), actionFan, 4).map((t) => t.id)).toEqual([
      "arcane",
      "matrix",
      "casa",
      "squad",
    ]);
    const noTaste: Profile = { favoriteGenres: [], watched: [] };
    // ozark et narcos : 8.6 tous les deux → Narcos avant Ozark
    const ids = m.recommend(catalogue(), noTaste, 12).map((t) => t.id);
    expect(ids.indexOf("narcos")).toBeLessThan(ids.indexOf("ozark"));
  });

  test("recommend renvoie des titres (objets avec id, title, genres), et n vaut 3 par défaut", () => {
    const result = m.recommend(catalogue(), PROFILE());
    expect(result).toHaveLength(3);
    expect(result[0]).toHaveProperty("id", "narcos");
    expect(result[0]).toHaveProperty("genres");
  });

  test("recommend ne modifie pas le catalogue reçu", () => {
    const titles = catalogue();
    const before = JSON.stringify(titles);
    m.recommend(titles, PROFILE());
    expect(JSON.stringify(titles), "le catalogue a été trié ou modifié sur place").toBe(before);
  });

  challenge(
    'explain(Dark, profil) renvoie "Dark : 2 genres en commun (drame, thriller), note 4.5 → score 29"',
    () => {
      expect(m.explain(titleById("dark"), PROFILE())).toBe(
        "Dark : 2 genres en commun (drame, thriller), note 4.5 → score 29",
      );
      expect(m.explain(titleById("chef"), PROFILE())).toBe(
        "Chef's Table : aucun genre en commun, note 3.9 → score 7.8",
      );
      expect(m.explain(titleById("sense8"), PROFILE())).toBe(
        "Sense8 : 1 genre en commun (drame), note 4.1 → score 18.2",
      );
      expect(m.explain(unrated(["drame"]), PROFILE())).toBe(
        "? : 1 genre en commun (drame), non noté → score 10",
      );
    },
  );
}
