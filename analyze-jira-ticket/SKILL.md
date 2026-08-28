---
name: analyze-jira-ticket
description: Analyze a Jira ticket to understand requirements, identify which repos/projects need changes, and produce an implementation plan. Use when user wants to scope out a ticket before starting work.
argument-hint: "<ticket-id or URL e.g. PROJ-123>"
---

# Analyze Jira Ticket

Analyze a Jira ticket to understand what it requires, identify which codebases need changes, and present a concrete implementation plan — all without making any code changes.

Follow these steps **strictly in order**.

## 1. Validate argument

The user must provide a Jira ticket ID (e.g. `PROJ-123`) or a Jira URL. Extract the ticket ID from the input:
- If a URL like `https://*.atlassian.net/browse/PROJ-123`, extract `PROJ-123`
- If already a ticket ID, use it directly
- If no ticket ID is provided, ask the user for it and stop

## 2. Fetch the Jira ticket

Use the Atlassian MCP tool (`getJiraIssue`) to fetch the full ticket details including:
- Summary (title)
- Description
- Issue type (Bug, Story, Task, Sub-task, etc.)
- Status
- Priority
- Acceptance criteria (often inside the description or a custom field)
- Any linked issues (parent epic, blocking/blocked-by, related issues)
- Labels and components

Also fetch the ticket's **comments** — comments often contain clarifications, design decisions, implementation hints, or updated requirements from the team that supersede or supplement the description.

## 3. Understand the ticket

Synthesize what you've read into a clear understanding:

1. **What is being asked?** — Summarize the requirement in plain language
2. **Why?** — What problem does this solve or what value does it add?
3. **Acceptance criteria** — List the concrete conditions that must be met
4. **Open questions** — Flag anything that is vague, contradictory, or missing from the ticket

If the ticket is empty or too vague to analyze meaningfully, present what you found and ask the user for clarification before proceeding.

## 4. Check if this is a SPIKE ticket

If the ticket title contains the word "SPIKE" (case-insensitive), this ticket requires a **PRD workflow** instead of continuing to the standard implementation analysis. Follow this alternative flow:

This flow uses three skills from the [Matt Pocock skills plugin](https://github.com/mattpocock/skills), so install that plugin before running it.

### 4a. Write a spec (`/to-spec`)

Invoke the `to-spec` skill to collaboratively create the spec (formerly called a PRD). Use your understanding from step 3 — the ticket's description, acceptance criteria, comments, and open questions — to seed the interview with the user instead of starting from scratch.

### 4b. Grill the user (`/grill-me`)

Invoke the `grill-me` skill to stress-test the spec. Walk through every decision branch, challenge assumptions, and resolve ambiguities until you and the user reach full shared understanding.

### 4c. Break the spec into tickets (`/to-tickets`)

Invoke the `to-tickets` skill to split the finalized spec into tracer-bullet vertical slices, each declaring its blocking edges, so the work can be picked up one slice at a time.

### 4d. Stop here

After completing the PRD workflow above, **do NOT continue** to steps 5–8 below (those are for non-SPIKE tickets). The spike output is the PRD file in `./prds/` and the plan file in `./plans/`. Ask the user if they'd like to refine anything further.

---

**If the ticket is NOT a spike, continue below.**

## 5. Identify affected repositories and projects

Determine which codebases need changes to fulfill the ticket. Use these strategies:

### 5a. Analyze ticket signals

From the ticket content, identify:
- Mentioned file paths, service names, component names, package names, or route paths
- Which part of the system is affected (UI app, backend service, shared library, infrastructure, database, etc.)
- Keywords that map to known services (e.g. "login" → auth service, "chart" → visualization library)

### 5b. Consult the repository catalog

If your team maintains a repository catalog or internal docs, read it to map ticket signals to specific repositories. Such a catalog typically covers:
- UI applications
- Backend services
- Shared libraries / packages
- Infrastructure repos
- Data pipeline / integration components

### 5c. Explore candidate repos (when needed)

If the ticket references specific features, components, or code paths, use the **Explore agent** to search across candidate repos to confirm where the relevant code lives. For example:
- Grep for component names, route paths, API endpoints, or function names mentioned in the ticket
- Check `README.md` files of candidate repos for feature descriptions
- Look at directory structures to confirm the repo handles the domain in question

### 5d. Check for cross-repo dependencies

Consider whether the change spans multiple repos:
- Does a UI change require a corresponding backend API change?
- Does it need a new or updated shared library/package?
- Are database migrations involved (check your project's migrations directory)?
- Does it affect shared configuration or infrastructure?

## 6. Determine the type and scope of changes

For each affected repository, describe:
- **What needs to change** — specific files, components, routes, services, or patterns to add/modify
- **Type of change** — new feature, bug fix, refactor, config change, migration, etc.
- **Estimated complexity** — small (a few lines), medium (a few files), large (new feature/module), or unclear
- **Dependencies** — does this repo's change depend on another repo's change being done first?

## 7. Present the analysis and plan

Format your output as follows:

### Ticket Summary
Brief plain-language summary of what the ticket requires and why.

### Acceptance Criteria
Bulleted list of conditions to satisfy (from the ticket or inferred).

### Open Questions / Risks
Any ambiguities, missing info, or risks identified. If none, say "None identified."

### Affected Repositories

For each repo, present:

**`<repo-name>`** (`<path-to-repo>`)
- **Changes needed**: What specifically needs to be added, modified, or removed
- **Key files/areas**: Which files or directories are likely involved
- **Change type**: feat / fix / refactor / chore / etc.
- **Complexity**: Small / Medium / Large
- **Branch name**: `<prefix>/<ticket-id-lowercase>` (following the branching convention)

### Implementation Order
If multiple repos are involved, specify the recommended order of implementation and why (e.g. "shared library first because the UI app depends on the new component").

### Suggested Approach
A step-by-step plan for implementing the ticket, including:
1. Which repo to start in
2. What to build/change in what order
3. When to run tests or verify
4. Any gotchas or things to watch out for

## 8. Ask for confirmation

After presenting the analysis, ask the user:
> Does this analysis look correct? Is there anything you'd like to adjust before we start working on it?

Do NOT start any implementation. This skill is analysis-only.
