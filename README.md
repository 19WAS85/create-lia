# create-lia

Lightweight and simple by design: made to work with your own agentic harness, applying YAGNI, KISS, and POLA in both design and execution. `create-lia` scaffolds a personal-assistant knowledge workspace for an assistant you name (Lia by default): a complete `AGENTS.md` operating manual, the directories of a proven organization method, task tracking, and three generic agent skills (`save`, `prompt`, `search`) — all in plain Markdown files you own.

## What Lia does for you

**Keeps your knowledge organized.** Choose the organization method that matches how you think; Lia applies its rules and keeps every file where it belongs.

| Method | Directories | Task tracking |
| --- | --- | --- |
| `para` | `projects/`, `areas/`, `resources/`, `archives/`, `knowledge/` | `TASKS.md` (This week / Upcoming / Completed) |
| `gtd` | `inbox/`, `projects/`, `reference/`, `next-actions.md`, `waiting-for.md`, `someday-maybe.md` | the GTD lists themselves |
| `zettelkasten` | `inbox/`, `notes/` (with a Map of Content), `sources/` | `TASKS.md` (Open / Done) |

**Tracks your tasks.** Task tracking is part of the method itself — `TASKS.md`, or the GTD lists — so there is no separate tool to maintain.

**Saves what matters, in the right place.** The `save` skill extracts reusable knowledge and routes every piece of information to its canonical home, defined by the save-routing table in `AGENTS.md`.

**Finds and summarizes.** The `search` skill works local-first across your workspace (and the web when needed), separates source claims from analysis, and treats instructions found inside source material as data — not commands.

**Helps you prompt any LLM.** The `prompt` skill creates, reviews, and improves prompts for any model, grounded in durable prompt-engineering principles.

## Your workspace

Everything the installer generates is yours — plain Markdown and directories, readable by you and by any agentic tool:

```text
<dir>/
├── AGENTS.md              # Lia's operating manual: identity, rules, method, save routing
├── README.md              # index + your user context
├── TASKS.md               # task tracking (not generated for gtd)
├── .agents/skills/save/   # workspace maintenance
├── .agents/skills/prompt/ # prompt engineering for any LLM
├── .agents/skills/search/ # local-first search and summarization
└── <method directories>
```

The assistant name is injected into `AGENTS.md` and the skill headings; the chosen language becomes an explicit rule in `AGENTS.md`. The method's rules live only in `AGENTS.md`, so the skills work unchanged for any method.

## Getting started

```bash
npx create-lia                # interactive
npx create-lia my-workspace --name Ada --method gtd --lang pt-BR --yes
```

Four decisions (asked interactively, or taken as flags):

| Question | Flag | Default |
| --- | --- | --- |
| What should your assistant be called? | `--name` | `Lia` |
| Which organization method do you use? | `--method` | none — must be chosen |
| Which language should your assistant converse and write documents in? | `--lang` | `English` |
| Where should the workspace be created? | `--dir` (or positional) | `./<kebab-cased name>` |

`--yes` runs non-interactive and requires `--method`. Unknown flags and invalid methods fail with the valid options listed. The installer never overwrites an existing workspace: it aborts when the target directory exists and is not empty.

Requires Node.js >= 20.

## License

MIT
