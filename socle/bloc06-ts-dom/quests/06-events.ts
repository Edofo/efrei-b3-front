import type { BrowserQuestContext } from "../engine/browser.ts";
import { must, rowHtml } from "./_fixtures.ts";

export const title = "Réagir";
export const file = "src/06-events.ts";

export const lesson = `
Jusqu'ici tu construis la page. Maintenant elle doit **réagir** : on tape
dans la recherche, on clique sur l'avatar, on appuie sur une flèche.

## addEventListener

\`\`\`
input.addEventListener("input", (event) => {
  console.log(input.value);      // la valeur au moment de la frappe
});
\`\`\`

Le premier argument est le **type** d'événement, le second la fonction
appelée à chaque fois — avec un objet \`event\` qui décrit ce qui s'est
passé (\`target\` : l'élément concerné ; \`key\` pour le clavier ;
\`preventDefault()\` pour annuler le comportement natif). TypeScript déduit
le type de \`event\` de la chaîne : \`"keydown"\` donne un \`KeyboardEvent\`
avec \`.key\`, \`"click"\` un \`MouseEvent\`.

Jamais \`onclick="…"\` dans le HTML, jamais \`el.onclick = …\` : un seul
gestionnaire possible, et le code mélangé au HTML.

## Les types utiles

- \`input\` : à chaque modification d'un champ (contrairement à \`change\`,
  qui attend qu'on quitte le champ)
- \`click\` : souris **et** clavier (Entrée, Espace sur un bouton) — c'est
  pour ça qu'on branche \`click\`, pas \`mousedown\`
- \`keydown\` : une touche, lue dans \`event.key\` (\`"Escape"\`, \`"Enter"\`)
- \`submit\` : sur le formulaire, pas sur le bouton

## Brancher, c'est tout

Une fonction \`bindX(element)\` **installe** l'écouteur et s'arrête là.
Elle ne renvoie rien (\`: void\`) ; le travail se fera plus tard, à chaque
événement. Les tests simulent l'événement avec
\`el.dispatchEvent(new Event("input"))\`.

## Un état visible et annoncé

Ouvrir le menu, c'est **deux** changements : la classe \`profile-menu-open\`
(la CSS du bloc 2 fait l'animation) et \`aria-expanded\` sur le bouton.
Toujours les deux.
`;

export const mission = `
Dans \`src/06-events.ts\` :
- \`bindSearch(input, container)\` → à chaque \`input\`, cache (\`hidden\`) les \`.card\` du conteneur dont le \`.card-title\` ne contient pas la saisie, sans tenir compte de la casse ; saisie vide → tout visible
- \`bindProfileMenu(button, menu)\` → \`click\` bascule \`profile-menu-open\` sur le menu et \`aria-expanded\` sur le bouton ; \`Escape\` (keydown sur le menu ou le bouton) ferme
- \`bindArrows(viewport)\` → un clic sur \`.arrow-right\` avance \`ul.track\` de 700 px (\`scrollLeft\`), \`.arrow-left\` recule d'autant
`;

interface Module {
  bindSearch(input: HTMLInputElement, container: HTMLElement, output?: HTMLElement): void;
  bindProfileMenu(button: HTMLButtonElement, menu: HTMLElement): void;
  bindArrows(viewport: HTMLElement): void;
}

const SEARCH = (): string => `<input class="search-input" id="search" type="search" />
<output aria-live="polite"></output>
<div class="rows">
${rowHtml({ id: "a", title: "A", ids: ["dark", "elite", "squad"] })}
${rowHtml({ id: "b", title: "B", ids: ["dark", "amelie", "ozark"] })}
</div>`;

const MENU =
  (): string => `<button class="avatar" type="button" id="avatar" aria-label="Profil" aria-expanded="false" aria-controls="profile-menu"></button>
<ul class="profile-menu" id="profile-menu"><li><button class="profile-row" type="button">Nolan</button></li></ul>`;

function spyScroll(track: HTMLElement): () => number {
  let value = 0;
  const left = (arg: ScrollToOptions | number | undefined): number =>
    typeof arg === "object" ? (arg?.left ?? 0) : (arg ?? 0);
  Object.defineProperty(track, "scrollLeft", {
    configurable: true,
    get: () => value,
    set: (v: number) => {
      value = Math.max(0, v);
    },
  });
  track.scrollBy = ((arg?: ScrollToOptions | number) => {
    value = Math.max(0, value + left(arg));
  }) as typeof track.scrollBy;
  track.scrollTo = ((arg?: ScrollToOptions | number) => {
    value = Math.max(0, left(arg));
  }) as typeof track.scrollTo;
  return () => value;
}

