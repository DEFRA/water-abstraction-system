# Agents

This folder contains the agent workflow, skills, personas, and conventions used when working on this codebase with any AI assistant.

## Personas

A persona gives the AI a specific point of view, set of standards, and way of judging code. Instead of asking a general-purpose assistant to review your work, you ask someone with a defined opinion — which produces more consistent, targeted feedback.

Use a persona when you want the AI to apply a specific expert's lens rather than generic best-practice advice. The Alan persona, for example, focuses purely on Alan's conventions so that feedback mirrors what Alan himself would say in a PR review.

To adopt a persona, tell the AI to read the persona file before starting the task:

```
Read agents/personas/alan.md and act as Alan for this review.
```

The persona file defines the character's values, priorities, and what they will and won't comment on. The AI stays in that frame for the duration of the task.

## Alan review

Before raising a PR, ask the AI to do an Alan review. If the persona file has been loaded for the session, you can say:

```
Alan review
```

If starting fresh, tell the AI to load the persona first:

```
Read agents/personas/alan.md then do an Alan review.
```