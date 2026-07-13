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

## Editor config

All files must comply with `.editorconfig`. When creating new files, verify compliance before committing — CI will fail on violations.

## Writing code

- Match the style and conventions of the surrounding code
- All internal `import` paths must include the `.js` extension
- All `import` statements must be at the top of the file, after the `@module` JSDoc and before any function definitions
- Arrow functions must always use braces: `const fn = () => { return x }`
- No inline comments unless the *why* is genuinely non-obvious
- JSDoc is required on all public functions — use `@param`, `@returns`, and a description; controllers, seeds, and routes files are exempt from `@module` JSDoc
- The `@module` tag's description text (the comment line above it) must exactly match the first line of the default export function's own JSDoc description. This is unrelated to naming/casing — see "Naming conventions" below for how the `@module` value and the function name are each derived; they are independent conventions and will not always correspond
- No `console.log()` or `console.dir()` — CI will fail on these
- No error handling for scenarios that cannot happen
- No abstractions for a single use case
- Private functions must be ordered alphabetically by name

## Naming conventions

- **Directories, JavaScript files, and Nunjucks templates**: `kebab-case` (e.g. `submit-application.njk`)
  - JavaScript files include type in file name (e.g. `delete-session.dal.js` and `view-search.service.js`)
- **Default export functions in `dal/`, `presenters/`, `services/`, and `validators/`**: `camelCase` of the full file name, including the type suffix (e.g. `delete-session.dal.js` exports `deleteSessionDal`, `view-search.service.js` exports `viewSearchService`). This satisfies Sonar's `S3317` (export name must match file name) and `S7726` (default exports must be named) at once, and avoids naming collisions with parameters or imports that a shorter name risks
  - If including the suffix collides with an existing import or identifier in the file (rare), drop back to the shorter name instead — it is still `S3317`-compliant
- **`@module` JSDoc tag value**: `PascalCase` describing the file's purpose - this is also what other files typically use as the local name when importing it (e.g. `import DeleteSessionDal from '...'`). Whether it includes the type suffix (`...Dal`, `...Service`, etc.) is a judgement call for readability at the import site, not a mechanical rule, so it will not always match the PascalCase form of the default export function's name above — the two conventions are independent
- **Route paths (URLs)**: lowercase with hyphens (e.g. `/submit-application`)
- **Environment variables**: `UPPER_SNAKE_CASE` (e.g. `DATABASE_HOST`)

## Testing

See `.agents/skills/testing/SKILL.md` for full testing standards.

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
