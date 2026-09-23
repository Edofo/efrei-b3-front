/* Quest 5 · Changing state — solution */

export function readId(card: HTMLElement): string {
  return card.dataset.id ?? "";
}

export function toggleFavorite(card: HTMLElement): boolean {
  const active = card.classList.toggle("card-favori");
  card.querySelector(".card-fav")?.setAttribute("aria-pressed", String(active));
  return active;
}

export function setBadge(card: HTMLElement, text: string | null): void {
  const link = card.querySelector("a");
  if (!link) return;
  let badge = link.querySelector(".card-badge");
  if (!text) {
    badge?.remove();
    return;
  }
  if (!badge) {
    badge = document.createElement("p");
    badge.className = "card-badge";
    link.prepend(badge); // first child of the link
  }
  badge.textContent = text;
}

export function showOnly(cards: Iterable<HTMLElement>, ids: string[]): void {
  const allowed = new Set(ids);
  for (const card of cards) {
    card.hidden = !allowed.has(card.dataset.id ?? "");
  }
}

// Challenge ⭐: idempotent — check before adding.
export function markWatched(root: ParentNode, ids: string[]): void {
  const watched = new Set(ids);
  for (const card of root.querySelectorAll<HTMLElement>(".card")) {
    if (!watched.has(card.dataset.id ?? "")) continue;
    card.classList.add("card-vu");
    const meta = card.querySelector(".card-meta");
    if (meta && !meta.querySelector(".card-vu-label")) {
      const label = document.createElement("span");
      label.className = "sr-only card-vu-label";
      label.textContent = "Déjà vu";
      meta.append(label);
    }
  }
}
