---
name: commits
description: Expectations and rules for making git commits in this project
---

# Commits skill

## Context

This document defines how an agent must make commits to this project when making changes and committing them to git.

In most cases, a new branch will have been created by the developer, containing an empty commit that explains the context and intended change before an agent is engaged.

## Core principles

- PR's are focused and related to specific changes
- Code review is simple and manageable
- The commit history is clean tree of changes
- There is consistency across the commits

## Rules

### 1 - Separate subject from body with a blank line

Not all commits require a subject and body. But if they do this rule should be applied.

```text
// Bad
Refactor all database logic to DAL modules
We're moving all interactions with the DB out of services and into DAL modules. This helps isolate the logic and makes testing of services far easier.

// Good
Refactor all database logic to DAL modules

We're moving all interactions with the DB out of services and into DAL modules. This helps isolate the logic and makes testing of services far easier.
```

### 2 - Limit the subject line to 50 characters

```text
// Bad
Refactor the service to move all database logic into a separate DAL module plus all tests

// Good
Refactor all database logic to DAL modules
```

### 3 - Capitalize the subject line

```text
// Bad
refactor all database logic to DAL modules

// Good
Refactor all database logic to DAL modules
```

### 4 - Do not end the subject line with a period

```text
// Bad
Refactor all database logic to DAL modules.

// Good
Refactor all database logic to DAL modules
```

### 5 - Use the imperative mood in the subject line

```text
// Bad
Refactored all database logic to DAL modules

// Good
Refactor all database logic to DAL modules
```

### 6 - Use the body to explain what and why vs. how

```text
// Bad
Refactored all database logic to DAL modules

We moved the query that fetched records from the DB to `fetch-records.dal.js` and the query that updates the return log to `update-return-log.dal.js'.

// Good
Refactor all database logic to DAL modules

As a team, we've agreed to move all interactions with the DB out of services and into DAL modules. This helps isolate the logic and makes testing of services easier.

Prior to changing the logic in `submit-check.service.js`, we're doing this refactor.
```

## Completion

When all changes are complete and have been verified, create commit messages that follow the rules above.

Before committing:

1. Ensure the commit scope is focused on one change
2. Ensure lint and tests have been run where relevant
3. Ensure commit subject/body formatting follows this skill
