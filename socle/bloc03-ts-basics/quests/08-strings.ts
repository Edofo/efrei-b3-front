import type { QuestContext } from "../engine/core.ts";

export const title = "L'atelier des chaînes";
export const file = "src/08-strings.ts";

export const lesson = `
L'URL d'un titre, c'est \`/titres/la-casa-de-papel\` : le titre transformé
en **slug** — minuscules, sans accent, des tirets à la place des espaces.
Le texte d'une carte est **tronqué** avec « … » s'il est trop long. Tout
ça, c'est de la manipulation de chaînes.

## La boîte à outils

\`\`\`
"Dark".toLowerCase()              // "dark"
"  Dark ".trim()                  // "Dark"
"Stranger Things".slice(0, 8)     // "Stranger"   (début inclus, fin exclue)
"a b c".split(" ")                // ["a", "b", "c"]
["a", "b"].join("-")              // "a-b"
"Dark".startsWith("D")            // true
"Dark".includes("ar")             // true
"Dark"[0]                         // "D"
\`\`\`

## replace et les expressions régulières

\`replace\` avec une chaîne ne remplace que la **première** occurrence.
Avec une expression régulière et le drapeau \`g\`, il remplace toutes :

\`\`\`
"a b c".replace(" ", "-")         // "a-b c"    ← une seule
"a b c".replace(/ /g, "-")        // "a-b-c"
"a  b".replace(/\\s+/g, "-")       // "a-b"      \\s+ = un ou plusieurs blancs
"Chef's".replace(/[^a-z0-9]+/g, "-")   // tout ce qui n'est PAS lettre ou chiffre
\`\`\`

## Retirer les accents

Un « é » peut s'écrire comme un seul caractère ou comme « e » + accent
combinant. \`normalize("NFD")\` choisit la deuxième forme ; il ne reste
plus qu'à enlever les accents combinants, qui sont dans la plage
\`\\u0300-\\u036f\` :

\`\`\`
"Élite".normalize("NFD").replace(/[\\u0300-\\u036f]/g, "")   // "Elite"
\`\`\`

## Le caractère « … »

Ce n'est pas trois points, c'est **un** caractère (\`…\`, U+2026). Il compte
pour 1 dans \`.length\`.
`;

export const mission = `
Dans \`src/08-strings.ts\` :
- \`slugify(title)\` → \`"la-casa-de-papel"\` : minuscules, sans accent, un tiret entre les mots, pas de tiret au bord
- \`truncate(text, max)\` → le texte intact s'il tient, sinon coupé à \`max\` caractères, « … » compris
- \`initials(fullName)\` → \`"Nolan Le Boucher"\` → \`"NLB"\`
- \`countWords(text)\` → le nombre de mots, quels que soient les espaces
`;

interface Module {
  slugify(title: string): string;
  truncate(text: string, max: number): string;
  initials(fullName: string): string;
  countWords(text: string): number;
  titleCase(text: string): string;
}

export default function ({ test, challenge, expect }: QuestContext, m: Module): void {
  test('slugify("Dark") renvoie "dark"', () => {
    expect(m.slugify("Dark")).toBe("dark");
  });

  test('slugify("La Casa de Papel") renvoie "la-casa-de-papel"', () => {
    expect(m.slugify("La Casa de Papel")).toBe("la-casa-de-papel");
    expect(m.slugify("Stranger Things")).toBe("stranger-things");
  });

  test('slugify("Élite") renvoie "elite" — sans accent', () => {
    expect(m.slugify("Élite")).toBe("elite");
    expect(m.slugify("Amélie")).toBe("amelie");
  });

  test('slugify("Chef\'s Table") renvoie "chefs-table" — l\'apostrophe disparaît', () => {
    expect(m.slugify("Chef's Table")).toBe("chefs-table");
  });

  test("slugify ne laisse pas de tiret au début ni à la fin, ni de tirets doubles", () => {
    expect(m.slugify("  Dark !  ")).toBe("dark");
    expect(m.slugify("Sense8 : la suite")).toBe("sense8-la-suite");
  });

  test("truncate laisse un texte court intact", () => {
    expect(m.truncate("Dark", 10)).toBe("Dark");
    expect(m.truncate("Dark", 4)).toBe("Dark");
  });

  test('truncate("Stranger Things", 8) renvoie "Strange…" — 8 caractères, « … » compris', () => {
    expect(m.truncate("Stranger Things", 8)).toBe("Strange…");
    expect(m.truncate("Stranger Things", 8)).toHaveLength(8);
    expect(m.truncate("La Casa de Papel", 12)).toBe("La Casa de …");
  });

  test('initials("Nolan Le Boucher") renvoie "NLB"', () => {
    expect(m.initials("Nolan Le Boucher")).toBe("NLB");
    expect(m.initials("Amélie")).toBe("A");
    expect(m.initials("baran bo odar")).toBe("BBO");
  });

  test('countWords("Un lycée d\'élite, trois boursiers") renvoie 5', () => {
    expect(m.countWords("Un lycée d'élite, trois boursiers")).toBe(5);
    expect(m.countWords("Dark")).toBe(1);
  });

  test("countWords ignore les espaces en trop et renvoie 0 pour une chaîne vide", () => {
    expect(m.countWords("  Dark   Arcane  ")).toBe(2);
    expect(m.countWords("")).toBe(0);
    expect(m.countWords("   ")).toBe(0);
  });

  challenge('titleCase("la casa de papel") renvoie "La Casa De Papel"', () => {
    expect(m.titleCase("la casa de papel")).toBe("La Casa De Papel");
    expect(m.titleCase("stranger things")).toBe("Stranger Things");
    expect(m.titleCase("élite")).toBe("Élite");
  });
}
