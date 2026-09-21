import type { QuestContext } from "../engine/core.ts";
import type { Catalogue, HistoryView, Profile } from "../src/types.ts";
import { catalogue, profile } from "./_data.ts";

export const title = "La jointure";
export const file = "src/06-join.ts";

export const lesson = `
Ouvre \`data/profiles.json\`. L'historique de Nolan dit \`{ "id": "ozark",
"progress": 0.6 }\`. Pas de nom, pas d'affiche : juste un **id** qui
pointe vers le catalogue. C'est normal, et c'est même la bonne façon de
faire — le nom de *Ozark* n'a pas à être recopié dans chaque profil.

Pour afficher « Reprendre *Ozark* · 60 % », il faut **joindre** les deux
fichiers : pour chaque entrée de l'historique, retrouver le titre
correspondant.

## La jointure naïve

\`\`\`
profile.history.map((entry) => {
  const title = catalogue.titles.find((t) => t.id === entry.id);
  return { title: title.title, progress: entry.progress };   // compilateur : possibly undefined
});
\`\`\`

Un \`find\` par entrée. Pour 12 titres, parfait. Pour 100 000, l'index de
la quête 5 (\`indexById\`) rend chaque recherche instantanée.

## Les orphelins

L'historique de Nolan contient un id qui n'est plus au catalogue (un
titre retiré). \`find\` renvoie \`undefined\`, et le compilateur refuse
\`title.title\` tant que tu ne l'as pas géré. Une jointure décide quoi
faire des orphelins : ici, on les **ignore** (\`filter\` après le \`find\`,
ou \`flatMap\` qui renvoie \`[]\`).

## Trier des dates ISO

\`"2026-08-20T21:40:00Z"\` : ce format se trie **comme du texte**. Pas
besoin de \`new Date\` pour ordonner : \`b.watchedAt.localeCompare(a.watchedAt)\`
donne le plus récent d'abord.
`;

export const mission = `
Dans \`src/06-join.ts\` :
- \`history(profile, catalogue)\` → \`HistoryView[]\` : \`{ title, progress, watchedAt }\`, progression en **pourcentage entier**, du plus récent au plus ancien, sans les ids inconnus
- \`continueWatching(profile, catalogue)\` → les noms (chaînes) commencés mais pas finis, du plus récent au plus ancien
- \`hasWatched(profile, id)\` → \`true\` si la progression vaut 1
`;

interface Module {
  history(profile: Profile, catalogue: Catalogue): HistoryView[];
  continueWatching(profile: Profile, catalogue: Catalogue): string[];
  hasWatched(profile: Profile, id: string): boolean;
  unseenNewTitles(profile: Profile, catalogue: Catalogue): string[];
}

export default function ({ test, challenge, expect }: QuestContext, m: Module): void {
  test("history(nolan) joint les titres, du plus récent au plus ancien, sans l'id inconnu", () => {
    expect(m.history(profile("nolan"), catalogue())).toEqual([
      { title: "Ozark", progress: 60, watchedAt: "2026-08-20T21:40:00Z" },
      { title: "Dark", progress: 100, watchedAt: "2026-08-12T20:15:00Z" },
      { title: "Sense8", progress: 15, watchedAt: "2026-07-02T22:05:00Z" },
      { title: "The Matrix", progress: 100, watchedAt: "2026-05-30T19:00:00Z" },
    ]);
  });

  test("history(guest) renvoie []", () => {
    expect(m.history(profile("guest"), catalogue())).toEqual([]);
  });

  test("history ne modifie ni le profil ni le catalogue", () => {
    const p = profile("nolan");
    const c = catalogue();
    const before = JSON.stringify([p, c]);
    m.history(p, c);
    expect(JSON.stringify([p, c])).toBe(before);
  });

  test('continueWatching(nolan) renvoie ["Ozark", "Sense8"]', () => {
    expect(m.continueWatching(profile("nolan"), catalogue())).toEqual(["Ozark", "Sense8"]);
  });

  test('continueWatching(kids) renvoie ["Arcane"] — Amélie est finie', () => {
    expect(m.continueWatching(profile("kids"), catalogue())).toEqual(["Arcane"]);
    expect(m.continueWatching(profile("guest"), catalogue())).toEqual([]);
  });

  test("hasWatched", () => {
    expect(m.hasWatched(profile("nolan"), "dark")).toBe(true);
    expect(m.hasWatched(profile("nolan"), "ozark")).toBe(false);
    expect(m.hasWatched(profile("nolan"), "narcos")).toBe(false);
    expect(m.hasWatched(profile("guest"), "dark")).toBe(false);
  });

  challenge(
    'unseenNewTitles(nolan, catalogue) renvoie ["Élite", "Arcane", "Stranger Things"] — les nouveautés absentes de l\'historique',
    () => {
      expect(m.unseenNewTitles(profile("nolan"), catalogue())).toEqual([
        "Élite",
        "Arcane",
        "Stranger Things",
      ]);
      expect(m.unseenNewTitles(profile("kids"), catalogue())).toEqual([
        "Élite",
        "Dark",
        "Stranger Things",
      ]);
    },
  );
}
