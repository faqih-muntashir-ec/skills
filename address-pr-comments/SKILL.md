---
name: address-pr-comments
description: Address PR review comments with critical verification — fact-check each comment against docs, conventions, and code context before accepting or dismissing. Use when user wants to respond to PR feedback, address review comments, or handle Copilot/reviewer suggestions.
argument-hint: "<PR URL or number>"
---

# Address PR Review Comments

Respond to review comments on a pull request. **Do not blindly accept every comment** — verify each one against documentation, project conventions, logical reasoning, and the actual code context before deciding to act on it or dismiss it.

## 1. Fetch PR context

Run these in parallel:
- `gh pr view <number> --json title,body,headRefName,baseRefName` — PR metadata
- `gh api repos/{owner}/{repo}/pulls/<number>/comments` — inline review comments
- `gh api repos/{owner}/{repo}/pulls/<number>/reviews` — review bodies (may contain non-inline feedback)
- `gh api repos/{owner}/{repo}/issues/<number>/comments` — issue-level comments

Parse all comments and deduplicate. Identify the **new/unresolved** comments that need addressing (skip your own replies and already-resolved threads).

## 2. Read the relevant source files

For each commented file, read the current source code so you can verify claims against the actual implementation. Also read related files if needed (e.g., types, utilities, tests referenced by the comments).

## 3. Verify each comment

For every comment, perform **critical evaluation** before deciding to accept or dismiss:

### Verification checklist

- **Fact-check**: Is the claim technically accurate? If it references library behavior, API contracts, or language semantics, verify against up-to-date documentation (use `context7` MCP or `WebSearch` if needed).
- **Convention check**: Does the suggestion align with the project's established patterns? Check CLAUDE.md, existing code, linter config, and team conventions. A "better practice" that contradicts the project's conventions is not better here.
- **Context check**: Is there a specific reason the code was written this way? Check git blame, PR description, related tickets, or nearby comments that explain intent.
- **Logical reasoning**: Does the comment's logic hold up? Some suggestions sound reasonable in isolation but don't apply to the specific scenario (e.g., premature optimization for trivially small inputs, race conditions with negligible windows, edge cases that can't actually occur).
- **Severity assessment**: Even if valid, is the comment worth addressing? A theoretically correct suggestion with zero practical impact may not warrant a code change.
- **Security review**: For security-related comments, err on the side of caution — these deserve extra scrutiny and are more likely to be valid.

### Classification

Classify each comment into one of:

| Verdict | Meaning | Action |
|---------|---------|--------|
| **VALID — Fix** | Comment is correct and worth addressing | Implement the fix |
| **VALID — Docs only** | Comment is correct but the fix is in docs/description, not code | Update PR description or add code comment |
| **NOT VALID** | Comment is factually wrong, doesn't apply, or is premature | Dismiss with clear reasoning |
| **LOW PRIORITY** | Technically valid but negligible impact | Dismiss with explanation of why it's acceptable |

## 4. Present the analysis

Before making changes, present a summary table to the user showing each comment, your verdict, and reasoning. Example:

```
| # | Comment summary | Verdict | Reason |
|---|----------------|---------|--------|
| 1 | Missing error handling on X | VALID — Fix | Error would cause silent failure |
| 2 | Use DP for string matching | NOT VALID | Inputs are <50 chars, O(n^3) is microseconds |
| 3 | Add server-side auth check | VALID — Fix | Defense-in-depth, direct POST bypasses UI |
```

Wait for the user to confirm or override your assessment before proceeding with fixes. If the user says to proceed or doesn't object, continue to step 5.

## 5. Implement fixes

For all comments classified as **VALID — Fix**:
- Make the code changes
- Run typecheck and lint on changed files
- If any fail, fix the issues before proceeding

For **VALID — Docs only**:
- Update the PR description via `gh pr edit` if needed (always `gh pr view` first to preserve existing content like screenshots)
- Or add code comments as appropriate

## 6. Reply to each comment and resolve threads

Reply to **every** comment — both accepted and dismissed:

- **For fixed comments**: Briefly state what was changed (e.g., "Fixed. Now using X instead of Y.")
- **For dismissed comments**: Explain **why** with specific reasoning (e.g., "Not addressing — inputs are <50 chars, computation is microseconds at this scale. DP would have identical practical performance while adding complexity.")
- **For docs-only fixes**: State what was updated (e.g., "Good catch. Updated the PR description to say 10,000 instead of 1,000.")

Use the GitHub API to reply and resolve threads:
- Reply: `gh api repos/{owner}/{repo}/pulls/<number>/comments/{id}/replies -f body="..."`
- For review-body-only feedback (no inline comments): `gh pr comment <number> --body "..."`
- Resolve threads via GraphQL: query `reviewThreads` for node IDs, then `resolveReviewThread` mutation

Resolve **all** threads after replying — both fixed and dismissed.

## 7. Commit (if changes were made)

If code changes were made, do **not** commit automatically. Tell the user the changes are ready and ask how they want to commit (new commit vs amend).

## Important rules

- **Never accept a comment just because a reviewer or bot said it.** Copilot, AI reviewers, and even human reviewers can be wrong. Your job is to be the arbiter.
- **Dismissals must be substantive.** "Not addressing" alone is insufficient — always include the specific technical reason.
- **Security comments get extra scrutiny.** When in doubt on security-related feedback, lean toward fixing it.
- **Preserve existing PR content.** When editing PR descriptions, always read the current body first to avoid losing screenshots or other content.
- **Don't over-fix.** If a comment asks for X, do X — don't also refactor the surrounding code.
