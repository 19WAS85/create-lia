# create-lia

Scaffold a personal-assistant knowledge-base workspace: a complete `AGENTS.md`
operating manual, the directories of a proven organization method, task
tracking, and three generic agent skills (`save`, `prompt`, `search`).

## Usage

```bash
npx create-lia                # interactive
npx create-lia my-workspace --name Ada --method gtd --lang pt-BR --yes
```

The installer asks four questions (or takes them as flags):

| Question | Flag | Default |
| --- | --- | --- |
| What should your assistant be called? | `--name` | `Lia` |
| Which organization method do you use? | `--method` | none — must be chosen |
| Which language should your assistant converse and write documents in? | `--lang` | `English` |
| Where should the workspace be created? | `--dir` (or positional) | `./<kebab-cased name>` |

`--yes` runs non-interactive and requires `--method`. Unknown flags and invalid
methods fail with a message listing the valid options. The installer never
overwrites an existing workspace: it aborts when the target directory exists and
is not empty.

## Organization methods

| Method | Directories | Task tracking |
| --- | --- | --- |
| `para` | `projects/`, `areas/`, `resources/`, `archives/`, `knowledge/` | `TASKS.md` (This week / Upcoming / Completed) |
| `gtd` | `inbox/`, `projects/`, `reference/`, `next-actions.md`, `waiting-for.md`, `someday-maybe.md` | the GTD lists themselves |
| `zettelkasten` | `inbox/`, `notes/` (with a Map of Content), `sources/` | `TASKS.md` (Open / Done) |

## What gets generated

```text
<dir>/
├── AGENTS.md              # operating manual: identity, rules, method, save routing
├── README.md              # index + user context section
├── TASKS.md               # task tracking (not generated for gtd)
├── .agents/skills/save/   # workspace maintenance
├── .agents/skills/prompt/ # prompt engineering for any LLM
├── .agents/skills/search/ # local-first search and summarization
└── <method directories>
```

The assistant name is injected into `AGENTS.md` and the skill headings; the chosen
language becomes an explicit rule in `AGENTS.md`. Everything else is method-agnostic: the method's rules live only
in `AGENTS.md`, so the skills work unchanged for any method.

## Requirements

Node.js >= 20.

## License

MIT