const type = (input: HTMLInputElement, text: string): void => {
  input.value = text;
  input.dispatchEvent(new Event("input", { bubbles: true }));
};
const visible = (root: ParentNode): string[] =>
  [...root.querySelectorAll<HTMLElement>(".card")]
    .filter((c) => !c.hidden)
    .map((c) => c.dataset.id ?? "");

export default function (
  { test, challenge, expect, sandbox }: BrowserQuestContext,
  m: Module,
): void {
  const search = (): {
    root: HTMLElement;
    input: HTMLInputElement;
    rows: HTMLElement;
    output: HTMLElement;
  } => {
    const root = sandbox(SEARCH());
    return {
      root,
      input: must(root, "#search"),
      rows: must(root, ".rows"),
      output: must(root, "output"),
    };
  };

  test('bindSearch : taper "dark" ne laisse visibles que les deux cartes Dark', () => {
    const { root, input, rows } = search();
    m.bindSearch(input, rows);
    type(input, "dark");
    expect(visible(root)).toEqual(["dark", "dark"]);
    expect(must<HTMLElement>(root, '[data-id="elite"]').hidden).toBe(true);
  });

  test('bindSearch ignore la casse et cherche au milieu du nom : "ARK" → Dark ×2, Ozark', () => {
    const { root, input, rows } = search();
    m.bindSearch(input, rows);
    type(input, "ARK");
    expect(visible(root)).toEqual(["dark", "dark", "ozark"]);
  });

  test("bindSearch : effacer la saisie réaffiche tout", () => {
    const { root, input, rows } = search();
    m.bindSearch(input, rows);
    type(input, "zzz");
    expect(visible(root)).toEqual([]);
    type(input, "");
    expect(visible(root)).toHaveLength(6);
  });

  test("bindSearch n'agit qu'à l'événement input, pas au branchement", () => {
    const { root, input, rows } = search();
    input.value = "zzz";
    m.bindSearch(input, rows);
    expect(visible(root), "rien ne doit bouger tant qu'on n'a pas tapé").toHaveLength(6);
  });

  test("bindProfileMenu : un clic ouvre (classe + aria-expanded), un second ferme", () => {
    const root = sandbox(MENU());
    const button = must<HTMLButtonElement>(root, "#avatar");
    const menu = must<HTMLElement>(root, "#profile-menu");
    m.bindProfileMenu(button, menu);
    button.click();
    expect(menu).toHaveClass("profile-menu-open");
    expect(button).toHaveAttribute("aria-expanded", "true");
    button.click();
    expect(menu).not.toHaveClass("profile-menu-open");
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  test("bindProfileMenu : Escape ferme le menu ouvert", () => {
    const root = sandbox(MENU());
    const button = must<HTMLButtonElement>(root, "#avatar");
    const menu = must<HTMLElement>(root, "#profile-menu");
    m.bindProfileMenu(button, menu);
    button.click();
    must(menu, "button").dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    expect(menu).not.toHaveClass("profile-menu-open");
    expect(button).toHaveAttribute("aria-expanded", "false");
    button.click();
    button.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(menu).not.toHaveClass("profile-menu-open");
  });

  test("bindArrows : la flèche droite avance de 700 px, la gauche revient", () => {
    const root = sandbox(
      rowHtml({ id: "a", title: "A", ids: ["dark", "elite", "squad", "amelie", "ozark", "casa"] }),
    );
    const viewport = must<HTMLElement>(root, ".row-viewport");
    const read = spyScroll(must(viewport, ".track"));
    m.bindArrows(viewport);
    must<HTMLElement>(viewport, ".arrow-right").click();
    expect(read()).toBe(700);
    must<HTMLElement>(viewport, ".arrow-right").click();
    expect(read()).toBe(1400);
    must<HTMLElement>(viewport, ".arrow-left").click();
    expect(read()).toBe(700);
  });

  test("tout passe par addEventListener, pas par onclick", () => {
    const source = [m.bindSearch, m.bindProfileMenu, m.bindArrows]
      .map((fn) => fn.toString())
      .join("\n");
    expect(source).toMatch(/addEventListener\(/);
    expect(source).not.toMatch(/\.on(click|input|keydown)\s*=/);
  });

  challenge(
    'bindSearch(input, container, output) annonce le compte dans output : "3 titres", "1 titre", "Aucun titre"',
    () => {
      const { input, rows, output } = search();
      m.bindSearch(input, rows, output);
      type(input, "ark");
      expect(output.textContent).toBe("3 titres");
      type(input, "ozark");
      expect(output.textContent).toBe("1 titre");
      type(input, "zzz");
      expect(output.textContent).toBe("Aucun titre");
    },
  );
}
