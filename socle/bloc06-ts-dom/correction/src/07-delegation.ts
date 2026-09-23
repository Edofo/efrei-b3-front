/* Quest 7 · A single listener — solution */
import type { CardCallback } from "./types.ts";

function cardOf(list: HTMLElement, target: EventTarget | null): HTMLElement | null {
  const card = (target as Element | null)?.closest<HTMLElement>(".card") ?? null;
  return card && list.contains(card) ? card : null;
}

export function bindSelection(list: HTMLElement, callback: CardCallback): void {
  list.addEventListener("click", (event) => {
    // Challenge ⭐: a new tab was asked for → let the browser do its thing.
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0) return;
    const card = cardOf(list, event.target);
    if (!card) return;
    event.preventDefault();
    callback(card.dataset.id ?? "", card);
  });
}

export function bindFocus(list: HTMLElement, callback: CardCallback): void {
  // focus does not bubble; focusin does.
  list.addEventListener("focusin", (event) => {
    const card = cardOf(list, event.target);
    if (card) callback(card.dataset.id ?? "", card);
  });
}
