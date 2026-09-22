/* Quest 3 · All ages? — solution */
import type { Flags } from "./types.ts";

export function canWatch(age: number, minimumAge: number): boolean {
  return age >= minimumAge;
}

export function badge(flags: Flags): string {
  if (flags.isNew) return "NOUVEAU";
  if (flags.top10) return "TOP 10";
  return "";
}

export function ratingLabel(rating: number | null | undefined): string {
  // Challenge: the type says the rating may be missing; the compiler makes
  // sure we deal with it before comparing.
  if (rating === undefined || rating === null) return "Pas encore noté";
  if (rating >= 4.5) return "Coup de cœur";
  if (rating >= 3.5) return "Recommandé";
  if (rating >= 2) return "Mitigé";
  return "À éviter";
}
