---
name: write-verification-guide
description: Write a reproducible "Verification Guide" for a PR — the run-now how-to a reviewer follows to confirm a change on a dev/staging environment, including preparing a seed when the environment lacks the data. Use when adding a Verification Guide to a PR description, when a reviewer needs steps to manually confirm a fix, or when dev data must be seeded to make a change observable.
argument-hint: "[optional: PR number or short description of what to verify]"
---

# Write Verification Guide

A **Verification Guide** is the section of a PR a reviewer runs *now* to confirm the change behaves as claimed — distinct from "Test Plan after Merge" (a post-merge checklist) and from "Tested" (what you already ran). It names the exact environment, subject, data, route, and the expected result at each step, so a reviewer reproduces the result without reverse-engineering the session.

## 0. Every repo verifies differently — discover its rules FIRST

**Do not assume the patterns below apply.** Before writing anything, find how *this* repo expects a change to be verified. Check, in order:

1. The repo's `CLAUDE.md` / `AGENTS.md` / `README` and any `docs/` notes on local dev, seeding, emulation, auth, or test environments.
2. Repo- or project-scoped skills that already encode the flow (e.g. a `/verify`, `/run`, `/test-*`, or app-launch skill; a migration-test skill; an API smoke-test skill). Prefer invoking those over hand-rolling steps.
3. Recent merged PRs on the same area — copy their Verification Guide shape, seed approach, and the exact subjects/ids they used (those are known-good).
4. Session-specific prerequisites the repo's instructions call out (VPN, SSO profile, a temporary config tweak, a tunnel, a feature flag).

What changes per repo: how you authenticate, how you impersonate/emulate a user, where dev data comes from (seeded vs. synthetic vs. live), which query path the UI actually hits, and the URL shape. Lift those specifics from the repo, not from memory.

## When to write one (and when to skip)

Write a guide when a reviewer can observe the change on a running environment: UI changes, data-display fixes, anything emulatable, an endpoint's behavior, a migration's effect. Skip it for pure-internal changes with nothing to observe (a refactor with no behavior change, a type-only change) — the "Tested" section is enough there.

## The four pillars

Cover all four. A guide missing any one of them usually fails to reproduce.

- **Prerequisites** — the environment to be on: auth (the exact login command / SSO profile), VPN/network, a build of the branch, any temporary config the repo requires, and any **upstream deploy dependency** (name the other PR/service and state whether it is *already live* on the target env — verify, don't assume).
- **Subject** — the exact user/account/tenant to act as, and *why it must be that one*. Call out look-alikes that won't work and the reason (wrong module/role/permission, so the thing never appears). When the app impersonates, state the rule (e.g. "the emulated actor must equal the subject in the URL").
- **Fixture** — the specific data needed to see the change. Cite the real row id / metric id / insight id when one already exists. If the environment only has synthetic or empty data, you must **prepare a seed** (next section).
- **Steps** — numbered, each with its **expected result** (the literal value or UI state to confirm). When the fix changes a rendered value, give **before vs. after** ("on this branch X; on master Y"). Give the **direct URL** for each step with real path params resolved — no placeholders. State the URL shape once so the reviewer can adapt it. **Confirm what each path segment actually is by reading the route/loader, not by guessing from its name** (a segment named `insightId` may be an insight *instance* id downstream). Note any precondition a URL depends on.

## Preparing a seed

When the target environment can't show the change with existing data, seed it. A good seed is *minimal, real-resolved, observable, and reversible.*

1. **Find the exact query path the app uses** — the DB function, view, or endpoint the feature calls, and read its **filter clauses**. The seed must satisfy every filter (subject join, null/not-null columns, type guards, presence checks) or the row won't surface. Don't seed against the table blindly; seed against what the function selects.
2. **Resolve real identifiers — never fabricate.** Look up the actual subject id, its id in *each* representation the system uses (e.g. legacy integer id for a DB filter vs. the UUID the route expects — confirm which mapping the route uses against a known-good example), and the real metric/insight/entity id. Generate UUIDs/tokens/hashes programmatically; never hand-type a value that must be structurally valid.
3. **Make the fixture carry the shape under test.** Seed the *buggy* (or relevant) shape so the fix is visibly the thing that changes it — e.g. the pre-fix labels/format — and keep the rest realistic enough to render.
4. **Make it re-runnable and reversible.** Use upsert (`ON CONFLICT ... DO UPDATE`) keyed on the real primary key, pick a reserved/high id unlikely to collide (e.g. derived from the ticket number), include a **verification query that calls the same function the app calls** (expect it to return the seeded row), and a commented **cleanup** (`DELETE`) so the env can be restored.
5. **Follow the user's data/SQL conventions.** (For this user: SQL is run in DataGrip — no `psql` meta-commands like `\set`/`\copy`/`\gexec`; inline literal values, not `:vars`; plain SQL / `DO $$ … $$` / CTEs are fine.) Use dollar-quoting for embedded JSON to avoid escaping pain.
6. **If your DB tooling is read-only** (e.g. a read-only MCP), you can't run the INSERT yourself. Then: (a) **validate the read path** — call the app's query function with the seed's params and confirm it returns *zero* rows now (so the seed is demonstrably what makes the change appear), and (b) hand the seed to the reviewer to run (embed it in the guide — see below).

## Where the seed lives — and the no-local-references rule

- A seed script is a **local dev artifact**: do **not** commit it to the repo and do **not** cite its local filename in the PR body (external reviewers can't see local files; the reference rots).
- Instead, **embed the seed SQL inline** in the Verification Guide so the PR is self-contained. If the user asked you to "prepare the seed in this directory", also write the `.sql` file locally (re-runnable, with verify + cleanup) for their own use — but keep it untracked and unreferenced in the PR.

## Verification log (when you ran direct queries/commands)

If *you* verified something by running specific queries/commands (SQL via a DB MCP, `curl`, `gh api`, `aws`, browser-captured concrete values), record it as a `### Verification log` subsection under `## Tested` with the actual query and result inline, each row/block ending in a ✅/❌ verdict — so the PR is self-contained. Don't convert ordinary `npm test`/lint runs into a log; a `- [x]` line covers those.

## Output

Produce a `## Verification Guide` markdown block ready to drop into the PR body: a short prerequisites/subject paragraph, the inline seed (in a fenced ```sql block) when one is needed, a numbered step list with direct URLs and expected results, and a one-line cleanup. Keep every cited id/subject/URL real and resolved. Same accuracy rule as the rest of the PR: only reference fixtures, users, columns, and upstream dependencies that actually exist and are actually live.
