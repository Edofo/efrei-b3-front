import type { QuestContext } from "../engine/core.ts";

export const title = "Le premier mot";
export const file = "src/01-welcome.ts";

export const lesson = `
Tu viens d'arriver chez NOLANFLIX. Le site est beau (c'est toi qui l'as
fait, blocs 1 et 2), mais il ne **fait** rien. Ton premier ticket : l'écran
d'accueil doit saluer la personne connectée.

En JavaScript, un morceau de code réutilisable s'appelle une **fonction**.
Elle reçoit des **paramètres**, fait un calcul, et **renvoie** un résultat
avec \`return\` :

\`\`\`
export function double(n: number): number {
  return n * 2;
}
\`\`\`

Sans \`return\`, une fonction renvoie \`undefined\`. C'est l'erreur n°1 du
débutant, et le jeu te le dira.

## Les types

C'est du TypeScript : \`n: number\` dit ce qui entre, \`: number\` dit ce
qui sort. Le compilateur les lit avant que le code tourne — appelle
\`double("2")\` et il refuse. Une quête est terminée quand les tests sont
verts **et** que le compilateur n'a rien à redire.

\`export\` rend la fonction visible depuis l'extérieur du fichier : c'est
comme ça que les tests (et plus tard le site) l'appellent.

## Les chaînes de caractères

Un texte se met entre guillemets. Pour y glisser une variable, entoure le
texte de **backticks** (AltGr+7 sur un clavier PC, Option+7 sur Mac) et
écris \`\${…}\` — on appelle ça un template literal :

\`\`\`
const name = "Nolan";
const greeting = \`Bonjour \${name} !\`;   // "Bonjour Nolan !"
greeting.length                           // 14
greeting.toUpperCase()                    // "BONJOUR NOLAN !"
\`\`\`

## Le code parle anglais, le produit parle français

Noms de fonctions, variables, commentaires : en anglais, comme dans toute
équipe. Ce que l'utilisateur lit à l'écran — « Bienvenue sur NOLANFLIX » —
reste en français, parce que le produit est français. Garde les deux
séparés : c'est une compétence de tous les jours en entreprise.
`;

export const mission = `
Dans \`src/01-welcome.ts\`, écris et exporte :
- \`welcome(name)\` → \`"Bienvenue sur NOLANFLIX, Nolan !"\` (attention à la ponctuation)
- \`uppercase(title)\` → le titre en majuscules
- \`titleLength(title)\` → le nombre de caractères
`;

interface Module {
  welcome(name?: string): string;
  uppercase(title: string): string;
  titleLength(title: string): number;
}

export default function ({ test, challenge, expect }: QuestContext, m: Module): void {
  test('welcome("Nolan") renvoie "Bienvenue sur NOLANFLIX, Nolan !"', () => {
    expect(m.welcome("Nolan")).toBe("Bienvenue sur NOLANFLIX, Nolan !");
  });

  test("welcome() marche avec n'importe quel prénom", () => {
    expect(m.welcome("Aïcha")).toBe("Bienvenue sur NOLANFLIX, Aïcha !");
    expect(m.welcome("Jean-Luc")).toBe("Bienvenue sur NOLANFLIX, Jean-Luc !");
  });

  test('uppercase("Dark") renvoie "DARK"', () => {
    expect(m.uppercase("Dark")).toBe("DARK");
    expect(m.uppercase("la casa de papel")).toBe("LA CASA DE PAPEL");
  });

  test('titleLength("Arcane") renvoie 6', () => {
    expect(m.titleLength("Arcane")).toBe(6);
    expect(m.titleLength("")).toBe(0);
    expect(m.titleLength("Stranger Things")).toBe(15);
  });

  challenge('welcome() sans prénom renvoie "Bienvenue sur NOLANFLIX !"', () => {
    expect(m.welcome()).toBe("Bienvenue sur NOLANFLIX !");
    expect(m.welcome("Nolan")).toBe("Bienvenue sur NOLANFLIX, Nolan !");
  });
}
