import type { BrowserQuestContext } from "../engine/browser.ts";
import type { Catalogue, Row, Title } from "../src/types.ts";
import { catalogue, must, SKELETON_HTML, titles } from "./_fixtures.ts";

export const title = "Remplir les rangées";
export const file = "src/04-fill.ts";

export const lesson = `
Une carte, c'est fait. Une rangée, c'est une liste de cartes ; la page,
c'est une liste de rangées. Même mouvement à chaque niveau : **vider,
fabriquer, attacher**.

## Attacher plusieurs enfants

\`\`\`
list.replaceChildren();                    // on vide
for (const t of titles) list.append(createCard(t));
\`\`\`

Ou en une ligne : \`list.replaceChildren(...titles.map(createCard))\` —
vider et remplir d'un coup.

## Le coût d'un append

À chaque \`append\`, le navigateur note qu'il devra recalculer la mise en
page. Pour six cartes, c'est invisible. Pour six cents, le
\`DocumentFragment\` sert de brouillon : on y attache tout, puis on attache
le brouillon **une seule fois**. Le fragment se vide dans la cible.

\`\`\`
const fragment = document.createDocumentFragment();
for (const t of titles) fragment.append(createCard(t));
list.append(fragment);           // une seule insertion
\`\`\`

## Réutiliser

\`createCard\` vient de ta quête 2 : le fichier l'importe. Tu ne réécris
jamais une carte, tu appelles la fonction qui sait le faire.

## La structure d'une rangée

Celle du bloc 2, encore :

\`\`\`
section.row[aria-labelledby="row-<id>"]
  h2.row-title#row-<id>          le titre de la rangée
  div.row-viewport
    button.arrow.arrow-left[aria-label="Faire défiler <titre> vers la gauche"]
    ul.track                     les cartes, dans l'ordre des ids
    button.arrow.arrow-right[aria-label="Faire défiler <titre> vers la droite"]
\`\`\`
`;

export const mission = `
Dans \`src/04-fill.ts\` :
- \`fillRow(list, titles)\` → vide \`list\` puis y attache une carte par titre
- \`createRow(row, titles)\` → la \`section.row\` ; \`row\` = \`{ id, title, ids }\`, \`titles\` = le tableau du catalogue (les ids inconnus sont ignorés)
- \`mountRows(container, catalogue)\` → vide le conteneur, puis une section par élément de \`catalogue.rows\`
`;

interface Module {
  fillRow(list: HTMLUListElement, titles: Title[]): void;
  createRow(row: Row, titles: Title[]): HTMLElement;
  mountRows(container: HTMLElement, catalogue: Catalogue): void;
}

const ids = (parent: ParentNode): string[] =>
  [...parent.querySelectorAll<HTMLElement>(":scope > li")].map((li) => li.dataset.id ?? "");

export default function (
  { test, challenge, expect, sandbox, wait }: BrowserQuestContext,
  m: Module,
): void {
  test("fillRow(list, [dark, arcane, ozark]) attache 3 cartes, dans l'ordre", () => {
    const list = must<HTMLUListElement>(sandbox('<ul class="track"></ul>'), "ul");
    m.fillRow(list, titles("dark", "arcane", "ozark"));
    expect(list.querySelectorAll(":scope > li.card")).toHaveLength(3);
    expect(ids(list)).toEqual(["dark", "arcane", "ozark"]);
  });

  test("fillRow vide d'abord : appelée deux fois, toujours 3 cartes", () => {
    const list = must<HTMLUListElement>(
      sandbox('<ul class="track"><li class="card">vieux</li></ul>'),
      "ul",
    );
    m.fillRow(list, titles("dark", "arcane", "ozark"));
    m.fillRow(list, titles("dark", "arcane", "ozark"));
    expect(list.children).toHaveLength(3);
    expect(list.textContent).not.toContain("vieux");
  });

  test("fillRow réutilise createCard (import de la quête 2)", () => {
    expect(m.fillRow.toString()).toMatch(/createCard/);
  });

  test("createRow : section.row avec son h2 et son aria-labelledby", () => {
    const section = m.createRow(
      { id: "trending", title: "Tendances actuelles", ids: ["dark", "arcane"] },
      catalogue().titles,
    );
    expect(section).toBeInstanceOf(HTMLElement);
    expect(section.tagName).toBe("SECTION");
    expect(section).toHaveClass("row");
    expect(section).toHaveAttribute("aria-labelledby", "row-trending");
    const h2 = section.querySelector(":scope > h2.row-title");
    expect(h2).not.toBeNull();
    expect(h2).toHaveAttribute("id", "row-trending");
    expect(h2).toHaveTextContent("Tendances actuelles");
    sandbox().append(section);
  });

  test("createRow : le viewport, les deux flèches et leurs aria-label", () => {
    const section = m.createRow(
      { id: "trending", title: "Tendances actuelles", ids: ["dark"] },
      catalogue().titles,
    );
    const viewport = section.querySelector(":scope > div.row-viewport");
    expect(viewport).not.toBeNull();
    const left = viewport?.querySelector("button.arrow.arrow-left");
    const right = viewport?.querySelector("button.arrow.arrow-right");
    expect(left).not.toBeNull();
    expect(right).not.toBeNull();
    expect(left).toHaveAttribute("aria-label", "Faire défiler Tendances actuelles vers la gauche");
    expect(right).toHaveAttribute("aria-label", "Faire défiler Tendances actuelles vers la droite");
    expect(left).toHaveAttribute("type", "button");
    expect(viewport?.children[0]).toBe(left);
    expect(viewport?.children[viewport.children.length - 1]).toBe(right);
    sandbox().append(section);
  });

  test("createRow : les cartes dans ul.track, dans l'ordre des ids, ids inconnus ignorés", () => {
    const section = m.createRow(
      { id: "x", title: "X", ids: ["ozark", "ghost", "dark"] },
      catalogue().titles,
    );
    const list = section.querySelector(".row-viewport > ul.track");
    expect(list).not.toBeNull();
    expect(ids(list as Element)).toEqual(["ozark", "dark"]);
    sandbox().append(section);
  });

  test("mountRows(container, catalogue) : le squelette disparaît, 3 sections, 18 cartes", () => {
    const rows = must<HTMLElement>(sandbox(`<div class="rows">${SKELETON_HTML}</div>`), ".rows");
    m.mountRows(rows, catalogue());
    expect(rows.querySelector("#skeleton")).toBeNull();
    expect(rows.querySelectorAll(":scope > section.row")).toHaveLength(3);
    expect(rows.querySelectorAll(".card")).toHaveLength(18);
    expect([...rows.querySelectorAll("h2")].map((h) => h.textContent?.trim())).toEqual([
      "Tendances actuelles",
      "Reprendre avec le profil de Nolan",
      "Populaires sur NOLANFLIX",
    ]);
  });

  challenge(
    "fillRow insère en une seule fois (DocumentFragment ou append(...liste)) : au plus 2 mutations sur le ul",
    async () => {
      const list = must<HTMLUListElement>(
        sandbox('<ul class="track"><li class="card">vieux</li></ul>'),
        "ul",
      );
      const mutations: MutationRecord[] = [];
      const observer = new MutationObserver((records) => mutations.push(...records));
      observer.observe(list, { childList: true });
      m.fillRow(list, titles("dark", "arcane", "ozark", "casa", "matrix", "sense8"));
      await wait(0);
      observer.disconnect();
      expect(list.children).toHaveLength(6);
      expect(
        mutations.length,
        "chaque append séparé est une mutation : regroupe-les",
      ).toBeLessThanOrEqual(2);
    },
  );
}
