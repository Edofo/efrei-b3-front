/* Quest 1 · Finding things in the page — solution */

export function mainTitle(root: ParentNode): string {
  return root.querySelector("h1")?.textContent?.trim() ?? "";
}

export function cardCount(root: ParentNode): number {
  return root.querySelectorAll(".card").length;
}

export function cardTitles(root: ParentNode): string[] {
  // querySelectorAll returns a NodeList: Array.from to get map.
  return Array.from(root.querySelectorAll(".card-title"), (h3) => h3.textContent?.trim() ?? "");
}

export function cardByTitle(root: ParentNode, title: string): HTMLElement | null {
  for (const card of root.querySelectorAll<HTMLElement>(".card")) {
    if (card.querySelector(".card-title")?.textContent?.trim() === title) return card;
  }
  return null;
}

// Challenge ⭐: closest goes up, querySelector goes back down.
export function rowOf(card: Element): string {
  return card.closest(".row")?.querySelector(".row-title")?.textContent?.trim() ?? "";
}
