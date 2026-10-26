#!/usr/bin/env node
import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import * as p from "@clack/prompts";
import { renderWorkspace, writeWorkspace } from "./generate.js";
import { getMethod, METHODS, type MethodPack } from "./methods.js";

const templatesDir = fileURLToPath(new URL("../templates", import.meta.url));

const USAGE = `create-lia — scaffold a personal-assistant knowledge-base workspace

Usage:
  create-lia [directory] [options]

Options:
  --name <name>       Assistant name (default: Lia)
  --method <method>   Organization method: para | gtd | zettelkasten
  --lang <language>   Conversation and document language (default: English)
  --dir <directory>   Target directory (default: ./<kebab-cased name>)
  --yes               Non-interactive mode; requires --method
  -h, --help          Show this help

Examples:
  create-lia
  create-lia my-workspace --name Ada --method gtd --lang pt-BR --yes`;

const LANGUAGES = ["English", "Português", "Español", "Deutsch", "Français"];

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

function cancel(): never {
  p.cancel("Cancelled. Nothing was written.");
  process.exit(0);
}

function toKebabCase(value: string): string {
  const kebab = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return kebab === "" ? "workspace" : kebab;
}

async function isUsableTarget(target: string): Promise<boolean> {
  try {
    const entries = await readdir(target);
    return entries.length === 0;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return true;
    }
    throw error;
  }
}

async function promptText(
  message: string,
  defaultValue: string,
): Promise<string> {
  const answer = await p.text({
    message,
    placeholder: defaultValue,
    defaultValue,
  });
  if (typeof answer !== "string" || p.isCancel(answer)) {
    cancel();
  }
  const value = answer.trim();
  return value === "" ? defaultValue : value;
}

async function promptLanguage(): Promise<string> {
  const answer = await p.select({
    message:
      "Which language should your assistant converse and write documents in?",
    options: [
      ...LANGUAGES.map((language) => ({ value: language, label: language })),
      { value: "other", label: "Other…" },
    ],
    initialValue: "English",
  });
  if (typeof answer !== "string" || p.isCancel(answer)) {
    cancel();
  }
  return answer === "other" ? promptText("Which language?", "English") : answer;
}

interface CliArgs {
  values: {
    name?: string;
    method?: string;
    lang?: string;
    dir?: string;
    yes?: boolean;
    help?: boolean;
  };
  positionals: string[];
}

function parseCliArgs(): CliArgs {
  try {
    return parseArgs({
      allowPositionals: true,
      strict: true,
      options: {
        name: { type: "string" },
        method: { type: "string" },
        lang: { type: "string" },
        dir: { type: "string" },
        yes: { type: "boolean" },
        help: { type: "boolean", short: "h" },
      },
    });
  } catch (error) {
    fail(`${(error as Error).message}\n\n${USAGE}`);
  }
}

async function main(): Promise<void> {
  const nodeMajor = Number(process.versions.node.split(".")[0]);
  if (nodeMajor < 20) {
    fail(
      `create-lia requires Node.js >= 20 (found v${process.versions.node}).`,
    );
  }

  const { values, positionals } = parseCliArgs();
  if (values.help === true) {
    console.log(USAGE);
    return;
  }
  if (positionals.length > 1) {
    fail(`Too many arguments: ${positionals.join(" ")}\n\n${USAGE}`);
  }
  if (positionals[0] !== undefined && values.dir !== undefined) {
    fail(
      "Specify the target directory either as the positional argument or with --dir, not both.",
    );
  }

  const nonInteractive = values.yes === true;
  if (nonInteractive && values.method === undefined) {
    fail("--yes requires --method (para | gtd | zettelkasten).");
  }
  if (!nonInteractive && process.stdin.isTTY !== true) {
    fail(
      "No interactive terminal detected. Re-run with --yes and --method in non-interactive environments.",
    );
  }

  let name = values.name;
  if (name === undefined) {
    name = nonInteractive
      ? "Lia"
      : await promptText("What should your assistant be called?", "Lia");
  }

  let method: MethodPack | undefined;
  if (values.method !== undefined) {
    method = getMethod(values.method);
    if (method === undefined) {
      fail(
        `Invalid method '${values.method}'. Valid methods: ${METHODS.map((m) => m.id).join(", ")}.`,
      );
    }
  }
  if (method === undefined) {
    const picked = await p.select({
      message: "Which organization method do you use?",
      options: METHODS.map((m) => ({ value: m.id, label: m.label })),
    });
    if (typeof picked !== "string" || p.isCancel(picked)) {
      cancel();
    }
    const pickedMethod = getMethod(picked);
    if (pickedMethod === undefined) {
      fail(`Invalid method '${picked}'.`);
    }
    method = pickedMethod;
  }

  let language = values.lang;
  if (language === undefined) {
    language = nonInteractive ? "English" : await promptLanguage();
  }

  let targetDir = positionals[0] ?? values.dir;
  if (targetDir === undefined) {
    const fallback = `./${toKebabCase(name)}`;
    targetDir = nonInteractive
      ? fallback
      : await promptText("Where should the workspace be created?", fallback);
  }
  targetDir = resolve(targetDir);

  if (!(await isUsableTarget(targetDir))) {
    fail(
      `Target directory '${targetDir}' exists and is not empty. Nothing was written.`,
    );
  }

  const files = await renderWorkspace({ name, language, method, templatesDir });
  const written = await writeWorkspace(targetDir, files);

  console.log(
    `\nCreated a workspace for ${name} in ${targetDir} (${written.length} files).\n`,
  );
  console.log("Next steps:");
  console.log(`  1. Open ${targetDir}`);
  console.log(`  2. Fill in the "User context" section of README.md`);
  console.log(
    "  3. After substantive changes, rely on the save skill to maintain the workspace",
  );
}

main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : String(error));
});
