import type { BrowserQuestContext } from "../engine/browser.ts";
import type { Catalogue } from "../src/types.ts";
import { must } from "./_fixtures.ts";

export const title = "Aller chercher la donnée";
export const file = "src/09-fetch.ts";

export const lesson = `
Au bloc 5, Node lisait \`data/catalogue.json\` sur le disque. Le navigateur
n'a pas de disque : il a le **réseau**. Le fichier est servi par un
serveur (Vite), et on le demande avec \`fetch\`.

## Une promesse, puis une autre

\`\`\`
const response = await fetch("/data/catalogue.json");   // les en-têtes arrivent
if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
const catalogue = (await response.json()) as Catalogue;  // le corps, parsé
\`\`\`

Deux \`await\` : le premier attend la **réponse** (statut, en-têtes), le
second attend et parse le **corps**. Et \`fetch\` ne rejette **pas** sur une
404 : pour lui, une réponse est arrivée. C'est \`response.ok\` (statut
200–299) qu'il faut vérifier soi-même. \`fetch\` ne rejette que si le
réseau est coupé.

\`response.json()\` renvoie \`Promise<any>\`. Le \`as Catalogue\` est la même
promesse qu'au bloc 5 : une frontière où l'on fait confiance au serveur.
Une vraie appli validerait (bloc 5, quête 8).

## async / await

Une fonction \`async\` renvoie toujours une promesse : \`Promise<Catalogue>\`,
jamais \`Catalogue\`. Dedans, \`await\` met en pause jusqu'au résultat, sans
bloquer la page. Un \`throw\` dans une fonction \`async\` rejette la
promesse ; l'appelant l'attrape avec \`try / catch\` autour de son \`await\`.

## Trois états à afficher

Chargement, succès, erreur. Une page qui ne montre que le succès
paraît cassée pendant les 800 ms de réseau, et muette quand ça échoue.

\`\`\`
el.textContent = "Chargement…";
try {
  const value = await promise;
  el.textContent = render(value);
} catch (error) {
  el.textContent = \`Erreur : \${error instanceof Error ? error.message : String(error)}\`;
}
\`\`\`

\`error\` dans un \`catch\` est \`unknown\` — on peut lancer n'importe quoi.
Réduis-le avant de lire \`.message\`.

## Ne pas attendre pour toujours

\`Promise.race([promise, delay])\` prend la première qui se termine. Si
\`delay\` est une promesse qui rejette après N ms, on a un timeout.

## Les tests remplacent fetch

Pour tester sans réseau, les tests posent un faux \`globalThis.fetch\`
qui renvoie ce qu'ils veulent. Ton code ne doit pas s'en apercevoir :
il appelle \`fetch(url)\`, point.
`;

export const mission = `
Dans \`src/09-fetch.ts\` :
- \`loadCatalogue(url)\` → (async) le JSON parsé ; rejette avec \`Error("HTTP <status>")\` si \`!response.ok\`
- \`showState(el, promise, render)\` → écrit \`« Chargement… »\` tout de suite, puis \`render(value)\` ou \`« Erreur : <message> »\` ; renvoie une promesse qui se résout une fois l'affichage fait
- \`withTimeout(promise, ms)\` → la même valeur, ou rejette avec \`Error("Timeout")\` après \`ms\`
`;

interface Module {
  loadCatalogue(url: string): Promise<Catalogue>;
  showState<T>(el: HTMLElement, promise: Promise<T>, render: (value: T) => string): Promise<void>;
  withTimeout<T>(promise: Promise<T>, ms: number): Promise<T>;
}

interface FakeResponse {
  status: number;
  body: unknown;
}

