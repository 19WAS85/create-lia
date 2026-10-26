import { describe, expect, it } from "vitest";
import { getMethod, METHODS } from "../src/methods.js";

describe("methods", () => {
  it("registers the three method packs in question order", () => {
    expect(METHODS.map((method) => method.id)).toEqual([
      "para",
      "gtd",
      "zettelkasten",
    ]);
    expect(METHODS.map((method) => method.label)).toEqual([
      "PARA",
      "GTD",
      "Zettelkasten",
    ]);
  });

  it("matches method ids case-insensitively and rejects unknown ids", () => {
    expect(getMethod("GTD")?.id).toBe("gtd");
    expect(getMethod("scrum")).toBeUndefined();
  });

  it("gives only PARA and Zettelkasten a TASKS.md", () => {
    expect(getMethod("para")?.tasksFile).toBe("tasks.md");
    expect(getMethod("gtd")?.tasksFile).toBeNull();
    expect(getMethod("zettelkasten")?.tasksFile).toBe("tasks.md");
  });
});
