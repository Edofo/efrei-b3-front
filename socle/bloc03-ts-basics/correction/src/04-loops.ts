/* Quest 4 · Again, again, again — solution */

const STAR_COUNT = 5;

export function stars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5; // challenge: the half star
  let text = "";
  for (let i = 0; i < full; i++) text += "★";
  if (half) text += "½";
  while (text.length < STAR_COUNT) text += "☆";
  return text;
}

export function totalEpisodes(seasons: number[]): number {
  let total = 0;
  for (const episodes of seasons) {
    total += episodes;
  }
  return total;
}

export function countdown(n: number): string {
  let text = "";
  for (let i = n; i >= 1; i--) {
    text += `${i}, `;
  }
  return `${text}Action !`;
}
