import type { QuestContext } from "../engine/core.ts";
import type { Catalogue, SearchRequest, SearchResponse } from "../src/types.ts";
import { catalogue, freeze } from "./_data.ts";

export const title = "BOSS · L'API du catalogue";
export const file = "src/10-boss-api.ts";

export const lesson = `
Le front demande « les thrillers, triés par note, page 2 ». Le back
répond avec un JSON : les résultats de la page, et de quoi afficher la
pagination. Tu écris cette réponse — sans serveur, juste la fonction.

## La requête

\`\`\`
const request: SearchRequest = { q: "ark", genre: "thriller", kind: "series", sort: "rating", page: 2, perPage: 5 };
\`\`\`

Tous les champs sont optionnels (\`SearchRequest\`, dans \`src/types.ts\`).
Par défaut : \`sort = "rating"\`, \`page = 1\`, \`perPage = 5\`. Une
destructuration avec valeurs par défaut les lit en une ligne :

\`\`\`
const { q, genre, kind, sort = "rating", page = 1, perPage = 5 } = request;
\`\`\`

## La réponse

\`\`\`
{
  page: 2, perPage: 5,
  total: 6,           // combien de titres correspondent, toutes pages confondues
  pages: 2,           // Math.ceil(total / perPage)
  results: [ …cartes… ]   // les cartes de la quête 4 (importe toCard)
}
\`\`\`

## L'ordre des opérations

1. **Filtrer** : \`q\` (le nom contient, sans tenir compte de la casse),
   \`genre\` (présent dans \`genres\`), \`kind\`. Un critère absent ne filtre pas.
2. **Trier** : \`"rating"\` décroissante (les titres sans note en dernier),
   \`"title"\` alphabétique, \`"year"\` croissante. Toujours le nom pour
   départager. Un \`Record<SortKey, Comparator>\` garde les trois
   comparateurs au même endroit.
3. **Paginer** : \`slice((page - 1) * perPage, page * perPage)\`.
4. **Transformer** en cartes.

Filtrer avant de trier (moins d'éléments à trier), trier avant de
paginer (sinon la page 1 n'est pas le top), transformer en dernier
(uniquement ce qu'on renvoie).

## Le catalogue ne bouge pas

Comme toujours. Le paramètre est \`Readonly<Catalogue>\` et le test le gèle.
`;

export const mission = `
Dans \`src/10-boss-api.ts\` :
- \`respond(catalogue, request = {})\` → \`{ page, perPage, total, pages, results }\`
`;

interface Module {
  respond(catalogue: Readonly<Catalogue>, request?: SearchRequest): SearchResponse;
}

