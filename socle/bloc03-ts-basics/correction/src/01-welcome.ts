/* Quest 1 · The first word — solution */

export function welcome(name?: string): string {
  // Challenge: no name, no comma. `name` is undefined when it is not passed.
  if (name === undefined) return "Bienvenue sur NOLANFLIX !";
  return `Bienvenue sur NOLANFLIX, ${name} !`;
}

export function uppercase(title: string): string {
  return title.toUpperCase();
}

export function titleLength(title: string): number {
  return title.length;
}
