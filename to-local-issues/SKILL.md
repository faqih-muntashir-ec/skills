---
name: to-local-issues
description: Break a plan, spec, or PRD into independently-grabbable issues as local markdown files using tracer-bullet vertical slices. Use when user wants to convert a plan into local issue files, create implementation tickets as markdown, or break down work into issues without GitHub.
---

# To Local Issues

Break a plan into independently-grabbable issues using vertical slices (tracer bullets), written as local markdown files in an `/issues` directory.

## Process

### 1. Gather context

Work from whatever is already in the conversation context. If the user passes a path to a plan/spec/PRD file as an argument, read it. If they pass a GitHub issue number or URL, fetch it with `gh issue view <number>` (with comments).

### 2. Explore the codebase (optional)

If you have not already explored the codebase, do so to understand the current state of the code.

### 3. Draft vertical slices

Break the plan into **tracer bullet** issues. Each issue is a thin vertical slice that cuts through ALL integration layers end-to-end, NOT a horizontal slice of one layer.

Slices may be 'HITL' or 'AFK'. HITL slices require human interaction, such as an architectural decision or a design review. AFK slices can be implemented and merged without human interaction. Prefer AFK over HITL where possible.

<vertical-slice-rules>
- Each slice delivers a narrow but COMPLETE path through every layer (schema, API, UI, tests)
- A completed slice is demoable or verifiable on its own
- Prefer many thin slices over few thick ones
- **Each slice must be safe to ship under your stack's deployment order (for example DB → backends → frontends)**: every PR in the slice must be backward-compatible with the *currently-deployed* version of every other layer. A DB widening that the deployed backend can't represent, or a backend response shape the deployed frontend can't parse, is a slice-decomposition bug — split or gate it behind an opt-in parameter / dual-shape response so the legacy contract keeps working until the consumer migrates. When a slice spans multiple repos, call this out explicitly in the issue body.
</vertical-slice-rules>

### 4. Quiz the user

Present the proposed breakdown as a numbered list. For each slice, show:

- **Title**: short descriptive name
- **Type**: HITL / AFK
- **Blocked by**: which other slices (if any) must complete first
- **User stories covered**: which user stories this addresses (if the source material has them)

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Are the dependency relationships correct?
- Should any slices be merged or split further?
- Are the correct slices marked as HITL and AFK?

Iterate until the user approves the breakdown.

### 5. Create the local issue files

For each approved slice, create a markdown file inside an `/issues` directory at the repository root (create the directory if it does not exist). Use this naming convention:

```
issues/NNN-short-kebab-title.md
```

Where `NNN` is a zero-padded sequence number starting at `001`, incremented in dependency order (blockers first). If the `/issues` directory already contains files numbered `NNN-*.md`, continue from the next available number rather than overwriting.

Create issues in dependency order (blockers first) so you can reference real filenames in the "Blocked by" field.

Use the issue body template below. Include a YAML frontmatter block at the top so the files are machine-parseable.

<issue-template>
---
title: <short descriptive title>
type: <HITL | AFK>
status: open
blocked_by: [<filename-without-.md>, ...]   # empty list if none
parent: <path-or-url-to-source-plan>        # omit if not applicable
github_pr:                                  # full URL of the PR once one is opened; leave empty until then
story_points: <number>                      # Fibonacci-ish estimate; see guidelines below
---

# <Title>

## What to build

A concise description of this vertical slice. Describe the end-to-end behavior, not layer-by-layer implementation.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Blocked by

- `NNN-other-slice` (if any)

Or "None - can start immediately" if no blockers.
</issue-template>

The `github_pr` field starts empty on every new issue. When a PR is opened for that issue, update the field to the full PR URL (e.g. `github_pr: https://github.com/<org>/<repo>/pull/742`) so future readers can cross-reference.

### Story-point estimation

Every issue **must** carry a `story_points` value so sizing is visible at a glance and the plan can be totalled. Before assigning values, calibrate against the team's closed tickets by querying Jira:

1. Identify the relevant Jira project key(s) from the PRD / branch / user context (e.g. `PROJ`).
2. Use the Atlassian MCP (`searchJiraIssuesUsingJql`) to pull a sample of recently-Done stories with story points set. Example JQL: `project = PROJ AND issuetype = Story AND "Story Points" is not EMPTY AND status = Done ORDER BY updated DESC`. Request `customfield_XXXXX` (your instance's Story Points field id) plus `summary`.
3. Read 10–20 rows and build a mental map of the scale. Typical ranges look like:
   - **0.5** — trivial (~30 min): tiny fixes, one-line changes, footer adds, comment tweaks
   - **1** — small (1–2 h): one-line bug fixes, small utility updates, mechanical cleanup
   - **2** — half-day: one focused feature slice, a single E2E test, small spike
   - **3** — one day: feature with minor design/handoff, new data pipeline addition
   - **5** — two days: larger spike, new pipeline in staging, multi-file refactor
   - **8** — 3–5 days: reverse-engineering existing behavior, standing up a new datastore or ETL
4. Only use the fractional and Fibonacci values the team already uses (typically `0.5, 1, 2, 3, 5, 8`); avoid values the team hasn't set on real tickets.
5. When in doubt round **up**, not down — over-estimates are less painful than under-estimates for sprint planning.

Do NOT modify any source plan/spec/PRD file. Do NOT create or close any GitHub issues.

### 6. Summarize

After writing the files, print a short summary listing each created file path so the user can grab any of them independently.
