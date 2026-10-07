# Write PR Description

## 1. Gather context

Determine the base branch (default: `master`, or use the argument if provided).

Run these in parallel:
- `git log <base>..HEAD --oneline` — commits on the branch
- `git diff <base>...HEAD --stat` — files changed summary
- `git diff <base>...HEAD` — full diff for analysis

## 2. Identify Jira ticket

Check for Jira context **already present in the conversation** (e.g. from a prior `getJiraIssue` call). If available, use the ticket summary, description, and acceptance criteria to enrich the PR description.

If no Jira context is in the conversation, attempt to extract a ticket ID from the branch name (e.g. `fix/proj-668` → `PROJ-668`). Use the ticket ID only for the title prefix and `Fix` footer — do **not** fetch the ticket yourself.

## 3. Generate PR title

Format: `[TICKET-ID] type: description` (if ticket exists) or `type: description` (if no ticket).

- **The `type: description` MUST match the head commit's Conventional Commit subject** — when the branch has a single (or squashed) commit, reuse that subject verbatim and only prepend `[TICKET-ID]`. Do not reword it. Run `git log -1 --format=%s` and base the title on it. PR title and commit subject staying in sync is the priority.
- If the commit subject already carries the ticket as a scope (`feat(PROJ-123): …`), keep the description identical; the `[PROJ-123]` prefix may duplicate the scope — that's fine.
- If the PR addresses **multiple tickets**, include all ticket IDs sorted ascending: `[PROJ-100, PROJ-101] feat: description`
- Prefer under 70 characters, but matching the commit subject wins over the length guideline.
- Use Conventional Commits types (`feat`, `fix`, `chore`, `refactor`, etc.)
- Description should be imperative, lowercase

## 4. Generate PR body

**Accuracy rule**: Every claim in the PR description must be verifiable from the actual diff. Before writing each bullet in Solution, or each line of a Change outline view, confirm the corresponding change exists in the diff. If a file was not modified, do not mention it. If a config was already in place and unchanged, do not claim it was added. Describe only what actually changed — not what you intended or planned to change.

Use this structure (no blank lines between section headers and their content):

```
## Problem
<exactly one sentence naming what is wrong or missing today>

## Solution
<exactly one sentence naming what this PR changes so the problem goes away>

## Preview (only if the PR changes UI appearance)
<Preview table, change descriptions and `### Visual diff`, as described in the Preview guidelines>

## Change outline
<the smallest set of code-shape views that shows how the change is built — see the Change outline guidelines>

### Reviewer notes (optional — include only when useful)
<bullet list of decisions another reviewer might question>

## Merge danger
**Door:** one-way | two-way — <why>
**Blast radius:** <who or what breaks if this is wrong>

## Verification Guide (optional — include when the change is manually verifiable on dev)
<prerequisites, the exact user/subject to emulate, the fixture/data needed, and numbered steps each with its expected result>

## Tested
- [x] <checklist of verifications already performed before creating the PR>

## Test Plan after Merge
- [ ] <checklist of verifications that require the dev environment or can only be done post-merge>

