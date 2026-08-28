---
name: investigation-report
description: Editorial rules for an investigation, defect, or findings report — what earns a place in it, how each finding reads, when a diagram beats a table, and how to grill the draft before it ships. Use when writing, revising, pruning or scope-checking a report, converting report prose into a diagram, or acting on review findings against a report. `html-pdf-report` owns the HTML shell, the CSS and the PDF command; this skill owns the content.
---

# Investigation Report

A report answers one question for one reader. Its quality is the share of lines that carry
weight, so **cutting is the main move**. Every section below either admits a line or removes one.

## 1. Draw the relevance line first

Name the one question the report answers: a ticket, a symptom, a decision. Write that
question down before the first section. Then admit a finding only when it passes one test:

- it **causes** the reported symptom, or
- it **hid the evidence** while you searched for the cause, or
- the request itself **asserts** it. A ticket that claims "the client view de-dupes" puts
  that claim in scope, because the report must answer the ticket, even when the claim is not
  the cause.

A finding that passes no test is real and out of scope. Give it one line: what it is, why it
sits outside this report, and the proof that closes it. The proof is the point. Without it a
reader reopens the question for free.

Keep sibling reports independent. A pointer from this report to another one is a claim that
the reader needs both, so make that claim only for material this report's own question needs.

Done when every finding in the draft passes one of the three tests or carries its
one-line out-of-scope note with proof.

## 2. Give every finding a verdict and a full thought

Each finding states four things, in this order:

1. **What is wrong.** The mechanism, with the file and line that holds it.
2. **What happens because of it**, in the reader's terms. Name who sees what, and the wrong
   decision that follows. "A manager reads two different rates for one group and cannot tell
   which to act on" lands; "the query returns two rows" does not.
3. **What should happen instead.** The contract the code breaks.
4. **The verdict.** Defect, correct by design, or open decision. Say which. A finding with no
   verdict hands the judgement back to the reader.

Name the system that owns each finding, and say plainly which systems are correct. A reader
who cannot see where the defect stops will re-check the whole chain.

For an open decision, state the decision and its owner: "That definition is an open product
decision. Product owns the answer." Keep the report's voice on the code and the numbers.

## 3. Choose the form: prose, table, or diagram

Match the form to the shape of the content.

| The content is | Use |
|---|---|
| A sequence, a branch, a fan-out, or a boundary in time | A diagram |
| Exact arithmetic, or a flat list of attributes | A table |
| A judgement, a verdict, a consequence | Prose |

A diagram and a table beside it must not carry the same facts. Put the mechanism in the
figure and the arithmetic in the table, then trim the sentence that restated either one.

Every figure carries a `figcaption` that states the consequence. A caption that describes the
picture spends a line to say what the reader already sees.

## 4. Treat every borrowed finding as a lead

A finding from a subagent, a reviewer, or an earlier draft is a **lead**. Open the cited file
and confirm it before it enters the report. Two classes of error repeat:

- **The wrong artefact.** A per-client config roster and a test fixture both list clients.
  Only the roster proves that a client is affected.
- **The wrong frame.** Code inside an example or demo path reads identically to code on the
  production path. Check which one the citation sits in.

Reproduce every count with a command, and keep the command in the verification section. A
remembered count is a defect waiting for the first reader who runs it.

## 5. Grill the draft

Run this list against the whole draft, and fix each failure before the report ships.

1. Every heading describes the content under it.
2. No item is marked open when another section already answers it. Search the draft for the
   item's own words.
3. Every "this explains that" and "the same shape as" claim survives arithmetic. Two numbers
   produced under different rules explain nothing about each other.
4. Every number in prose matches the number in the table and in the figure beside it.
5. Every sentence names its referent, so it survives being read alone. Replace "the numbers
   above", "this issue", "as mentioned".
6. Every claim carries its file, line or query. A claim with no citation is an opinion.
7. The report states how each fact was checked, and says plainly what is still unverified.
8. Findings appear as findings. Keep discovery narration and the first person out, so
   "Found while reading the read layer" becomes the finding itself.
9. Every cross-reference resolves. Renumbering breaks these silently.

Done when each of the nine passes on the current text, not on the text you remember writing.

## 6. Edit and verify

Read [`MECHANICS.md`](MECHANICS.md) before the first edit to an existing report. It holds the
exactly-one-match replace helper, the tag-balance check, the safe renumbering pass, the
report-figure contract, and the verify loop that runs after every edit.
