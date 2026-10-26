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

describe("generate (gtd)", () => {
  it("renders the GTD workspace tree without TASKS.md", async () => {
    const files = await render("gtd");
    expect([...files.keys()].sort()).toEqual([
      "AGENTS.md",
      "README.md",
      "inbox/.gitkeep",
      "next-actions.md",
      "projects/.gitkeep",
      "reference/.gitkeep",
      "someday-maybe.md",
      "waiting-for.md",
    ]);
    expect([...files.keys()].sort()).toMatchSnapshot("gtd tree");
  });

  it("documents the GTD lists as the task system", async () => {
    const files = await render("gtd");
    const agents = content(files, "AGENTS.md");
    expect(agents).toContain("## Organization Method: GTD");
    expect(agents).toContain("no `TASKS.md` is generated");
    expect(agents).toContain("## Save Routing");
    expect(agents).not.toContain("## Organization Method: PARA");
    expect(agents).toMatchSnapshot("gtd AGENTS.md");
  });

  it("seeds the GTD list files", async () => {
    const files = await render("gtd");
    expect(content(files, "next-actions.md")).toContain("# Next Actions");
    expect(content(files, "waiting-for.md")).toContain("# Waiting For");
    expect(content(files, "someday-maybe.md")).toContain("# Someday");
  });
});

describe("generate (zettelkasten)", () => {
  it("renders the Zettelkasten workspace tree", async () => {
    const files = await render("zettelkasten");
    expect([...files.keys()].sort()).toEqual([
      "AGENTS.md",
      "README.md",
      "TASKS.md",
      "inbox/.gitkeep",
      "notes/index.md",
      "sources/.gitkeep",
    ]);
    expect([...files.keys()].sort()).toMatchSnapshot("zettelkasten tree");
  });

  it("documents atomic notes and a minimal task list", async () => {
    const files = await render("zettelkasten");
    const agents = content(files, "AGENTS.md");
    expect(agents).toContain("## Organization Method: Zettelkasten");
    expect(agents).toContain("Map of Content");
    expect(agents).toContain("## Save Routing");
    expect(agents).toMatchSnapshot("zettelkasten AGENTS.md");
    const tasks = content(files, "TASKS.md");
    expect(tasks).toContain("## Open");
    expect(tasks).toContain("## Done");
    expect(tasks).not.toContain("## This week");
  });

  it("seeds the Map of Content", async () => {
    const files = await render("zettelkasten");
    expect(content(files, "notes/index.md")).toContain("# Map of Content");
  });
});
