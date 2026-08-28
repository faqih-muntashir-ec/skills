---
name: learn-jira-ticket
description: Build a reading-list / reference brief for a Jira ticket — sibling tickets, parent epic, foundation work, related GitHub PRs, and pointers to legacy/reference code in local repos. Use when the user wants to learn the context around a ticket before starting work, not when they want an implementation plan (use /analyze-jira-ticket for that).
argument-hint: "<ticket-id or URL e.g. PROJ-123>"
---

# Learn Jira Ticket

Produce a **reference brief** for a Jira ticket so the user can learn the surrounding context before starting work. The output is a guided reading list — not an implementation plan.

This is distinct from `/analyze-jira-ticket`:
- `/analyze-jira-ticket` → "what should I build, and where?"
- `/learn-jira-ticket` → "what should I read first, and what already exists I can model from?"

Follow these steps **strictly in order**.

## 1. Validate argument

Extract a ticket ID from the user's input:
- URL like `https://*.atlassian.net/browse/PROJ-123` → `PROJ-123`
- Already an ID → use directly
- Missing → ask the user and stop

## 2. Fetch the ticket

Use the Atlassian MCP (`getJiraIssue`) with `responseContentFormat: "markdown"` to fetch:
- summary, description, status, issue type, priority, assignee
- parent / epic link (look at the issue's `parent` or `Epic Link` custom field)
- comments (often hold clarifications and decisions)
- linked issues (`issuelinks`)

If the ticket is empty/vague, surface that and ask the user before continuing.

## 3. Find sibling and foundation tickets

Cast a wide net for *related* Jira tickets the user can learn from. Use `searchJiraIssuesUsingJql`:

### 3a. Sibling tickets in the same epic

If the ticket has an Epic Link, search for all stories under that epic:
```
project = <PROJECT> AND "Epic Link" = <EPIC-KEY> ORDER BY status DESC, created ASC
```
Note which siblings are **Done / Code Complete** — those are the closest patterns to copy. Note which ones share the same assignee or are still To Do.

### 3b. Title-pattern siblings (cross-epic)

Many tickets follow a naming pattern (e.g. "Develop HospXMetric", "Add support for Y", "Migrate Z to ..."). Pull out the recurring pattern from the title and search across the project:
```
project = <PROJECT> AND summary ~ "<keyword1>" AND summary ~ "<keyword2>" ORDER BY created DESC
```
Surface earlier tickets with the same pattern — especially Done ones — because they likely have completed PRs that serve as templates.

### 3c. Predecessor / foundation tickets

Search for tickets that established prerequisite infrastructure (DDLs, scaffolding, configs) for the same feature area:
```
project = <PROJECT> AND (summary ~ "<feature-noun>" OR summary ~ "<module-name>") ORDER BY created ASC
```
These are the tickets that built the tables/modules/services the current ticket will read from or extend. Their merged PRs are valuable references.

### 3d. Companion / blocked-by tickets

Check `issuelinks` and look for tickets linked as "blocks", "is blocked by", "relates to". Also check the parent epic's other children for a companion validation/follow-up ticket (e.g. "Run validation on developed metrics for X").

## 4. Find related GitHub PRs

For each repo the foundation/sibling tickets touched, list the relevant PRs. Use `gh pr list` with searches keyed on:
- ticket IDs from step 3 (e.g. `gh pr list --state all --search "<TICKET-KEY>"`)
- feature keywords / module names (e.g. `gh pr list --state all --search "ct utilization"`)
- branch-name patterns (e.g. `feat/<project>-<number>/...`)

Prefer **MERGED** PRs — those are the patterns to model. Note OPEN/CLOSED ones too (closed PRs often hold useful discussion). For each PR, capture: number, title, branch, status, and the files it touched (use `gh pr view <num> --json files`).

If you don't know which repos to search, ask the user. Do not guess wildly — a focused list of 1–4 repos beats a sprawling search.

## 5. Find legacy / reference code in local repos

If the ticket involves porting, reverse-engineering, or replacing existing code, locate the source in the locally cloned repos:
- grep / find for module names, class names, table names mentioned in the ticket
- read the relevant entry-point files briefly (top of file, class declarations, key functions) so you can describe what's there — do **not** read entire large files
- note the inheritance / call structure if a base class hides most of the logic

If the user mentioned specific repos, restrict the search to those. Otherwise, list the candidate repos cloned locally and pick the most likely 2–4 by name.

If you can't find the legacy code, say so and ask the user where it lives.

## 6. Read project conventions

Briefly check `CLAUDE.md` / `AGENTS.md` / `README.md` in any target repo identified in step 4 or 5 — these often spell out file layout, naming conventions, and migration patterns the user will need to follow. Surface anything non-obvious in the brief.

## 7. Present the reference brief

Format the output exactly as below. **Lead with the ticket summary**, then the reading list. Do not include an implementation plan — that's for `/analyze-jira-ticket`.

### Ticket: `<TICKET-KEY>` — `<title>`
Status · Issue Type · Assignee · Parent epic (if any, with link)

One-paragraph plain-language summary of what the ticket asks for.

### Acceptance criteria
Bullet list copied / paraphrased from the ticket.

### Sibling and foundation tickets

For each relevant ticket, one line:
- `<KEY>` — `<title>` — *Status* — what makes it a useful reference

Group as: **Closest analogs** (same pattern, ideally Done), **Same epic**, **Foundation work** (already merged), **Companion** (validation / follow-up).

### Related GitHub PRs

For each repo, list the PRs that establish the pattern or scaffolding:

**`<owner/repo>`**
- #N — *title* — `branch` — *MERGED/OPEN/CLOSED* — what it covers

### Legacy / reference code

For each location:

**`<repo>`** (`<absolute path>`)
- File / dir → one-line description of what's there and why it matters
- Note inheritance, call graph, or hidden complexity (e.g. "thin subclass — 90% of logic lives in base.py")

### Project conventions worth knowing
Bullet list of repo-specific conventions (file layout, naming, migration format, type rules) the user will encounter. Skip if nothing notable.

### Risks and observations
Things the user should know before starting:
- "No sibling has been merged yet — you may be establishing the pattern"
- "Foundation tables exist but procedure scaffolding does not"
- "The legacy logic uses a 563-line base class — most complexity is hidden there"

Keep this section short and concrete. Skip if there's nothing to flag.

### Suggested reading order
A short numbered list — what to read first, second, third — so the user can pace their onboarding.

## 8. Stop

Do not propose an implementation plan and do not start coding. End by asking:
> Want me to dig deeper into any of these references, or run `/analyze-jira-ticket <KEY>` to turn this into an implementation plan?
