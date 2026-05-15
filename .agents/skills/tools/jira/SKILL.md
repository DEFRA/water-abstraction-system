---
name: jira
description: Read-only access to WATER project Jira tickets for task context
---

# Jira skill

## Setup

The scripts require three environment variables:

- **`JIRA_USER`** — the email address you use to log in to Jira
- **`JIRA_TOKEN`** — a personal API token ([create one here](https://id.atlassian.com/manage-profile/security/api-tokens))
- **`JIRA_BASE_URL`** — the organisation's Jira base URL, e.g. `https://eaflood.atlassian.net` (no trailing slash)

Run `bash .agents/skills/tools/jira/auth.sh` to verify the credentials are working before using the skill.

## Constraints

This skill is **read-only**. You may only fetch ticket information. You must not:

- Create tickets
- Update tickets (fields, status, assignee, etc.)
- Transition tickets between statuses
- Add or edit comments
- Upload attachments

If asked to do any of the above, refuse and explain that Jira access is read-only.

## Fetching a ticket

Run the ticket script to retrieve and display ticket information:

```bash
bash .agents/skills/tools/jira/ticket.sh <NUMBER>
```

Where `<NUMBER>` is either the full ticket ID (`WATER-4904`) or just the number (`4904`). The script always fetches from the WATER project.

## Using ticket context

Once fetched, treat the ticket output as authoritative context for the current task:

- The **summary** and **description** define what needs to be done
- The **comments** may contain additional decisions, constraints, or links to supporting material
- The **status** and **parent** give placement within the wider body of work
- Do not infer intent beyond what is written — if the ticket is ambiguous, say so
