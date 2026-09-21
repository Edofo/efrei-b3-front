import type { BrowserQuestContext } from "../engine/browser.ts";
import { catalogue, must, rowHtml } from "./_fixtures.ts";

export const title = "Trouver dans la page";
export const file = "src/01-select.ts";

export const lesson = `
La page d'accueil existe (bloc 2). Le JavaScript tourne dans le
navigateur, et il voit la page sous forme d'un **arbre d'objets** : le
DOM (Document Object Model). Chaque balise est un objet, avec ses
attributs, son texte, ses enfants. Avant de modifier quoi que ce soit, il
faut savoir **trouver** un élément.

## Les sélecteurs CSS, encore eux

\`\`\`
root.querySelector("h1")              // le PREMIER h1, ou null
root.querySelector(".card-title")     // par classe
root.querySelector("#search")         // par id
root.querySelectorAll(".card")        // TOUS : une NodeList
\`\`\`

Tout ce que tu sais écrire en CSS marche ici : \`.row .card\`,
\`li[data-id="dark"]\`, \`.track > li:first-child\`.

## Les types : querySelector renvoie Element | null

Le compilateur ne sait pas ce que ton sélecteur va trouver, donc il te
donne \`Element | null\`. Deux conséquences : vérifie le \`null\` (ou
renvoie-le quand le contrat l'autorise), et précise le type quand tu en
as besoin : \`root.querySelector<HTMLElement>(".card")\`. \`HTMLElement\` a
\`dataset\` et \`hidden\` ; un simple \`Element\`, non.

## NodeList n'est pas un tableau

\`querySelectorAll\` renvoie une \`NodeList\` : on peut la parcourir avec
\`for…of\` et lire sa \`length\`, mais elle n'a **ni** \`map\` **ni** \`filter\`.
Pour retrouver tes outils du bloc 3 : \`[...list]\` ou \`Array.from(list)\`.

## Lire le texte

\`el.textContent\` donne tout le texte d'un élément, sous-éléments compris,
espaces et retours à la ligne inclus tels qu'ils sont dans le HTML. Un
\`.trim()\` s'impose presque toujours. Son type est \`string | null\` : \`?? ""\`.

## Remonter : closest

\`el.closest(".row")\` cherche l'ancêtre le plus proche (lui-même compris)
qui correspond au sélecteur. C'est le miroir de \`querySelector\`, vers le
haut.

## Pourquoi « root » et pas « document » ?

Les tests te passent une **racine** : un morceau de page isolé. Toujours
chercher à partir de ce qu'on te donne, jamais depuis \`document\` — sinon
ta fonction ne marche que sur *une* page, et jamais deux fois sur la même.
\`ParentNode\` est le type que \`document\` et n'importe quel élément
satisfont.
`;

export const mission = `
Dans \`src/01-select.ts\` (\`root\` est un \`ParentNode\`) :
- \`mainTitle(root)\` → le texte du \`h1\`, sans espaces autour
- \`cardCount(root)\` → combien de \`.card\`
- \`cardTitles(root)\` → un **tableau** des textes des \`.card-title\`
- \`cardByTitle(root, title)\` → l'élément \`li.card\` dont le titre correspond, ou \`null\`
`;

interface Module {
  mainTitle(root: ParentNode): string;
  cardCount(root: ParentNode): number;
  cardTitles(root: ParentNode): string[];
  cardByTitle(root: ParentNode, title: string): HTMLElement | null;
  rowOf(card: Element): string;
}

const PAGE = (): string => {
  const c = catalogue();
  return `<h1 class="hero-title">
    Dark
  </h1>
  <div class="rows">
    ${rowHtml({ id: "a", title: "Tendances actuelles", ids: ["dark", "arcane", "ozark"] }, c.titles)}
    ${rowHtml({ id: "b", title: "Populaires", ids: ["casa", "matrix"] }, c.titles)}
  </div>`;
};

export default function (
  { test, challenge, expect, sandbox }: BrowserQuestContext,
  m: Module,
): void {
  test('mainTitle(root) renvoie "Dark", sans les espaces ni retours à la ligne autour', () => {
    expect(m.mainTitle(sandbox(PAGE()))).toBe("Dark");
    expect(m.mainTitle(sandbox("<h1>  Arcane </h1>"))).toBe("Arcane");
  });

  test("cardCount(root) renvoie 5", () => {
    expect(m.cardCount(sandbox(PAGE()))).toBe(5);
    expect(m.cardCount(sandbox('<ul class="track"></ul>'))).toBe(0);
  });

  test('cardTitles(root) renvoie ["Dark", "Arcane", "Ozark", "La Casa de Papel", "The Matrix"]', () => {
    const result = m.cardTitles(sandbox(PAGE()));
    expect(Array.isArray(result), "une NodeList n'est pas un tableau : Array.from ou [...]").toBe(
      true,
    );
    expect(result).toEqual(["Dark", "Arcane", "Ozark", "La Casa de Papel", "The Matrix"]);
  });

  test('cardByTitle(root, "Ozark") renvoie le li.card de data-id "ozark"', () => {
    const card = m.cardByTitle(sandbox(PAGE()), "Ozark");
    expect(card).toBeInstanceOf(HTMLElement);
    expect(card?.tagName).toBe("LI");
    expect(card).toHaveClass("card");
    expect(card?.dataset.id).toBe("ozark");
  });

  test('cardByTitle(root, "Inconnu") renvoie null', () => {
    expect(m.cardByTitle(sandbox(PAGE()), "Inconnu")).toBeNull();
  });

  test("les fonctions cherchent depuis root, jamais depuis document", () => {
    const source = [m.mainTitle, m.cardCount, m.cardTitles, m.cardByTitle]
      .map((fn) => fn.toString())
      .join("\n");
    expect(source).not.toMatch(/document\.(querySelector|getElement)/);
  });

  challenge(
    'rowOf(card) renvoie "Tendances actuelles" — le titre de la section qui contient la carte',
    () => {
      const root = sandbox(PAGE());
      expect(m.rowOf(must(root, '[data-id="arcane"]'))).toBe("Tendances actuelles");
      expect(m.rowOf(must(root, '[data-id="matrix"]'))).toBe("Populaires");
      expect(
        m.rowOf(must(root, '[data-id="matrix"] .card-title')),
        "depuis le h3, il faut remonter",
      ).toBe("Populaires");
    },
  );
}
