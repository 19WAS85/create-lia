# Model-Specific Prompt Notes

Model behavior changes quickly. Use this file only as a routing guide, not as a frozen
statement of current behavior.

## Verification rule

Before relying on model-specific defaults, confirm the exact target model and consult its
current official documentation. Record the model ID and relevant API constraints in the
prompt design notes when they materially affect the result.

Check current documentation for:

- supported system and developer instruction channels;
- tool-use and structured-output behavior;
- reasoning or effort controls;
- context-window and output limits;
- support for prefills, citations, images, files, and prompt caching;
- formatting tendencies and migration notes.

Do not request or expose hidden chain of thought. Ask for conclusions, concise rationale,
assumptions, evidence, intermediate artifacts required by the workflow, or verification
against explicit criteria.

## Sources

Verified 2026-09-10:

- https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
- https://platform.claude.com/docs/en/build-with-claude/extended-thinking
- https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview
