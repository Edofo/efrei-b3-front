/* Quest 4 · Filling the rows — solution */
import type { Catalogue, Row, Title } from "./types.ts";
import { createCard } from "./02-create.ts";

export function fillRow(list: HTMLUListElement, titles: Title[]): void {
  // Challenge ⭐: replaceChildren empties AND inserts in one operation — a single mutation.
  list.replaceChildren(...titles.map(createCard));
}

function arrow(side: "left" | "right", rowTitle: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.className = `arrow arrow-${side}`;
  button.type = "button";
  const direction = side === "left" ? "gauche" : "droite";
  button.setAttribute("aria-label", `Faire défiler ${rowTitle} vers la ${direction}`);
  const icon = document.createElement("span");
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = side === "left" ? "‹" : "›";
  button.append(icon);
  return button;
}

export function createRow(row: Row, titles: Title[]): HTMLElement {
  const section = document.createElement("section");
  section.className = "row";
  section.setAttribute("aria-labelledby", `row-${row.id}`);

  const heading = document.createElement("h2");
  heading.className = "row-title";
  heading.id = `row-${row.id}`;
  heading.textContent = row.title;

  const viewport = document.createElement("div");
  viewport.className = "row-viewport";

  const list = document.createElement("ul");
  list.className = "track";
  const selection = row.ids
    .map((id) => titles.find((t) => t.id === id))
    .filter((t): t is Title => t !== undefined);
  fillRow(list, selection);

  viewport.append(arrow("left", row.title), list, arrow("right", row.title));
  section.append(heading, viewport);
  return section;
}

export function mountRows(container: HTMLElement, catalogue: Catalogue): void {
  container.replaceChildren(...catalogue.rows.map((row) => createRow(row, catalogue.titles)));
}
