---
name: create-hotfix-branch
description: Create a new hotfix branch from a remote base branch, cherry-pick one or more commits onto it, and push to origin. Use when the user wants to spin up a hotfix/release branch off another remote branch and seed it with specific commits.
argument-hint: "<base-ref> <new-branch> <commit-sha>[,<commit-sha>...]"
---

# Create Hotfix Branch

Creates a new branch off a remote ref, cherry-picks one or more commits, and pushes to origin. Designed for quick hotfix branches that derive from another in-flight hotfix.

## Inputs (from the user's request)

Parse three things from the user's prompt:
- **base ref** — the remote branch to branch off (e.g. `origin/hotfix/proj-999-drilldown-label`). Strip `origin/` if present; you'll add it back when needed.
- **new branch name** — the local + remote branch to create (e.g. `hotfix/proj-974-proj-977`).
- **commit SHA(s)** — one or more commits to cherry-pick, in the order they should be applied.

If any of the three is missing or ambiguous, ask the user before proceeding.

## 1. Capture starting state

```bash
git branch --show-current
git status --short
```

Remember the original branch name so you can restore it at the end. If there are uncommitted changes (staged, unstaged, or untracked) that touch tracked files, stash only the **tracked** modifications so they don't follow you onto the hotfix branch:

```bash
git stash push -m "pre-<new-branch>" -- <modified tracked files>
```

Do **not** use `-u` here — it would sweep up untracked files (env files, scratch dirs, plans/, etc.) that the user wants to keep in their working tree. List the modified tracked files explicitly.

If the working tree is clean, skip the stash.

## 2. Fetch the base ref

```bash
git fetch origin <base-ref-without-origin-prefix>
```

## 3. Create the new branch

```bash
git checkout -b <new-branch> origin/<base-ref>
```

**Important:** `git checkout -b <new> origin/<base>` auto-tracks the remote base branch as upstream. That would cause `git push` to push back into the *base* hotfix branch. Immediately unset the upstream:

```bash
git branch --unset-upstream
```

## 4. Cherry-pick the commit(s)

```bash
git cherry-pick <sha1> [<sha2> ...]
```

If a cherry-pick conflicts:
- Resolve each conflict file by hand (favoring the cherry-picked commit's intent unless context suggests otherwise).
- `git add` the resolved files and `git cherry-pick --continue`.
- If the situation is unclear, stop and surface the conflict to the user rather than guessing.

## 5. Push and set upstream

```bash
git push -u origin <new-branch>
```

This creates a brand-new remote branch (since upstream was unset in step 3).

## 6. Restore the original working state

Switch back to the original branch and pop the stash if you created one:

```bash
git checkout <original-branch>
git stash pop
```

If the stash pop conflicts (the original branch's HEAD has diverged from the hotfix branch's HEAD on the same files), abort the pop's destructive merge:

```bash
git checkout HEAD -- <conflicted files>
git reset HEAD
```

The stash entry remains in `git stash list` — tell the user it's preserved as `stash@{0}` so they can recover it manually. Do not silently drop it.

## 7. Report back

Tell the user:
- The new branch name and the URL-friendly form (`origin/<new-branch>`) so they can open a PR.
- Which commit(s) were cherry-picked.
- Whether you returned to the original branch and whether any stash is left behind.

Keep the summary to 2–3 sentences.

## Notes

- This skill only creates the branch and seeds it with commits. It does **not** open a PR — leave that to the user or to `/create-pr`.
- If the user hasn't said which commit(s) to cherry-pick, ask. Do not guess from recent history.
- If the new branch already exists locally, ask before overwriting — don't blow away in-progress work.
