---
name: save
description: >
  Performs workspace maintenance after authorized substantive file changes or
  when explicitly requested: extracts reusable knowledge, updates tasks and
  durable user context, refreshes the README index when needed, and validates
  edits. External automation may invoke it for detection, but must not silently
  create new uncommitted maintenance changes.
---

# {{name}}: Save

Apply the maintenance rules from `AGENTS.md` at the workspace root. That file is the source of
truth for authorization, privacy, routing, and document conventions.

## Invocation Modes

- **Explicit:** the user asks for workspace maintenance. Report whether files changed.
- **After authorized edits:** run applicable maintenance as part of the same task.
- **External automation:** when the user wires up automation (for example a hook),
  inspect and report maintenance that may be needed, but do not create new
  uncommitted changes automatically. Propose the follow-up action.

A session appearing to end is not independent authorization to write.

## Workflow

1. Read `AGENTS.md` and inspect the current working tree, including untracked and
   uncommitted files relevant to the conversation. Do not limit duplicate checks
   to committed content.
2. Identify only durable changes produced by the current work:
   - reusable knowledge not already captured;
   - tasks created, completed, cancelled, or reprioritized;
   - durable facts about the user;
   - structural or indexing changes.
3. Route updates to the canonical locations defined in the save-routing table in
   `AGENTS.md`.
4. Update task tracking according to the method defined in `AGENTS.md`, including
   deduplication and movement between active and completed sections.
5. For durable personal or professional context, update the canonical
   `user-context` file defined in the `AGENTS.md` save-routing table, and keep
   only the useful summary in the `README.md` user context section.
6. Update `README.md` when repository structure changed or a canonical,
   recurring-reference document should be indexed.
7. Validate every changed file:
   - reread modified regions;
   - check frontmatter, relative links, duplicates, and canonical placement;
   - ensure no `private/` content or unnecessary confidential data escaped its boundary.
8. Never commit automatically. A commit requires the user's explicit authorization.

## No-op Behavior

- Automatic invocation: make no changes and produce no extra message when nothing qualifies.
- Explicit invocation: make no changes and reply with one sentence stating that
  no maintenance is needed, in the conversation language.

See [evaluation scenarios](references/evaluations.md) when testing or revising this skill.
