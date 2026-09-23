/* Quest 2 · Building a card — solution */
import type { Title } from "./types.ts";

const STAR_COUNT = 5;

function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function stars(rating: number): string {
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(STAR_COUNT - full);
}

export function createCard(title: Title): HTMLLIElement {
  const li = createElement("li", "card");
  li.dataset.id = title.id;

  const link = createElement("a");
  link.href = `/titres/${title.id}`;

  if (title.top10) link.append(createElement("p", "card-badge", "TOP 10"));

  const img = createElement("img", "card-img");
  img.src = title.poster;
  img.alt = `${title.title} — ${title.tagline}`;

  const meta = createElement("div", "card-meta");
  meta.append(createElement("h3", "card-title", title.title));
  if (title.rating === undefined || title.rating === null) {
    meta.append(createElement("span", "sr-only", "Pas encore noté"));
  } else {
    const rating = createElement("div", "card-stars", stars(title.rating));
    rating.setAttribute("aria-hidden", "true");
    meta.append(rating, createElement("span", "sr-only", `Note : ${title.rating} sur 5`));
  }

  link.append(img, meta);
  li.append(link);
  return li;
}

// Challenge ⭐: a draft we will attach in one go.
export function createCards(titles: Title[]): DocumentFragment {
  const fragment = document.createDocumentFragment();
  for (const title of titles) fragment.append(createCard(title));
  return fragment;
}
