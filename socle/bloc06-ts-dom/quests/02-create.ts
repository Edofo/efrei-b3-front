import type { BrowserQuestContext } from "../engine/browser.ts";
import type { Title } from "../src/types.ts";
import { must, title as titleById, titles } from "./_fixtures.ts";

export const title = "Fabriquer une carte";
export const file = "src/02-create.ts";

export const lesson = `
Les cartes de la page d'accueil, au bloc 2, étaient écrites à la main
dans le HTML. Maintenant elles viennent du catalogue : il faut les
**fabriquer** en TypeScript.

## Créer, régler, attacher

\`\`\`
const li = document.createElement("li");   // typé HTMLLIElement
li.className = "card";                      // ou li.classList.add("card")
li.dataset.id = title.id;                   // → data-id="dark"

const img = document.createElement("img");  // typé HTMLImageElement : .src, .alt existent
img.src = title.poster;
img.alt = \`\${title.title} — \${title.tagline}\`;

const h3 = document.createElement("h3");
h3.textContent = title.title;

li.append(img, h3);                         // append accepte plusieurs enfants
\`\`\`

\`createElement("img")\` sait qu'il fabrique un \`HTMLImageElement\` :
\`img.src\` compile, \`img.href\` non. Ce sont les typages du DOM qui font
leur travail.

Un élément créé n'est **nulle part** tant qu'on ne l'a pas attaché. Ta
fonction fabrique la carte et la **renvoie** ; c'est l'appelant qui
décidera où la mettre.

## Attribut ou propriété ?

\`img.src = x\` et \`img.setAttribute("src", x)\` font la même chose pour
les attributs standards. Pour \`aria-*\` et \`data-*\`, \`setAttribute\` (ou
\`dataset\`). Pour les classes, \`classList\`.

## La structure à reproduire

C'est exactement celle du bloc 2 (regarde le HTML de la page) :

\`\`\`
li.card[data-id]
  a[href="/titres/<id>"]
    p.card-badge          « TOP 10 », seulement si title.top10
    img.card-img          src = poster, alt = "Titre — tagline"
    div.card-meta
      h3.card-title
      div.card-stars[aria-hidden="true"]   étoiles (note arrondie) — seulement s'il y a une note
      span.sr-only        "Note : 4.5 sur 5", ou "Pas encore noté"
\`\`\`

Pas d'\`innerHTML\` dans cette quête. Tu comprendras pourquoi à la suivante.
`;

export const mission = `
Dans \`src/02-create.ts\` :
- \`createCard(title)\` → l'élément \`li.card\`, non attaché à la page
`;

interface Module {
  createCard(title: Title): HTMLLIElement;
  createCards(titles: Title[]): DocumentFragment;
}

export default function (
  { test, challenge, expect, sandbox }: BrowserQuestContext,
  m: Module,
): void {
  const show = (card: unknown): void => {
    const list = must(sandbox('<ul class="track"></ul>'), "ul");
    if (card instanceof Element) list.append(card);
  };

  test('createCard(Dark) renvoie un li.card avec data-id="dark"', () => {
    const card = m.createCard(titleById("dark"));
    expect(card).toBeInstanceOf(HTMLElement);
    expect(card.tagName).toBe("LI");
    expect(card).toHaveClass("card");
    expect(card).toHaveAttribute("data-id", "dark");
    show(card);
  });

  test("la carte n'est attachée nulle part : c'est l'appelant qui décide", () => {
    expect(m.createCard(titleById("dark")).isConnected).toBe(false);
  });

  test('le lien : a[href="/titres/dark"], enfant direct du li', () => {
    const card = m.createCard(titleById("dark"));
    const link = card.querySelector(":scope > a");
    expect(link, "pas de <a> directement dans le li").not.toBeNull();
    expect(link).toHaveAttribute("href", "/titres/dark");
    show(card);
  });

  test("l'image : img.card-img avec src = poster et alt = « Dark — tagline »", () => {
    const card = m.createCard(titleById("dark"));
    const img = card.querySelector("a > img.card-img");
    expect(img).not.toBeNull();
    expect(img?.getAttribute("src")).toBe(titleById("dark").poster);
    expect(img).toHaveAttribute("alt", "Dark — Quatre familles, une grotte, trois époques");
    show(card);
  });

  test("le titre : div.card-meta > h3.card-title", () => {
    const card = m.createCard(titleById("casa"));
    const h3 = card.querySelector("a > div.card-meta > h3.card-title");
    expect(h3).not.toBeNull();
    expect(h3).toHaveTextContent("La Casa de Papel");
    show(card);
  });

  test('les étoiles : div.card-stars[aria-hidden="true"] avec la note arrondie, et le span.sr-only « Note : 4.5 sur 5 »', () => {
    const card = m.createCard(titleById("dark"));
    const stars = card.querySelector(".card-meta > .card-stars");
    expect(stars).not.toBeNull();
    expect(stars).toHaveAttribute("aria-hidden", "true");
    expect(stars?.textContent?.trim()).toBe("★★★★★");
    expect(card.querySelector(".card-meta > .sr-only")).toHaveTextContent("Note : 4.5 sur 5");
    expect(m.createCard(titleById("elite")).querySelector(".card-stars")?.textContent?.trim()).toBe(
      "★★★★☆",
    );
    show(card);
  });

  test("sans note (Chef's Table) : pas de card-stars, et « Pas encore noté » en sr-only", () => {
    const card = m.createCard(titleById("chef"));
    expect(card.querySelector(".card-stars")).toBeNull();
    expect(card.querySelector(".sr-only")).toHaveTextContent("Pas encore noté");
    show(card);
  });

  test("le badge : p.card-badge « TOP 10 » en premier dans le lien, seulement si top10", () => {
    const elite = m.createCard(titleById("elite"));
    const badge = elite.querySelector("a > p.card-badge");
    expect(badge).not.toBeNull();
    expect(badge).toHaveTextContent("TOP 10");
    expect(
      elite.querySelector("a")?.firstElementChild,
      "le badge doit être le premier enfant du lien",
    ).toBe(badge);
    expect(m.createCard(titleById("dark")).querySelector(".card-badge")).toBeNull();
    show(elite);
  });

  test("pas d'innerHTML ici : createElement, textContent, append", () => {
    expect(m.createCard.toString()).not.toMatch(/innerHTML|outerHTML|insertAdjacentHTML/);
  });

  challenge("createCards(titles) renvoie un DocumentFragment contenant une carte par titre", () => {
    const fragment = m.createCards(titles("dark", "arcane", "ozark"));
    expect(fragment).toBeInstanceOf(DocumentFragment);
    expect(fragment.childElementCount).toBe(3);
    expect([...fragment.children].map((c) => (c as HTMLElement).dataset.id)).toEqual([
      "dark",
      "arcane",
      "ozark",
    ]);
    const list = must(sandbox('<ul class="track"></ul>'), "ul");
    list.append(fragment);
    expect(list.children).toHaveLength(3);
  });
}
