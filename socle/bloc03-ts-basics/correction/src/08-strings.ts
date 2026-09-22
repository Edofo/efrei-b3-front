/* Quest 8 · The string workshop — solution */

const ELLIPSIS = "…";

export function slugify(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // the combining accents
    .toLowerCase()
    .replace(/'/g, "") // "chef's" → "chefs"
    .replace(/[^a-z0-9]+/g, "-") // everything else becomes one dash
    .replace(/^-|-$/g, ""); // no dash at the edges
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - ELLIPSIS.length) + ELLIPSIS;
}

export function initials(fullName: string): string {
  return fullName
    .split(" ")
    .map((word) => word[0].toUpperCase())
    .join("");
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (trimmed === "") return 0;
  return trimmed.split(/\s+/).length;
}

// Challenge ⭐
export function titleCase(text: string): string {
  return text
    .split(" ")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}
