---
name: adversarial-verification
description: Dispatch one refuter subagent to refute every finding listed earlier in this session, then report which survive. Use when the user wants findings stress-tested, adversarially verified, double-checked, or asks "are these real?" before acting on a review, audit, bug list, or investigation.
argument-hint: "(no args — operates on the findings already in the transcript)"
---

# Adversarial Verification

Every finding in the transcript is a **claim**, not a fact. A claim survives only when an independent agent tries to kill it and fails.

## 1. List the claims

Collect every finding stated earlier in this session — review comments, bugs, audit hits, investigation conclusions. Number them. Show the list before dispatching.

Ask the user which ones to verify only when the list is over 10; otherwise verify all of them.

## 2. Dispatch one refuter for the whole list

Send a single subagent that takes every claim. One agent reads the shared files once, so the claims cost one pass instead of one pass each.

The refuter gets:

- Every claim, verbatim and numbered.
- Each claim's file and line, when it names one.
- Where to read the real code, stated explicitly — the working tree is often on the wrong branch, so name the exact PR-head copies or the `gh pr diff` command to use.
- This instruction: **"For EACH claim independently: try to refute it. Read the actual code and the authoritative docs. Return `refuted: true` if the claim is wrong, overstated, or unreproducible. Default to `refuted: true` when the evidence is thin — a claim you cannot confirm is not confirmed. Judge each claim on its own evidence; do not let a verdict on one claim influence another."**
- Per claim, the specific thing that would kill it — the doc to check, the sibling precedent that would make it a preference rather than a defect, the second half of a two-part assertion.
- The required return shape, one block per claim: `claim` (number), `refuted` (true/false), `evidence` (file:line or doc URL), `reason` (one sentence).

Naming the kill condition per claim is what keeps one agent as sharp as many. Without it the agent grades the list instead of attacking it.

Split into several refuters only when the claims need different tools or different repos, or when the list is long enough that one agent would run out of room.

## 3. Report the verdicts

One table: claim, verdict, evidence.

- **Survived** — the refuter failed to kill it. Act on it.
- **Refuted** — state what the refuter found, in the refuter's own evidence terms.

Close on the next action: which surviving findings to fix first.

Do not fix anything here. This skill decides what is real; a separate turn decides what to do.

## Completion criterion

Every claim on the numbered list has a verdict backed by a file:line or a doc URL. A verdict with no evidence is not a verdict — send the refuter back for that claim alone.
