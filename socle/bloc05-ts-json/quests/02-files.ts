import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { QuestContext } from "../engine/core.ts";
import type { Title } from "../src/types.ts";

export const title = "Sur le disque";
export const file = "src/02-files.ts";

export const lesson = `
Le catalogue est dans \`data/catalogue.json\`. Un fichier, sur le disque.
Node sait le lire — le navigateur, lui, n'a pas le droit de toucher au
disque : c'est le sujet du bloc 6 (\`fetch\`).

## Lire un fichier avec Node

\`\`\`
import { readFileSync } from "node:fs";

const text = readFileSync("data/catalogue.json", "utf8");   // une chaîne
const catalogue = JSON.parse(text) as Catalogue;             // un objet
\`\`\`

Sans \`"utf8"\`, \`readFileSync\` renvoie un \`Buffer\` (des octets), pas un
texte. Si le fichier n'existe pas, elle lance une erreur dont le
\`code\` vaut \`"ENOENT"\`.

\`as Catalogue\` est une **assertion de type** : « je sais que ce JSON a
cette forme ». Ça ne vérifie rien à l'exécution — c'est une promesse que
tu fais au compilateur. La quête 8 montre l'alternative honnête.

## Écrire

\`\`\`
import { writeFileSync } from "node:fs";
writeFileSync(filePath, \`\${JSON.stringify(data, null, 2)}\\n\`);
\`\`\`

Le \`"\\n"\` final : un fichier texte se termine par un retour à la ligne.
Git, les éditeurs et \`cat\` te remercieront.

## Où est « data/ » ?

Un chemin relatif comme \`"data/catalogue.json"\` est relatif au dossier
**d'où on a lancé Node**, pas au fichier qui contient le code. Pour viser
un fichier à côté de ton module, quel que soit l'endroit d'où on lance :

\`\`\`
const url = new URL("../data/catalogue.json", import.meta.url);
readFileSync(url, "utf8");
\`\`\`

## Des erreurs qui parlent

« ENOENT: no such file or directory » ne dit pas *quel* fichier. Ta
fonction attrape l'erreur et en relance une avec le chemin dedans.
`;

export const mission = `
Dans \`src/02-files.ts\` :
- \`readJsonFile(filePath)\` → la valeur ; lance \`Error("File not found: <path>")\` ou \`Error("Invalid JSON: <path>")\`
- \`writeJsonFile(filePath, data)\` → écrit le JSON indenté, avec un retour à la ligne final
- \`loadCatalogue()\` → le tableau \`titles\` de \`data/catalogue.json\`, quel que soit le dossier courant
`;

interface Module {
  readJsonFile(filePath: string): unknown;
  writeJsonFile(filePath: string, data: unknown): void;
  loadCatalogue(): Title[];
  loadCatalogueAsync(): Promise<Title[]>;
}

const DATA = fileURLToPath(new URL("../data/", import.meta.url));

export default function ({ test, challenge, expect }: QuestContext, m: Module): void {
  test("readJsonFile(data/profiles.json) renvoie les 3 profils", () => {
    const profiles = m.readJsonFile(path.join(DATA, "profiles.json")) as { name: string }[];
    expect(Array.isArray(profiles)).toBe(true);
    expect(profiles).toHaveLength(3);
    expect(profiles[0].name).toBe("Nolan");
  });

  test('readJsonFile(fichier absent) lance "File not found: <path>"', () => {
    const filePath = path.join(DATA, "does-not-exist.json");
    expect(() => m.readJsonFile(filePath)).toThrow(`File not found: ${filePath}`);
  });

  test('readJsonFile(data/broken.json) lance "Invalid JSON: <path>"', () => {
    const filePath = path.join(DATA, "broken.json");
    expect(() => m.readJsonFile(filePath)).toThrow(`Invalid JSON: ${filePath}`);
  });

  test("writeJsonFile écrit le JSON indenté, avec un retour à la ligne final", () => {
    const folder = mkdtempSync(path.join(tmpdir(), "nolanflix-"));
    try {
      const filePath = path.join(folder, "out.json");
      m.writeJsonFile(filePath, { title: "Dark", genres: ["drame"] });
      expect(existsSync(filePath)).toBe(true);
      expect(readFileSync(filePath, "utf8")).toBe(
        '{\n  "title": "Dark",\n  "genres": [\n    "drame"\n  ]\n}\n',
      );
    } finally {
      rmSync(folder, { recursive: true, force: true });
    }
  });

  test("writeJsonFile puis readJsonFile : l'aller-retour", () => {
    const folder = mkdtempSync(path.join(tmpdir(), "nolanflix-"));
    try {
      const filePath = path.join(folder, "profile.json");
      const profile = { id: "nolan", favoriteGenres: ["drame"], history: [] };
      m.writeJsonFile(filePath, profile);
      expect(m.readJsonFile(filePath)).toEqual(profile);
    } finally {
      rmSync(folder, { recursive: true, force: true });
    }
  });

  test("loadCatalogue() renvoie les 12 titres, sans se soucier du dossier courant", () => {
    const titles = m.loadCatalogue();
    expect(Array.isArray(titles), "on attend le tableau titles, pas l'objet complet").toBe(true);
    expect(titles).toHaveLength(12);
    expect(titles[0].id).toBe("elite");
    expect(titles[3].title).toBe("Dark");
  });

  test("loadCatalogue ne dépend pas de process.cwd() (import.meta.url)", () => {
    expect(m.loadCatalogue.toString()).toMatch(/import\.meta\.url/);
  });

  challenge(
    "loadCatalogueAsync() renvoie une promesse des 12 titres (fs/promises + async/await)",
    async () => {
      const promise = m.loadCatalogueAsync();
      expect(promise).toBeInstanceOf(Promise);
      const titles = await promise;
      expect(titles).toHaveLength(12);
      expect(titles[3].title).toBe("Dark");
    },
  );
}
