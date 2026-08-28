---
name: rebase-on-pr-base
description: Look up a PR's base branch via gh, rebase that PR's head branch onto the latest base, resolve conflicts, force-push. Use when the user asks to "rebase with the target branch in PR" or "rebase onto the base of PR #<N>" — common for stacked PRs where the base was amended/force-pushed and the head needs to catch up.
argument-hint: "<PR URL or PR number>"
---

# Rebase a PR's head onto its base branch

The argument is a GitHub PR URL (e.g. `https://github.com/<org>/<repo>/pull/28`) or a bare PR number (e.g. `28`) when the working directory is already inside the right repo.

## 1. Resolve the PR's head and base

If the argument is a URL, parse `owner/repo` and PR number from it. Otherwise, use the current repo and the bare number.

```bash
gh pr view <pr-number-or-url> --json headRefName,baseRefName,headRepository,baseRepository
```

From the JSON:
- `headRefName` — the branch this PR is asking to merge **from**
- `baseRefName` — the branch this PR is asking to merge **into** (the rebase target)

If `headRepository` differs from `baseRepository` (cross-fork PR), stop and tell the user — this skill is for same-repo PRs only.

## 2. Make sure we're in the right repo

If the URL pointed at a different repo than `pwd`, `cd` there. If you can't find a local clone, stop and tell the user.

## 3. Checkout the head branch and fetch the base

```bash
git fetch origin <baseRefName> <headRefName>
git checkout <headRefName>
git pull --ff-only  # only if local head was already up-to-date with remote; otherwise skip
```

If `git pull --ff-only` fails because local head and `origin/<headRefName>` have diverged, prefer the remote: `git reset --hard origin/<headRefName>` **only after confirming with the user** that they don't have unpushed local work.

## 4. Rebase onto the new base

The simple form works most of the time:

```bash
git rebase origin/<baseRefName>
```

### Stacked-PR case: base was amended/force-pushed

If the PR's base is itself another PR's head, that base may have been force-pushed (e.g. after `amend-and-push`). A plain `git rebase origin/<base>` will then try to replay commits that were already squashed/rewritten into the new base — producing spurious conflicts on commits the user already incorporated.

Detect this: after the fetch, run

```bash
git log --oneline origin/<baseRefName> | head -10
git log --oneline HEAD | head -10
```

If you see that the previous base SHA (the one HEAD was originally branched off) is **not** an ancestor of the new `origin/<baseRefName>`, use the `--onto` form to skip the rewritten commits:

```bash
# <old-base-sha> = the commit that was the tip of <baseRefName> when this branch was originally created
# Find it from the reflog of origin/<baseRefName>, or from the merge-base before fetching:
#   git reflog origin/<baseRefName>
#   git merge-base HEAD <old-base-sha>   # sanity check

git rebase --onto origin/<baseRefName> <old-base-sha> <headRefName>
```

If the reflog isn't enough, ask the user for the previous base SHA — the GitHub PR timeline of the base PR usually shows the force-push event with both the old and new SHA.

## 5. Resolve conflicts

For each conflict:
- **Ours (HEAD)** = the new base (the rebase target — what's already on `origin/<baseRefName>`)
- **Theirs (the commit being replayed)** = the head PR's intentional changes

Generally keep the head PR's changes since that's the work being preserved, unless the new base contains a clearly-superseding bugfix. After resolving: `git add <files>` then `git rebase --continue`.

If `package.json`/`package-lock.json` conflicted: delete `node_modules` and `package-lock.json`, run `npm install`, then `git add package-lock.json`.

## 6. Run validations before pushing

The rebased branch may now fail tests/types/lint that passed before — the new base may have introduced changes that break the head's assumptions. Run the project's test/typecheck/lint commands before force-pushing. Do not skip this step on stacked PRs — that's exactly where breakage hides.

## 7. Amend (if conflicts were resolved during the rebase) and force push

The `git rebase --continue` chain has already produced new commits on the head branch. Don't `--amend` separately. Just push:

```bash
git push --force-with-lease origin <headRefName>
```

Use `--force-with-lease` (not `--force`) for safety. If the push is rejected because the remote moved (someone else pushed), stop and tell the user — do not blindly `--force`.

## 8. Verify

```bash
git fetch origin
git log --oneline origin/<headRefName> -5
```

Confirm the top commit matches the local rebased HEAD.
