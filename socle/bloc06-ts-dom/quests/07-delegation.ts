import type { BrowserQuestContext } from "../engine/browser.ts";
import type { CardCallback } from "../src/types.ts";
import { cardHtml, must, title as titleById } from "./_fixtures.ts";

export const title = "Un seul écouteur";
export const file = "src/07-delegation.ts";

export const lesson = `
Dix-huit cartes, un clic possible sur chacune. Le réflexe : dix-huit
\`addEventListener\`. Puis la recherche filtre, une rangée se recharge,
des cartes apparaissent — et elles n'ont pas d'écouteur.

## Les événements remontent

Un clic sur le \`h3\` d'une carte est d'abord vu par le \`h3\`, puis par le
\`div\`, le \`a\`, le \`li\`, le \`ul\`… jusqu'à \`document\`. C'est la
**propagation** (bubbling). Un écouteur posé sur le \`ul\` reçoit donc
tous les clics de toutes les cartes — celles d'aujourd'hui et celles
qu'on ajoutera demain.

\`\`\`
list.addEventListener("click", (event) => {
  const card = (event.target as Element).closest<HTMLElement>(".card");
  if (!card || !list.contains(card)) return;   // clic ailleurs : on ignore
  callback(card.dataset.id ?? "", card);
});
\`\`\`

\`event.target\` est l'élément **exact** qui a reçu le clic (le \`h3\`,
l'\`img\`). Il est typé \`EventTarget | null\` — trop vague pour appeler
\`closest\` dessus — d'où le \`as Element\`. \`closest(".card")\` remonte
jusqu'à la carte. C'est la **délégation**.

## Annuler le comportement natif

Cliquer sur un \`<a href="/titres/dark">\` navigue vers cette URL. Pour
gérer le clic en TypeScript à la place, \`event.preventDefault()\`. Les
tests vérifient que l'événement a bien été annulé.

## focus ne remonte pas

Presque tous les événements se propagent. Quelques-uns non : \`focus\`,
\`blur\`, \`mouseenter\`, \`mouseleave\`. Pour déléguer le focus, on écoute
\`focusin\` (et \`focusout\`), qui sont leurs versions propagées.

## Rester poli avec la souris

Ctrl+clic (Cmd+clic sur Mac) ou clic molette sur un lien, c'est « ouvre
dans un nouvel onglet ». Un gestionnaire qui l'annule rend les gens fous.
\`event.ctrlKey\`, \`event.metaKey\`, \`event.button\` disent ce qui s'est passé.
`;

export const mission = `
Dans \`src/07-delegation.ts\` :
- \`bindSelection(list, callback)\` → **un seul** écouteur \`click\` sur \`list\` ; un clic n'importe où dans une \`.card\` appelle \`callback(id, card)\` et annule la navigation ; un clic hors carte ne fait rien
- \`bindFocus(list, callback)\` → quand un élément d'une carte reçoit le focus, \`callback(id, card)\`
`;

interface Module {
  bindSelection(list: HTMLElement, callback: CardCallback): void;
  bindFocus(list: HTMLElement, callback: CardCallback): void;
}

const LIST = (): string =>
  `<ul class="track">${["dark", "arcane", "ozark"].map((id) => cardHtml(titleById(id))).join("")}</ul>`;
const click = (el: Element, init: MouseEventInit = {}): MouseEvent => {
  const event = new MouseEvent("click", { bubbles: true, cancelable: true, ...init });
  el.dispatchEvent(event);
  return event;
};

export default function (
  { test, challenge, expect, sandbox, wasPrevented }: BrowserQuestContext,
  m: Module,
): void {
  const list = (): HTMLElement => must(sandbox(LIST()), "ul");

  test("un clic sur le h3 d'une carte appelle callback(id, card)", () => {
    const ul = list();
    const calls: [string, HTMLElement][] = [];
    m.bindSelection(ul, (id, card) => calls.push([id, card]));
    click(must(ul, '[data-id="arcane"] .card-title'));
    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toBe("arcane");
    expect(calls[0][1]).toBe(must(ul, '[data-id="arcane"]'));
  });

  test("un clic sur l'image ou le lien marche aussi, et la navigation est annulée", () => {
    const ul = list();
    const ids: string[] = [];
    m.bindSelection(ul, (id) => ids.push(id));
    const e1 = click(must(ul, '[data-id="dark"] img'));
    const e2 = click(must(ul, '[data-id="ozark"] a'));
    expect(ids).toEqual(["dark", "ozark"]);
    expect(wasPrevented(e1), "preventDefault() manque : le navigateur suivrait le lien").toBe(true);
    expect(wasPrevented(e2)).toBe(true);
  });

  test("un clic sur le ul lui-même (hors carte) ne fait rien", () => {
    const ul = list();
    const ids: string[] = [];
    m.bindSelection(ul, (id) => ids.push(id));
    click(ul);
    expect(ids).toEqual([]);
  });

  test("un seul addEventListener sur le ul — pas un par carte", () => {
    const ul = list();
    let onList = 0;
    let onCards = 0;
    const original = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (
      this: EventTarget,
      ...args: Parameters<typeof original>
    ) {
      if (this === ul) onList++;
      else if (this instanceof Element && ul.contains(this)) onCards++;
      return original.apply(this, args);
    };
    try {
      m.bindSelection(ul, () => {});
    } finally {
      EventTarget.prototype.addEventListener = original;
    }
    expect(onCards, "des écouteurs ont été posés sur les cartes").toBe(0);
    expect(onList).toBe(1);
  });

  test("une carte ajoutée APRÈS le branchement réagit aussi : c'est tout l'intérêt", () => {
    const ul = list();
    const ids: string[] = [];
    m.bindSelection(ul, (id) => ids.push(id));
    ul.insertAdjacentHTML("beforeend", cardHtml(titleById("casa")));
    click(must(ul, '[data-id="casa"] .card-title'));
    expect(ids).toEqual(["casa"]);
  });

  test("bindFocus : focusin sur le lien d'une carte appelle callback(id, card)", () => {
    const ul = list();
    const calls: [string, HTMLElement][] = [];
    m.bindFocus(ul, (id, card) => calls.push([id, card]));
    must(ul, '[data-id="ozark"] a').dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toBe("ozark");
    expect(calls[0][1]).toBe(must(ul, '[data-id="ozark"]'));
  });

  test("bindFocus écoute focusin (qui se propage), pas focus (qui ne se propage pas)", () => {
    expect(m.bindFocus.toString()).toMatch(/["']focusin["']/);
  });

  challenge(
    "bindSelection laisse passer Ctrl/Cmd+clic et le clic molette (nouvel onglet) : ni callback, ni preventDefault",
    () => {
      const ul = list();
      const ids: string[] = [];
      m.bindSelection(ul, (id) => ids.push(id));
      const e1 = click(must(ul, '[data-id="dark"] .card-title'), { metaKey: true });
      const e2 = click(must(ul, '[data-id="dark"] .card-title'), { ctrlKey: true });
      const e3 = click(must(ul, '[data-id="dark"] .card-title'), { button: 1 });
      expect(ids).toEqual([]);
      expect(wasPrevented(e1)).toBe(false);
      expect(wasPrevented(e2)).toBe(false);
      expect(wasPrevented(e3)).toBe(false);
      click(must(ul, '[data-id="dark"] .card-title'));
      expect(ids).toEqual(["dark"]);
    },
  );
}
