import type { BrowserQuestContext } from "../engine/browser.ts";
import type { Catalogue } from "../src/types.ts";
import { catalogue, must, pageHtml } from "./_fixtures.ts";

export const title = "BOSS · La page qui vit";
export const file = "src/10-boss-page.ts";

export const lesson = `
Tout est prêt. \`index.html\` est la page du bloc 2, vidée de ses rangées,
avec un squelette qui pulse et une ligne dans \`app.ts\` :

\`\`\`
start(document, "/data/catalogue.json");
\`\`\`

À toi d'écrire \`start\`. Rien de neuf : tu **assembles**.

## mountPage(root, catalogue)

1. \`mountRows\` (quête 4) sur \`root.querySelector(".rows")\`
2. \`bindSearch\` (quête 6) : le champ \`#search\` filtre toutes les cartes de \`.rows\`
3. \`bindProfileMenu\` (quête 6) : \`#avatar\` et \`#profile-menu\`
4. \`bindArrows\` (quête 6) sur chaque \`.row-viewport\`
5. \`bindSelection\` (quête 7) sur \`.rows\` : un clic sur une carte met le
   titre dans le bandeau — \`.hero-title\`, \`.hero-desc\` (la tagline),
   \`.flag-year\` (texte **et** \`datetime\`)

Chaque \`querySelector\` ici renvoie \`Element | null\`. Décide une fois quoi
faire d'un élément manquant (lancer — c'est la page qui est cassée, pas
la donnée) et écris un petit utilitaire pour ça, plutôt que des \`!\`
partout.

## start(root, url, { timeout })

1. écrire \`« Chargement du catalogue… »\` dans \`[role="status"]\` — **avant**
   le premier \`await\`
2. \`await loadCatalogue(url)\` (quête 9), enveloppé dans \`withTimeout\`
3. \`mountPage\`
4. \`« Catalogue chargé : 12 titres »\` dans le status
5. en cas d'erreur : \`« Erreur : <message> »\` dans le status, et le
   squelette reste en place (on n'a rien monté)

## Ce que ça prouve

Chaque fonction a été testée seule. Le boss ne teste que le **câblage** :
que le clic arrive au bandeau, que la recherche voit les cartes montées
après elle. Si un test du boss casse, c'est un fil, pas une brique.

Quand tout est vert : ouvre \`index.html\`. Tape dans la recherche. Clique
sur une carte. C'est ta page.
`;

export const mission = `
Dans \`src/10-boss-page.ts\` :
- \`mountPage(root, catalogue)\`
- \`start(root, url, { timeout = 5000 } = {})\` → async
`;

interface Module {
  mountPage(root: ParentNode, catalogue: Catalogue): void;
  start(root: ParentNode, url: string, options?: { timeout?: number }): Promise<void>;
}

const type = (input: HTMLInputElement, text: string): void => {
  input.value = text;
  input.dispatchEvent(new Event("input", { bubbles: true }));
};
const click = (el: Element): MouseEvent => {
  const e = new MouseEvent("click", { bubbles: true, cancelable: true });
  el.dispatchEvent(e);
  return e;
};
const visible = (root: ParentNode): HTMLElement[] =>
  [...root.querySelectorAll<HTMLElement>(".rows .card")].filter((c) => !c.hidden);

type FakeAnswer = { status: number; body: unknown } | "never" | Error;
function fakeFetch(answer: FakeAnswer): typeof fetch {
  return (async () => {
    if (answer === "never") return new Promise<Response>(() => {});
    if (answer instanceof Error) throw answer;
    return {
      ok: answer.status < 300,
      status: answer.status,
      json: async () => answer.body,
    } as Response;
  }) as typeof fetch;
}
async function withFakeFetch<T>(fake: typeof fetch, body: () => Promise<T>): Promise<T> {
  const original = globalThis.fetch;
  globalThis.fetch = fake;
  try {
    return await body();
  } finally {
    globalThis.fetch = original;
  }
}

