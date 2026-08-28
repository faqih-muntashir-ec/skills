---
name: address-dry-review
description: Address findings from a /dry-review (terminal-only review). Critically verify each finding against docs, conventions, and code context before accepting or dismissing. Use when the user wants to act on a dry-review you just produced in the conversation.
argument-hint: "(no args — operates on the most recent dry-review in the transcript)"
---

# Address Dry Review Findings

Respond to the findings of a `/dry-review` you produced earlier in this conversation. Unlike `/address-pr-comments`, the review lives only in the transcript — there is no GitHub thread to reply to or resolve. Your job is to **decide**, **fix**, and **report back inline**, while still subjecting each finding to the same critical scrutiny.

**Do not blindly accept your own review.** A finding from your earlier turn is just another reviewer's opinion — verify it against current code, project conventions, and authoritative docs before acting on it.

## 1. Locate the dry-review in the transcript

- Find the most recent `/dry-review` (or equivalent terminal-only review) you produced in this conversation.
- Extract every distinct finding — must-fix items, nits, minor drift notes, cosmetic suggestions. Capture the file path and line/section the finding refers to.
- If the user has indicated which findings to address (e.g. "address findings 1 and 3" or "skip the cosmetic stuff"), restrict scope accordingly. Otherwise, address every finding.
- If you cannot find a dry-review in the transcript, ask the user to point you at it (or to run `/dry-review` first) — do not invent findings.

## 2. Re-read the relevant source files

For each file referenced by a finding, read the **current** state of the source (in the working tree or via `gh api .../contents` if reviewing a remote branch). Do not rely on the diff snippet you cited earlier — code may have moved since the review was produced, and your earlier read window may have missed nearby context.

If the finding references types, helpers, configs, or sibling files (e.g. a state changelog, a role grant file, a migration), read those too.

## 3. Verify each finding

For every finding, perform critical evaluation before deciding to accept or dismiss:

### Verification checklist

- **Fact-check**: Is the claim technically accurate? If it cites library, framework, or language behavior, verify against current docs (`context7` MCP, official docs, or `WebSearch`). For DB / SQL / Liquibase claims, verify against the project's `CLAUDE.md`, `AGENTS.md`, or schema files.
- **Convention check**: Does the suggested fix align with the project's established patterns? Read the relevant `CLAUDE.md` (root and any nested), existing similar code, and lint/format config. A "best practice" that contradicts the project's conventions is not better here.
- **Context check**: Is there a specific reason the code was written this way? Check git blame, the PR description, related tickets, sibling PRs, and nearby comments. The author may have made a deliberate trade-off you missed in the first pass.
- **Self-skepticism**: You wrote the review. Re-examine your own claim — did you cite a line correctly, did you confuse two similar files, did you assume a behavior that the code doesn't actually have? Be especially suspicious of confident claims that turn out to rest on a single grep.
- **Severity assessment**: Even if valid, is the finding worth addressing in this PR? A theoretically correct nit with zero practical impact may belong in a follow-up — or may not be worth filing at all.
- **Security-adjacent findings**: Err on the side of fixing. These deserve extra scrutiny and are more likely to be valid.

### Classification

Classify each finding into one of:

| Verdict | Meaning | Action |
|---|---|---|
| **VALID — Fix** | Finding is correct and worth addressing now | Implement the fix |
| **VALID — Docs only** | Finding is correct but the fix is in the PR description / a code comment, not the logic | Update PR description or add comment |
| **NOT VALID** | Finding is factually wrong, doesn't apply, or rests on a misread | Dismiss with clear reasoning |
| **LOW PRIORITY / DEFER** | Technically valid but not worth this PR (e.g. cosmetic, follow-up scope) | Note rationale; optionally file as a follow-up issue |

## 4. Present the analysis

Before making changes, present a summary table showing each finding, your verdict, and the reasoning. Example:

