import type { QuestContext } from "../engine/core.ts";
import type { Flags } from "../src/types.ts";

export const title = "Tout public ?";
export const file = "src/03-ratings.ts";

export const lesson = `
Le profil « Enfants » ne doit pas voir *Narcos*. Le code doit **décider** :
selon l'âge, selon la note, selon les drapeaux d'un titre.

## if, else if, else

\`\`\`
if (age >= 18) {
  return "adult";
} else if (age >= 12) {
  return "teen";
} else {
  return "kid";
}
\`\`\`

Les conditions se lisent de haut en bas : la première vraie gagne, les
autres sont ignorées. L'ordre compte.

## Comparer

\`===\` compare valeur **et** type. \`==\` convertit d'abord, et c'est une
source de bugs sans fin : \`"16" == 16\` est vrai, \`"16" === 16\` est faux.
**N'écris jamais \`==\`.** Le linter (\`npm run lint\`) le refuse de toute façon.

Les opérateurs logiques : \`&&\` (et), \`||\` (ou), \`!\` (non).

## Vrai, faux, et tout le reste

Une condition n'a pas besoin d'être un booléen. \`0\`, \`""\`, \`null\`,
\`undefined\` et \`NaN\` comptent comme faux (**falsy**). Tout le reste est
vrai (**truthy**) : \`"0"\`, \`[]\`, \`{}\` sont vrais.

\`\`\`
if (title.isNew) { … }      // marche que isNew vaille true, 1 ou "oui"
\`\`\`

## Le ternaire

Pour un choix simple entre deux valeurs, sur une ligne :

\`\`\`
const access = age >= 16 ? "granted" : "denied";
\`\`\`

## Les propriétés optionnelles

\`Flags\` (voir \`src/types.ts\`) déclare \`isNew?: boolean\` : le point
d'interrogation veut dire que la propriété peut manquer. La lire donne
\`boolean | undefined\`, et \`undefined\` est falsy — un \`if\` s'en charge
gratuitement.
`;

export const mission = `
Dans \`src/03-ratings.ts\` :
- \`canWatch(age, minimumAge)\` → \`true\` ou \`false\`
- \`badge(flags)\` → \`"NOUVEAU"\` si \`flags.isNew\`, sinon \`"TOP 10"\` si \`flags.top10\`, sinon \`""\`
- \`ratingLabel(rating)\` → \`"Coup de cœur"\` (≥ 4.5), \`"Recommandé"\` (≥ 3.5), \`"Mitigé"\` (≥ 2), \`"À éviter"\` (en dessous)
`;

interface Module {
  canWatch(age: number, minimumAge: number): boolean;
  badge(flags: Flags): string;
  ratingLabel(rating: number | null | undefined): string;
}

export default function ({ test, challenge, expect }: QuestContext, m: Module): void {
  test("canWatch(16, 16) renvoie true — l'âge minimum est inclus", () => {
    expect(m.canWatch(16, 16)).toBe(true);
    expect(m.canWatch(30, 18)).toBe(true);
  });

  test("canWatch(9, 12) renvoie false", () => {
    expect(m.canWatch(9, 12)).toBe(false);
    expect(m.canWatch(17, 18)).toBe(false);
  });

  test("canWatch renvoie un vrai booléen, pas un nombre ni une chaîne", () => {
    expect(m.canWatch(5, 0)).toBe(true);
    expect(typeof m.canWatch(5, 0)).toBe("boolean");
  });

  test('badge({ isNew: true }) renvoie "NOUVEAU"', () => {
    expect(m.badge({ isNew: true, top10: false })).toBe("NOUVEAU");
  });

  test('badge({ top10: true }) renvoie "TOP 10"', () => {
    expect(m.badge({ isNew: false, top10: true })).toBe("TOP 10");
  });

  test("badge : NOUVEAU passe avant TOP 10 quand les deux sont levés", () => {
    expect(m.badge({ isNew: true, top10: true })).toBe("NOUVEAU");
  });

  test('badge({}) renvoie "" quand aucun drapeau n\'est levé', () => {
    expect(m.badge({ isNew: false, top10: false })).toBe("");
    expect(m.badge({})).toBe("");
  });

  test("ratingLabel : 4.5 et plus → Coup de cœur", () => {
    expect(m.ratingLabel(4.5)).toBe("Coup de cœur");
    expect(m.ratingLabel(5)).toBe("Coup de cœur");
  });

  test("ratingLabel : de 3.5 à 4.4 → Recommandé", () => {
    expect(m.ratingLabel(3.5)).toBe("Recommandé");
    expect(m.ratingLabel(4.4)).toBe("Recommandé");
  });

  test("ratingLabel : de 2 à 3.4 → Mitigé, en dessous → À éviter", () => {
    expect(m.ratingLabel(2)).toBe("Mitigé");
    expect(m.ratingLabel(3.4)).toBe("Mitigé");
    expect(m.ratingLabel(1.9)).toBe("À éviter");
    expect(m.ratingLabel(0)).toBe("À éviter");
  });

  challenge('ratingLabel(undefined) et ratingLabel(null) renvoient "Pas encore noté"', () => {
    expect(m.ratingLabel(undefined)).toBe("Pas encore noté");
    expect(m.ratingLabel(null)).toBe("Pas encore noté");
    expect(m.ratingLabel(0)).toBe("À éviter");
  });
}
