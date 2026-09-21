import type { BrowserQuestContext } from "../engine/browser.ts";
import type { SelectOption } from "../src/types.ts";
import { must } from "./_fixtures.ts";

export const title = "Le formulaire";
export const file = "src/08-forms.ts";

export const lesson = `
Le formulaire de recherche du bloc 1 a une \`action="/recherche"\` : sans
JavaScript, valider recharge la page vers cette URL. C'est le
comportement natif, et il **marche**. Le JS vient par-dessus pour faire
mieux : valider avant d'envoyer, filtrer sans recharger.

## submit, pas click

On écoute \`submit\` **sur le formulaire**. Il se déclenche pour le bouton,
pour la touche Entrée, pour tout ce qui valide. Écouter \`click\` sur le
bouton rate la touche Entrée.

\`\`\`
form.addEventListener("submit", (event) => {
  event.preventDefault();          // sinon la page se recharge
  // …
});
\`\`\`

## Lire les champs d'un coup : FormData

\`\`\`
const data = Object.fromEntries(new FormData(form));
// { q: "dark", genre: "drame" }
\`\`\`

Chaque champ avec un \`name\` devient une clé. Une case à cocher n'y
figure **que si elle est cochée** (valeur \`"on"\` par défaut). Les valeurs
d'un \`FormData\` sont typées \`FormDataEntryValue\` (une chaîne ou un
\`File\`) : notre formulaire n'a pas de fichier, la fonction renvoie donc
un \`Record<string, string>\` — une assertion, une seule, à la frontière.

## Dire ce qui ne va pas

Un message d'erreur, c'est du texte dans un élément que le lecteur
d'écran annonce : \`<output aria-live="polite">\`. Et le champ fautif est
marqué : \`aria-invalid="true"\`. Quand c'est corrigé, on efface **les
deux**.

## Remplir un select

\`\`\`
const option = document.createElement("option");
option.value = "drame";
option.textContent = "Drame";
select.append(option);
\`\`\`
`;

export const mission = `
Dans \`src/08-forms.ts\` :
- \`readForm(form)\` → un objet \`{ nom: valeur }\` de tous les champs nommés
- \`bindForm(form, onValid)\` → à \`submit\` : annule l'envoi ; si \`q\` (sans espaces autour) fait moins de 2 caractères, écrit \`« Tape au moins 2 caractères »\` dans l'\`output\` du formulaire et pose \`aria-invalid="true"\` sur le champ ; sinon efface le message, retire \`aria-invalid\`, et appelle \`onValid(data)\` avec \`q\` nettoyé
- \`fillSelect(select, options)\` → remplace les \`<option>\` par celles de \`options\` (\`{ value, label }\`)
`;

interface Module {
  readForm(form: HTMLFormElement): Record<string, string>;
  bindForm(form: HTMLFormElement, onValid: (data: Record<string, string>) => void): void;
  fillSelect(select: HTMLSelectElement, options: SelectOption[]): void;
}

const FORM = (): string => `<form class="search-box" role="search" action="/recherche" method="get">
  <label class="sr-only" for="q">Rechercher</label>
  <input class="search-input" id="q" name="q" type="search" value="" />
  <select name="genre" id="genre"><option value="">Tous</option><option value="drame" selected>Drame</option></select>
  <label><input type="checkbox" name="nouveautes" /> Nouveautés</label>
  <button type="submit">Chercher</button>
  <output aria-live="polite"></output>
</form>`;

const submit = (form: HTMLFormElement): Event => {
  const event = new Event("submit", { bubbles: true, cancelable: true });
  form.dispatchEvent(event);
  return event;
};

export default function (
  { test, challenge, expect, sandbox, wasPrevented }: BrowserQuestContext,
  m: Module,
): void {
  const form = (): HTMLFormElement => must(sandbox(FORM()), "form");
  const field = (f: HTMLFormElement): HTMLInputElement => must(f, "#q");
  const output = (f: HTMLFormElement): HTMLOutputElement => must(f, "output");

  test('readForm(form) renvoie { q: "dark", genre: "drame" } — la case non cochée est absente', () => {
    const f = form();
    field(f).value = "dark";
    expect(m.readForm(f)).toEqual({ q: "dark", genre: "drame" });
  });

  test('readForm : la case cochée apparaît avec "on"', () => {
    const f = form();
    must<HTMLInputElement>(f, '[name="nouveautes"]').checked = true;
    expect(m.readForm(f)).toEqual({ q: "", genre: "drame", nouveautes: "on" });
  });

  test("bindForm annule l'envoi natif (preventDefault)", () => {
    const f = form();
    m.bindForm(f, () => {});
    field(f).value = "dark";
    expect(wasPrevented(submit(f))).toBe(true);
  });

  test('q trop court : message « Tape au moins 2 caractères » dans output, aria-invalid="true", onValid pas appelé', () => {
    const f = form();
    const calls: Record<string, string>[] = [];
    m.bindForm(f, (data) => calls.push(data));
    field(f).value = "d";
    submit(f);
    expect(output(f)).toHaveTextContent("Tape au moins 2 caractères");
    expect(field(f)).toHaveAttribute("aria-invalid", "true");
    expect(calls).toEqual([]);
  });

  test('q = "   " (que des espaces) est trop court aussi', () => {
    const f = form();
    const calls: Record<string, string>[] = [];
    m.bindForm(f, (data) => calls.push(data));
    field(f).value = "   ";
    submit(f);
    expect(calls).toEqual([]);
    expect(field(f)).toHaveAttribute("aria-invalid", "true");
  });

  test('q valide : onValid({ q: "dark", genre: "drame" }) avec q nettoyé, message effacé, aria-invalid retiré', () => {
    const f = form();
    const calls: Record<string, string>[] = [];
    m.bindForm(f, (data) => calls.push(data));
    field(f).value = "d";
    submit(f);
    field(f).value = "  dark ";
    submit(f);
    expect(calls).toEqual([{ q: "dark", genre: "drame" }]);
    expect(output(f).textContent).toBe("");
    expect(
      field(f).getAttribute("aria-invalid"),
      'aria-invalid doit disparaître (ou valoir "false")',
    ).not.toBe("true");
  });

  test("bindForm écoute submit sur le formulaire, pas click sur le bouton", () => {
    expect(m.bindForm.toString()).toMatch(/["']submit["']/);
    expect(m.bindForm.toString()).not.toMatch(/["']click["']/);
  });

  test("fillSelect remplace les options, sans doublon si appelé deux fois", () => {
    const select = must<HTMLSelectElement>(
      sandbox('<select name="genre"><option value="">Tous</option></select>'),
      "select",
    );
    const options: SelectOption[] = [
      { value: "drame", label: "Drame" },
      { value: "thriller", label: "Thriller" },
    ];
    m.fillSelect(select, options);
    m.fillSelect(select, options);
    expect(select.options).toHaveLength(2);
    expect([...select.options].map((o) => o.value)).toEqual(["drame", "thriller"]);
    expect([...select.options].map((o) => o.textContent)).toEqual(["Drame", "Thriller"]);
  });

  challenge(
    "validation en direct : après une erreur, taper 2 caractères efface le message sans re-soumettre",
    () => {
      const f = form();
      m.bindForm(f, () => {});
      const q = field(f);
      q.value = "d";
      submit(f);
      expect(output(f).textContent).not.toBe("");
      q.value = "da";
      q.dispatchEvent(new Event("input", { bubbles: true }));
      expect(output(f).textContent).toBe("");
      expect(q.getAttribute("aria-invalid")).not.toBe("true");
    },
  );
}
