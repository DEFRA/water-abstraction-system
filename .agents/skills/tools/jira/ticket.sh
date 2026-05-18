#!/bin/bash
# Fetch a WATER Jira ticket
# Usage: ./ticket.sh <NUMBER|WATER-NUMBER>
# Requires: JIRA_USER, JIRA_TOKEN, JIRA_BASE_URL

set -e

RAW="${1:?Usage: ./ticket.sh <NUMBER|WATER-NUMBER>}"
NUMBER="${RAW#WATER-}"
TICKET_ID="WATER-${NUMBER}"

response=$(curl --silent --fail --request GET \
  --url "${JIRA_BASE_URL:?JIRA_BASE_URL is not set}/rest/api/2/issue/${TICKET_ID}" \
  --user "${JIRA_USER:?JIRA_USER is not set}:${JIRA_TOKEN:?JIRA_TOKEN is not set}" \
  --header 'Accept: application/json')

echo "$response" | jq -r '
  "=== \(.key) ===",
  "\(.fields.issuetype.name) | \(.fields.status.name) | \(.fields.priority.name)",
  "",
  "Summary: \(.fields.summary)",
  "",
  (if .fields.parent then "Parent: \(.fields.parent.key) - \(.fields.parent.fields.summary)" else empty end),
  "Assignee: \(.fields.assignee.displayName // "Unassigned")",
  "Reporter: \(.fields.reporter.displayName // "Unknown")",
  (if (.fields.labels | length) > 0 then "Labels: \(.fields.labels | join(", "))" else empty end),
  "",
  "--- Description ---",
  (.fields.description // "(no description)"),
  "",
  "--- Comments (\(.fields.comment.total)) ---",
  (.fields.comment.comments[] |
    "\(.author.displayName) (\(.created[:10])):",
    .body,
    ""
  )
'
