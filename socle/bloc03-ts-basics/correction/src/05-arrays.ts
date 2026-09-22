/* Quest 5 · My list — solution */

export function first<T>(list: T[]): T | undefined {
  return list[0];
}

export function last<T>(list: T[]): T | undefined {
  return list[list.length - 1];
}

export function add(list: string[], title: string): string[] {
  list.push(title); // push returns the new LENGTH, not the array: hence the next line
  return list;
}

export function contains(list: string[], title: string): boolean {
  return list.includes(title);
}

export function positionOf(list: string[], title: string): number {
  return list.indexOf(title);
}

export function reversed<T>(list: T[]): T[] {
  // reverse() mutates in place: we do it on a copy.
  // (Node ≥ 20 also has list.toReversed(), which mutates nothing.)
  return [...list].reverse();
}
