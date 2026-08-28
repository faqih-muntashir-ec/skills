---
name: amend-and-push
description: Amend the latest commit with current changes and force-push. Use when user says "amend commit and push", "amend and push", or wants to update the last commit and push.
argument-hint: "[optional: new commit message]"
---

# Amend and Push

## 1. Gather context

Run in parallel:
- `git status` — check for modified/untracked files
- `git diff` — see unstaged changes
- `git log --oneline -1` — current commit message

If there are no changes (staged or unstaged), tell the user there is nothing to amend and stop.

## 2. Stage changes

- Stage all modified/deleted files that are relevant to the current commit's scope.
- Do NOT stage untracked files unless they are clearly related to the commit. If unsure, ask.
- Do NOT stage files that likely contain secrets (`.env`, credentials, etc.).

## 3. Amend the commit

- If the user provided a new commit message argument, use it.
- Otherwise, amend with `--no-edit` to keep the existing message.

```bash
git commit --amend --no-edit
```

## 4. Force push

Use `--force-with-lease` for safety:

```bash
git push --force-with-lease
```

If the push fails due to diverged history, inform the user rather than force-pushing with `--force`.
