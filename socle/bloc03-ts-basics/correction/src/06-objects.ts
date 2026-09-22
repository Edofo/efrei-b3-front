/* Quest 6 · The movie card — solution */
import type { Movie } from "./types.ts";

export function createMovie(title: string, year: number, rating: number): Movie {
  return { title, year, rating };
}

export function summary(movie: Movie): string {
  // Challenge: missing rating (undefined or null) → "non noté". 0 is a real rating.
  const rating =
    movie.rating === undefined || movie.rating === null ? "non noté" : `★ ${movie.rating}`;
  return `${movie.title} (${movie.year}) · ${rating}`;
}

export function rate(movie: Movie, rating: number): Movie {
  movie.rating = rating;
  return movie;
}

export function hasGenre(movie: Movie, genre: string): boolean {
  return movie.genres?.includes(genre) ?? false;
}

export function fields(movie: Movie): string[] {
  return Object.keys(movie);
}
