/* Quest 6 · Reacting — solution */

function normalize(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

function countLabel(count: number): string {
  if (count === 0) return "Aucun titre";
  return count === 1 ? "1 titre" : `${count} titres`;
}

export function bindSearch(
  input: HTMLInputElement,
  container: HTMLElement,
  output?: HTMLElement,
): void {
  input.addEventListener("input", () => {
    const query = normalize(input.value);
    let shown = 0;
    for (const card of container.querySelectorAll<HTMLElement>(".card")) {
      const title = normalize(card.querySelector(".card-title")?.textContent ?? "");
      card.hidden = query !== "" && !title.includes(query);
      if (!card.hidden) shown++;
    }
    if (output) output.textContent = countLabel(shown); // challenge ⭐
  });
}

export function bindProfileMenu(button: HTMLButtonElement, menu: HTMLElement): void {
  const setOpen = (open: boolean): void => {
    menu.classList.toggle("profile-menu-open", open);
    button.setAttribute("aria-expanded", String(open));
  };
  button.addEventListener("click", () => setOpen(!menu.classList.contains("profile-menu-open")));
  const onEscape = (event: KeyboardEvent): void => {
    if (event.key === "Escape") setOpen(false);
  };
  menu.addEventListener("keydown", onEscape);
  button.addEventListener("keydown", onEscape);
}

export function bindArrows(viewport: HTMLElement): void {
  const track = viewport.querySelector<HTMLElement>(".track");
  if (!track) return;
  viewport.querySelector(".arrow-left")?.addEventListener("click", () => {
    track.scrollLeft -= 700;
  });
  viewport.querySelector(".arrow-right")?.addEventListener("click", () => {
    track.scrollLeft += 700;
  });
}
