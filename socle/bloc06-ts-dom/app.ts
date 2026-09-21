/* app.ts — wires your functions to the real page.

   This file is not yours to edit. It tries, in order, everything you may
   have written: the page comes a little more alive with every completed
   quest. Open the console (F12): it says what it found.
   index.html?solution=1 loads the teacher's solution instead of src/. */
import type { Catalogue } from "./src/types.ts";

type Loader = () => Promise<Record<string, unknown>>;
const LOADERS = import.meta.glob(["./src/*.ts", "./_animateur/solution/src/*.ts"]) as Record<
  string,
  Loader
>;
const SOURCE =
  new URLSearchParams(location.search).get("solution") === "1"
    ? "./_animateur/solution/src/"
    : "./src/";

const info = (...args: unknown[]): void =>
  console.info("%c[app.ts]", "color:#e50914;font-weight:bold", ...args);

async function load<T>(file: string): Promise<T> {
  const loader = LOADERS[`${SOURCE}${file}`];
  if (!loader) throw new Error(`${file} not found`);
  return (await loader()) as T;
}

async function attempt(quest: string, fn: () => Promise<boolean | void>): Promise<boolean> {
  try {
    const ok = await fn();
    info(`quest ${quest}: ${ok === false ? "not done yet" : "✔"}`);
    return ok !== false;
  } catch (error) {
    info(
      `quest ${quest}: not done yet (${error instanceof Error ? error.message : String(error)})`,
    );
    return false;
  }
}

const topbar = document.querySelector(".topbar");
window.addEventListener("scroll", () =>
  topbar?.classList.toggle("topbar-scrolled", window.scrollY > 40),
);

async function main(): Promise<void> {
  const root = document;
  const rows = root.querySelector<HTMLElement>(".rows");
  if (!rows) throw new Error(".rows is missing from index.html");

  const boss = await attempt("10 (boss)", async () => {
    const { start } = await load<{ start: (root: ParentNode, url: string) => Promise<void> }>(
      "10-boss-page.ts",
    );
    await start(root, "/data/catalogue.json");
    return rows.querySelectorAll(".card:not(#skeleton .card)").length > 0;
  });
  if (boss) return;

  const catalogue = (await (await fetch("/data/catalogue.json")).json()) as Catalogue;

  const mounted = await attempt("4 (the rows)", async () => {
    const { mountRows } = await load<{
      mountRows: (container: HTMLElement, catalogue: Catalogue) => void;
    }>("04-fill.ts");
    mountRows(rows, catalogue);
    return rows.querySelectorAll(".card").length > 0;
  });

  if (!mounted) {
    await attempt("2 (one card)", async () => {
      const { createCard } = await load<{
        createCard: (title: Catalogue["titles"][number]) => HTMLElement;
      }>("02-create.ts");
      const track = rows.querySelector("#skeleton .track");
      const cards = catalogue.titles.slice(0, 6).map(createCard);
      if (!track || cards.some((card) => !(card instanceof Element))) return false;
      track.replaceChildren(...cards);
      rows.querySelector("#skeleton")?.removeAttribute("aria-hidden");
      const heading = rows.querySelector("#skeleton .row-title");
      if (heading) heading.textContent = "Tes premières cartes";
      return true;
    });
  }

  await attempt("6 (search, menu, arrows)", async () => {
    const events = await load<{
      bindSearch: (input: HTMLInputElement, container: HTMLElement) => void;
      bindProfileMenu: (button: HTMLButtonElement, menu: HTMLElement) => void;
      bindArrows: (viewport: HTMLElement) => void;
    }>("06-events.ts");
    const input = root.querySelector<HTMLInputElement>("#search");
    const avatar = root.querySelector<HTMLButtonElement>("#avatar");
    const menu = root.querySelector<HTMLElement>("#profile-menu");
    if (input) events.bindSearch(input, rows);
    if (avatar && menu) events.bindProfileMenu(avatar, menu);
    for (const viewport of rows.querySelectorAll<HTMLElement>(".row-viewport"))
      events.bindArrows(viewport);
  });

  await attempt("7 (click on a card)", async () => {
    const { bindSelection } = await load<{
      bindSelection: (list: HTMLElement, callback: (id: string) => void) => void;
    }>("07-delegation.ts");
    bindSelection(rows, (id) => {
      const title = catalogue.titles.find((t) => t.id === id);
      if (!title) return;
      const heading = root.querySelector(".hero-title");
      const description = root.querySelector(".hero-desc");
      if (heading) heading.textContent = title.title;
      if (description) description.textContent = title.tagline;
    });
  });
}

main().catch((error: unknown) => console.error("[app.ts] it breaks:", error));
