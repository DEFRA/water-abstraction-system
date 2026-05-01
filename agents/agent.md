---
description: Core operational framework for the AI coding agent working on this project
---

# Agent

Water Abstraction System is a Node.js/Hapi API that calculates charges, queues transactions, and generates files to produce invoices for water abstraction licences. It is a live production service under active development.

## Commands

```bash
# Install dependencies
npm install

# Run the service
npm start

# Lint
npm run lint

# Test (runs clean + lab)
npm test

# Database migrations
npm run migrate          # run latest migrations
npm run migrate:test     # wipe and re-migrate test DB
npm run rollback         # rollback last migration
```

## Rules

Consult these files before starting any task:

| File | When to read |
|---|---|
| `skill.md` | Understanding how to apply skills and standard patterns |
| `personas/alan.md` | Alan's persona and coding philosophy |
| `alanisms.md` | Non-negotiable conventions that cannot be automated or linted |

## Models

The files in `agents/` are model-agnostic. They must work equally well with any LLM — Claude, GPT, Gemini, or others. When writing or updating these files:

- Use plain language, not prompt patterns specific to one provider
- Do not rely on system-prompt features that only some models support
- Assume the consumer pastes the content directly into any chat interface

You may use whichever model you have access to for any given task. Stronger models are better for complex reasoning (architecture, debugging); faster/cheaper models are fine for mechanical tasks (sorting, formatting, renaming).

## Constraints

- Node.js v22, PostgreSQL v15
- Test framework is `@hapi/lab` with `@hapi/code` assertions — not Jest or Mocha
- ESLint is enforced — run `npm run lint` before considering a task complete
- Do not introduce new dependencies without discussion
- Configuration is environment-variable driven; local config lives in `.env`
