/* Quest 10 · BOSS · The page comes alive — solution */
import type { Catalogue, Title } from "./types.ts";
import { mountRows } from "./04-fill.ts";
import { bindSearch, bindProfileMenu, bindArrows } from "./06-events.ts";
import { bindSelection } from "./07-delegation.ts";
import { loadCatalogue, withTimeout } from "./09-fetch.ts";

const DEFAULT_TIMEOUT_MS = 5000;

/** A required element of the page: a missing one is a broken page, not a data problem. */
function required<T extends Element>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`the page is missing ${selector}`);
  return element;
}

function showInHero(root: ParentNode, title: Title): void {
  required(root, ".hero-title").textContent = title.title;
  required(root, ".hero-desc").textContent = title.tagline;
  const year = required(root, ".flag-year");
  year.textContent = String(title.year);
  year.setAttribute("datetime", String(title.year));
}

export function mountPage(root: ParentNode, catalogue: Catalogue): void {
  const rows = required<HTMLElement>(root, ".rows");
  mountRows(rows, catalogue);

  bindSearch(required<HTMLInputElement>(root, "#search"), rows);
  bindProfileMenu(
    required<HTMLButtonElement>(root, "#avatar"),
    required<HTMLElement>(root, "#profile-menu"),
  );
  for (const viewport of rows.querySelectorAll<HTMLElement>(".row-viewport")) bindArrows(viewport);

  bindSelection(rows, (id) => {
    const title = catalogue.titles.find((t) => t.id === id);
    if (title) showInHero(root, title);
  });
}

const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export async function start(
  root: ParentNode,
  url: string,
  { timeout = DEFAULT_TIMEOUT_MS } = {},
): Promise<void> {
  const status = required(root, '[role="status"]');
  status.textContent = "Chargement du catalogue…"; // before the first await
  try {
    const catalogue = await withTimeout(loadCatalogue(url), timeout);
    mountPage(root, catalogue);
    status.textContent = `Catalogue chargé : ${catalogue.titles.length} titres`;
  } catch (error) {
    status.textContent = `Erreur : ${messageOf(error)}`;
  }
}
