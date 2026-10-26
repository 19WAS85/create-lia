import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const cliPath = fileURLToPath(new URL("../dist/cli.js", import.meta.url));

function runCli(args: string[], cwd: string) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1" },
  });
}

async function tempDir(): Promise<string> {
  return mkdtemp(join(tmpdir(), "create-lia-"));
}

describe("cli", () => {
  it("generates a workspace non-interactively", async () => {
    const cwd = await tempDir();
    const result = runCli(
      ["ws", "--name", "Ada", "--method", "gtd", "--lang", "pt-BR", "--yes"],
      cwd,
    );
    expect(result.status, result.stderr).toBe(0);
    expect((await readdir(join(cwd, "ws"))).sort()).toEqual([
      ".agents",
      "AGENTS.md",
      "README.md",
      "inbox",
      "next-actions.md",
      "projects",
      "reference",
      "someday-maybe.md",
      "waiting-for.md",
    ]);
    const agents = await readFile(join(cwd, "ws", "AGENTS.md"), "utf8");
    expect(agents).toContain("# AGENTS.md — Ada");
    expect(agents).toContain("**pt-BR**");
    expect(agents).toContain("## Organization Method: GTD");
    expect(result.stdout).toContain("Ada");
    expect(result.stdout).toContain("Next steps");
  });

  it("derives a kebab-case default directory from the name", async () => {
    const cwd = await tempDir();
    const result = runCli(
      ["--name", "Ada Lovelace", "--method", "para", "--yes"],
      cwd,
    );
    expect(result.status, result.stderr).toBe(0);
    const agents = await readFile(
      join(cwd, "ada-lovelace", "AGENTS.md"),
      "utf8",
    );
    expect(agents).toContain("Ada Lovelace");
  });

  it("refuses a non-empty target directory without touching it", async () => {
    const cwd = await tempDir();
    await mkdir(join(cwd, "ws"));
    await writeFile(join(cwd, "ws", "notes.txt"), "keep me");
    const result = runCli(["ws", "--method", "para", "--yes"], cwd);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("not empty");
    expect(await readdir(join(cwd, "ws"))).toEqual(["notes.txt"]);
  });

  it("rejects unknown flags with usage", async () => {
    const cwd = await tempDir();
    const result = runCli(["--bogus"], cwd);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Usage:");
  });

  it("rejects an invalid method and lists valid ones", async () => {
    const cwd = await tempDir();
    const result = runCli(["ws", "--method", "scrum", "--yes"], cwd);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("para, gtd, zettelkasten");
  });

  it("requires --method with --yes", async () => {
    const cwd = await tempDir();
    const result = runCli(["ws", "--yes"], cwd);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("--method");
  });

  it("rejects a positional directory together with --dir", async () => {
    const cwd = await tempDir();
    const result = runCli(
      ["one", "--dir", "two", "--method", "para", "--yes"],
      cwd,
    );
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("not both");
  });
});
