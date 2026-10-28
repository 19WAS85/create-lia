# Repository Guidelines

## Project Overview

`create-lia` is a Node.js CLI that scaffolds a personal-assistant knowledge-base workspace: a generated `AGENTS.md` operating manual, the directories of an organization method (PARA, GTD, or Zettelkasten), task tracking, and three generic agent skills (`save`, `prompt`, `search`). The package exposes a single binary (`bin: { "create-lia": "dist/cli.js" }`) — it is CLI-only, with no `main`/`exports` and no emitted type declarations. The `templates/` tree is the generator's data and ships with the package (`files: ["dist", "templates"]`).

## Architecture & Data Flow

One-way module chain: `src/cli.ts` → `src/generate.ts` → `src/interpolate.ts` + `src/methods.ts`.

- `src/cli.ts` — CLI shell: `parseArgs` (from `node:util`) for flags, `@clack/prompts` for the interactive flow (the only runtime dependency), validation, and exit handling. `main()` runs at module top level: importing this file executes the CLI — never import it (tests spawn the compiled binary instead).
- `src/methods.ts` — method registry: `METHODS` is a list of `MethodPack { id, label, tasksFile }`; `getMethod(id)` is the lookup. All method-specific behavior is data-driven — `tasksFile: null` for GTD suppresses `TASKS.md` everywhere downstream.
- `src/generate.ts` — rendering pipeline: `renderWorkspace(options)` reads `templates/` and returns a `FileTree = Map<relativePath, content>`; `writeWorkspace(targetDir, files)` writes it to disk and returns the sorted list of written paths.
- `src/interpolate.ts` — pure `{{slot}}` substitution; throws `Unknown template slot: {{key}}` on undefined slots (template typos fail fast at render time).

Data flow: templates on disk → `renderWorkspace` → `FileTree` → `writeWorkspace` → target directory. Inside `renderWorkspace`: compose `AGENTS.md` from `templates/core/AGENTS-core.md` + the method's `chapter.md` + `save-routing.md`; render `TASKS.md` (unless `tasksFile` is null); copy the method's `skeleton/**` to the workspace root; append a generated `## Index` section to `templates/core/README.md`; copy `templates/skills/**` to `.agents/skills/`. Every copied/rendered file is interpolated with `{ name, language }`. The templates dir is resolved relative to the compiled file (`new URL("../templates", import.meta.url)` in `src/cli.ts`), never to cwd.

## Key Directories

| Path | Purpose |
| --- | --- |
| `src/` | Four flat modules: `cli.ts`, `generate.ts`, `interpolate.ts`, `methods.ts` (one concern per file) |
| `tests/` | Vitest suites mirroring `src/` one-to-one (`<module>.test.ts` ↔ `src/<module>.ts`) |
| `templates/core/` | Method-agnostic templates: `AGENTS-core.md`, `README.md` |
| `templates/methods/<id>/` | Per method: `chapter.md`, `save-routing.md`, `tasks.md` (not for gtd), `skeleton/` directory tree |
| `templates/skills/{save,prompt,search}/` | `SKILL.md` + `references/` files copied to `.agents/skills/` in generated workspaces |

## Development Commands

```bash
npm install                                   # npm only (package-lock.json, lockfileVersion 3)
npm run build                                 # tsc: src/ -> dist/
npm test                                      # npm run build && vitest run
npm run lint                                  # biome check . (lint + format + import sort)
npx vitest run tests/generate.test.ts         # single test file
npx vitest                                    # watch mode
npx vitest run -u                             # regenerate snapshots
node dist/cli.js --name Ada --method gtd --lang pt-BR --yes   # run the CLI locally
```

`npm test` builds first because `tests/cli.test.ts` spawns the compiled `dist/cli.js` — a stale or missing `dist/` fails those tests.

## Code Conventions & Common Patterns

- **ESM + NodeNext**: `"type": "module"`; relative imports end in `.js` even in `.ts` sources (`./generate.js`); type-only imports use the inline `type` keyword (`import { getMethod, type MethodPack } from "./methods.js"`).
- **Naming**: camelCase functions/variables, PascalCase types/interfaces, SCREAMING_SNAKE_CASE module constants. Constants carry a short comment above them stating their role.
- **Error handling**: no Result types. CLI outcomes use `never`-returning terminators (`fail(message)` → stderr + exit 1, `cancel()` → clack cancel + exit 0); programming/condition errors are thrown as `Error` and caught once by `main().catch(...)`. Errno checks cast to `NodeJS.ErrnoException` (see `isUsableTarget` in `src/cli.ts`).
- **Async**: `node:fs/promises` exclusively (`readFile`, `readdir withFileTypes`, `mkdir`, `writeFile`) with `await`; no sync fs, callbacks, or streams. Files are read whole, manipulated as strings, written whole.
- **Determinism is load-bearing**: all directory listings and output collections are sorted (`localeCompare` in `collectTemplates`, `[...files.keys()].sort()` in `buildIndex`, `written.sort()` in `writeWorkspace`) — snapshot tests depend on this order. Never emit unsorted output.
- **Config as data, not DI**: method behavior lives in `METHODS`/`MethodPack` records; downstream code branches on `method.tasksFile !== null`.
- **FileTree keys are platform-neutral**: `/`-separated relative paths, converted with `join(targetDir, ...relPath.split("/"))` only at write time in `writeWorkspace`.
- **CLI parsing/UI**: `node:util` `parseArgs` (no yargs/commander) + `@clack/prompts` only. Non-interactive mode is `--yes`; flag defaults double as prompt defaults (`DEFAULT_ASSISTANT_NAME = "Lia"`, `DEFAULT_LANGUAGE`, `FALLBACK_DIR_NAME = "workspace"`).
- **Docs and templates are English**; generated workspaces get the user's `--lang` as an explicit rule, while agent artifacts stay English by design (`templates/core/AGENTS-core.md`).

