import type { QuestContext } from "../engine/core.ts";
import type { Catalogue, Title } from "../src/types.ts";
import { catalogue, freeze, title as titleById } from "./_data.ts";

export const title = "Ne touche pas à l'original";
export const file = "src/07-immutability.ts";

export const lesson = `
Le catalogue est chargé une fois, puis partagé : la page d'accueil, la
recherche, le profil le lisent tous. Si \`rate\` modifie le catalogue en
place, **tout le monde** voit la nouvelle note — y compris l'écran qui
avait affiché l'ancienne et ne se redessinera pas. Ces bugs-là sont les
pires : ils apparaissent loin de la ligne fautive.

La règle : une fonction qui « change » une donnée **renvoie une nouvelle
donnée** et laisse l'original intact. On appelle ça l'immutabilité, et
c'est la base de React, Redux, et de tout ce que tu croiseras ensuite.

## Copier

\`\`\`
const copy = { ...catalogue };              // copie SUPERFICIELLE : titles est partagé
const copy = structuredClone(catalogue);    // copie PROFONDE : tout est dupliqué
\`\`\`

Le spread \`...\` ne copie qu'un niveau. \`copy.titles\` est le **même
tableau** que \`catalogue.titles\` : y faire un \`push\` modifie l'original.
\`structuredClone\` duplique tout, à tous les niveaux.

## Transformer sans muter

Souvent on n'a même pas besoin de copier : \`map\` et \`filter\` renvoient
déjà un nouveau tableau, et le spread construit un nouvel objet.

\`\`\`
const titles = catalogue.titles.map((t) =>
  t.id === id ? { ...t, rating } : t        // un nouvel objet pour celui qui change
);
return { ...catalogue, titles };            // un nouveau catalogue
\`\`\`

## readonly à la compilation, freeze à l'exécution

\`rate(catalogue: Readonly<Catalogue>, …)\` : le compilateur interdit
\`catalogue.titles = …\`. Il n'interdit pas \`catalogue.titles.push(…)\` —
\`Readonly\` est superficiel lui aussi. Alors les tests **gèlent** le
catalogue en profondeur avec \`Object.freeze\` : toute écriture lance
\`TypeError: Cannot assign to read only property\`. Si tu vois cette
erreur, tu as modifié l'original.
`;

export const mission = `
Dans \`src/07-immutability.ts\`, chaque fonction renvoie un **nouveau** catalogue :
- \`rate(catalogue, id, rating)\` → la note du titre changée
- \`addTitle(catalogue, title)\` → le titre en plus, à la fin de \`titles\`
- \`removeTitle(catalogue, id)\` → le titre retiré de \`titles\` **et** de toutes les rangées
`;

interface Module {
  rate(catalogue: Readonly<Catalogue>, id: string, rating: number): Catalogue;
  addTitle(catalogue: Readonly<Catalogue>, title: Title): Catalogue;
  removeTitle(catalogue: Readonly<Catalogue>, id: string): Catalogue;
  renameGenre(catalogue: Readonly<Catalogue>, from: string, to: string): Catalogue;
}

const ratingOf = (c: Catalogue, id: string): number | null | undefined =>
  c.titles.find((t) => t.id === id)?.rating;

export default function ({ test, challenge, expect }: QuestContext, m: Module): void {
  test('rate(catalogue, "dark", 3) : le nouveau catalogue a la note 3', () => {
    const result = m.rate(freeze(catalogue()), "dark", 3);
    expect(ratingOf(result, "dark")).toBe(3);
    expect(result.titles).toHaveLength(12);
    expect(result.rows).toHaveLength(3);
  });

  test("rate ne modifie pas le catalogue reçu (gelé)", () => {
    const original = freeze(catalogue());
    const result = m.rate(original, "dark", 3);
    expect(ratingOf(original, "dark")).toBe(4.5);
    expect(result === original, "tu renvoies l'objet reçu : il en faut un nouveau").toBe(false);
  });

  test("rate d'un id inconnu renvoie un catalogue équivalent", () => {
    expect(m.rate(freeze(catalogue()), "ghost", 3)).toEqual(catalogue());
  });

  test("addTitle : 13 titres dans le nouveau, 12 dans l'original", () => {
    const original = freeze(catalogue());
    const added: Title = { ...titleById("dark"), id: "new", title: "Nouveau" };
    const result = m.addTitle(original, added);
    expect(result.titles).toHaveLength(13);
    expect(result.titles[12]).toEqual(added);
    expect(original.titles).toHaveLength(12);
  });

  test('removeTitle(catalogue, "dark") : plus de Dark dans titles', () => {
    const result = m.removeTitle(freeze(catalogue()), "dark");
    expect(result.titles).toHaveLength(11);
    expect(result.titles.map((t) => t.id)).not.toContain("dark");
  });

  test('removeTitle(catalogue, "dark") : plus de "dark" dans les rangées non plus', () => {
    const result = m.removeTitle(freeze(catalogue()), "dark");
    expect(result.rows[0].ids).toEqual(["elite", "matrix", "amelie", "casa", "arcane"]);
    expect(result.rows[2].ids).toEqual(["casa", "stranger", "arcane", "matrix", "sense8"]);
    expect(result.rows[1].ids).toHaveLength(6);
  });

  test("removeTitle ne modifie pas l'original (titles ni rows)", () => {
    const original = freeze(catalogue());
    m.removeTitle(original, "dark");
    expect(original.titles).toHaveLength(12);
    expect(original.rows[0].ids).toHaveLength(6);
  });

  challenge(
    'renameGenre(catalogue, "science-fiction", "sf") renomme le genre dans tous les titres, sans toucher à l\'original',
    () => {
      const original = freeze(catalogue());
      const result = m.renameGenre(original, "science-fiction", "sf");
      expect(result.titles.find((t) => t.id === "dark")?.genres).toEqual([
        "drame",
        "sf",
        "thriller",
      ]);
      expect(result.titles.filter((t) => t.genres.includes("sf"))).toHaveLength(4);
      expect(result.titles.filter((t) => t.genres.includes("science-fiction"))).toHaveLength(0);
      expect(original.titles.find((t) => t.id === "dark")?.genres).toEqual([
        "drame",
        "science-fiction",
        "thriller",
      ]);
    },
  );
}
