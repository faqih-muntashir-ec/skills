---
name: write-commit-message
description: Analyze staged changes and generate a Conventional Commits message. Use when user wants to write a commit message or commit changes.
argument-hint: "[optional: type override, e.g. fix, feat, chore]"
---

# Write Commit Message

## 1. Gather context

Run these in parallel:
- `git diff --cached --stat` — check for staged changes. If nothing is staged, fall back to `git diff` (unstaged changes)
- `git log --oneline -5` — recent commit style for scope/casing conventions

If there are no staged **and** no unstaged changes, tell the user there is nothing to commit and stop.

## 2. Analyze the diff

Read the full diff (`git diff --cached`, or `git diff` if nothing staged). The commit message must describe only what the diff actually shows — do not generalize, assume, or mention files/changes that are not present in the diff. Then identify:
- **Type**: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `style`, `perf`, `ci`, `build`
  - For `dependencies` and `peerDependencies` changes (version bumps, additions, removals, moves), always use `fix`
  - For `devDependencies`-only changes, use `chore`
- **Scope** (optional): the package, module, or area affected (e.g. `auth`, `api`, `deps`). Use a descriptive name
- **Never put a Jira ticket ID (e.g. `PROJ-1239`) anywhere in the commit message** — not as the scope (`feat(PROJ-1239):`), not in the subject, not in the body. The ticket ID belongs only in the PR title prefix (`[PROJ-1239] feat: ...`), never in the commit itself
- **Subject**: imperative, lowercase, no period, under 72 chars
- **Body** (optional): explain *why* the change was made when the subject alone isn't enough. Keep it to 1-2 short sentences on a single line.

If the user provided a type override argument, use that type instead of inferring one.

## 3. Format the message

Follow the [Conventional Commits](https://www.conventionalcommits.org/) spec:

```
type(scope): subject

body (optional — single line, no hard-wrapping)

BREAKING CHANGE: description (if applicable)
```

Do not hard-wrap lines. Let the git client or viewer handle wrapping.

- A `BREAKING CHANGE` footer triggers a **major** version bump in semantic-release.
- Only include the footer when the change actually breaks the public API.

## 4. Stage and commit

- If invoked from another skill (e.g. `/create-pr`), **do NOT ask for confirmation** — stage all changed files and commit directly.
- If invoked standalone by the user, present the generated commit message and ask for confirmation before committing. If nothing was staged initially (fell back to unstaged), also confirm which files to stage.
