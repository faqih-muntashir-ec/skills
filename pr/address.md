# Address Review Findings

Respond to review feedback on a pull request. **Do not blindly accept every finding** — verify each one against documentation, project conventions, logical reasoning, and the actual code context before deciding to act on it or dismiss it.

A **finding** is one item of feedback. It comes from one of two sources, and the source picks the branch for step 1 and step 6:

- **(a) PR comments** — review comments on GitHub (inline comments, review bodies, issue-level comments). Use when the user gives a PR URL or number, or asks to respond to PR feedback or Copilot/reviewer suggestions.
- **(b) Dry review** — the findings of a `/pr review` you produced earlier in this conversation. The review lives only in the transcript — there is no GitHub thread to reply to or resolve. Your job is to **decide**, **fix**, and **report back inline**, while still subjecting each finding to the same critical scrutiny. **Do not blindly accept your own review.** A finding from your earlier turn is just another reviewer's opinion.

## 1. Collect the findings

### (a) PR comments: fetch PR context

Run these in parallel:
- `gh pr view <number> --json title,body,headRefName,baseRefName` — PR metadata
- `gh api repos/{owner}/{repo}/pulls/<number>/comments` — inline review comments
- `gh api repos/{owner}/{repo}/pulls/<number>/reviews` — review bodies (may contain non-inline feedback)
- `gh api repos/{owner}/{repo}/issues/<number>/comments` — issue-level comments

Parse all comments and deduplicate. Identify the **new/unresolved** comments that need addressing (skip your own replies and already-resolved threads).

### (b) Dry review: locate it in the transcript

- Find the most recent `/pr review` (or equivalent terminal-only review) you produced in this conversation.
- Extract every distinct finding — must-fix items, nits, minor drift notes, cosmetic suggestions. Capture the file path and line/section the finding refers to.
- If the user has indicated which findings to address (e.g. "address findings 1 and 3" or "skip the cosmetic stuff"), restrict scope accordingly. Otherwise, address every finding.
- If you cannot find a dry review in the transcript, ask the user to point you at it (or to run `/pr review` first) — do not invent findings.

## 2. Read the relevant source files

For each file a finding refers to, read the **current** source code so you can verify claims against the actual implementation. Also read related files if needed (e.g. types, utilities, helpers, configs, tests, or sibling files such as a state changelog, a role grant file, a migration).

(b) Read the current state in the working tree, or via `gh api .../contents` if reviewing a remote branch. Do not rely on the diff snippet you cited earlier — code may have moved since the review was produced, and your earlier read window may have missed nearby context.

## 3. Verify each finding

For every finding, perform **critical evaluation** before deciding to accept or dismiss:

### Verification checklist

