## Organization Method: PARA

This workspace organizes content with the PARA method: by horizon, not by topic.

- `projects/` — initiatives with a defined outcome or deadline. Complex projects may use subdirectories with separate documents, such as `projects/pulse/scope.md`.
- `areas/` — ongoing responsibilities with no defined end.
- `resources/` — reference, guides, and consultation material.
- `archives/` — completed or inactive items.
- `knowledge/` — reusable cross-cutting knowledge by domain: `knowledge/<domain>/<topic-kebab-case>.md`. Create a new domain only when no existing domain fits and there is concrete content to store.

### Horizons

- Active initiative with a defined outcome or deadline → `projects/`.
- Ongoing responsibility without a defined end → `areas/`.
- Workspace reference material → `resources/`.
- General reusable insight that spans the workspace → `knowledge/<domain>/<topic-kebab-case>.md`.
- Completed or inactive item → `archives/`: archive it, do not delete it.

The workspace root holds only metadocuments and global structures. Do not save one-off conversations at the root.

### Task Tracking

Tasks live in [`TASKS.md`](TASKS.md), with three stable sections:

- `This week` — action intended for the current week.
- `Upcoming` — future action, or one with no commitment for the current week.
- `Completed` — completed, cancelled, or closed actions, with date and a brief result.

Rules:

- Register only concrete pending actions. Reference information belongs in the canonical document of its subject, not in tasks.
- Before adding a task, look for duplicates and update the existing item when appropriate.
- Each task needs an actionable description. Include deadline, origin, and context only when known and useful.
- On completion or cancellation, move the item to `Completed`; never leave it duplicated in an active section.
- When `This week` is maintained across a new week, update its range.
- Mark cancellation or expiry by the real result, never as a completed execution.
