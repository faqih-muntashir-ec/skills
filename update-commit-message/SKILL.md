---
name: update-commit-message
description: Amend the latest commit message to accurately reflect the current state of the changes. Use when the commit message is outdated, inaccurate, or needs rewording (e.g. references a WIP dependency that has since merged, or the scope changed).
argument-hint: "[optional: specific instruction, e.g. 'remove WIP note', 'add scope']"
---

# Update Commit Message

Amend the most recent commit's message so it accurately describes the changes. This does NOT change the committed files — only the message.

## 1. Gather context

Run these in parallel:
- `git log -1 --format="%B"` — current commit message (full, with body)
- `git diff HEAD~1 --stat` — files changed in the latest commit
- `git log -5 --oneline` — recent commit style for scope/casing conventions

## 2. Analyze what needs to change

Read the current message and the diff. Identify inaccuracies or outdated claims in the message:
- References to WIP/pending work that is now complete
- Incorrect scope or type
- Missing or misleading context in the body
- Overly verbose or underly descriptive subject

If the user provided specific instructions (e.g. "remove the WIP note", "change type to fix"), follow those.

## 3. Draft the updated message

Follow the same [Conventional Commits](https://www.conventionalcommits.org/) format as the existing message:

```
type(scope): subject

body (optional — single line, no hard-wrapping)

BREAKING CHANGE: description (if applicable)
```

Rules:
- Imperative, lowercase subject, no period, under 72 chars
- Do not hard-wrap body text
- **Never use Jira ticket IDs as scope**
- Only change what needs changing — if the subject is fine and only the body is outdated, keep the subject as-is
- Every claim in the message must match the actual diff

## 4. Confirm and amend

Present the old and new commit messages to the user and ask for confirmation before amending.

Once confirmed, run:
```bash
git commit --amend -m "<new message>"
```

After amending, remind the user they will need to force push (`git push --force-with-lease`) if the branch has already been pushed — but do NOT push automatically.