- **Fact-check**: Is the claim technically accurate? If it references library, framework, or language behavior, or API contracts, verify against up-to-date documentation (`context7` MCP, official docs, or `WebSearch`). For DB / SQL / Liquibase claims, verify against the project's `CLAUDE.md`, `AGENTS.md`, or schema files.
- **Convention check**: Does the suggestion align with the project's established patterns? Read the relevant `CLAUDE.md` (root and any nested), existing similar code, lint/format config, and team conventions. A "better practice" that contradicts the project's conventions is not better here.
- **Context check**: Is there a specific reason the code was written this way? Check git blame, the PR description, related tickets, sibling PRs, and nearby comments that explain intent. (b) The author may have made a deliberate trade-off you missed in the first pass.
- **Logical reasoning**: Does the finding's logic hold up? Some suggestions sound reasonable in isolation but don't apply to the specific scenario (e.g., premature optimization for trivially small inputs, race conditions with negligible windows, edge cases that can't actually occur).
- **(b) Self-skepticism**: You wrote the review. Re-examine your own claim — did you cite a line correctly, did you confuse two similar files, did you assume a behavior that the code doesn't actually have? Be especially suspicious of confident claims that turn out to rest on a single grep.
- **Severity assessment**: Even if valid, is the finding worth addressing in this PR? A theoretically correct suggestion with zero practical impact may not warrant a code change — it may belong in a follow-up, or may not be worth filing at all.
- **Security review**: For security-related or security-adjacent findings, err on the side of fixing. These deserve extra scrutiny and are more likely to be valid.

### Classification

Classify each finding into one of:

| Verdict | Meaning | Action |
|---|---|---|
| **VALID — Fix** | Finding is correct and worth addressing now | Implement the fix |
| **VALID — Docs only** | Finding is correct but the fix is in the PR description / a code comment, not the logic | Update PR description or add code comment |
| **NOT VALID** | Finding is factually wrong, doesn't apply, is premature, or rests on a misread | Dismiss with clear reasoning |
| **LOW PRIORITY / DEFER** | Technically valid but negligible impact, or not worth this PR (e.g. cosmetic, follow-up scope) | (a) Dismiss with explanation of why it's acceptable. (b) Note rationale; optionally file as a follow-up issue |

## 4. Present the analysis

Before making changes, present a summary table to the user showing each finding, your verdict, and the reasoning. Example:

```
| # | Finding (short) | Verdict | Reason |
|---|---|---|---|
| 1 | Missing error handling on X | VALID — Fix | Error would cause silent failure |
| 2 | Use DP for string matching | NOT VALID | Inputs are <50 chars, O(n^3) is microseconds |
| 3 | Missing changelog include | VALID — Fix | Per CLAUDE.md; verified file is absent from the changelog |
| 4 | `:=` alignment cosmetic | NOT VALID | Re-read shows alignment is internally consistent; original finding was a misread |
```

Wait for the user to confirm or override your verdicts before proceeding. If the user says "go" / "proceed" / doesn't object, continue to step 5. If they push back on any verdict, update the table and re-confirm before fixing.

## 5. Implement fixes

For every finding classified **VALID — Fix**:
- Make the code change.
- For SQL / migration changes, follow the project's conventions in `CLAUDE.md`.
- Run typecheck / lint / `liquibase validate` on the changed files, only if the project has them and they apply. Don't run a full repo build for a single migration edit.
- Fix any issues surfaced before proceeding.

For **VALID — Docs only**:
- Update the PR description via `gh pr edit` (always `gh pr view --json body` first and preserve the existing body, screenshots, and external links).
- Or add a short code comment if the WHY genuinely needs to live in the source.

For **NOT VALID** and **LOW PRIORITY / DEFER**: no code change. The reasoning goes into step 6.

## 6. Close the loop

### (a) PR comments: reply to each comment and resolve threads

Reply to **every** comment — both accepted and dismissed:

- **For fixed comments**: Briefly state what was changed (e.g., "Fixed. Now using X instead of Y.")
- **For dismissed comments**: Explain **why** with specific reasoning (e.g., "Not addressing — inputs are <50 chars, computation is microseconds at this scale. DP would have identical practical performance while adding complexity.")
- **For docs-only fixes**: State what was updated (e.g., "Good catch. Updated the PR description to say 10,000 instead of 1,000.")

Use the GitHub API to reply and resolve threads:
- Reply: `gh api repos/{owner}/{repo}/pulls/<number>/comments/{id}/replies -f body="..."`
- For review-body-only feedback (no inline comments): `gh pr comment <number> --body "..."`
- Resolve threads via GraphQL: query `reviewThreads` for node IDs, then `resolveReviewThread` mutation

Resolve **all** threads after replying — both fixed and dismissed.

### (b) Dry review: preempt re-litigation in the PR description

Findings classified **NOT VALID** or **LOW PRIORITY / DEFER** still represent real questions another reviewer is likely to raise — they'll re-discover the same things you did and write the same comments. Head this off by adding a brief "Reviewer notes" entry to the PR description so the reasoning is visible up front.

- Fetch the current body first: `gh pr view <number> --json body --jq .body` and preserve all existing content (screenshots, external links, test plan, Jira links).
- Append concise bullets under an existing **Reviewer notes** section (or create one if absent) — one per dismissed/deferred finding. Each bullet should state the concern and the reason it's intentional, in one or two sentences max.
- Keep entries terse and specific (cite the file/pattern that backs the decision). Do **not** dump the full verdict table — readers want the "why this is fine," not the meta-process.
- Skip this step entirely if there are no NOT VALID or DEFERRED findings, or if there's nothing a reviewer could reasonably misread.
- Follow the user's PR-description rules: no local-only references (issue numbers, plan phases, local branches), Jira IDs and external PR URLs are fine.
- Push the update via `gh pr edit <number> --body-file <tmp file>` (use a file, not `--body`, so newlines render correctly).

### (b) Dry review: report back inline

After all fixes are made, post a single summary message to the user covering every finding:

- **For fixed findings**: state the file(s) touched and what changed in one line.
- **For dismissed findings**: state the specific technical reason (not just "won't fix").
- **For deferred findings**: state why it's out of scope and, if relevant, where it should live (follow-up PR / future ticket).

There is no GitHub thread to resolve — the report-back lives entirely in the conversation. Make it self-contained so a reader skimming only the final message can see every decision.

## 7. Commit / push

If code changes were made, do **not** commit or push automatically. Tell the user the changes are ready and ask how they want to proceed (new commit vs amend, push now vs wait). Their next message decides.

## Important rules

- **Never accept a finding just because a reviewer or bot said it.** Copilot, AI reviewers, and even human reviewers can be wrong. Your job is to be the arbiter.
- **(b) Treat your own review as input, not as a verdict.** You are allowed — and expected — to overturn your own findings if a closer look shows they don't hold up.
- **(b) Re-read before fixing.** Never edit based on the diff you cited in the review; always re-read the live file first.
- **Dismissals must be substantive.** "Not addressing" alone is insufficient — always include the specific technical reason.
- **Security findings get extra scrutiny.** When in doubt on security-related feedback, lean toward fixing it.
- **Preserve existing PR content.** When editing PR descriptions, always read the current body first; never overwrite screenshots, external links, or other content.
- **Don't over-fix.** If a finding asks for X, do X — don't also refactor the surrounding code. (b) If you spot a new issue while fixing, mention it in the report-back rather than silently expanding scope.
- **(b) Match the user's filter.** If the user asked you to address a subset, do not creep beyond it.