export default function (
  { test, challenge, expect, sandbox, wasPrevented }: BrowserQuestContext,
  m: Module,
): void {
  test("mountPage : 3 rangées, 18 cartes, le squelette a disparu", () => {
    const root = sandbox(pageHtml());
    m.mountPage(root, catalogue());
    expect(root.querySelector("#skeleton")).toBeNull();
    expect(root.querySelectorAll(".rows > section.row")).toHaveLength(3);
    expect(root.querySelectorAll(".rows .card")).toHaveLength(18);
  });

  test('la recherche est branchée : "dark" ne laisse que les 2 cartes Dark', () => {
    const root = sandbox(pageHtml());
    m.mountPage(root, catalogue());
    type(must(root, "#search"), "dark");
    expect(visible(root).map((c) => c.dataset.id)).toEqual(["dark", "dark"]);
    type(must(root, "#search"), "");
    expect(visible(root)).toHaveLength(18);
  });

  test("le menu profil est branché", () => {
    const root = sandbox(pageHtml());
    m.mountPage(root, catalogue());
    must<HTMLButtonElement>(root, "#avatar").click();
    expect(must(root, "#profile-menu")).toHaveClass("profile-menu-open");
    expect(must(root, "#avatar")).toHaveAttribute("aria-expanded", "true");
  });

  test("un clic sur la carte Arcane met Arcane dans le bandeau (titre, tagline, année) et annule la navigation", () => {
    const root = sandbox(pageHtml());
    m.mountPage(root, catalogue());
    const event = click(must(root, '.rows [data-id="arcane"] .card-title'));
    expect(wasPrevented(event)).toBe(true);
    expect(must(root, ".hero-title")).toHaveTextContent("Arcane");
    expect(must(root, ".hero-desc")).toHaveTextContent(
      "Deux sœurs de part et d'autre d'une guerre de cités",
    );
    expect(must(root, ".flag-year")).toHaveTextContent("2021");
    expect(must(root, ".flag-year")).toHaveAttribute("datetime", "2021");
  });

  test("les flèches sont branchées sur chaque rangée", () => {
    const root = sandbox(pageHtml());
    m.mountPage(root, catalogue());
    const viewports = root.querySelectorAll<HTMLElement>(".row-viewport");
    expect(viewports).toHaveLength(3);
    for (const viewport of viewports) {
      let value = 0;
      const track = must<HTMLElement>(viewport, ".track");
      Object.defineProperty(track, "scrollLeft", {
        configurable: true,
        get: () => value,
        set: (v: number) => {
          value = v;
        },
      });
      track.scrollBy = ((arg?: ScrollToOptions | number) => {
        value += typeof arg === "object" ? (arg?.left ?? 0) : (arg ?? 0);
      }) as typeof track.scrollBy;
      must<HTMLElement>(viewport, ".arrow-right").click();
      expect(value).toBe(700);
    }
  });

  test("mountPage assemble les quêtes 4, 6 et 7 (imports), sans les réécrire", () => {
    const source = m.mountPage.toString();
    for (const name of [
      "mountRows",
      "bindSearch",
      "bindProfileMenu",
      "bindArrows",
      "bindSelection",
    ]) {
      expect(source, `on attend un appel à ${name}`).toMatch(new RegExp(`${name}\\(`));
    }
  });

  test("start : status « Chargement du catalogue… » tout de suite, puis la page montée et « Catalogue chargé : 12 titres »", async () => {
    const root = sandbox(pageHtml());
    const status = must(root, '[role="status"]');
    await withFakeFetch(fakeFetch({ status: 200, body: catalogue() }), async () => {
      const promise = m.start(root, "/data/catalogue.json");
      expect(promise).toBeInstanceOf(Promise);
      expect(status.textContent, "le status doit être écrit avant le premier await").toBe(
        "Chargement du catalogue…",
      );
      await promise;
    });
    expect(status.textContent).toBe("Catalogue chargé : 12 titres");
    expect(root.querySelectorAll(".rows .card")).toHaveLength(18);
    expect(root.querySelector("#skeleton")).toBeNull();
  });

  test("start en cas de 500 : « Erreur : HTTP 500 » dans le status, et le squelette reste", async () => {
    const root = sandbox(pageHtml());
    await withFakeFetch(fakeFetch({ status: 500, body: {} }), async () => {
      await m.start(root, "/data/catalogue.json");
    });
    expect(must(root, '[role="status"]').textContent).toBe("Erreur : HTTP 500");
    expect(root.querySelector("#skeleton")).not.toBeNull();
  });

  test("start réutilise loadCatalogue et withTimeout (quête 9)", () => {
    expect(m.start.toString()).toMatch(/loadCatalogue\(/);
    expect(m.start.toString()).toMatch(/withTimeout\(/);
  });

  challenge(
    "start(root, url, { timeout: 20 }) affiche « Erreur : Timeout » si le réseau ne répond jamais",
    async () => {
      const root = sandbox(pageHtml());
      await withFakeFetch(fakeFetch("never"), async () => {
        await m.start(root, "/data/catalogue.json", { timeout: 20 });
      });
      expect(must(root, '[role="status"]').textContent).toBe("Erreur : Timeout");
      expect(root.querySelector("#skeleton")).not.toBeNull();
    },
  );
}
