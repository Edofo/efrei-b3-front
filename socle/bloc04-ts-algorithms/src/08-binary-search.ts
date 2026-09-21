/* Quest 8 · Cut in half
   `T extends string | number`: only values that `<` knows how to compare. */

export function binarySearch<T extends string | number>(sorted: readonly T[], target: T): number {
  // TODO
}

export function insertSorted<T extends string | number>(sorted: readonly T[], value: T): T[] {
  // TODO
}

// Challenge ⭐: firstOccurrence<T extends string | number>(sorted: readonly T[], target: T): number
