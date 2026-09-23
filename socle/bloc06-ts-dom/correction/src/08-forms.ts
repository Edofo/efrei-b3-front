/* Quest 8 · The form — solution */
import type { SelectOption } from "./types.ts";

const MIN_QUERY_LENGTH = 2;
const TOO_SHORT = "Tape au moins 2 caractères";

export function readForm(form: HTMLFormElement): Record<string, string> {
  // Our form has no file field: every value is a string.
  return Object.fromEntries(new FormData(form)) as Record<string, string>;
}

export function fillSelect(select: HTMLSelectElement, options: SelectOption[]): void {
  select.replaceChildren(
    ...options.map(({ value, label }) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      return option;
    }),
  );
}

export function bindForm(
  form: HTMLFormElement,
  onValid: (data: Record<string, string>) => void,
): void {
  const field = form.querySelector<HTMLInputElement>('[name="q"]');
  const output = form.querySelector("output");
  if (!field || !output) throw new Error("the form needs a q field and an output");

  const validate = (): string | null => {
    const query = field.value.trim();
    if (query.length < MIN_QUERY_LENGTH) {
      output.textContent = TOO_SHORT;
      field.setAttribute("aria-invalid", "true");
      return null;
    }
    output.textContent = "";
    field.removeAttribute("aria-invalid");
    return query;
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = validate();
    if (query === null) return;
    onValid({ ...readForm(form), q: query });
  });

  // Challenge ⭐: once an error is shown, every keystroke re-validates.
  field.addEventListener("input", () => {
    if (field.getAttribute("aria-invalid") === "true") validate();
  });
}
