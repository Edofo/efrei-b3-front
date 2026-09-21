import type { QuestContext } from "../engine/core.ts";
import type { Card, Catalogue, Title } from "../src/types.ts";
import { catalogue, title as titleById } from "./_data.ts";

export const title = "Le modèle de vue";
export const file = "src/04-transform.ts";

export const lesson = `
La page d'accueil n'affiche pas un titre du catalogue : elle affiche une
**carte** — un nom, un sous-titre « 2017 · Série · 3 saisons », une
note. La donnée brute et ce qu'on montre sont deux formes différentes ;
passer de l'une à l'autre, c'est **transformer**.

## Un objet en donne un autre

\`\`\`
function toCard(title: Title): Card {
  return {
    id: title.id,
    title: title.title,
    url: \`/titres/\${title.id}\`,
    // …
  };
}
\`\`\`

Le type de retour est \`Card\` (voir \`src/types.ts\`) : oublie un champ et
le compilateur le dit ; ajoutes-en un et il le dit aussi. L'interface
**est** le contrat entre le back et la vue.

On ne renvoie **que** ce dont la vue a besoin, sous la forme dont elle a
besoin. Le \`poster\` de 1 500 caractères ne sert à rien dans un export
CSV ; la \`rating\` sert affichée avec une décimale, pas brute.

## map, encore lui

\`catalogue.titles.map(toCard)\` : la transformation d'un élément est
une fonction, la transformation de la liste est \`map\`. Garde-les
séparées, la première se teste seule.

## Suivre un ordre imposé

Une rangée est une liste d'\`ids\` dans un ordre choisi par l'éditorial.
Pour produire ses cartes **dans cet ordre**, on part des ids, pas des
titres :

\`\`\`
row.ids.map((id) => titles.find((t) => t.id === id))
\`\`\`

\`find\` peut renvoyer \`undefined\` (un id absent du catalogue), donc le
résultat est un \`(Title | undefined)[]\`. Il faut filtrer les trous **et**
le dire au compilateur : un **type guard** \`(t): t is Title => t !==
undefined\` fait les deux.
`;

export const mission = `
Dans \`src/04-transform.ts\` :
- \`toCard(title)\` → \`{ id, title, url, subtitle, rating }\` avec \`url\` = \`"/titres/<id>"\`, \`subtitle\` = \`"2017 · Série · 3 saisons"\` ou \`"1999 · Film · 136 min"\`, \`rating\` = la note ou \`null\`
- \`toCards(catalogue)\` → toutes les cartes, dans l'ordre du catalogue
- \`rowCards(catalogue, rowId)\` → les cartes de la rangée, dans l'ordre de ses \`ids\`
`;

interface Module {
  toCard(title: Title): Card;
  toCards(catalogue: Catalogue): Card[];
  rowCards(catalogue: Catalogue, rowId: string): Card[];
  toCsv(titles: Title[]): string;
}

export default function ({ test, challenge, expect }: QuestContext, m: Module): void {
  test("toCard(Dark) renvoie exactement { id, title, url, subtitle, rating }", () => {
    expect(m.toCard(titleById("dark"))).toEqual({
      id: "dark",
      title: "Dark",
      url: "/titres/dark",
      subtitle: "2017 · Série · 3 saisons",
      rating: 4.5,
    });
  });

  test('toCard(The Matrix) : subtitle "1999 · Film · 136 min"', () => {
    expect(m.toCard(titleById("matrix")).subtitle).toBe("1999 · Film · 136 min");
    expect(m.toCard(titleById("matrix")).url).toBe("/titres/matrix");
  });

  test("toCard(Chef's Table) : rating null quand il n'y en a pas, et « 6 saisons »", () => {
    const card = m.toCard(titleById("chef"));
    expect(card.rating).toBeNull();
    expect(card.subtitle).toBe("2015 · Série · 6 saisons");
  });

  test("toCard d'une série d'une saison : « 1 saison »", () => {
    expect(
      m.toCard({ ...titleById("dark"), year: 2020, seasons: [{ number: 1, episodes: 8 }] })
        .subtitle,
    ).toBe("2020 · Série · 1 saison");
  });

  test("toCard ne garde ni le poster ni les credits", () => {
    expect(Object.keys(m.toCard(titleById("dark"))).sort()).toEqual([
      "id",
      "rating",
      "subtitle",
      "title",
      "url",
    ]);
  });

  test("toCards(catalogue) renvoie 12 cartes dans l'ordre du catalogue", () => {
    const cards = m.toCards(catalogue());
    expect(cards).toHaveLength(12);
    expect(cards.map((c) => c.id)).toEqual([
      "elite",
      "matrix",
      "amelie",
      "dark",
      "casa",
      "arcane",
      "chef",
      "sense8",
      "squad",
      "ozark",
      "stranger",
      "narcos",
    ]);
  });

  test('rowCards(catalogue, "popular") suit l\'ordre de la rangée, pas celui du catalogue', () => {
    expect(m.rowCards(catalogue(), "popular").map((c) => c.title)).toEqual([
      "La Casa de Papel",
      "Stranger Things",
      "Dark",
      "Arcane",
      "The Matrix",
      "Sense8",
    ]);
  });

  test('rowCards(catalogue, "unknown") renvoie [], et les ids inconnus d\'une rangée sont ignorés', () => {
    expect(m.rowCards(catalogue(), "unknown")).toEqual([]);
    const withGhost = catalogue();
    withGhost.rows[0].ids = ["dark", "ghost", "ozark"];
    expect(m.rowCards(withGhost, "trending").map((c) => c.id)).toEqual(["dark", "ozark"]);
  });

  challenge(
    'toCsv(titles) : "id;title;year;rating" puis une ligne par titre, note vide si absente',
    () => {
      expect(m.toCsv([titleById("dark"), titleById("chef")])).toBe(
        "id;title;year;rating\ndark;Dark;2017;4.5\nchef;Chef's Table;2015;",
      );
      expect(m.toCsv([])).toBe("id;title;year;rating");
    },
  );
}
