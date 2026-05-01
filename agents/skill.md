---
description: Standard skills and patterns the agent should apply when working in this codebase
---

# Skill

## Context

This document defines the standard skills the agent should apply consistently across all tasks. Skills are repeatable, quality-assured approaches to common engineering activities.

## Core principles

- Solve the problem as stated — do not over-engineer or anticipate future requirements
- Follow existing patterns in the codebase before introducing new ones
- Verify work with lint and tests before marking a task complete

## Skills

### Reading code

- Read the full function and its callers before making changes
- Check for existing utilities before writing new ones
- Use `grep` / search to find all usages of a symbol before renaming or removing it

### Writing code

- Match the style and conventions of the surrounding code
- Every file must begin with `'use strict'`
- All internal `require()` paths must include the `.js` extension
- All `require()` calls must be at the top of the file, after the `@module` JSDoc and before any function definitions — never inside functions
- Arrow functions must always use braces: `const fn = () => { return x }`
- No inline comments unless the *why* is genuinely non-obvious
- JSDoc is required on all public functions — use `@param`, `@returns`, and a description; controllers and seeds are exempt
- No `console.log()` or `console.dir()` — CI will fail on these
- No error handling for scenarios that cannot happen
- No abstractions for a single use case

### Testing

- Tests live in `test/` mirroring the `app/` structure
- Use `@hapi/lab` and `@hapi/code` — not Jest, Mocha, or Chai
- Never leave `describe.only()` or `it.only()` in committed code — CI will fail on these
- Test behaviour, not implementation
- One assertion concept per `it` block

### Database

- Migrations go in `db/migrations/`
- Never modify an existing migration — always add a new one
- Run `npm run migrate:test` to reset the test database after schema changes

### Refactoring

- Refactor in a separate commit from behaviour changes
- Do not rename or restructure things incidentally while fixing bugs

## Quality gates

Before completing any task:

1. `npm run lint` passes
2. `npm test` passes
3. No `console.log`, `console.dir`, `describe.only`, or `it.only` present
4. No unintended files changed