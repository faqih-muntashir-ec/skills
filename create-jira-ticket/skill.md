---
name: create-jira-ticket
description: Create Jira tickets with proper fields, linking, and story points. Use when user asks to create a Jira issue, story, task, or bug.
user_invocable: true
argument: ticket details (summary, description, type, story points, links, etc.)
---

# Create Jira Ticket

Create one or more Jira tickets with proper configuration.

## Cloud ID

Use your Atlassian site's `cloudId` (e.g. `<your-site>.atlassian.net`) for all Atlassian MCP tool calls. The exact value should be stored in your local memory or config.

## Creating a Ticket

Use `mcp__atlassian__createJiraIssue` with:

```
cloudId: "<your-site>.atlassian.net"
projectKey: "<project key, e.g., PROJ>"
issueTypeName: "Story" | "Task" | "Bug" | "Epic"
summary: "<title>"
description: "<markdown body>"
contentFormat: "markdown"
additional_fields: { "<story-points-field-id>": <story_points_number> }
```

## Custom Field IDs

Custom field IDs (e.g. Story Points, Sprint) are **specific to each Jira instance**. Look them up for your instance via `mcp__atlassian__getJiraIssueTypeMetaWithFields` or your Jira admin, and record them in your local memory/config.

Common fields you may need to look up:
- **Story Points** — typically a numeric field; e.g. `customfield_XXXXX`
- **Sprint** — numeric (sprint ID); only set if explicitly requested

**The standard `story_points` field often does NOT work** — you usually need the instance-specific `customfield_XXXXX` id.

## Linking Tickets

Use `mcp__atlassian__createIssueLink`. Available link types:

| Link Type | Name | inward text | outward text |
|---|---|---|---|
| Blocks | `Blocks` | "is blocked by" | "blocks" |
| Implements | `Polaris work item link` | "is implemented by" | "implements" |
| Relates | `Relates` | "relates to" | "relates to" |
| Duplicate | `Duplicate` | "is duplicated by" | "duplicates" |

### Link Direction Convention

The tool description says: *inwardIssue = issue that blocks, outwardIssue = issue that is blocked*.

**Blocks example**: "PROJ-2 is blocked by PROJ-1"
```
inwardIssue: "PROJ-1"   (the blocker)
outwardIssue: "PROJ-2"  (the blocked one)
type: "Blocks"
```

**"is implemented by" example**: "PROJ-765 is implemented by PROJ-867"
```
inwardIssue: "PROJ-867"  (the one that implements)
outwardIssue: "PROJ-765" (the one being implemented)
type: "Polaris work item link"
```

## Process

1. If user provides ticket details, create the ticket(s) directly.
2. Set story points via `additional_fields` if specified.
3. After creation, create any requested links (blocks, implements, relates).
4. Report back the created ticket key(s) and links.
5. Do NOT set the Sprint field unless the user explicitly asks for it.

## Available Issue Types

- **Story** — features and user goals
- **Task** — small pieces of work
- **Bug** — problems or errors
- **Epic** — large stories to be broken down
- **Sub-task** — part of a larger task (requires `parent` field)

## Tips

- Create all independent tickets in parallel for speed.
- Create all links in parallel after tickets exist.
- Use `mcp__atlassian__getIssueLinkTypes` if you need to discover link types for a different project.
- Use `mcp__atlassian__searchJiraIssuesUsingJql` to find existing tickets for linking.
