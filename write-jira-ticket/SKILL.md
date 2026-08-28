---
name: write-jira-ticket
description: Write and create Jira tickets that hold their shape — epic/story structure, testable acceptance criteria, and the fields a ticket is useless without (story points, sprint, assignee, parent epic, blocks links, status). Use when the user wants to write, draft, file, or bulk-create Jira tickets/stories/epics, turn a plan or spec into tickets, fix a vague ticket, or asks which fields a ticket still needs.
---

# Writing a Jira ticket

A ticket has two halves, and both must land: the **body** someone reads, and the **fields** the board runs on. A perfect body with no points and no sprint is invisible; a fully-fielded ticket with vague criteria gets built wrong.

## The body: house format

Three parts, in this order. Match the format of the tickets already in the project — read one recent sibling ticket first and copy its shape.

**Repo:** which repository the change lands in. Omit the line when the ticket ships no code (a session, a decision, manual setup).

**Background:** what is true today, why it hurts, and what this ticket changes. Two or three short paragraphs. Name the failure that happens without this ticket. Put the one hard judgement call here — the trap the implementer would otherwise walk into.

**Acceptance Criteria:** a flat bullet list, each bullet one checkable end state.

- One claim per bullet. A bullet with "and then" is two bullets.
- Write the observable result, not the activity: "a type error fails the build", not "set up type checking".
- Give commands, file paths, field names, and exact numbers where they exist — `docs/cli.md`, `0` on success, default 99%.
- Use an indented sub-list only to enumerate cases under one bullet.
- Close with the criterion that proves the whole thing: the review, the sign-off, or the person other than the author who succeeds unaided.

Write prose in plain English: short sentences, active voice, direct commands.

## The fields

Fill every row. If a row stays empty, say why in your reply — an unset field is a decision, not an oversight.

| Field | What to set |
|---|---|
| Project + issue type | The user's board. Epic for the container, Story for work, Bug for a defect |
| Summary | The deliverable, no ticket-id prefix, no trailing period |
| Parent | The epic. Every story belongs to one |
| Story points | Fibonacci: 1, 2, 3, 5, 8, 13. A 13 means "split this if the sprint cannot hold it" |
| Sprint | The sprint id, not its name |
| Assignee | Ask whose name goes on it if the user did not say |
| Links | Blocks links from the dependency order |
| Status | The workflow status the user asked for |

Story points and Sprint are custom fields whose ids differ per Jira site. Discover them once: fetch the create metadata for the issue type with all fields (not required-only) and read the ids for "Story Points" and "Sprint". To get the sprint id, search the project for issues in `sprint in openSprints()` and read the sprint object off one of them.

**A site usually has two point fields, and only one drives the board.** "Story Points" and "Story point estimate" are different fields with different ids. Jira accepts a write to either and returns it on read, so a value in the wrong one is invisible on the board and in the sprint report while every API check passes. Points are also often absent from the create screen, so they need an edit call after create.

Pick the right id by elimination, not by copying a sibling ticket's populated field — a sibling can carry both:

1. Read one issue that shows a point value in the board's Story Points column, with all fields.
2. If two point fields both hold a value, write your value to one, then look at the board.
3. Set the field the board reads and clear the other, so no report counts the same estimate twice.

Confirm points against the board UI, not the API. This is the one field an API read cannot verify.

## Linking dependencies

Build the dependency order first — for each ticket, which tickets must land before it. Then create one `Blocks` link per pair.

**The blocker goes inward.** `inwardIssue` = the ticket that blocks; `outwardIssue` = the ticket that waits. Create one link and read it back before making the rest: the waiting ticket must read "is blocked by" the blocker.

## Order of operations

1. Draft every body and settle the dependency order before creating anything. Renaming and renumbering after creation is far more work than before.
2. Create the epic. Create the stories against it, each with points, sprint, and assignee in the create call.
3. Read one created ticket back. Confirm the parent, the points, and the sprint actually stuck, and that the description rendered — nested bullets need four-space indentation, and wiki markup (`*bold*`, `**` sub-bullets) comes out escaped when the field takes markdown.
4. Create the links.
5. Fetch the available transitions for one ticket, then transition by id. Never guess a transition id; boards carry extra done-category statuses like "Code Complete" that are not "Done".
6. Verify the whole set in one query — key, points, status, sprint, assignee, link count per ticket — and report that table.

## Epics

An epic carries the body, the assignee, and its status. Jira rolls its children's points up, so leave the epic's own points empty unless the user asks for a number. If the epic and its children all sit in one sprint and the epic also carries points, the sprint report counts those points twice — say so once, then do what the user asked.

An epic is Done only when every child is Done.
