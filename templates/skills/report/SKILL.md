---
name: report
description: >
  Use for analytical deliverables: structured reports, comparative analyses, or
  multi-source syntheses. Not for straightforward factual or conversational
  research (use `search` instead), operational edits, pipelines, fixes, or
  prompt text without execution.
---

# {{name}}: Report

Turn a research request that requires a structured, multi-source analytical
deliverable into a well-crafted prompt, execute it in a fresh agent, and deliver
the result. Follow `AGENTS.md`, including its writing rules and its security and
privacy rules.

**Scope gate**: if the request is a factual lookup, a conversational answer, or
a simple web/workspace search, use the `search` skill instead. `report` is for
deliverables that justify the overhead of a fresh agent: structured reports,
comparative analyses, or multi-source syntheses.

**Warning: never execute the task in the current agent.** Build the prompt via
the `prompt` sub-skill, display it, then execute it in a fresh agent (step 3)
without asking for approval. The prompt is the fresh agent's instruction; the
deliverable it produces is the result. Execution never waits for user approval
and that includes tasks with external effects — but the executing agent still
obeys the `AGENTS.md` security and privacy rules: never expose secrets or
`private/` content; keep work and client content confidential.

**REQUIRED SUB-SKILL:** Use `prompt` to construct the prompt. `prompt` owns
target clarification, technique selection, untrusted-input boundary protection,
drafting, model-specific guidance, and prompt validation. The dependency is
one-way: `prompt` is unaware of `report`. When invoking `prompt`, specify that
its target runtime is a fresh tool-using execution agent with no conversation
context, and require that it produce a self-contained final prompt with no
variants and no save.

## Workflow

1. **Invoke `prompt`**
   - Read `skill://prompt/SKILL.md` and apply its full workflow to the report
     request. The target for prompt construction is the fresh execution agent in
     step 3: the prompt must be self-contained, with every variable input
     substituted inline, and must not depend on any conversation context.
   - Suppress prompt variants and do not ask for approval; execution follows
     immediately after display.

2. **Display the prompt**
   - Present the finished prompt in a labeled code block with at most five
     concise `Why it works` bullets.
   - Do not offer variants. Do not wait for approval. Continue to step 3.

3. **Execute in a fresh agent**
   - Immediately after displaying the prompt, spawn a fresh agent with the
     `task` tool. Never ask the user for permission or confirmation.
   - Assign a stable output path before spawning: `local://report-<slug>.md`,
     where `<slug>` is a short kebab-case label derived from the request topic.
     Pass that path to the agent in the prompt so it writes its deliverable
     there directly.
   - Call shape:
     ```
     task(
       context: "# Contract\nExecute the prompt below exactly as written; it fully specifies the task.",
       tasks: [{ task: "<final prompt text — any SYSTEM/USER blocks in order, variable inputs substituted inline>",
                 solutionSpace: "The prompt fully specifies the task; execute it end to end." }],
       i: "Executing final prompt in fresh agent"
     )
     ```
   - The fresh agent has no conversation context: substitute every variable input
     into the task text, including the output path. Payloads too large to inline
     (multiple files, long documents) go into `local://` files referenced by path
     in the task.
   - Wait for the result. If the agent fails or is blocked, report the failure and
     its error output on screen; never retry silently.

4. **Deliver the result**
   - The deliverable lives at the `local://` path the agent wrote. Confirm the
     file exists; if it does not, treat it as a failure and surface the agent's
     error output verbatim.
   - Present **only** the output path to the user — never read or echo the file
     contents. Example reply:
     > Report at `local://report-<slug>.md`
   - This keeps the deliverable out of the context window. The user reads it
     directly, or saves it with the `save` skill, which copies the file to its
     canonical destination without routing the content through the LLM.
   - Never save or persist the prompt. The user saves the report with `save`.

## Quality Checks

Before delivering, verify:

- the skill was triggered by a report, advanced-search, research, or similar
  analytical request (not an operational task or bare prompt request);
- `prompt` was read and its full workflow was applied before constructing the
  prompt;
- the finished prompt was displayed before execution;
- execution ran in a fresh agent without asking for approval;
- only the output path (not the content) is presented on screen, and nothing was saved;
- failures are surfaced verbatim, not retried silently.

See [evaluation scenarios](references/evaluations.md) when testing or revising
this skill.
