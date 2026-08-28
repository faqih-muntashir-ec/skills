---
name: create-pr
description: Create a pull request following the standard workflow — fetch Jira context, review code, commit, and open PR with structured description. Use when user wants to create a PR, open a pull request, or submit changes for review.
argument-hint: "[optional: base branch, defaults to master]"
---

# Create Pull Request

Follow these steps **strictly in order**. Each step specifies the exact tool to use — you MUST use that tool, not do the work inline.

## 1. Read the Jira ticket (if applicable)

If the branch name contains a ticket ID (e.g. `fix/proj-668`, `feat/PROJ-123`):
- Extract the ticket ID from the branch name
- Use the Atlassian MCP tool (`getJiraIssue`) to fetch the full ticket context
- Use the ticket summary, description, and acceptance criteria to enrich the PR description

## 2. Review the code

Run **both** of these and address any critical issues found before proceeding:
- **Invoke the `code-reviewer` agent via the Task tool** (`subagent_type: "code-reviewer"`) to review the diff between the current branch and `master`.
- **Invoke the `thermo-nuclear-code-quality-review` skill via the Skill tool** for a deep code-quality pass on the same diff.

## 3. Commit

**Invoke the `write-commit-message` skill via the Skill tool** to generate a Conventional Commits message, stage changes, and commit. Do NOT ask for confirmation — stage and commit directly.

## 4. Create the PR

**You MUST invoke the `write-pr-description` skill via the Skill tool** to generate the PR title and body. Do NOT write the PR description yourself — the skill defines the canonical format (Problem / Solution / Implementation Details). Pass the base branch argument if the user specified one (default: `master`). Also pass any additional context the user provided (e.g. "mention why X" or "include Y") so the skill can incorporate it.

Then push the branch and create the PR using `gh pr create` with the title and body produced by the skill.