```
| # | Finding (short) | Verdict | Reason |
|---|---|---|---|
| 1 | Missing changelog include | VALID — Fix | Per CLAUDE.md §9; verified file is absent from state.changelog.xml |
| 2 | Collapse 2 changesets to 1 | VALID — Fix | User explicitly asked for this in the dry-review args |
| 3 | Schema vs migration body drift (inline comment) | LOW PRIORITY | Trivially cosmetic; PR description claim is the only real issue |
| 4 | `:=` alignment cosmetic | NOT VALID | Re-read shows alignment is internally consistent; original finding was a misread |
```

Wait for the user to confirm or override your verdicts before proceeding. If the user says "go" / "proceed" / doesn't object, continue to step 5. If they push back on any verdict, update the table and re-confirm before fixing.

## 5. Implement fixes

For every finding classified **VALID — Fix**:
- Make the code change.
- For SQL / migration changes in a database repo, follow that project's conventions in `CLAUDE.md` (idempotent SQL, `--go-endFunction` endDelimiter for the user's own migrations, register new schema files in `state.changelog.xml`, add grants to the role file, etc.).
- Run typecheck / lint / `liquibase validate` only if the project has them and they apply to the changed files. Don't run a full repo build for a single migration edit.
- Fix any issues surfaced before proceeding.

For **VALID — Docs only**:
- Update the PR description via `gh pr edit` (always `gh pr view --json body` first and preserve the existing body, screenshots, and external links).
- Or add a short code comment if the WHY genuinely needs to live in the source.

For **NOT VALID** and **LOW PRIORITY / DEFER**: no code change. The reasoning will appear in the report.

## 6. Preempt re-litigation in the PR description

Findings classified **NOT VALID** or **LOW PRIORITY / DEFER** still represent real questions another reviewer is likely to raise — they'll re-discover the same things you did and write the same comments. Head this off by adding a brief "Reviewer notes" entry to the PR description so the reasoning is visible up front.

- Fetch the current body first: `gh pr view <number> --json body --jq .body` and preserve all existing content (screenshots, external links, test plan, Jira links).
- Append concise bullets under an existing **Reviewer notes** section (or create one if absent) — one per dismissed/deferred finding. Each bullet should state the concern and the reason it's intentional, in one or two sentences max.
- Keep entries terse and specific (cite the file/pattern that backs the decision). Do **not** dump the full verdict table — readers want the "why this is fine," not the meta-process.
- Skip this step entirely if there are no NOT VALID or DEFERRED findings, or if there's nothing a reviewer could reasonably misread.
- Follow the user's PR-description rules: no local-only references (issue numbers, plan phases, local branches), Jira IDs and external PR URLs are fine.
- Push the update via `gh pr edit <number> --body-file <tmp file>` (use a file, not `--body`, so newlines render correctly).

## 7. Report back inline

After all fixes are made, post a single summary message to the user covering every finding:

- **For fixed findings**: state the file(s) touched and what changed in one line.
- **For dismissed findings**: state the specific technical reason (not just "won't fix").
- **For deferred findings**: state why it's out of scope and, if relevant, where it should live (follow-up PR / future ticket).

There is no GitHub thread to resolve — the report-back lives entirely in the conversation. Make it self-contained so a reader skimming only the final message can see every decision.

## 8. Commit / push

Do **not** commit or push automatically. Tell the user the changes are ready and ask how they want to proceed (new commit vs amend, push now vs wait). Their next message decides.

## Important rules

- **Treat your own review as input, not as a verdict.** You are allowed — and expected — to overturn your own findings if a closer look shows they don't hold up.
- **Re-read before fixing.** Never edit based on the diff you cited in the review; always re-read the live file first.
- **Dismissals must be substantive.** "Not addressing" alone is insufficient — always include the specific technical reason.
- **Don't over-fix.** Address the finding, not the surrounding code. If you spot a new issue while fixing, mention it in the report-back rather than silently expanding scope.
- **Preserve existing PR content.** When editing PR descriptions, always fetch the current body first; never overwrite screenshots or external links.
- **Match the user's filter.** If the user asked you to address a subset, do not creep beyond it.
