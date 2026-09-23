/* Quest 8 · Quality control — solution */
import type { ValidationReport } from "./types.ts";

const FIRST_MOVIE_YEAR = 1895;
const LAST_ACCEPTED_YEAR = 2030;
const MAX_RATING = 5;
const KINDS = ["movie", "series"];

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim() !== "";

const isValidYear = (value: unknown): boolean =>
  Number.isInteger(value) &&
  (value as number) >= FIRST_MOVIE_YEAR &&
  (value as number) <= LAST_ACCEPTED_YEAR;

const isValidRating = (value: unknown): boolean =>
  typeof value === "number" && !Number.isNaN(value) && value >= 0 && value <= MAX_RATING;

const isGenreList = (value: unknown): boolean =>
  Array.isArray(value) && value.length > 0 && value.every((genre) => typeof genre === "string");

export function validate(input: unknown): string[] {
  // Anything that is not an object gets an empty record: every check then fails, cleanly.
  const record: Record<string, unknown> =
    typeof input === "object" && input !== null ? (input as Record<string, unknown>) : {};
  const errors: string[] = [];
  if (!isNonEmptyString(record.id)) errors.push("missing id");
  if (!isNonEmptyString(record.title)) errors.push("missing title");
  if (!KINDS.includes(record.kind as string)) errors.push("invalid kind");
  if (!isValidYear(record.year)) errors.push("invalid year");
  if (record.rating !== undefined && record.rating !== null && !isValidRating(record.rating))
    errors.push("invalid rating");
  if (!isGenreList(record.genres)) errors.push("invalid genres");
  return errors;
}

export function validateCatalogue(inputs: unknown[]): ValidationReport {
  const report: ValidationReport = { valid: 0, errors: {} };
  const seenIds = new Set<string>();
  inputs.forEach((input, index) => {
    const id = (input as { id?: unknown } | null)?.id;
    const key = isNonEmptyString(id) ? id : `#${index}`;
    const errors = validate(input);
    if (seenIds.has(key)) errors.push("duplicate id"); // challenge ⭐
    seenIds.add(key);
    if (errors.length === 0) report.valid++;
    else report.errors[key] = errors;
  });
  return report;
}
