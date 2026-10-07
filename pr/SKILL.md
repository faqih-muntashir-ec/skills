---
name: pr
description: PR workflow with one subcommand per job. Use when the user wants to create or open a pull request; write or draft a PR title or body; update, refresh or sync an existing PR description; review a PR locally or as a dry run without posting; address PR review comments, Copilot/reviewer suggestions or dry-review findings; post review findings as inline comments anchored to file:line (also when the code-reviewer agent reaches review submission); or write a Verification Guide, including a dev seed, so a reviewer can confirm a change.
argument-hint: "<create|describe|update|review|address|comment|guide> [PR number/URL or base branch]"
---

# PR

| Subcommand | File | When to use | Argument |
|---|---|---|---|
| `create` | `create.md` | Open a new PR: Jira context, code review, commit, push, `gh pr create` | `[base branch, default master]` |
| `describe` | `describe.md` | Draft the PR title and body only; does not create the PR | `[base branch, default master]` |
| `update` | `update.md` | Refresh an existing PR's body to the current branch, keeping screenshots and notes | `[PR number, default the current branch's PR]` |
| `review` | `review.md` | Review a PR in the terminal; posts nothing to GitHub | `<PR number or URL>` |
| `address` | `address.md` | Act on GitHub review comments, or on the latest `review` output in this conversation | `<PR URL or number>` for GitHub comments; none for the latest `review` |
| `comment` | `comment.md` | Submit review findings to GitHub as inline comments; the code-reviewer agent uses this at review submission | none |
| `guide` | `guide.md` | Write a Verification Guide, with a dev seed when dev lacks the data | `[PR number or what to verify]` |

## No subcommand

Infer the subcommand from state, and say which one you picked in one line:

- The user pasted review feedback → `address`.
- `gh pr view` finds a PR for the current branch → `update`.
- No PR for the current branch, and the branch has commits → `create`.

Read only the file for the chosen subcommand; each file names any sibling file it needs.
