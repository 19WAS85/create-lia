import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { interpolate } from "./interpolate.js";
import {
  CHAPTER_FILE,
  type MethodPack,
  ROUTING_FILE,
  SKELETON_DIR,
} from "./methods.js";

export interface WorkspaceOptions {
  name: string;
  language: string;
  method: MethodPack;
  templatesDir: string;
}

export type FileTree = Map<string, string>;

export async function renderWorkspace(
  options: WorkspaceOptions,
): Promise<FileTree> {
  const values = { name: options.name, language: options.language };
  const packDir = join(options.templatesDir, "methods", options.method.id);
  const files: FileTree = new Map();

  const core = await readFile(
    join(options.templatesDir, "core", "AGENTS-core.md"),
    "utf8",
  );
  const chapter = await readFile(join(packDir, CHAPTER_FILE), "utf8");
  const routing = await readFile(join(packDir, ROUTING_FILE), "utf8");
  files.set(
    "AGENTS.md",
    interpolate([core, chapter, routing].join("\n\n"), values),
  );

  if (options.method.tasksFile !== null) {
    const tasks = await readFile(
      join(packDir, options.method.tasksFile),
      "utf8",
    );
    files.set("TASKS.md", interpolate(tasks, values));
  }

  await collectTemplates(join(packDir, SKELETON_DIR), "", files, values);

  const index = buildIndex(files, options.method);
  const readme = await readFile(
    join(options.templatesDir, "core", "README.md"),
    "utf8",
  );
  files.set("README.md", `${interpolate(readme, values)}\n\n${index}`);
  return files;
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
      files.set(to, interpolate(await readFile(from, "utf8"), values));
    }
  }
}

function buildIndex(files: FileTree, method: MethodPack): string {
  const lines = ["## Index", "", "- [AGENTS.md](AGENTS.md)"];
  if (method.tasksFile !== null) {
    lines.push(`- [TASKS.md](TASKS.md)`);
  }
  const seen = new Set<string>();
  for (const key of [...files.keys()].sort()) {
    if (key === "AGENTS.md" || key === "TASKS.md" || key === "README.md") {
      continue;
    }
    const top = key.split("/")[0];
    if (seen.has(top)) {
      continue;
    }
    seen.add(top);
    lines.push(
      key.includes("/") ? `- [${top}/](${top}/)` : `- [${key}](${key})`,
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
