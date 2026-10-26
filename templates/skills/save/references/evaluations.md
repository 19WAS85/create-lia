# Evaluation Scenarios

1. **Explicit no-op invocation:** inspect applicable files and reply with one sentence stating that no maintenance is needed, in the conversation language.
2. **Uncommitted insight already present:** detect it in the working tree and do not create a duplicate.
3. **Durable personal fact:** update the canonical user profile and only the useful README summary.
4. **Resolved task:** move and deduplicate the task according to `AGENTS.md`.
5. **Post-commit invocation:** report suggested maintenance without silently creating new uncommitted changes.
