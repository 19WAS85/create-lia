import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  type FileTree,
  renderWorkspace,
  type WorkspaceOptions,
} from "../src/generate.js";
import { getMethod, type MethodPack } from "../src/methods.js";

const templatesDir = fileURLToPath(new URL("../templates", import.meta.url));

function pack(id: string): MethodPack {
  const method = getMethod(id);
  if (method === undefined) {
    throw new Error(`unknown method: ${id}`);
  }
  return method;
}

function content(files: FileTree, path: string): string {
  const value = files.get(path);
  if (value === undefined) {
    throw new Error(`missing rendered file: ${path}`);
  }
  return value;
}

function render(
  id: string,
  overrides: Partial<Omit<WorkspaceOptions, "method" | "templatesDir">> = {},
): Promise<FileTree> {
  return renderWorkspace({
    name: "Ada",
    language: "English",
    ...overrides,
    method: pack(id),
    templatesDir,
  });
}

describe("generate (para)", () => {
  it("renders the PARA workspace tree", async () => {
    const files = await render("para");
    expect([...files.keys()].sort()).toEqual([
      "AGENTS.md",
      "README.md",
      "TASKS.md",
      "archives/.gitkeep",
      "areas/.gitkeep",
      "knowledge/.gitkeep",
      "projects/.gitkeep",
      "resources/.gitkeep",
    ]);
    expect([...files.keys()].sort()).toMatchSnapshot("para tree");
  });

  it("composes AGENTS.md from core, chapter, and routing", async () => {
    const files = await render("para");
    const agents = content(files, "AGENTS.md");
    expect(agents).toContain("# AGENTS.md — Ada");
    expect(agents).toContain("**English**");
    expect(agents).toContain("## Organization Method: PARA");
    expect(agents).toContain("## Save Routing");
    expect(agents.indexOf("## Organization Method: PARA")).toBeLessThan(
      agents.indexOf("## Save Routing"),
    );
    expect(agents).toMatchSnapshot("para AGENTS.md");
  });

  it("seeds the README index from the method skeleton", async () => {
    const files = await render("para");
    const readme = content(files, "README.md");
    expect(readme).toContain("## Index");
    expect(readme).toContain("- [AGENTS.md](AGENTS.md)");
    expect(readme).toContain("- [TASKS.md](TASKS.md)");
    expect(readme).toContain("- [projects/](projects/)");
    expect(readme).toContain("- [knowledge/](knowledge/)");
    expect(readme).not.toContain(".gitkeep");
  });

  it("renders PARA task sections", async () => {
    const files = await render("para");
    const tasks = content(files, "TASKS.md");
    expect(tasks).toContain("## This week");
    expect(tasks).toContain("## Upcoming");
    expect(tasks).toContain("## Completed");
  });
});
