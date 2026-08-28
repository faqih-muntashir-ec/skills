---
name: adversarial-verification
description: Dispatch subagents to refute each finding listed earlier in this session, then report which survive. Use when the user wants findings stress-tested, adversarially verified, double-checked, or asks "are these real?" before acting on a review, audit, bug list, or investigation.
argument-hint: "(no args — operates on the findings already in the transcript)"
---

# Adversarial Verification

Every finding in the transcript is a **claim**, not a fact. A claim survives only when an independent agent tries to kill it and fails.

## 1. List the claims

Collect every finding stated earlier in this session — review comments, bugs, audit hits, investigation conclusions. Number them. Show the list before dispatching.

Ask the user which ones to verify only when the list is over 10; otherwise verify all of them.

## 2. Dispatch one refuter per claim

Send all refuters in a single message so they run concurrently. Each gets:

- The claim, verbatim.
- Its file and line, when the claim names one.
- This instruction: **"Try to refute this claim. Read the actual code and the authoritative docs. Return `refuted: true` if the claim is wrong, overstated, or unreproducible. Default to `refuted: true` when the evidence is thin — a claim you cannot confirm is not confirmed."**
- The required return shape: `refuted` (true/false), `evidence` (file:line or doc URL), `reason` (one sentence).

Give each refuter only its own claim. A refuter that sees the whole list anchors on the others.

## 3. Report the verdicts

One table: claim, verdict, evidence.

- **Survived** — the refuter failed to kill it. Act on it.
- **Refuted** — state what the refuter found, in the refuter's own evidence terms.

Close on the next action: which surviving findings to fix first.

Do not fix anything here. This skill decides what is real; a separate turn decides what to do.

## Completion criterion

Every claim on the numbered list has a verdict backed by a file:line or a doc URL. A verdict with no evidence is not a verdict — re-dispatch that refuter.
