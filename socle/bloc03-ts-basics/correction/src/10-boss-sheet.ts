/* Quest 10 · BOSS · The full sheet — solution */
import type { Movie } from "./types.ts";
import { formatDuration } from "./02-durations.ts";
import { stars, totalEpisodes } from "./04-loops.ts";

function capitalize(word: string): string {
  return word[0].toUpperCase() + word.slice(1);
}

// Challenge: the singular. "1 saison", "1 épisode".
function plural(count: number, word: string): string {
  return `${count} ${word}${count > 1 ? "s" : ""}`;
}

function ageLine(title: Movie): string {
  const minimumAge = title.minimumAge ?? 0;
  return minimumAge === 0 ? "Tout public" : `${minimumAge}+`;
}

function ratingPart(title: Movie): string {
  if (title.rating === undefined || title.rating === null) return "Non noté";
  return `${stars(Math.round(title.rating))} ${title.rating}/5`;
}

function formatPart(title: Movie): string {
  if (title.seasons) {
    return `${plural(title.seasons.length, "saison")} · ${plural(totalEpisodes(title.seasons), "épisode")}`;
  }
  return formatDuration(title.runtime ?? 0);
}

export function sheet(title: Movie): string {
  const header = `${title.title.toUpperCase()} (${title.year}) · ${ageLine(title)}`;
  const details = `${ratingPart(title)} · ${formatPart(title)}`;
  const genres = (title.genres ?? []).map(capitalize).join(", ");
  const director = title.credits?.director;
  const credits = director ? `Réalisé par ${director}` : "Réalisation inconnue";
  return [header, details, genres, credits].join("\n");
}

export function catalogueText(titles: Movie[]): string {
  return titles.map(sheet).join("\n\n");
}
