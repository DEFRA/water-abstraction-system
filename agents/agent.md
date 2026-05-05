---
description: Core operational framework for the AI coding agent working on this project
---

# Agent

Water Abstraction System is a Node.js/Hapi API that calculates charges, queues transactions, and generates files to produce invoices for water abstraction licences. It is a live production service under active development.

## Commands

```bash
# Start the local environment (from repo root)
docker compose up -d

# Open a shell in the dev container
docker compose exec dev /bin/bash

# Run commands inside the dev container (preferred pattern)
docker compose exec dev /bin/bash -c 'cd /home/repos/water-abstraction-system && <command>'

# Install dependencies
docker compose exec dev /bin/bash -c 'cd /home/repos/water-abstraction-system && npm ci'

# Run the service
docker compose exec dev /bin/bash -c 'cd /home/repos/water-abstraction-system && npm start'

# Lint
docker compose exec dev /bin/bash -c 'cd /home/repos/water-abstraction-system && npm run lint'

# Test (runs clean + lab)
docker compose exec dev /bin/bash -c 'cd /home/repos/water-abstraction-system && npm test'

# Database migrations
docker compose exec dev /bin/bash -c 'cd /home/repos/water-abstraction-system && npm run migrate'       # run latest migrations
docker compose exec dev /bin/bash -c 'cd /home/repos/water-abstraction-system && npm run migrate:test'  # wipe and re-migrate test DB
docker compose exec dev /bin/bash -c 'cd /home/repos/water-abstraction-system && npm run rollback'      # rollback last migration
```

## Execution environment

- Workflow is selected in `workflow.md` (`docker` or `host`)
- If `docker`, prefer the VS Code tasks in `.vscode/tasks.json` and run commands via Docker
- If `docker` and `dev` is not running, start it with `docker compose up -d` before running commands
- If `host`, run `npm`, `node`, and migration commands directly on the host shell

## Rules

Consult these files before starting any task:

| File | When to read |
|---|---|
| `workflow.md` | Determine whether command execution must be Docker or host |
| `skill.md` | Understanding how to apply skills and standard patterns |
| `personas/alan.md` | Alan's persona and coding philosophy |
| `alanisms.md` | Non-negotiable conventions that cannot be automated or linted |

Execution mode decision order:

1. Read `workflow.md`
2. If `workflow: docker`, use Docker/task-based commands
3. If `workflow: host`, use host shell commands
4. If missing/invalid, default to Docker and state the assumption in the response

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
