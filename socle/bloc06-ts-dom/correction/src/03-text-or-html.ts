/* Quest 3 · Text or HTML? — solution */

export function showResultCount(el: HTMLElement, query: string, count: number): void {
  let start: string;
  if (count === 0) start = "Aucun résultat";
  else if (count === 1) start = "1 résultat";
  else start = `${count} résultats`;
  // textContent: the query is shown as is, never interpreted.
  el.textContent = `${start} pour « ${query} »`;
}

export function clear(el: Element): void {
  el.replaceChildren();
}

export function highlight(el: HTMLElement, text: string, query: string): void {
  el.replaceChildren();
  if (!query) {
    el.append(text);
    return;
  }
  const lowerText = text.toLowerCase();
  const target = query.toLowerCase();
  let position = 0;
  // Challenge ⭐: move from occurrence to occurrence instead of stopping at the first.
  let index = lowerText.indexOf(target, position);
  while (index !== -1) {
    el.append(text.slice(position, index)); // a string becomes a text node
    const mark = document.createElement("mark");
    mark.textContent = text.slice(index, index + query.length); // the TEXT's casing
    el.append(mark);
    position = index + query.length;
    index = lowerText.indexOf(target, position);
  }
  el.append(text.slice(position));
}
