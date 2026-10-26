import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { interpolate } from "./interpolate.js";
import {
  CHAPTER_FILE,
  type MethodPack,
  ROUTING_FILE,
  SKELETON_DIR,
} from "./methods.js";

// Core documents generated in every workspace, regardless of the method.
const AGENTS_FILE = "AGENTS.md";
const TASKS_FILE = "TASKS.md";
const README_FILE = "README.md";

export interface WorkspaceOptions {
  name: string;
  language: string;
  method: MethodPack;
  templatesDir: string;
}

export type FileTree = Map<string, string>;

// The options-object parameter is part of the frozen public API.
export async function renderWorkspace(
  options: WorkspaceOptions,
): Promise<FileTree> {
  const { name, language, method, templatesDir } = options;
  const values = { name, language };
  const packDir = join(templatesDir, "methods", method.id);
  const files: FileTree = new Map();

  const core = await readTemplate(join(templatesDir, "core", "AGENTS-core.md"));
  const chapter = await readTemplate(join(packDir, CHAPTER_FILE));
  const routing = await readTemplate(join(packDir, ROUTING_FILE));
  files.set(
    AGENTS_FILE,
    interpolate([core, chapter, routing].join("\n\n"), values),
  );

  if (method.tasksFile !== null) {
    const tasks = await readTemplate(join(packDir, method.tasksFile));
    files.set(TASKS_FILE, interpolate(tasks, values));
  }

  await collectTemplates(join(packDir, SKELETON_DIR), "", files, values);

  const index = buildIndex(files, method);
  const readme = await readTemplate(join(templatesDir, "core", "README.md"));
  files.set(README_FILE, `${interpolate(readme, values)}\n\n${index}`);
  await collectTemplates(
    join(templatesDir, "skills"),
    ".agents/skills",
    files,
    values,
  );
  return files;
}

async function readTemplate(path: string): Promise<string> {
  return readFile(path, "utf8");
}

async function collectTemplates(
  sourceDir: string,
  targetPrefix: string,
  files: FileTree,
  values: Record<string, string>,
): Promise<void> {
  const entries = await readdir(sourceDir, { withFileTypes: true });
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const from = join(sourceDir, entry.name);
    const to =
      targetPrefix === "" ? entry.name : `${targetPrefix}/${entry.name}`;
    if (entry.isDirectory()) {
      await collectTemplates(from, to, files, values);
    } else {
      files.set(to, interpolate(await readTemplate(from), values));
    }
  }
}

function buildIndex(files: FileTree, method: MethodPack): string {
  const lines = ["## Index", "", `- [${AGENTS_FILE}](${AGENTS_FILE})`];
  if (method.tasksFile !== null) {
    lines.push(`- [${TASKS_FILE}](${TASKS_FILE})`);
  }
  const seen = new Set<string>();
  for (const relPath of [...files.keys()].sort()) {
    if (
      relPath === AGENTS_FILE ||
      relPath === TASKS_FILE ||
      relPath === README_FILE
    ) {
      continue;
    }
    const top = relPath.split("/")[0];
    if (seen.has(top)) {
      continue;
    }
    seen.add(top);
    lines.push(
      relPath.includes("/")
        ? `- [${top}/](${top}/)`
        : `- [${relPath}](${relPath})`,
    );
  }
  return lines.join("\n");
}

export async function writeWorkspace(
  targetDir: string,
  files: FileTree,
): Promise<string[]> {
  const written: string[] = [];
  for (const [relPath, content] of files) {
    const abs = join(targetDir, ...relPath.split("/"));
    await mkdir(dirname(abs), { recursive: true });
    await writeFile(abs, content, "utf8");
    written.push(relPath);
  }
  return written.sort();
}
