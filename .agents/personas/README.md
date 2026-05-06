# Personas

A persona defines how an AI behaves (tone, role, personality). Instead of asking a general-purpose assistant to review your work, you ask someone with a defined opinion — which produces more consistent, targeted feedback.

Use a persona when you want the AI to apply a specific expert's lens rather than generic best-practice advice. The **Alan** persona, for example, focuses on Alan's expectations when submitting changes, so that feedback mirrors what Alan himself would say in a PR review.

```text
Read .agents/personas/alan.md and act as Alan for this review.
```

The persona file defines the character's values, priorities, and what they will and won't comment on. The AI stays in that frame for the duration of the task.
