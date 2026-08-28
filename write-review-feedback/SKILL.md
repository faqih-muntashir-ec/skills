---
name: write-review-feedback
description: Rules for wording review comments and replies - discuss the code not the author, state the reason and the tradeoff, mark low-priority notes, and answer the reviewer's question in the code. Use when writing a code review comment, when replying to review feedback, when a review thread has gone two rounds without agreement, or when preparing a change to be reviewed.
---

# Write review feedback

A review comment is useful when the author can act on it without asking what you meant. Tone is not politeness alone: in Google's research, very negative comments were judged useful 57% of the time, neutral ones 79%.

Sibling skills cover the mechanics: `dry-review` and `thermo-nuclear-code-quality-review` for finding issues, `inline-pr-comments` for where to post them, `address-pr-comments` for verifying a comment before acting on it. This skill covers the wording.

## As the reviewer

**Discuss the code, never the author.** The word "you" turns a note about a diff into a judgment about a person, and the author then defends instead of thinking.

```
Why are you using this approach? You're adding unnecessary complexity.
This concurrency model appears to add complexity without a visible performance benefit.
```

**State the reason, not only the request.** The author may know a constraint you do not, or may not know the alternative you do.

```
This doesn't make any sense. Why don't you use InitializeServerWithAFewExtraSteps()?
InitializeServerWithAFewExtraSteps() looks like it achieves the same result with
built-in logging and auditing (see <link>). Would that work better here?
```

**Name the tradeoff your suggestion carries**, and act as a guide rather than a grader. Leave the author some freedom in how they solve it.

**Mark the small stuff.** Prefix low-priority notes with `Nit`, `Optional`, or `FYI` so the author can tell which comments block the change.

**Give an example when the rewrite is subtle.** For an API usage change or a "split this into smaller changes" request, a short snippet saves a round trip.

**Say when the code is hard to read, and stop there.** If code is hard to understand, it is probably too complex, not too clever for you. "It is hard for me to follow this" or "please use more descriptive names here" is one of the most useful comments a reviewer can leave. Do not spend minutes decoding it first.

**Provide the rationale document** — a style guide, a design doc, a best-practices page — when one exists. It teaches instead of only correcting.

**Assume competence.** When you do not have specific advice, ask why the author made the choice.

## As the author

**Address the comment rather than argue it.** A comment means a reader stumbled. If the improvement is cheap, make it — the code gets better and the thread ends.

**Look past the literal request for the real problem.** A reviewer asking "can we keep this signature unchanged?" may be pointing at the function taking on a second responsibility. Extracting `selectEnglishPosts(posts)` satisfies the comment and fixes the cause.

**Ask when the comment is unclear.** Move to chat or a call rather than guessing across three rounds.

**Answer the question in the code, not only in the thread.** Rename the variable, turn the boolean into an enum, or add a comment — the next reader has the same question and will not read your reply.

**Add context when "Done" is not enough.** Reply with what you changed and why whenever the diff alone does not show it.

```
Reviewer: This approach seems risky. It might not handle all the edge cases.
Author:   Updated.
Author:   Good catch. Added checks for null, empty, and negative inputs, each with a new test case.
```

Add context specifically when: the change does not show how you addressed it, you made a non-obvious tradeoff, an offline discussion decided it, or several options existed and you picked one. Put a design decision in a code comment or the commit message too — the thread is not where the next reader looks.

**Re-read the whole change after non-trivial comments.** One fix often opens the next one.

**Explain the advantage of your approach when you disagree**, rather than declining. If you cannot reach agreement, escalate through the team's conflict process.

```
I prefer short names so I'd rather not change this. Unless you make me? :)
Best practice suggests omitting generic terms. I'm not sure how to reconcile
that with this request — can you say more about what you're seeing?
```

## Before you request the review

- **Self-review the diff in the review tool.** It shows the change differently from the editor and catches a round trip's worth of issues.
- **Keep the diff to one purpose.** Move significant refactoring and formatting into a separate change. See `simplify-code` for prefactoring.
- **Put important information in the code, not only the commit message.** A later reader will not open the commit.
- **Write the first line of the commit message to stand alone**, so the history reads as a list of what changed and why.

## After two rounds

If a thread has gone two rounds without agreement, move to chat or a call. Text is the wrong medium for the disagreement you now have.

## Completion criteria

- No comment contains "you" or "your" aimed at the author.
- Every non-obvious comment states its reason.
- Every low-priority comment carries a `Nit`, `Optional`, or `FYI` prefix.
- Every reply that is not self-evident from the diff says what changed and why.
