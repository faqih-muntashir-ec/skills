---
name: write-pr-description
description: Generate a structured PR title and description from branch changes. Use when user wants to write a PR description, draft PR body, or prepare a pull request summary.
argument-hint: "[optional: base branch, defaults to master]"
---

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

**Accuracy rule**: Every claim in the PR description must be verifiable from the actual diff. Before writing each bullet in Solution or Implementation Details, confirm the corresponding file change exists in the diff. If a file was not modified, do not mention it. If a config was already in place and unchanged, do not claim it was added. Describe only what actually changed — not what you intended or planned to change.

Use this structure (no blank lines between section headers and their content):

```
## Problem
<1-2 sentences explaining the current situation / motivation>

## Solution
<1-2 sentences explaining what the PR does>

## Preview (only if the PR changes UI appearance)
| Before | After |
|--------|-------|
|        |       |

## Implementation Details
<bullet list of notable implementation choices>

### Reviewer notes (optional — include only when useful)
<bullet list of decisions another reviewer might question>

## Verification Guide (optional — include when the change is manually verifiable on dev)
<prerequisites, the exact user/subject to emulate, the fixture/data needed, and numbered steps each with its expected result>

## Tested
- [x] <checklist of verifications already performed before creating the PR>

## Test Plan after Merge
- [ ] <checklist of verifications that require the dev environment or can only be done post-merge>

Fix [TICKET-ID](https://<your-site>.atlassian.net/browse/TICKET-ID) (if applicable — always link to Jira URL)
```

Do not hard-wrap lines. Keep each paragraph or bullet on a single line and let the renderer handle wrapping.

### Preview guidelines
- **Always include the Preview section** when the PR changes UI appearance (layout, styling, colors, spacing, visibility of elements, etc.)
- Check the conversation for screenshots the user shared (bug reports, design comps) — use those as the "Before" image
- Check for screenshots taken during the session (e.g. via Playwright MCP) — use those as "After" images
- If you have both before and after images, embed them directly in the table cells using markdown image syntax
- If you only have a "Before" screenshot from the user's bug report, include it and note that "After" will be verified post-merge
- If no screenshots are available but the PR is clearly a UI change, include the table with placeholder notes asking the user to paste images via the GitHub web UI
- Images cannot be uploaded via CLI — when referencing local screenshots, add a note asking the user to paste them into the PR via the web UI

### Verification Guide guidelines
- Include when a reviewer can manually confirm the change on the dev environment (UI changes, data-display fixes, anything emulatable). Skip for pure-internal changes with nothing to observe.
- **Invoke the `write-verification-guide` skill via the Skill tool to produce this section** — it covers discovering the repo's own verification rules, the four pillars (prerequisites / subject / fixture / steps), and **preparing a dev seed** when the environment lacks the data (resolving real ids, matching the app's query filters, a re-runnable upsert with cleanup, embedding the seed inline rather than citing a local file). Follow whatever it returns.
- Quick reference if you only need a reminder: cover **prerequisites** (auth, VPN, branch build, any upstream deploy dependency — verify it's live), **subject** (the exact user to emulate and why a look-alike won't work), **fixture** (real row/metric/insight ids, or a seed when dev data is synthetic), and **steps** (numbered, each with its expected result and a direct URL with real params; confirm path segments from the route/loader, not the name).
- Distinct from Test Plan after Merge: the guide is a reproducible how-to a reviewer runs **now**; the Test Plan is a post-merge checklist. When a guide is present, the Test Plan can stay a short checklist.
- Same accuracy rule applies: only cite fixtures, users, and columns that actually exist, and verify any upstream deploy dependency is genuinely live before claiming it.

### Tested guidelines
- List verifications that were **already run** in this session (e.g. `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`)
- Every item should be marked checked (`- [x]`) — these are things we did, not things to do
- Include the result summary when useful (e.g. "527 tests passed", "0 lint errors")
- Common items: typecheck, lint, tests, build, `npm install` without errors
- If no verifications were run yet, leave this section empty — the `pre-pr-verify` hook will run them automatically before the PR is created

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

## 5. Humanize the PR body

Before presenting, apply the **humanizer** skill's patterns to the Problem, Solution, and Implementation Details sections. PR descriptions are technical writing read by engineers — they should sound like a person wrote them, not a language model.

Focus on these high-impact patterns (skip the full humanizer process — just do a single editing pass):

- **Remove significance inflation**: "pivotal", "crucial", "vital role", "key", "enhancing", "ensuring", "fostering" — replace with plain language
- **Remove promotional language**: "robust", "seamless", "comprehensive", "streamlined" — say what it actually does
- **Remove -ing filler**: "ensuring that...", "highlighting the...", "contributing to..." — cut or restructure
- **Remove copula avoidance**: "serves as", "stands as", "functions as" — use "is"
- **Remove AI vocabulary**: "Additionally", "leverage", "utilize", "facilitate", "delve", "landscape", "tapestry", "interplay", "underscore" — use normal words
- **Remove rule-of-three padding**: Don't force ideas into groups of three for rhetorical effect
- **Remove hedging**: "It should be noted that", "It is important to note" — just state the fact
- **Use straight quotes** (`"..."`) not curly quotes
- **Use sentence case** in headings (not Title Case) — except for proper nouns

Do **not** change the markdown structure, section headers, checklist items, or technical details (file names, function names, config values). Only edit the prose.

## 6. Present output

Display the generated title and body to the user for review. Do **not** create the PR — that is the caller's responsibility.
