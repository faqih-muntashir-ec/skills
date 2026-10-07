---
name: do-jira-ticket
description: Work on a Jira ticket end-to-end — read the ticket, create the appropriate branch, and start implementation. Use when the user wants to start, pick up, or begin work on a Jira ticket.
argument-hint: "<ticket-id e.g. PROJ-123>"
---

# Work on a Jira Ticket

Follow these steps **strictly in order**.

## 1. Analyze the ticket

**Invoke the `analyze-jira-ticket` skill via the Skill tool**, passing the ticket ID as the argument. This will:
- Fetch and read the ticket details and comments
- Assess ticket clarity
- Identify affected repositories and what changes are needed
- Present a plan and ask for confirmation

Wait for the user to confirm the plan before proceeding. If the user wants adjustments, re-run the analysis or adjust the plan accordingly.

## 2. Navigate to the target project

If the analysis identified a different repo than the current working directory:
- `cd` into the relevant repo (e.g. `<projects-dir>/<repo-name>`)
- Verify the directory exists and is a git repo
- If the repo isn't cloned locally, inform the user and ask them to clone it first

If the work spans multiple repos, start with the primary one (as identified in the analysis).

## 3. Determine branch type

Based on the issue type and ticket content, determine the appropriate conventional prefix:

| Issue signals | Branch prefix |
|---|---|
| Bug, defect, "fix", error correction | `fix/` |
| New feature, story, enhancement, new capability | `feat/` |
| Documentation changes only | `docs/` |
| Refactor, tech debt, cleanup (no behavior change) | `refactor/` |
| Test additions/changes only | `test/` |
| CI/CD, pipeline, build changes | `ci/` |
| Dependency updates, build config | `chore/` |
| Performance improvement | `perf/` |

If the type is ambiguous, default to `feat/` for Stories and `fix/` for Bugs. For Tasks, infer from the description or ask the user.

## 4. Create and checkout branch

The branch name format is: `<prefix>/<ticket-id-lowercase>`

Example: `fix/proj-123`, `feat/proj-456`

```bash
git checkout -b <prefix>/<ticket-id-lowercase>
```

If the branch already exists, check it out instead:
```bash
git checkout <prefix>/<ticket-id-lowercase>
```

## 5. Implement the changes

Work on the ticket using the full context from the analysis:
- Follow the project's existing patterns and conventions
- Reference acceptance criteria as your definition of done
- Run linting, type checking, and tests as appropriate
- Keep changes focused on the ticket scope — avoid unrelated modifications

## 6. Verify UI changes in the real app

Run this step when the change alters anything a user sees in the UI. Otherwise the ticket is done at step 5.

1. Run the base branch and your branch locally, and take one before/after screenshot pair per visible change, each differing only in that change.
2. Read the values that prove the change from the page, such as a computed color, a text or a count, and record them before and after.
3. Embed the pairs in the PR's Preview table, and put the recorded values in its Tested section.

Done when: the PR shows the uploaded before and after images, you opened every image and checked it, and the recorded values show the change.
