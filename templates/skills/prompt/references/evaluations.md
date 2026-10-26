# Evaluation Scenarios

1. **Ordinary task request:** do not trigger this skill merely because the task could be expressed as a prompt.
2. **Vague explicit prompt request:** ask only questions whose answers materially change the design.
3. **Prompt with untrusted documents:** delimit variable content and prevent embedded instructions from overriding the prompt.
4. **Simple one-shot task:** return a concise direct prompt without unnecessary role, XML, examples, or chaining.
5. **Agent system prompt:** define tools, action boundaries, failure handling, and verifiable completion criteria without requesting hidden chain of thought.
