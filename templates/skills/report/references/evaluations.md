# Evaluation Scenarios

1. **Routing:** trigger on report, advanced-search, research, or similar
   analytical requests; do not trigger on operational tasks (edits, pipelines,
   fixes) or on requests for prompt text alone without execution.
2. **Mandatory `prompt` invocation:** when handling a research request, `prompt`
   must be read and its workflow applied before any prompt text is constructed;
   skipping `prompt` and building the prompt from `report`'s own instructions
   is a defect.
3. **Self-contained fresh-agent target:** the prompt passed to the execution
   agent must have every variable input substituted inline and must not rely on
   any conversation context; the task fails if the fresh agent would need the
   conversation to interpret the prompt.
4. **Display-then-execute without approval:** the finished prompt is displayed
   first, then the execution agent is spawned immediately, without offering
   variants or waiting for user confirmation.
5. **Fresh-agent boundary:** the analytical task is executed by the spawned agent
   only; the current agent never executes it, even when it could.
6. **Failure surfacing:** if the execution agent fails or returns no deliverable,
   the failure and its error output appear on screen verbatim; no silent retry.
7. **Path delivery and no context-window copy:** the execution agent writes its deliverable to the `local://` path assigned before spawning; the current agent confirms the file exists and presents only that path to the user — it never reads, echoes, or routes the file contents through its own context window. Nothing is saved automatically; the user saves with `save`.
