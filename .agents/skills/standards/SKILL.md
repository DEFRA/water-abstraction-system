---
name: standards
description: Standard skills and patterns an agent should apply when working in this codebase
---

# Standards skill

## Context

This document defines the standards an agent must apply when reviewing or writing code in this project.

## Core principles

- Solve the problem as stated — do not over-engineer or anticipate future requirements
- Follow existing patterns in the codebase before introducing new ones
- Verify work before marking a task complete
- Run project commands in Docker (`docker compose exec dev ...`) or via VS Code tasks; do not run Node/NPM commands on the host

## Reading code

- Read the full function and its callers before making changes
- Check for existing utilities before writing new ones
- Use `grep` / search to find all usages of a symbol before renaming or removing it

## Writing code

- Match the style and conventions of the surrounding code
- Every file must begin with `'use strict'`
- All internal `require()` paths must include the `.js` extension
- All `require()` calls must be at the top of the file, after the `@module` JSDoc and before any function definitions — never inside functions
- Arrow functions must always use braces: `const fn = () => { return x }`
- No inline comments unless the *why* is genuinely non-obvious
- JSDoc is required on all public functions — use `@param`, `@returns`, and a description; controllers, seeds, and routes files are exempt from `@module` JSDoc
- No `console.log()` or `console.dir()` — CI will fail on these
- No error handling for scenarios that cannot happen
- No abstractions for a single use case

## Naming conventions

- **Directories, JavaScript files, and Nunjucks templates**: `kebab-case` (e.g. `submit-application.njk`)
  - JavaScript files include type in file name (e.g. `delete-session.dal.js` and `view-search.service.js`)
- **Route paths (URLs)**: lowercase with hyphens (e.g. `/submit-application`)
- **Environment variables**: `UPPER_SNAKE_CASE` (e.g. `DATABASE_HOST`)

## Testing

- Tests live in `test/` mirroring the `app/` structure
- Test file names match the module they are testing with a `.test.js` extension (e.g. `delete-session.dal.test.js`)
- Use `@hapi/lab` and `@hapi/code` — not Jest, Mocha, or Chai
- Never leave `describe.only()` or `it.only()` in committed code — CI will fail on these
- Test behaviour, not implementation
- One assertion concept per `it` block

## Database

- Migrations go in `db/migrations/`
- Never modify an existing migration — always add a new one
- Run `npm run migrate:test` to reset the test database after schema changes

## Refactoring

- Refactor in a separate commit from behaviour changes
- Do not rename or restructure things incidentally while fixing bugs

## Quality gates

Before completing any task:

1. Lint checks pass
2. No 'alanisms' identified
3. Tests pass
4. No `console.log`, `console.dir`, `describe.only`, or `it.only` present
5. No commented out code
6. No unintended files changed