function fakeFetch(responses: FakeResponse | ((attempt: number) => FakeResponse | Error)): {
  fn: typeof fetch;
  calls: string[];
} {
  const calls: string[] = [];
  const fn = (async (input: RequestInfo | URL) => {
    calls.push(String(input));
    const r = typeof responses === "function" ? responses(calls.length) : responses;
    if (r instanceof Error) throw r;
    return {
      ok: r.status >= 200 && r.status < 300,
      status: r.status,
      json: async () => r.body,
      text: async () => JSON.stringify(r.body),
    } as Response;
  }) as typeof fetch;
  return { fn, calls };
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
  { test, challenge, expect, sandbox }: BrowserQuestContext,
  m: Module,
): void {
  const zone = (): HTMLElement => must(sandbox('<p class="hero-desc"></p>'), "p");

  test("loadCatalogue(url) renvoie une promesse du JSON, en appelant fetch(url)", async () => {
    const { fn, calls } = fakeFetch({ status: 200, body: { titles: [{ id: "dark" }] } });
    await withFakeFetch(fn, async () => {
      const promise = m.loadCatalogue("https://api.example/catalogue.json");
      expect(promise).toBeInstanceOf(Promise);
      expect(await promise).toEqual({ titles: [{ id: "dark" }] });
    });
    expect(calls).toEqual(["https://api.example/catalogue.json"]);
  });

  test('loadCatalogue rejette avec "HTTP 404" quand la réponse n\'est pas ok', async () => {
    await withFakeFetch(fakeFetch({ status: 404, body: {} }).fn, async () => {
      await expect(m.loadCatalogue("x")).rejects.toThrow("HTTP 404");
    });
    await withFakeFetch(fakeFetch({ status: 500, body: {} }).fn, async () => {
      await expect(m.loadCatalogue("x")).rejects.toThrow("HTTP 500");
    });
  });

  test("loadCatalogue en vrai : /data/catalogue.json a 12 titres", async () => {
    const c = await m.loadCatalogue("/data/catalogue.json");
    expect(c.titles).toHaveLength(12);
    expect(c.rows).toHaveLength(3);
  });

  test("loadCatalogue utilise fetch, pas XMLHttpRequest", () => {
    expect(m.loadCatalogue.toString()).toMatch(/fetch\(/);
    expect(m.loadCatalogue.toString()).not.toMatch(/XMLHttpRequest/);
  });

  test("showState écrit « Chargement… » immédiatement, puis render(value)", async () => {
    const el = zone();
    let resolve: (value: { titles: number[] }) => void = () => {};
    const promise = new Promise<{ titles: number[] }>((r) => {
      resolve = r;
    });
    const done = m.showState(el, promise, (v) => `${v.titles.length} titres chargés`);
    expect(el.textContent).toBe("Chargement…");
    resolve({ titles: [1, 2, 3] });
    await done;
    expect(el.textContent).toBe("3 titres chargés");
  });

  test("showState affiche « Erreur : … » si la promesse rejette, sans faire planter l'appelant", async () => {
    const el = zone();
    await m.showState(el, Promise.reject(new Error("network down")), () => "jamais");
    expect(el.textContent).toBe("Erreur : network down");
  });

  test("withTimeout laisse passer une promesse rapide", async () => {
    expect(await m.withTimeout(Promise.resolve(42), 100)).toBe(42);
    expect(
      await m.withTimeout(new Promise<string>((r) => setTimeout(() => r("ok"), 10)), 100),
    ).toBe("ok");
  });

  test('withTimeout rejette avec "Timeout" si rien n\'arrive à temps', async () => {
    const never = new Promise<never>(() => {});
    await expect(m.withTimeout(never, 20)).rejects.toThrow("Timeout");
  });

  test("withTimeout transmet l'erreur d'origine si la promesse rejette avant le délai", async () => {
    await expect(m.withTimeout(Promise.reject(new Error("HTTP 404")), 100)).rejects.toThrow(
      "HTTP 404",
    );
  });

  challenge(
    "loadCatalogue réessaie UNE fois quand le réseau échoue (fetch rejette), pas sur une 404",
    async () => {
      const { fn, calls } = fakeFetch((attempt) =>
        attempt === 1 ? new TypeError("Failed to fetch") : { status: 200, body: { titles: [] } },
      );
      await withFakeFetch(fn, async () => {
        expect(await m.loadCatalogue("x")).toEqual({ titles: [] });
      });
      expect(calls).toHaveLength(2);
      const always = fakeFetch(() => new TypeError("Failed to fetch"));
      await withFakeFetch(always.fn, async () => {
        await expect(m.loadCatalogue("x")).rejects.toThrow("Failed to fetch");
      });
      expect(always.calls).toHaveLength(2);
      const notFound = fakeFetch({ status: 404, body: {} });
      await withFakeFetch(notFound.fn, async () => {
        await expect(m.loadCatalogue("x")).rejects.toThrow("HTTP 404");
      });
      expect(
        notFound.calls,
        "une 404 n'est pas une panne réseau : pas de second essai",
      ).toHaveLength(1);
    },
  );
}