## Important Files

- `src/cli.ts` — entry point (shebang, top-level `main()`); help text lives in the `USAGE` constant.
- `src/generate.ts` — `renderWorkspace`/`writeWorkspace`; **frozen public API**: `renderWorkspace` takes a single options object (`// The options-object parameter is part of the frozen public API.`) — do not change it to positional args. `WorkspaceOptions`, `FileTree`, `getMethod`, `MethodPack` are likewise a stable contract relied on by tests.
- `src/methods.ts` — `METHODS`, `getMethod`, and the template-filename constants (`SKELETON_DIR`, `CHAPTER_FILE`, `ROUTING_FILE`).
- `templates/` — consumed at runtime by `renderWorkspace`; editing it changes generated output and invalidates snapshots.
- `tests/__snapshots__/generate.test.ts.snap` — full rendered trees and `AGENTS.md` per method.
- `biome.json`, `tsconfig.json`, `README.md`, `LICENSE` (MIT).

### Frozen contracts & traps

- Template filenames are magic constants in code (`AGENTS.md`, `TASKS.md`, `README.md` in `src/generate.ts`; `skeleton`, `chapter.md`, `save-routing.md` in `src/methods.ts`) and must match the `templates/` tree exactly — there is no schema validation; a missing file surfaces as a raw ENOENT.
- `.gitkeep` files are intentionally copied into generated workspaces (they keep empty skeleton dirs alive) — do not filter them out without updating tests.
- `USAGE` in `src/cli.ts` must stay in sync with the `parseArgs` option table and the method list in `METHODS` (the method list is also duplicated in error messages).
- `getMethod` lowercases its input and returns `undefined` for unknown ids — every caller must handle `undefined` (the CLI turns it into `fail` listing valid methods).
- `interpolate` inserts values verbatim into Markdown with no escaping and throws on unknown slots.
- `biome.json` scopes itself to `src/**`, `tests/**`, `*.json` — templates and docs are intentionally not linted or formatted.
- `cli.ts` executes on import; only `generate.ts`, `methods.ts`, `interpolate.ts` are importable as modules.

## Runtime/Tooling Preferences

- **Node.js >= 20** — enforced by `engines` and a hard runtime gate in `src/cli.ts`. No Bun/tsx/ts-node anywhere.
- **npm** as package manager (only `package-lock.json` exists).
- **TypeScript** `^7`, `strict: true`, `target: ES2022`, `module`/`moduleResolution: NodeNext`, `rootDir: src`, `outDir: dist`, `declaration: false`, `sourceMap: false`. `tsconfig.json` includes only `src` — tests are transpiled by Vitest, not `tsc`.
- **Biome** handles lint + formatting (recommended preset, double quotes, space indent, `organizeImports` on). No ESLint, no Prettier.
- **No CI pipeline** — `npm test` and `npm run lint` are local-only gates. `dist/` is build output and gitignored.

## Testing & QA

- **Vitest 5**, no config file (defaults pick up `tests/*.test.ts`). Import `describe`/`it`/`expect` from `"vitest"`; use `it`, not `test`.
- Layout mirrors source: `tests/<module>.test.ts` ↔ `src/<module>.ts`. Exception: `tests/cli.test.ts` exercises the compiled binary via `spawnSync(process.execPath, [cliPath, ...args])` in a fresh `mkdtemp` dir with `NO_COLOR=1`; assertions carry stderr as the failure message (`expect(result.status, result.stderr).toBe(0)`).
- **No mocks, spies, or shared fixtures** — tests call real modules, render the real `templates/` directory (`render(id, overrides)` helper in `tests/generate.test.ts`), and run the real CLI. Small typed helpers live inside each test file.
- **Snapshots**: `tests/__snapshots__/generate.test.ts.snap` captures file trees and full `AGENTS.md` per method, always paired with explicit `toEqual`/`toContain` assertions. Any change to `templates/` or rendering output requires `npx vitest run -u`.
- Cross-cutting invariants asserted per method: no leftover `{{slots}}`, skill bodies contain no method names, no personal/git residue in generated output, exact sorted file-tree keys (catches stray or missing files).
