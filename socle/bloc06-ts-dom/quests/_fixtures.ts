/* The data and the pieces of page used by the tests. The HTML produced
   here is the real page's (bloc 2): same classes, same structure. Every
   test gets a fresh copy through sandbox(html). */
import type { Catalogue, Row, Title } from "../src/types.ts";

export const CATALOGUE = (await (
  await fetch("/data/catalogue.json", { cache: "no-store" })
).json()) as Catalogue;

export function catalogue(): Catalogue {
  return structuredClone(CATALOGUE);
}

export function title(id: string): Title {
  const found = CATALOGUE.titles.find((t) => t.id === id);
  if (!found) throw new Error(`unknown test title: ${id}`);
  return structuredClone(found);
}

export function titles(...ids: string[]): Title[] {
  return ids.map(title);
}

export function stars(rating: number): string {
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

const TINY_POSTER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='27'%3E%3Crect width='48' height='27' fill='%23333'/%3E%3C/svg%3E";

export function cardHtml(t: Title, { favorite = false } = {}): string {
  const rating =
    t.rating === undefined || t.rating === null
      ? '<span class="sr-only">Pas encore noté</span>'
      : `<div class="card-stars" aria-hidden="true">${stars(t.rating)}</div><span class="sr-only">Note : ${t.rating} sur 5</span>`;
  return `<li class="card" data-id="${t.id}">
  <a href="/titres/${t.id}">
    ${t.top10 ? '<p class="card-badge">TOP 10</p>' : ""}
    <img class="card-img" src="${TINY_POSTER}" alt="${t.title} — ${t.tagline}" />
    <div class="card-meta">
      <h3 class="card-title">${t.title}</h3>
      ${rating}
    </div>
  </a>${favorite ? '\n  <button class="card-fav" type="button" aria-pressed="false" aria-label="Ajouter à ma liste">♡</button>' : ""}
</li>`;
}

export function rowHtml(row: Row, list: Title[] = CATALOGUE.titles): string {
  const cards = row.ids
    .map((id) => list.find((t) => t.id === id))
    .filter((t): t is Title => t !== undefined)
    .map((t) => cardHtml(t))
    .join("\n");
  return `<section class="row" aria-labelledby="row-${row.id}">
  <h2 class="row-title" id="row-${row.id}">${row.title}</h2>
  <div class="row-viewport">
    <button class="arrow arrow-left" type="button" aria-label="Faire défiler ${row.title} vers la gauche"><span aria-hidden="true">‹</span></button>
    <ul class="track">
${cards}
    </ul>
    <button class="arrow arrow-right" type="button" aria-label="Faire défiler ${row.title} vers la droite"><span aria-hidden="true">›</span></button>
  </div>
</section>`;
}

export const SKELETON_HTML = `<section class="row" id="skeleton" aria-hidden="true">
  <h2 class="row-title">Chargement…</h2>
  <div class="row-viewport">
    <ul class="track">
      ${'<li class="card"><div class="skeleton-img"></div><div class="skeleton-line"></div></li>'.repeat(6)}
    </ul>
  </div>
</section>`;

/** The home page, reduced to what the quests manipulate. */
export function pageHtml(): string {
  return `<header class="topbar">
  <a class="logo" href="/">NOLANFLIX</a>
  <div class="topbar-right">
    <form class="search-box" role="search" action="/recherche" method="get">
      <label class="sr-only" for="search">Rechercher un titre</label>
      <input class="search-input" id="search" name="q" type="search" placeholder="Titres, personnes, genres" />
    </form>
    <button class="avatar" type="button" id="avatar" aria-label="Profil de Nolan" aria-expanded="false" aria-controls="profile-menu"></button>
  </div>
</header>
<ul class="profile-menu" id="profile-menu">
  <li><button class="profile-row" type="button">Nolan</button></li>
  <li><button class="profile-row" type="button">Se déconnecter</button></li>
</ul>
<main>
  <section class="hero" aria-labelledby="hero-title">
    <div class="hero-text">
      <p class="hero-tag">Série NOLANFLIX</p>
      <h1 class="hero-title" id="hero-title">Dark</h1>
      <p class="hero-flags"><time class="flag-year" datetime="2017">2017</time> <span class="flag-age">16+</span></p>
      <p class="hero-desc">Quatre familles, une grotte, trois époques</p>
    </div>
  </section>
  <div class="rows">
${SKELETON_HTML}
  </div>
  <p class="sr-only" role="status"></p>
</main>`;
}

/** A required element of a fixture: throws instead of returning null. */
export function must<T extends Element>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`fixture is missing ${selector}`);
  return element;
}
