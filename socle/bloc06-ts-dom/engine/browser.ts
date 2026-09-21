/* engine/browser.ts — the game in the browser (bloc 6, the DOM).

   Loaded by play.html through Vite (`npm run play`). URL options:
     ?solution=1    play with _animateur/solution/src (teacher)
     ?all=1         replay every quest
     ?level=4       replay quest 4 only
     ?reset=1       reset the progress

   The sandbox is a Shadow DOM: the real page's CSS applies inside it
   without leaking into the game's own interface. Vite reloads the page
   whenever a file in src/ or quests/ changes. */

import { play, rankFor, nextRank, splitLesson, emptyProgress } from "./core.ts";
import type {
  Failure,
  GameReport,
  Level,
  LoadedQuest,
  Progress,
  QuestContext,
  QuestDefinition,
  TestCase,
} from "./core.ts";

/** The context quests receive in the browser: the sandbox is a real element. */
export interface BrowserQuestContext extends QuestContext {
  sandbox: (html?: string) => HTMLElement;
}

interface BlocInfo {
  readonly number: number;
  readonly name: string;
}

interface QuestIndex {
  readonly bloc: BlocInfo;
  readonly quests: readonly string[];
}

interface Options {
  readonly solution: boolean;
  readonly all: boolean;
  readonly level?: number;
  readonly reset: boolean;
}

type Loader = () => Promise<object>;

// Vite resolves these globs at build time: every quest and every source
// file becomes a lazy import, keyed by its path relative to this file.
const QUEST_LOADERS = import.meta.glob("../quests/*.ts") as Record<string, Loader>;
const SOURCE_LOADERS = import.meta.glob([
  "../src/*.ts",
  "../_animateur/solution/src/*.ts",
]) as Record<string, Loader>;
const STYLESHEETS = [
  "styles.css",
  "header.css",
  "hero.css",
  "rows.css",
  "footer.css",
  "animations.css",
];

export async function playInBrowser({
  container,
  sandboxHost,
}: {
  container: HTMLElement;
  sandboxHost: HTMLElement;
}): Promise<GameReport> {
  const params = new URLSearchParams(location.search);
  const options: Options = {
    solution: params.get("solution") === "1",
    all: params.get("all") === "1",
    level: Number(params.get("level")) || undefined,
    reset: params.get("reset") === "1",
  };

  const index = (await QUEST_LOADERS["../quests/index.ts"]()) as QuestIndex;
  const storageKey = `nolanflix-quest-bloc${index.bloc.number}`;

  if (options.reset) {
    localStorage.removeItem(storageKey);
    history.replaceState(null, "", location.pathname);
  }

  const quests: LoadedQuest[] = [];
  for (const slug of index.quests) {
    quests.push({
      slug,
      definition: (await QUEST_LOADERS[`../quests/${slug}.ts`]()) as QuestDefinition,
    });
  }

  let progress: Progress = emptyProgress();
  if (options.solution) progress.unlocked = quests.length;
  else {
    try {
      progress = {
        ...progress,
        ...(JSON.parse(localStorage.getItem(storageKey) ?? "{}") as Partial<Progress>),
      };
    } catch {
      /* start over */
    }
  }

  const sourceDir = options.solution ? "../_animateur/solution/src/" : "../src/";
  const loadModule = async (file: string): Promise<object> => {
    const key = file.replace(/^src\//, sourceDir);
    const loader = SOURCE_LOADERS[key];
    if (!loader) {
      const error = new Error(`the file ${file} does not exist`) as Error & {
        hint: string;
      };
      error.hint = "create it: it must export the functions the quest asks for.";
      throw error;
    }
    return loader();
  };

  // ---- the sandbox
  const shadow = sandboxHost.shadowRoot ?? sandboxHost.attachShadow({ mode: "open" });
  shadow.innerHTML = "";
  for (const sheet of STYLESHEETS) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `/css/${sheet}`;
    shadow.append(link);
  }
  const style = document.createElement("style");
  style.textContent = `
    :host { display: block; }
    .sandbox-page { background: #141414; color: #fff; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; padding: 12px; min-width: 0; }
    .sandbox-test { border-top: 1px dashed #444; padding: 10px 0 18px; }
    .sandbox-test:first-of-type { border-top: 0; }
    .sandbox-name { font: 12px/1.4 ui-monospace, Menlo, monospace; color: #b3b3b3; margin: 0 0 10px; }
    .sandbox-name::before { content: "🧪 "; }
    .sandbox-content { position: relative; }
    .topbar { position: static; }
    .profile-menu { position: static; }
    .hero { height: auto; min-height: 0; }
    .hero-img { height: 220px; }
    .rows { margin-top: 12px; }
  `;
  shadow.append(style);
  const page = document.createElement("div");
  page.className = "sandbox-page";
  shadow.append(page);

  let currentTest: TestCase | null = null;
  const sandbox = (html = ""): HTMLElement => {
    const zone = document.createElement("div");
    zone.className = "sandbox-test";
    const name = document.createElement("p");
    name.className = "sandbox-name";
    name.textContent = currentTest?.name ?? "";
    const content = document.createElement("div");
    content.className = "sandbox-content";
    content.innerHTML = html;
    zone.append(name, content);
    page.append(zone);
    return content;
  };
  const wait = (ms = 0): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

  // An uncancelled click on <a href="/titles/dark"> would leave the game for
  // a 404. The sandbox catches the event last, after every listener of the
  // tests, and remembers whether the student had already cancelled it.
  type Guarded = Event & { preventedBeforeSandbox?: boolean };
  for (const type of ["click", "submit"]) {
    shadow.addEventListener(type, (event: Guarded) => {
      if (type === "click" && !(event.target as Element | null)?.closest?.("a[href]")) return;
      if (event.preventedBeforeSandbox === undefined)
        event.preventedBeforeSandbox = event.defaultPrevented;
      event.preventDefault();
    });
  }
  const wasPrevented = (event: { readonly defaultPrevented: boolean }): boolean =>
    (event as Guarded).preventedBeforeSandbox ?? event.defaultPrevented;

  const report = await play({
    quests,
    loadModule,
    progress,
    options: { all: options.all || options.solution, level: options.level },
    extras: { sandbox, wait, wasPrevented },
    beforeEach: (test) => {
      currentTest = test;
    },
  });

  if (!options.solution) localStorage.setItem(storageKey, JSON.stringify(report.progress));

  render(container, report, index.bloc, options);
  return report;
}

