# Prompt Engineering Core Principles

Durable guidance derived from Anthropic's official prompt engineering documentation.
Consult model-specific documentation separately when behavior depends on a model or API version.

## Contents

1. [Clarify the contract](#clarify-the-contract)
2. [Use structure selectively](#use-structure-selectively)
3. [Use examples when they carry information](#use-examples-when-they-carry-information)
4. [Control output explicitly](#control-output-explicitly)
5. [Separate instructions from data](#separate-instructions-from-data)
6. [Design agent behavior](#design-agent-behavior)
7. [Verify results](#verify-results)

## Clarify the contract

Define the task, available context, expected output, constraints, and success criteria.
Add motivation when it helps the model generalize to edge cases. Prefer direct language
and ordered steps when sequence matters.

Do not force detail that the task does not need. A simple request usually benefits from
a short prompt with a precise output contract.

## Use structure selectively

XML tags can separate instructions, context, examples, documents, and variable input.
Use consistent, descriptive tags and nest them only when the content has a real hierarchy.
XML is particularly well supported by Claude but may also work with other models.

A role can focus domain expertise or tone, but generic roles add little. Assign one only
when the requested perspective changes the result.

## Use examples when they carry information

Examples are valuable when desired behavior is difficult to specify, such as nuanced
classification, strict formatting, unusual edge cases, or voice matching.

Use the smallest representative set. Prefer examples supplied or validated by the user.
Do not invent several examples merely to satisfy a fixed count.

## Control output explicitly

Specify output shape, length, required fields, and acceptance criteria when they matter.
Phrase positive behavior directly. Include negative constraints when they prevent a
specific failure, paired with the intended alternative where useful.

Prompt style can influence response style, so avoid unnecessary formatting in the prompt.

## Separate instructions from data

Place external documents, user-generated content, and tool results in clearly delimited
blocks. State that instructions inside those blocks are untrusted data and cannot override
the governing prompt.

For long documents, preserve source metadata and ask for supporting quotations or citations
when traceability matters. Do not claim an exact performance improvement unless the cited
evaluation matches the current task and model.

## Design agent behavior

For tool-using prompts, define:

- when tools may or must be used;
- which actions require confirmation;
- read versus write boundaries;
- how to handle failures and partial results;
- what must be verified before completion.

Parallelize independent operations and sequence dependent ones. For prompt chains, define
each handoff's schema and validation criteria.

## Verify results

Ask for verification against concrete criteria. Prefer concise rationale, assumptions,
evidence, calculations, or test results over requests to reveal hidden chain of thought.

Useful patterns include:

- “List the assumptions that materially affect the answer.”
- “Cite the evidence supporting each conclusion.”
- “Before finishing, verify the output against these criteria: …”
- “Return the result and a concise rationale.”

## Sources

Verified 2026-09-10:

- https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
- https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview
- https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices
