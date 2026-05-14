---
name: pull-requests
description: Expectations and rules for creating and managing pull requests in this project
---

# Pull requests skill

## Context

This document defines how pull requests (PRs) should be created and managed in this project. It is based on the [Defra pull request standards](https://defra.github.io/software-development-standards/processes/pull_requests/).

## Core principles

- PRs are focused and related to a specific change
- Code review is simple and manageable
- The commit history is a clean, linear tree of changes
- There is consistency across commits

## Rules

### 1 - Always work on a branch

No matter how small the change, never commit directly to `main`. Always create a feature branch first.

```text
// Bad
git commit -m "Fix typo in readme" (on main)

// Good
git checkout -b fix-readme-typo
```

Branch names use hyphens only — no slashes.

```text
// Bad
chore/update-agent-skills

// Good
chore-update-agent-skills
```

### 2 - Commit body structure

Every commit that describes the PR's intent must follow this structure:

- **Line 1**: Subject line (50 character maximum, imperative mood, capitalised, no trailing period)
- **Line 2**: Blank line
- **Line 3**: Link to the tracking ticket (Jira, Trello, etc.)
- **Remaining lines**: Explanation of what is changing and why

```text
Handle empty params in ValidatePreUpdate method

https://eaflood.atlassian.net/browse/WAS-1096

Fixes an undefined method error when validate_pre_update_organisation_address
receives empty parameters.
```

### 3 - Start with an empty commit (preferred)

Beginning every branch with an empty commit is preferred but not required. It sets out the context and intended change before any code is written, and its message follows the commit body structure above.

```bash
git commit --allow-empty
```

### 4 - Push immediately and create the PR

Push the branch right away so the team can see work in progress:

```bash
git push -u origin [branch-name]
```

Create a PR from the GitHub UI. Assign yourself to indicate ownership.

### 5 - Keep up to date with main

Use rebase (not merge) to stay in sync with `main`. This avoids merge commits and keeps the history linear.

```bash
git rebase origin/main
```

### 6 - Get it reviewed

Request a review from at least one team member. At least one approval is required before merging.

### 7 - Completing the PR

Use GitHub's **"Squash and merge"** button. Reword the combined commit message into a single coherent message that follows the commit rules. Delete the feature branch after merging.