/* ------------------------------------------------------------------ */
/* Rendering                                                           */
/* ------------------------------------------------------------------ */

type Child = Node | string | null | undefined;

function el(tag: string, attrs: Record<string, string> = {}, ...children: Child[]): HTMLElement {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") element.className = value;
    else if (key === "html") element.innerHTML = value;
    else element.setAttribute(key, value);
  }
  for (const child of children) if (child !== null && child !== undefined) element.append(child);
  return element;
}

function enrich(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function render(
  container: HTMLElement,
  report: GameReport,
  bloc: BlocInfo,
  options: Options,
): void {
  const { levels, progress, events, focus, total } = report;
  const rank = rankFor(progress.xp);
  const next = nextRank(progress.xp);
  const done = levels.filter((l) => l.state === "done").length;
  container.innerHTML = "";

  const header = el(
    "header",
    { class: "game-header" },
    el(
      "div",
      { class: "game-title" },
      el("span", { class: "game-brand" }, "NOLANFLIX QUEST"),
      ` · bloc ${bloc.number} · ${bloc.name}`,
    ),
    el(
      "div",
      { class: "game-rank" },
      `${rank.icon} ${rank.name} · ${progress.xp} XP`,
      el("span", { class: "dim" }, next ? ` · ${next.name} at ${next.xp} XP` : " · top rank"),
    ),
    el(
      "div",
      {
        class: "game-bar",
        role: "progressbar",
        "aria-valuenow": String(done),
        "aria-valuemax": String(total),
        "aria-label": "Completed quests",
      },
      el("div", {
        class: "game-bar-fill",
        style: `width:${(done / total) * 100}%`,
      }),
    ),
    el("div", { class: "dim" }, `${done} / ${total} quests`),
  );
  if (options.solution)
    header.append(el("p", { class: "game-mode" }, "solution mode: _animateur/solution/src"));
  container.append(header);

  if (events.length) {
    const list = el("ul", { class: "game-events" });
    for (const event of events) {
      if (event.type === "quest")
        list.append(
          el("li", { class: "ev-quest" }, `🎉 Quest ${event.level} completed · +${event.xp} XP`),
        );
      if (event.type === "challenge")
        list.append(
          el(
            "li",
            { class: "ev-challenge" },
            `⭐ Challenge passed · ${event.name} · +${event.xp} XP`,
          ),
        );
      if (event.type === "unlocked")
        list.append(
          el("li", { class: "ev-unlock" }, `🔓 Quest ${event.level} unlocked · ${event.title}`),
        );
      if (event.type === "rank")
        list.append(
          el("li", { class: "ev-rank" }, `🆙 NEW RANK: ${event.rank.icon} ${event.rank.name}`),
        );
    }
    container.append(list);
  }

  const body = el("div", { class: "game-body" });
  container.append(body);

  const map = el("nav", { class: "game-map", "aria-label": "Quests" });
  for (const level of levels) {
    const results = level.results ?? [];
    const passed = results.filter((r) => r.challenge && r.ok).length;
    const challenges = results.filter((r) => r.challenge).length;
    const stars = challenges
      ? el("span", { class: "stars" }, "★".repeat(passed) + "☆".repeat(challenges - passed))
      : null;
    const icon = { done: "✔", regression: "✘", current: "▶", locked: "🔒" }[level.state];
    const row = el(
      "a",
      {
        class: `quest quest-${level.state}`,
        href: level.state === "locked" ? "#" : `?level=${level.number}`,
      },
      el("span", { class: "quest-icon" }, icon),
      el("span", { class: "quest-number" }, String(level.number)),
      " · ",
      el("span", { class: "quest-title" }, level.title),
      stars,
    );
    if (level.state === "locked") row.setAttribute("aria-disabled", "true");
    if (level === focus) row.classList.add("quest-focus");
    map.append(row);
  }
  const tools = el(
    "p",
    { class: "game-tools" },
    el("a", { href: location.pathname }, "▶ current quest"),
    " · ",
    el("a", { href: "?all=1" }, "replay everything"),
    " · ",
    el("a", { href: "/index.html", target: "_blank" }, "open the real page ↗"),
    " · ",
    el(
      "a",
      {
        href: "?reset=1",
        class: "danger",
        onclick: "return confirm('Reset your progress?')",
      },
      "reset",
    ),
  );
  body.append(el("aside", { class: "game-left" }, map, tools));

  const main = el("main", { class: "game-main" });
  body.append(main);

  if (report.allDone && !focus) {
    main.append(el("h2", { class: "game-end" }, "🏆 BLOC COMPLETED. Every quest is green."));
    main.append(
      el(
        "p",
        {},
        "Open ",
        el("a", { href: "/index.html", target: "_blank" }, "index.html"),
        ": the page is alive.",
      ),
    );
    const remaining = levels.reduce(
      (sum, l) => sum + (l.results ?? []).filter((r) => r.challenge && !r.ok).length,
      0,
    );
    if (remaining)
      main.append(
        el(
          "p",
          {},
          `${remaining} challenge(s) ⭐ left: `,
          el("a", { href: "?all=1" }, "replay everything"),
          " to see them.",
        ),
      );
    main.append(
      el(
        "p",
        { class: "dim" },
        "Types are not checked here: run `npm run typecheck` before you call it done.",
      ),
    );
    return;
  }

  for (const level of levels) {
    if (level === focus || level.state !== "regression") continue;
    const block = el(
      "section",
      { class: "regression" },
      el("h3", {}, `✘ Quest ${level.number} · ${level.title} — regression`),
      el("p", { class: "dim" }, level.file),
    );
    if (level.loadFailure) block.append(el("pre", { class: "error" }, level.loadFailure.message));
    for (const result of (level.results ?? []).filter((r) => !r.ok && !r.challenge))
      block.append(el("p", { class: "test-fail" }, `✘ ${result.name}`));
    main.append(block);
  }
  if (!focus) return;

  main.append(
    el(
      "h2",
      { class: "quest-header" },
      `Quest ${focus.number} · ${focus.title}`,
      el("code", { class: "file" }, focus.file),
    ),
  );
  const columns = el("div", { class: "game-columns" });
  main.append(columns);

  const lesson = el("article", { class: "lesson" });
  renderParagraphs(lesson, splitLesson(focus.lesson));
  if (focus.mission) {
    lesson.append(el("h3", {}, "🎯 Mission"));
    renderParagraphs(lesson, splitLesson(focus.mission));
  }
  columns.append(lesson);

  const tests = el("section", { class: "tests" }, el("h3", {}, "🧪 Tests"));
  if (focus.loadFailure) {
    tests.append(el("p", { class: "test-fail" }, `💥 ${focus.file} does not load`));
    tests.append(el("pre", { class: "error" }, focus.loadFailure.message));
    if (focus.loadFailure.hint)
      tests.append(el("p", { class: "hint" }, `💡 ${focus.loadFailure.hint}`));
    tests.append(
      el(
        "p",
        { class: "dim" },
        "The browser console (F12) and the Vite overlay give the exact line.",
      ),
    );
  } else {
    renderResults(tests, focus, options);
  }
  columns.append(tests);
}

function renderResults(tests: HTMLElement, level: Level, options: Options): void {
  const results = level.results ?? [];
  let firstFailure = false;
  const list = el("ul", { class: "test-list" });
  for (const result of results) {
    const bonus = result.challenge
      ? el("span", { class: "bonus" }, ` ⭐ challenge +${result.xp} XP`)
      : null;
    if (result.ok) list.append(el("li", { class: "test-ok" }, `✔ ${result.name}`, bonus));
    else if (!firstFailure && !result.challenge) {
      firstFailure = true;
      const item = el("li", { class: "test-fail" }, el("strong", {}, `✘ ${result.name}`));
      item.append(failureBlock(result.failure));
      list.append(item);
    } else if (result.challenge)
      list.append(el("li", { class: "test-later" }, `☆ ${result.name}`, bonus));
    else
      list.append(
        el(
          "li",
          { class: "test-later" },
          `· ${result.name}`,
          el("span", { class: "dim" }, " (later)"),
        ),
      );
  }
  tests.append(list);
  const failedChallenges = results.filter((r) => r.challenge && !r.ok);
  if (
    !firstFailure &&
    failedChallenges.length &&
    (options.level || options.all || level.state === "done")
  ) {
    tests.append(el("h4", {}, "Challenges still resisting"));
    for (const result of failedChallenges) {
      const item = el("div", { class: "test-challenge" }, `☆ ${result.name}`);
      item.append(failureBlock(result.failure));
      tests.append(item);
    }
  }
  const ok = results.filter((r) => r.ok && !r.challenge).length;
  const total = results.filter((r) => !r.challenge).length;
  tests.append(
    el(
      "p",
      { class: ok === total ? "summary summary-ok" : "summary" },
      el("strong", {}, `${ok}/${total}`),
      ok === total && total > 0
        ? " · all green."
        : ` · edit ${level.file}, save: the page reloads on its own.`,
    ),
  );
}

function failureBlock(failure: Failure | undefined): DocumentFragment {
  const fragment = document.createDocumentFragment();
  if (!failure) return fragment;
  fragment.append(el("pre", { class: "error" }, failure.message));
  if (failure.hint) fragment.append(el("p", { class: "hint" }, `💡 ${failure.hint}`));
  if (failure.location) fragment.append(el("p", { class: "dim" }, `→ ${failure.location}`));
  return fragment;
}

/* Lessons are written at 72 columns: lines of a paragraph are joined, a
   blank line separates two paragraphs, a dash opens a list. */
function renderParagraphs(target: HTMLElement, blocks: ReturnType<typeof splitLesson>): void {
  let lines: string[] = [];
  let list: HTMLElement | null = null;
  const flush = (): void => {
    if (lines.length) {
      target.append(el("p", { html: enrich(lines.join(" ")) }));
      lines = [];
    }
    list = null;
  };
  for (const block of blocks) {
    if (block.type === "heading") {
      flush();
      target.append(el("h3", {}, block.content));
      continue;
    }
    if (block.type === "code") {
      flush();
      target.append(el("pre", {}, el("code", {}, block.content)));
      continue;
    }
    const line = block.content;
    if (line.trim() === "") {
      flush();
      continue;
    }
    if (/^[-*] /.test(line)) {
      if (lines.length) {
        target.append(el("p", { html: enrich(lines.join(" ")) }));
        lines = [];
      }
      if (!list) {
        list = el("ul");
        target.append(list);
      }
      list.append(el("li", { html: enrich(line.slice(2)) }));
      continue;
    }
    if (list && /^\s+\S/.test(line) && list.lastElementChild) {
      list.lastElementChild.innerHTML += ` ${enrich(line.trim())}`;
      continue;
    }
    list = null;
    lines.push(line.trim());
  }
  flush();
}
