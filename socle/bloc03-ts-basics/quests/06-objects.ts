import type { QuestContext } from "../engine/core.ts";
import type { Movie } from "../src/types.ts";

export const title = "La fiche du film";
export const file = "src/06-objects.ts";

export const lesson = `
Un film, ce n'est pas juste un titre : c'est un titre, une année, une note,
des genres. Pour regrouper des données qui vont ensemble, JavaScript a
l'**objet** — des paires clé / valeur entre accolades :

\`\`\`
const movie: Movie = {
  title: "Dark",
  year: 2017,
  rating: 4.5,
  genres: ["drame", "science-fiction"],
};
\`\`\`

## Lire, écrire

\`\`\`
movie.title               // "Dark"
movie["title"]            // pareil, utile quand la clé est dans une variable
movie.rating = 4.7;       // modifie la propriété
movie.credits             // undefined — pas d'erreur, juste rien
Object.keys(movie)        // ["title", "year", "rating", "genres"]
\`\`\`

## L'interface

\`Movie\` vit dans \`src/types.ts\`. Une **interface** décrit la forme d'un
objet : quelles clés, quels types, lesquelles sont optionnelles
(\`rating?\`). Écris \`movie.titel\` et le compilateur t'arrête avant qu'un
seul test tourne. C'est tout l'intérêt.

## Créer un objet depuis des paramètres

Quand la variable porte le même nom que la clé, on peut écrire la clé
seule. Les deux lignes ci-dessous sont identiques :

\`\`\`
return { title: title, year: year };
return { title, year };
\`\`\`

## Le point de vue de la mémoire

Un objet passé à une fonction n'est **pas copié** : la fonction reçoit une
référence vers le même objet. Si elle le modifie, l'appelant voit la
modification. C'est parfois ce qu'on veut (\`rate\`), parfois une
catastrophe silencieuse. Tu y reviendras.
`;

export const mission = `
Dans \`src/06-objects.ts\` :
- \`createMovie(title, year, rating)\` → \`{ title, year, rating }\`
- \`summary(movie)\` → \`"Dark (2017) · ★ 4.5"\`
- \`rate(movie, rating)\` → modifie \`movie.rating\` et renvoie le film
- \`hasGenre(movie, genre)\` → \`true\` si le genre est dans \`movie.genres\`
- \`fields(movie)\` → le tableau des noms de propriétés
`;

interface Module {
  createMovie(title: string, year: number, rating: number): Movie;
  summary(movie: Movie): string;
  rate(movie: Movie, rating: number): Movie;
  hasGenre(movie: Movie, genre: string): boolean;
  fields(movie: Movie): string[];
}

export default function ({ test, challenge, expect }: QuestContext, m: Module): void {
  const dark = (): Movie => ({
    title: "Dark",
    year: 2017,
    rating: 4.5,
    genres: ["drame", "science-fiction"],
  });

  test('createMovie("Dark", 2017, 4.5) renvoie { title: "Dark", year: 2017, rating: 4.5 }', () => {
    expect(m.createMovie("Dark", 2017, 4.5)).toEqual({ title: "Dark", year: 2017, rating: 4.5 });
  });

  test("createMovie renvoie un objet neuf à chaque appel", () => {
    const a = m.createMovie("Dark", 2017, 4.5);
    const b = m.createMovie("Dark", 2017, 4.5);
    expect(a).toEqual(b);
    expect(a === b, "les deux appels renvoient le MÊME objet").toBe(false);
  });

  test('summary(dark) renvoie "Dark (2017) · ★ 4.5"', () => {
    expect(m.summary(dark())).toBe("Dark (2017) · ★ 4.5");
    expect(m.summary({ title: "Amélie", year: 2001, rating: 4 })).toBe("Amélie (2001) · ★ 4");
  });

  test("rate(movie, 3) change la note du film reçu", () => {
    const movie = dark();
    m.rate(movie, 3);
    expect(movie.rating).toBe(3);
  });

  test("rate renvoie le film (le même objet, pas une copie)", () => {
    const movie = dark();
    const returned = m.rate(movie, 2);
    expect(returned).toBe(movie);
    expect(returned.rating).toBe(2);
  });

  test('hasGenre(dark, "drame") renvoie true, hasGenre(dark, "comédie") renvoie false', () => {
    expect(m.hasGenre(dark(), "drame")).toBe(true);
    expect(m.hasGenre(dark(), "science-fiction")).toBe(true);
    expect(m.hasGenre(dark(), "comédie")).toBe(false);
    expect(m.hasGenre({ title: "X", year: 2000 }, "drame"), "aucun genre du tout").toBe(false);
  });

  test('fields(dark) renvoie ["title", "year", "rating", "genres"]', () => {
    expect(m.fields(dark())).toEqual(["title", "year", "rating", "genres"]);
    expect(m.fields({ title: "X", year: 2000 })).toEqual(["title", "year"]);
  });

  challenge('summary d\'un film sans note renvoie "Dark (2017) · non noté"', () => {
    expect(m.summary({ title: "Dark", year: 2017 })).toBe("Dark (2017) · non noté");
    expect(m.summary({ title: "Dark", year: 2017, rating: null })).toBe("Dark (2017) · non noté");
    expect(m.summary({ title: "Dark", year: 2017, rating: 0 }), "0 est une vraie note").toBe(
      "Dark (2017) · ★ 0",
    );
  });
}
