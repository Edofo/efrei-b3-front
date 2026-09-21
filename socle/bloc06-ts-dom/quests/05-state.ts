import type { BrowserQuestContext } from "../engine/browser.ts";
import { cardHtml, must, title as titleById } from "./_fixtures.ts";

export const title = "Changer d'état";
export const file = "src/05-state.ts";

export const lesson = `
Une carte a des **états** : favorite ou non, visible ou cachée, marquée
« TOP 10 » ou pas. Un état, c'est une classe ou un attribut qu'on ajoute,
retire, ou bascule — et la CSS (bloc 2) fait le reste.

## classList

\`\`\`
el.classList.add("card-favori");
el.classList.remove("card-favori");
el.classList.toggle("card-favori");        // ajoute si absent, retire si présent ; renvoie true/false
el.classList.contains("card-favori");      // true / false
\`\`\`

Jamais \`el.className = "…"\` pour changer *une* classe : ça écrase toutes
les autres.

## Attributs et ARIA

Un bouton « favori » change de classe pour l'œil ; il doit aussi changer
d'état pour le lecteur d'écran : \`aria-pressed="true"\`. La classe et
l'attribut sont deux faces du même état — on les met à jour **ensemble**.

\`\`\`
button.setAttribute("aria-pressed", String(active));
button.getAttribute("aria-pressed")           // "true" ou "false" — une chaîne
\`\`\`

## hidden

L'attribut booléen \`hidden\` cache un élément (\`display: none\`). En
TypeScript, c'est une propriété de \`HTMLElement\` : \`el.hidden = true\`. Pas
de classe à inventer. (Sur un simple \`Element\`, elle n'existe pas : c'est
pour ça que les signatures demandent un \`HTMLElement\`.)

## data-*

\`data-id="dark"\` dans le HTML se lit \`el.dataset.id\` en TypeScript — typé
\`string | undefined\`, parce que l'attribut peut manquer. C'est l'endroit
prévu pour ranger une donnée sur un élément — jamais dans \`id\` ni dans
\`class\`.

## Créer ou mettre à jour

« Mettre un badge » sur une carte qui en a déjà un ne doit pas en créer
un deuxième. Cherche d'abord, crée seulement s'il manque : c'est ce
qu'on appelle une opération **idempotente**, et c'est le réflexe à avoir
pour tout ce qui touche au DOM.
`;

export const mission = `
Dans \`src/05-state.ts\` :
- \`readId(card)\` → le \`data-id\` (\`""\` s'il manque)
- \`toggleFavorite(card)\` → bascule la classe \`card-favori\` sur le \`li\` et \`aria-pressed\` sur son \`button.card-fav\` ; renvoie le nouvel état
- \`setBadge(card, text)\` → crée ou met à jour \`p.card-badge\` en premier enfant du lien ; \`null\` ou \`""\` le retire
- \`showOnly(cards, ids)\` → \`hidden\` sur toutes les cartes dont l'id n'est pas dans \`ids\`
`;

interface Module {
  readId(card: HTMLElement): string;
  toggleFavorite(card: HTMLElement): boolean;
  setBadge(card: HTMLElement, text: string | null): void;
  showOnly(cards: Iterable<HTMLElement>, ids: string[]): void;
  markWatched(root: ParentNode, ids: string[]): void;
}

export default function (
  { test, challenge, expect, sandbox }: BrowserQuestContext,
  m: Module,
): void {
  const card = (id = "dark"): HTMLElement =>
    must(
      sandbox(`<ul class="track">${cardHtml(titleById(id), { favorite: true })}</ul>`),
      "li.card",
    );
  const list = (...ids: string[]): HTMLElement =>
    must(
      sandbox(`<ul class="track">${ids.map((id) => cardHtml(titleById(id))).join("")}</ul>`),
      "ul",
    );

  test('readId(card) renvoie "dark"', () => {
    expect(m.readId(card())).toBe("dark");
    expect(m.readId(card("casa"))).toBe("casa");
  });

  test('toggleFavorite : ajoute card-favori, aria-pressed="true", et renvoie true', () => {
    const c = card();
    expect(m.toggleFavorite(c)).toBe(true);
    expect(c).toHaveClass("card-favori");
    expect(c).toHaveClass("card");
    expect(c.querySelector(".card-fav")).toHaveAttribute("aria-pressed", "true");
  });

  test("toggleFavorite deux fois : retour à l'état initial, et renvoie false", () => {
    const c = card();
    m.toggleFavorite(c);
    expect(m.toggleFavorite(c)).toBe(false);
    expect(c).not.toHaveClass("card-favori");
    expect(c.querySelector(".card-fav")).toHaveAttribute("aria-pressed", "false");
  });

  test('setBadge(card, "NOUVEAU") crée p.card-badge en premier enfant du lien', () => {
    const c = card();
    m.setBadge(c, "NOUVEAU");
    const badge = c.querySelector("a > p.card-badge");
    expect(badge).not.toBeNull();
    expect(badge).toHaveTextContent("NOUVEAU");
    expect(c.querySelector("a")?.firstElementChild).toBe(badge);
  });

  test("setBadge sur une carte qui en a déjà un : met à jour, ne duplique pas", () => {
    const c = card("elite"); // Élite a déjà TOP 10
    m.setBadge(c, "NOUVEAU");
    expect(c.querySelectorAll(".card-badge")).toHaveLength(1);
    expect(c.querySelector(".card-badge")).toHaveTextContent("NOUVEAU");
  });

  test('setBadge(card, null) et setBadge(card, "") retirent le badge', () => {
    const c = card("elite");
    m.setBadge(c, null);
    expect(c.querySelector(".card-badge")).toBeNull();
    m.setBadge(c, "TOP 10");
    m.setBadge(c, "");
    expect(c.querySelector(".card-badge")).toBeNull();
  });

  test('showOnly(cards, ["dark", "ozark"]) cache les autres avec hidden', () => {
    const cards = list("dark", "arcane", "ozark", "casa").querySelectorAll<HTMLElement>(".card");
    m.showOnly(cards, ["dark", "ozark"]);
    expect([...cards].map((c) => c.hidden)).toEqual([false, true, false, true]);
    m.showOnly(cards, ["dark", "arcane", "ozark", "casa"]);
    expect([...cards].map((c) => c.hidden)).toEqual([false, false, false, false]);
  });

  test("showOnly accepte une NodeList ou un tableau", () => {
    const ul = list("dark", "arcane");
    m.showOnly([...ul.querySelectorAll<HTMLElement>(".card")], ["arcane"]);
    expect(must<HTMLElement>(ul, '[data-id="dark"]').hidden).toBe(true);
    expect(must<HTMLElement>(ul, '[data-id="arcane"]').hidden).toBe(false);
  });

  challenge(
    'markWatched(root, ["dark"]) ajoute la classe card-vu et un span.sr-only « Déjà vu » dans card-meta — sans doublon si appelé deux fois',
    () => {
      const root = list("dark", "arcane");
      m.markWatched(root, ["dark"]);
      m.markWatched(root, ["dark"]);
      const dark = must(root, '[data-id="dark"]');
      expect(dark).toHaveClass("card-vu");
      expect(dark.querySelectorAll(".card-meta > .sr-only")).toHaveLength(2); // la note + « Déjà vu »
      expect(dark.querySelector(".card-meta")).toHaveTextContent("Déjà vu");
      expect(must(root, '[data-id="arcane"]')).not.toHaveClass("card-vu");
    },
  );
}
