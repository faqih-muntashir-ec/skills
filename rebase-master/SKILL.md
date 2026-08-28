---
name: rebase-master
description: Fetch origin/master, rebase current branch onto it, resolve any merge conflicts, amend the commit, and force push. Use when user wants to rebase onto master, sync with master, or update their branch.
argument-hint: "[optional: branch name to checkout first]"
---

# Rebase onto origin/master

Follow these steps in order:

## 1. Checkout branch (if argument provided)

If the user provided a branch name as an argument, checkout that branch first:
```
git checkout <branch-name>
```

## 2. Fetch latest origin/master

```
git fetch origin master
```

## 3. Rebase onto origin/master

```
git rebase origin/master
```

## 4. Resolve merge conflicts (if any)

If there are merge conflicts:
- Read each conflicted file
- Understand both sides of the conflict:
  - **HEAD** = what's on origin/master (the target)
  - **The commit being replayed** = the current branch's changes (the PR's work)
- Generally **keep the current branch's changes** since that's the PR's intentional work, unless the master changes are clearly a bugfix or improvement that should be preserved
- After resolving all conflicts, stage the files and run `git rebase --continue`
- If there are multiple commits to replay, repeat for each

## 5. Regenerate package-lock.json (if package.json was involved in conflicts)

If `package.json` or `package-lock.json` had merge conflicts:
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` to regenerate a clean lockfile from the resolved `package.json`
3. Verify the install completes with no errors
4. Stage the regenerated `package-lock.json`:
   ```
   git add package-lock.json
   ```

## 6. Amend the commit

```
git commit --amend --no-edit --no-verify
```

Use `--no-verify` to skip pre-commit hooks since this is just a rebase amend — no new code is being introduced.

## 7. Force push

```
git push --force-with-lease origin <current-branch-name>
```

Always use `--force-with-lease` instead of `--force` for safety.
