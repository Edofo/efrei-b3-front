/* engine/terminal.ts — the game in the terminal (Node ≥ 22.18).

   Started by play.ts:   node --watch play.ts
   Options:   --reset        start over
              --all          replay every quest, locked ones included
              --solution     play with _animateur/solution/src (teacher)
              --no-lesson    hide the lesson
              --no-types     skip the type check
              <n>            replay quest n only (if unlocked) */

import { existsSync } from "node:fs";
import { readFile, writeFile, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { play, rankFor, nextRank, splitLesson, emptyProgress } from "./core.ts";
import type { Failure, GameReport, LoadedQuest, Level, Progress, QuestDefinition } from "./core.ts";

interface BlocInfo {
  readonly number: number;
  readonly name: string;
}

interface QuestIndex {
  readonly bloc: BlocInfo;
  readonly quests: readonly string[];
}

interface Options {
  readonly reset: boolean;
  readonly all: boolean;
  readonly solution: boolean;
  readonly noLesson: boolean;
  readonly noTypes: boolean;
  readonly level?: number;
}

const COLOR = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;
const paint =
  (code: string) =>
  (text: unknown): string =>
    COLOR ? `\x1b[${code}m${String(text)}\x1b[0m` : String(text);
const bold = paint("1");
const dim = paint("2");
const red = paint("31");
const green = paint("32");
const yellow = paint("33");
const magenta = paint("35");
const cyan = paint("36");
const grey = paint("90");

export async function playInTerminal(playUrl: string): Promise<void> {
  const root = path.dirname(fileURLToPath(playUrl));
  const args = process.argv.slice(2);
  const options: Options = {
    reset: args.includes("--reset"),
    all: args.includes("--all"),
    solution: args.includes("--solution"),
    noLesson: args.includes("--no-lesson"),
    noTypes: args.includes("--no-types"),
    level: Number(args.find((a) => /^\d+$/.test(a))) || undefined,
  };
  const progressFile = path.join(root, ".progress.json");

  if (options.reset) {
    await rm(progressFile, { force: true });
    print(green("✔ Progress reset. Start the game again."));
    return;
  }

  const index = (await import(
    pathToFileURL(path.join(root, "quests", "index.ts")).href
  )) as QuestIndex;
  const quests: LoadedQuest[] = [];
  for (const slug of index.quests) {
    const definition = (await import(
      pathToFileURL(path.join(root, "quests", `${slug}.ts`)).href
    )) as QuestDefinition;
    quests.push({ slug, definition });
  }

  let progress: Progress = emptyProgress();
  if (options.solution) {
    progress.unlocked = quests.length;
  } else if (existsSync(progressFile)) {
    try {
      progress = {
        ...progress,
        ...(JSON.parse(await readFile(progressFile, "utf8")) as Partial<Progress>),
      };
    } catch {
      /* corrupted file: start over */
    }
  }

  const srcDir = options.solution ? path.join("_animateur", "solution", "src") : "src";
  const resolveSource = (file: string): string =>
    path.join(root, file.replace(/^src\//, srcDir + path.sep));
  const loadModule = async (file: string): Promise<object> => {
    const absolute = resolveSource(file);
    if (!existsSync(absolute)) {
      const error = new Error(`the file ${file} does not exist`) as Error & {
        hint: string;
      };
      error.hint = "create it: it must export the functions the quest asks for.";
      throw error;
    }
    return (await import(pathToFileURL(absolute).href)) as object;
  };

  const typeErrors = options.noTypes ? null : typeCheck(root);
  const typeErrorsFor = (file: string): string[] =>
    typeErrors?.get(path.normalize(resolveSource(file))) ?? [];

  const report = await play({
    quests,
    loadModule,
    progress,
    options: { all: options.all || options.solution, level: options.level },
    typeErrorsFor,
  });
  for (const level of report.levels) level.absolutePath = resolveSource(level.file);

  if (!options.solution) {
    await writeFile(progressFile, `${JSON.stringify(report.progress, null, 2)}\n`);
  }

  render(
    report,
    index.bloc,
    options,
    typeErrors === null ? "skipped" : typeErrors === undefined ? "unavailable" : "done",
  );

  const allGreen = report.levels.filter((l) => l.played).every((l) => l.state === "done");
  process.exitCode = allGreen ? 0 : 1;
}

/* ------------------------------------------------------------------ */
/* Type check: one `tsc --noEmit` per run, errors grouped by file       */
/* ------------------------------------------------------------------ */

function typeCheck(root: string): Map<string, string[]> | undefined {
  const tsc = path.join(root, "node_modules", ".bin", "tsc");
  if (!existsSync(tsc)) return undefined;
  const result = spawnSync(tsc, ["--noEmit", "--pretty", "false"], {
    cwd: root,
    encoding: "utf8",
  });
  const errors = new Map<string, string[]>();
  const pattern = /^(.+?)\((\d+),(\d+)\): error (TS\d+): (.*)$/;
  for (const line of (result.stdout || "").split("\n")) {
    const match = pattern.exec(line.trim());
    if (!match) continue;
    const file = path.normalize(path.resolve(root, match[1]));
    const list = errors.get(file) ?? [];
    list.push(`line ${match[2]}: ${match[5]} (${match[4]})`);
    errors.set(file, list);
  }
  return errors;
}

/* ------------------------------------------------------------------ */
/* Rendering                                                           */
/* ------------------------------------------------------------------ */

function render(
  report: GameReport,
  bloc: BlocInfo,
  options: Options,
  typeStatus: "done" | "skipped" | "unavailable",
): void {
  const { levels, progress, events, focus, total } = report;
  const lines: string[] = [];
  const out = (text = ""): void => {
    lines.push(text);
  };

  // ---- header
  const rank = rankFor(progress.xp);
  const next = nextRank(progress.xp);
  const done = levels.filter((l) => l.state === "done").length;
  const bar = "█".repeat(done) + "░".repeat(total - done);
  const line1 = `NOLANFLIX QUEST · bloc ${bloc.number} · ${bloc.name}`;
  const line2 =
    `${rank.icon} ${rank.name} · ${progress.xp} XP` +
    (next ? ` · ${next.name} at ${next.xp} XP` : " · top rank");
  const line3 = `${bar}  ${done} / ${total} quests`;
  const width = Math.max(line1.length, line2.length, line3.length) + 4;
  const boxed = (text: string): string =>
    `  │ ${text}${" ".repeat(Math.max(0, width - text.length - 3))}│`;
  out();
  out(`  ╭${"─".repeat(width - 2)}╮`);
  out(bold(boxed(line1)));
  out(boxed(line2));
  out(boxed(line3));
  out(`  ╰${"─".repeat(width - 2)}╯`);

  // ---- events
  for (const event of events) {
    if (event.type === "quest")
      out(`  ${green(`🎉 Quest ${event.level} completed`)} · ${bold(`+${event.xp} XP`)}`);
    if (event.type === "challenge")
      out(`  ${yellow("⭐ Challenge passed")} · ${event.name} · ${bold(`+${event.xp} XP`)}`);
    if (event.type === "unlocked")
      out(`  ${cyan(`🔓 Quest ${event.level} unlocked`)} · ${event.title}`);
    if (event.type === "rank")
      out(`  ${magenta(bold(`🆙 NEW RANK: ${event.rank.icon} ${event.rank.name}`))}`);
  }
  if (events.length) out();

  // ---- quest map
  if (options.solution) out(dim("  (--solution mode: functions from _animateur/solution/src)"));
  if (typeStatus === "unavailable")
    out(yellow("  ⚠ type check unavailable: run `npm install` to enable it (tsc)"));
  for (const level of levels) {
    const results = level.results ?? [];
    const passedChallenges = results.filter((r) => r.challenge && r.ok).length;
    const totalChallenges = results.filter((r) => r.challenge).length;
    const stars = totalChallenges
      ? ` ${yellow("★".repeat(passedChallenges))}${grey("☆".repeat(totalChallenges - passedChallenges))}`
      : "";
    const number = String(level.number).padStart(2, " ");
    if (level.state === "done")
      out(`  ${green("✔")} ${number} · ${level.title}${stars}  ${dim(`${level.xp} XP`)}`);
    else if (level.state === "regression")
      out(
        `  ${red("✘")} ${number} · ${level.title}  ${red("← regression: a test that used to pass fails again")}`,
      );
    else if (level.state === "current")
      out(`  ${yellow("▶")} ${number} · ${bold(level.title)}${stars}`);
    else out(grey(`  🔒 ${number} · ${level.title}`));
  }

  // ---- end of bloc
  if (report.allDone && !focus) {
    out();
    out(magenta(bold("  🏆 BLOC COMPLETED. Every quest is green.")));
    const remaining = levels.reduce(
      (sum, l) => sum + (l.results ?? []).filter((r) => r.challenge && !r.ok).length,
      0,
    );
    if (remaining)
      out(
        `  ${remaining} challenge(s) ⭐ left to reach the next rank: ${dim("node play.ts --all")}`,
      );
    else out(`  And every challenge. ${rank.icon} ${rank.name}, nothing to add.`);
    out();
    print(lines.join("\n"));
    return;
  }

  // ---- regressions on other levels
  for (const level of levels) {
    if (level === focus || level.state !== "regression") continue;
    out();
    out(`  ${red(`✘ Quest ${level.number} · ${level.title}`)} ${dim(`· ${level.file}`)}`);
    if (level.loadFailure) out(`     ${red(level.loadFailure.message)}`);
    for (const result of (level.results ?? []).filter((r) => !r.ok && !r.challenge))
      out(`     ${red("✘")} ${result.name}`);
    for (const error of level.typeErrors) out(`     ${red("TS")} ${error}`);
  }

  if (!focus) {
    print(lines.join("\n"));
    return;
  }

  // ---- the current quest
  out();
  const header = `── Quest ${focus.number} · ${focus.title} `;
  out(`  ${bold(header)}${dim("─".repeat(Math.max(0, 66 - header.length)))}  ${cyan(focus.file)}`);
  if (!options.noLesson && focus.lesson) {
    out();
    for (const block of splitLesson(focus.lesson)) {
      if (block.type === "heading") out(`  ${bold(block.content)}`);
      else if (block.type === "code")
        for (const l of block.content.split("\n")) out(`      ${cyan(l)}`);
      else out(`  ${enrich(block.content)}`);
    }
  }
  if (focus.mission) {
    out();
    out(`  ${bold("🎯 Mission")}`);
    for (const l of focus.mission.replace(/^\n+|\s+$/g, "").split("\n")) out(`  ${enrich(l)}`);
  }

  out();
  out(`  ${bold("🧪 Tests")}`);
  if (focus.loadFailure) {
    renderLoadFailure(focus, out);
  } else {
    renderResults(focus, options, out);
  }
  renderTypeErrors(focus, typeStatus, out);
  out();
  print(lines.join("\n"));
}

function print(text: string): void {
  process.stdout.write(`${text}\n`);
}

function renderLoadFailure(level: Level, out: (text?: string) => void): void {
  const failure = level.loadFailure as Failure;
  out(`  ${red(`💥 ${level.file} does not load`)}`);
  out(`     ${red(failure.message)}`);
  if (failure.hint) out(`     ${yellow(`💡 ${failure.hint}`)}`);
  if (failure.raw instanceof SyntaxError && level.absolutePath) {
    // Node keeps the offending line out of e.stack for ES modules:
    // `node --check` prints it, with the little caret under the character.
    const check = spawnSync(process.execPath, ["--check", level.absolutePath], {
      encoding: "utf8",
    });
    const details = (check.stderr || "")
      .split("\n")
      .filter((l) => l.trim() && !/^\s+at /.test(l) && !/^Node\.js/.test(l));
    for (const l of details.slice(0, 3))
      out(`     ${dim(l.replace(/^.*?\/((?:_animateur\/solution\/)?src\/)/, "$1"))}`);
  }
}

function renderResults(level: Level, options: Options, out: (text?: string) => void): void {
  const results = level.results ?? [];
  let firstFailure = false;
  for (const result of results) {
    const bonus = result.challenge ? yellow(` ⭐ challenge +${result.xp} XP`) : "";
    if (result.ok) out(`  ${green("✔")} ${result.name}${bonus}`);
    else if (!firstFailure && !result.challenge) {
      firstFailure = true;
      out(`  ${red("✘")} ${bold(result.name)}`);
      renderFailure(result.failure, out);
    } else if (result.challenge) out(`  ${grey("☆")} ${grey(result.name)}${bonus}`);
    else out(`  ${grey("·")} ${grey(result.name)} ${dim("(later)")}`);
  }
  const failedChallenges = results.filter((r) => r.challenge && !r.ok);
  if (
    !firstFailure &&
    failedChallenges.length &&
    (options.level || options.all || level.state === "done")
  ) {
    out();
    out(`  ${yellow("Challenges still resisting:")}`);
    for (const result of failedChallenges) {
      out(`  ${yellow("☆")} ${result.name}`);
      renderFailure(result.failure, out);
    }
  }
  const ok = results.filter((r) => r.ok && !r.challenge).length;
  const total = results.filter((r) => !r.challenge).length;
  out();
  if (ok === total && total > 0 && level.typeErrors.length === 0)
    out(`  ${green(bold(`${ok}/${total}`))} ${green("· all green.")}`);
  else if (ok === total && total > 0)
    out(
      `  ${green(bold(`${ok}/${total}`))} · tests are green, but the compiler still complains — see below.`,
    );
  else
    out(
      `  ${bold(`${ok}/${total}`)} · edit ${cyan(level.file)}, save: the game replays on its own.`,
    );
}

function renderTypeErrors(
  level: Level,
  status: "done" | "skipped" | "unavailable",
  out: (text?: string) => void,
): void {
  if (status !== "done") return;
  out();
  if (level.typeErrors.length === 0) {
    out(`  ${bold("🔎 Types")} ${green("✔ no type error in " + level.file)}`);
    return;
  }
  out(
    `  ${bold("🔎 Types")} ${red(`✘ ${level.typeErrors.length} error(s) in ${level.file}`)} ${dim("— a quest is complete only when the compiler agrees")}`,
  );
  for (const error of level.typeErrors.slice(0, 6)) out(`     ${red("TS")} ${error}`);
  if (level.typeErrors.length > 6)
    out(`     ${dim(`… and ${level.typeErrors.length - 6} more (npm run typecheck)`)}`);
}

function renderFailure(failure: Failure | undefined, out: (text?: string) => void): void {
  if (!failure) return;
  for (const l of failure.message.split("\n"))
    out(`      ${l.startsWith("Expected") ? bold(l) : l}`);
  if (failure.hint) out(`      ${yellow(`💡 ${failure.hint}`)}`);
  if (failure.location) out(`      ${dim(`→ ${failure.location}`)}`);
}

function enrich(line: string): string {
  return line
    .replace(/\*\*([^*]+)\*\*/g, (_, s: string) => bold(s))
    .replace(/`([^`]+)`/g, (_, s: string) => cyan(s));
}