Fix [TICKET-ID](https://<your-site>.atlassian.net/browse/TICKET-ID) (if applicable — always link to Jira URL)
```

Do not hard-wrap lines. Keep each paragraph or bullet on a single line and let the renderer handle wrapping.

### Problem and Solution guidelines
- Write **exactly one sentence** in each. A second sentence means the detail belongs in Change outline or Reviewer notes, where the reviewer expects it.
- Problem states the current wrong or missing behavior, not the fix. Solution states the change, not how it is built.
- Cut the sentence until a reviewer who knows nothing about the ticket still understands why this PR exists.

### Preview guidelines
- **Always include the Preview section** when the PR changes UI appearance (layout, styling, colors, spacing, visibility of elements, etc.)
- Check the conversation for screenshots the user shared (bug reports, design comps) — use those as the "Before" image
- Check for before/after pairs already taken this session, and use those
- If no pair exists but the PR is clearly a UI change, run the base and the branch locally and take one before/after pair per change, with the change as the only difference. Lay out the Preview table with a same-label caption row above each image row, so both columns get equal width. Do not leave a placeholder table for the user to fill in.
- If the app cannot run locally and you only have a "Before" screenshot from the user's bug report, include it and note that "After" will be verified post-merge

### Change outline guidelines
- Show the **shape** of the change so a reviewer can predict the code before opening it. This replaces a prose changelog of files touched.
- **Invoke the `show-me` skill via the Skill tool** and build this section from its views. The skill holds the worked example of each one; the list below is the trigger for reaching for it.
- Walk the full list every time and pick the views that fit this PR. A view the PR did not change is omitted, but it is omitted because you checked it, not because you stopped reading early:
  - **Logic or an algorithm → pseudocode.** The changed rule in a few lines, with the branches that matter and nothing else.
  - **Runtime control flow → a call tree.** The chain of calls the change adds, removes, or reroutes, indented by depth.
  - **UI structure → a component tree.** Include the hooks, state, and module or package boundaries that the reviewer needs; leave out the wrappers that carry nothing.
  - **File responsibility or a broad refactor → a shallow file tree.** One line per changed file or directory, each with a comment naming what it now owns.
  - The reader is a visual learner: when the change has a mechanism or a before/after with more than two moving parts, include a diagram.
  - **Component interaction, control flow, or data flow → Mermaid.** Reach for it when the point is who talks to whom across a boundary, and a flat tree would lose the direction or the ordering.
  - **SQL tables and endpoint contracts → the table shape or the request/response shape.** Columns, relationships, and the fields a consumer reads.
  - **Key data structures → the type.** The shape the rest of the change hangs off, so the reviewer reads every later view against it.
- Use a `diff` block when the surrounding shape already exists, so the reader sees what moved, and **match the diff shape to the topic** — diff the component tree for a component change, the file tree for a layout change, the call tree for a flow change. Show the complete target shape when most of it is new, or when diff markers would hide ownership or order.
- Order the views so the change tells a story — sometimes the table comes first, sometimes the file tree. Put one short sentence above each view saying what it shows.
- Keep prose bullets for a decision no view can carry (a library choice, an alternative dropped and why). Put them under the views, so the shape lands first.
- Keep the whole section to about one screen. Detail past that belongs in the code, where the reviewer is going next.

### Merge danger guidelines
- Always include this section, even when the answer is boring. Two lines is a complete answer; the point is that the reviewer sees the risk before they see the code.
- **Door** is how reversible the merge is. A **two-way door** is cheap to walk back — revert the commit and the world is as it was. A **one-way door** cannot be undone by a revert: a dropped column, a deleted row, a published package version, a sent notification, a migrated data shape another service now reads. Name which one and the reason in the same line.
- **Blast radius** is who or what breaks if the change is wrong. Reach past the files in the diff: other consumers of a changed API or shared component, mobile and narrow viewports, layout shift, cached or stored data written in the old shape, permissions and who can now see what, and cost or load on a downstream service.
- Write both in the reviewer's terms — which user sees what, which service fails. "The query returns NULL" is not a blast radius.
- A one-way door earns a sentence saying what the rollback actually costs (a restore from backup, a follow-up migration, a manual data fix).

### Verification Guide guidelines
- Include when a reviewer can manually confirm the change on the dev environment (UI changes, data-display fixes, anything emulatable). Skip for pure-internal changes with nothing to observe.
- **Read `guide.md` in this skill and follow it to produce this section** — it covers discovering the repo's own verification rules, the four pillars (prerequisites / subject / fixture / steps), and **preparing a dev seed** when the environment lacks the data (resolving real ids, matching the app's query filters, a re-runnable upsert with cleanup, embedding the seed inline rather than citing a local file). Follow whatever it returns.
- Quick reference if you only need a reminder: cover **prerequisites** (auth, VPN, branch build, any upstream deploy dependency — verify it's live), **subject** (the exact user to emulate and why a look-alike won't work), **fixture** (real row/metric/insight ids, or a seed when dev data is synthetic), and **steps** (numbered, each with its expected result and a direct URL with real params; confirm path segments from the route/loader, not the name).
- Distinct from Test Plan after Merge: the guide is a reproducible how-to a reviewer runs **now**; the Test Plan is a post-merge checklist. When a guide is present, the Test Plan can stay a short checklist.
- Same accuracy rule applies: only cite fixtures, users, and columns that actually exist, and verify any upstream deploy dependency is genuinely live before claiming it.

### Tested guidelines
- Rank the evidence by how directly it proves the change works, and lead with the strongest available: a **screenshot** of the changed UI beats **execution output** (the exact test that failed before and passes now, a command's output), which beats a claim that something was checked.
- For a fixed bug, name the specific test or command that goes from failing to passing — that pair is the proof, where "tests pass" alone is not.
- List verifications that were **already run** in this session (e.g. `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`)
- Every item should be marked checked (`- [x]`) — these are things we did, not things to do
- Include the result summary when useful (e.g. "527 tests passed", "0 lint errors")
- Common items: typecheck, lint, tests, build, `npm install` without errors
- If no verifications were run yet, run the project's checks first, then list them here

#### Verification log for direct-query / direct-command checks

When the verification was run by issuing **specific commands or queries** (rather than a generic `npm test`-style invocation that produces its own log), include a `### Verification log` subsection inside `## Tested` with the actual evidence inline. This makes the PR self-contained for the reviewer — they can see exactly what was run and what came back without having to reproduce the session.

When this applies:

- DB migrations / functions verified by running SQL via a postgres MCP, `psql`, or similar
- Behavior verified via `curl`, `gh api`, `aws` CLI, or other one-off command invocations
- Browser-driven verifications where you captured concrete observed values (URLs, status codes, payloads) — not just "looked OK"
- Any case where a reviewer would otherwise have to ask "what did you actually run?"

What to include:

- A short prose note about the environment if non-obvious (e.g. "applied to a local Postgres with the test data set"), and any cleanup performed.
- For 1–3 checks: each as its own labeled `sql`/`bash`/`text` code block pair (one for the query/command, one for the result), separated by a one-line verdict.
- For 4+ checks: a Markdown table with columns `# | What | Query | Result | Verdict`. Use `<code>` / inline backticks for short queries; for queries longer than ~120 chars, summarize the call in the table cell and show the full SQL/command in a code block above the table.
- Use placeholder substitutions for UUIDs and any other long opaque values in inline cells (e.g. `<user>`, `<org>`, `<issuer>`); keep the actual values in the standalone code blocks above the table when they matter for reproducibility.
- Mark each row with ✅ / ❌ in the verdict column. Don't skip the verdict — that's what tells the reviewer the test actually proved something.

Do **not** convert ordinary `npm test` / lint runs into a verification log — the existing `- [x]` line is enough. The verification log is for cases where the reviewer benefits from seeing the exact query and the exact response.

### Test Plan after Merge guidelines
- Write actionable steps a developer can follow on the dev environment **after** the PR is merged
- Each item should be unchecked (`- [ ]`) describing a specific verification
- Include relevant dev server URLs or paths when applicable
- Cover runtime behavior, integration scenarios, and anything that can't be verified locally
- Examples: "Verify secret fetching works on dev", "Confirm login flow on staging", "Check dashboard renders with live data"

## 5. Clean the prose

Invoke the `avoid-ai-writing` skill with `--mode rewrite --voice technical --context technical-blog`, over the prose of the PR body only. A PR description is read by an engineer deciding whether to trust the change, so it has to read like the person who wrote the code, not like a model describing it.

Pass only the prose: Problem, Solution, the Merge danger lines, the Reviewer notes bullets, and the sentences introducing each Change outline view. Hold back the views themselves, code, commands, tables, identifiers, and quoted text. Those carry meaning by being exact.

One rewrite pass is enough here; the skill already runs its own corrective pass. Reserve `--iterate 2` for a body that still reads like a model after that.

Completion criterion: every prose sentence in the body survived the pass unchanged or came back rewritten, and the structure, code blocks, and identifiers are byte-identical to what step 4 produced.

## 6. Present output

Display the generated title and body to the user for review. Do **not** create the PR — that is the caller's responsibility.