export default function ({ test, challenge, expect }: QuestContext, m: Module): void {
  const names = (response: SearchResponse): string[] => response.results.map((card) => card.title);

  test("respond(catalogue) : page 1 sur 3, 12 au total, 5 résultats du mieux noté au moins bien noté", () => {
    const response = m.respond(freeze(catalogue()));
    expect(response.page).toBe(1);
    expect(response.perPage).toBe(5);
    expect(response.total).toBe(12);
    expect(response.pages).toBe(3);
    expect(names(response)).toEqual(["Arcane", "The Matrix", "Dark", "Stranger Things", "Narcos"]);
  });

  test("les résultats sont des cartes (quête 4) : { id, title, url, subtitle, rating }", () => {
    const response = m.respond(freeze(catalogue()));
    expect(response.results[0]).toEqual({
      id: "arcane",
      title: "Arcane",
      url: "/titres/arcane",
      subtitle: "2021 · Série · 2 saisons",
      rating: 4.8,
    });
    expect(m.respond.toString(), "importe toCard depuis ./04-transform.ts").toMatch(/toCard/);
  });

  test("page 2 : Ozark, Amélie, Sense8, La Casa de Papel, Élite ; page 3 : Elite Squad puis Chef's Table (sans note, dernier)", () => {
    expect(names(m.respond(freeze(catalogue()), { page: 2 }))).toEqual([
      "Ozark",
      "Amélie",
      "Sense8",
      "La Casa de Papel",
      "Élite",
    ]);
    expect(names(m.respond(freeze(catalogue()), { page: 3 }))).toEqual([
      "Elite Squad",
      "Chef's Table",
    ]);
  });

  test("page 4 : aucun résultat, mais total et pages restent justes", () => {
    const response = m.respond(freeze(catalogue()), { page: 4 });
    expect(response.results).toEqual([]);
    expect(response.total).toBe(12);
    expect(response.pages).toBe(3);
    expect(response.page).toBe(4);
  });

  test("perPage: 12 → une seule page de 12", () => {
    const response = m.respond(freeze(catalogue()), { perPage: 12 });
    expect(response.results).toHaveLength(12);
    expect(response.pages).toBe(1);
  });

  test('genre: "thriller" → 6 titres : Dark, Narcos, Ozark, La Casa de Papel, Élite, Elite Squad', () => {
    const response = m.respond(freeze(catalogue()), { genre: "thriller", perPage: 10 });
    expect(response.total).toBe(6);
    expect(names(response)).toEqual([
      "Dark",
      "Narcos",
      "Ozark",
      "La Casa de Papel",
      "Élite",
      "Elite Squad",
    ]);
  });

  test('q: "ark" → Dark, Ozark (sans tenir compte de la casse) ; q: "AR" → 4 titres (Dark, Arcane, Ozark, Narcos)', () => {
    expect(names(m.respond(freeze(catalogue()), { q: "ark" }))).toEqual(["Dark", "Ozark"]);
    expect(m.respond(freeze(catalogue()), { q: "AR" }).total).toBe(4);
    expect(m.respond(freeze(catalogue()), { q: "zzz" })).toEqual({
      page: 1,
      perPage: 5,
      total: 0,
      pages: 0,
      results: [],
    });
  });

  test('kind: "movie" → The Matrix, Amélie, Elite Squad ; combiné avec genre: "action" → The Matrix, Elite Squad', () => {
    expect(names(m.respond(freeze(catalogue()), { kind: "movie" }))).toEqual([
      "The Matrix",
      "Amélie",
      "Elite Squad",
    ]);
    expect(names(m.respond(freeze(catalogue()), { kind: "movie", genre: "action" }))).toEqual([
      "The Matrix",
      "Elite Squad",
    ]);
  });

  test('sort: "title" → Amélie, Arcane, Chef\'s Table, Dark, Élite… ; sort: "year" → 1999, 2001, 2007, puis 2015 départagé par nom', () => {
    expect(names(m.respond(freeze(catalogue()), { sort: "title" }))).toEqual([
      "Amélie",
      "Arcane",
      "Chef's Table",
      "Dark",
      "Élite",
    ]);
    expect(names(m.respond(freeze(catalogue()), { sort: "year", perPage: 6 }))).toEqual([
      "The Matrix",
      "Amélie",
      "Elite Squad",
      "Chef's Table",
      "Narcos",
      "Sense8",
    ]);
  });

  test("le catalogue reçu n'est pas modifié (il est gelé : toute écriture lance une TypeError)", () => {
    const c = freeze(catalogue());
    const before = JSON.stringify(c);
    m.respond(c, { sort: "title" });
    m.respond(c, { sort: "year" });
    expect(JSON.stringify(c)).toBe(before);
  });

  challenge(
    'q ignore les accents : q: "elite" → Élite et Elite Squad ; q: "amelie" → Amélie',
    () => {
      expect(names(m.respond(freeze(catalogue()), { q: "elite" }))).toEqual([
        "Élite",
        "Elite Squad",
      ]);
      expect(m.respond(freeze(catalogue()), { q: "amelie" }).total).toBe(1);
      expect(m.respond(freeze(catalogue()), { q: "ÉLITE" }).total).toBe(2);
    },
  );
}
