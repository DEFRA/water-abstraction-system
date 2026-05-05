---
description: Runtime workflow selector for command execution
---

# Workflow

Set the active execution workflow for this repository.

## Active workflow

workflow: docker

Allowed values:
- docker
- host

## Rules

- Agents must read this file before running setup, lint, test, migration, or start commands.
- If workflow is docker: run commands through Docker or VS Code tasks.
- If workflow is host: run commands directly on the host shell.
- If the value is missing or invalid: default to docker and state that assumption.

## Command templates

Docker:
- docker compose up -d
- docker compose exec dev /bin/bash -c 'cd /home/repos/water-abstraction-system && <command>'

Host:
- npm ci
- npm start
- npm run lint
- npm test
- npm run migrate
- npm run migrate:test
- npm run rollback
