---
name: update-pr-description
description: Update the description of an existing PR to reflect the latest changes, preserving content that cannot be regenerated (screenshots, reviewer-specific notes). Use when user wants to refresh, update, or sync the PR description with the current branch state.
argument-hint: "[optional: PR number, defaults to current branch's PR]"
---

# Update PR Description

Follow these steps in order. The critical rule: **read the current PR description first** and preserve content that cannot be regenerated from the diff alone — especially uploaded images, since `gh` CLI and MCP cannot upload new images to GitHub.

## 1. Fetch the current PR

Determine which PR to update:
- If the user provided a PR number, use that
- Otherwise, use `gh pr view --json number,title,body,url,headRefName,baseRefName` to find the PR for the current branch

Read the **full current body** — do not skim. Identify content that cannot be regenerated from the diff:

- **Embedded images** — any `![alt](https://github.com/user-attachments/...)` or `<img src="...">` tags. These were uploaded via the GitHub web UI and **cannot be re-uploaded** via CLI/MCP. If you lose them, the user has to re-upload manually.
- **Screenshots in tables** — Preview sections with Before/After images
- **Links to external resources** — Loom videos, Figma links, design comps, Slack threads
- **Reviewer-specific discussion** — notes added in response to review feedback that aren't derivable from the diff
- **Manual test evidence** — specific test output, dev environment URLs, user-confirmed behavior
- **Verification log blocks** — `### Verification log` subsections with actual queries/commands and their results (e.g. SQL run via a postgres MCP, `curl` invocations, `gh api` output). These are typically captured during the session and should be preserved verbatim if still accurate. If new verification was run for this update, append rows/blocks rather than discarding the existing log.
- **Verification Guide blocks** — a `## Verification Guide` section carries session-derived specifics (the embedded seed SQL, resolved subject/account ids, real dev URLs) that the diff alone can't regenerate. Preserve it. Only re-derive it (via the `write-verification-guide` skill) if the change it describes has materially shifted or the guide is now stale.
- **Stacked PR pointers** — links to related PRs in a stack
- **Convention-defined sections** — if a **convention skill** governs this PR (step 2), the specialized sections it mandates (e.g. porting-decision subsections, harness/validation tables) cannot be reproduced by the generic generator; preserve them the same way.

Make a mental (or explicit) list of these preserved blocks before regenerating.

## 2. Regenerate the body — via the project's convention skill if one applies

**First, check for a convention skill.** A project may ship a skill that governs the PR description for a specific kind of change — its own required sections and evidence format (e.g. a metric-port skill for a `generate_scores_*` diff, keyed by branch/path/diff shape, or named by the user). Scan the available skills for one whose description matches this PR's change.

**If a convention skill applies, follow it — do not run `write-pr-description`.** The generic generator emits only the canonical Problem/Solution/… shape and would overwrite the convention's specialized structure (e.g. porting-decision subsections, harness-sourced validation tables). Treat every section the convention mandates but the diff alone can't reproduce as preserved content (step 1 rules): keep it, and regenerate only the parts the convention says are regenerable — typically the results/validation section, from freshly-sourced data.

**Otherwise, invoke `write-pr-description`** via the Skill tool to generate a fresh title and body from the current branch state (pass the base branch if provided). It produces the canonical Problem / Solution / Implementation Details / Tested / Test Plan structure from the diff.

Completion criterion: the regenerated body carries the structure the governing convention requires (or the canonical structure when none applies), and every convention-mandated non-regenerable section survived.

## 3. Merge preserved content into the regenerated body

Integrate the preserved content from step 1 into the regenerated body:

- **Preview section with images**: If the old body had a Preview table with uploaded screenshots, copy that entire section verbatim into the new body (place it between Solution and Implementation Details, matching the write-pr-description structure).
- **Reviewer notes that still apply**: Keep reviewer-specific notes that remain relevant. Drop notes that are now obsolete (e.g. "waiting on API PR #37" when that PR is merged).
- **External links**: Keep Loom/Figma/Slack links in their original section.
- **Tested items with evidence**: If the old body had specific test evidence (e.g. "Verified on dev: https://..."), preserve those lines rather than replacing with generic claims.
- **Test Plan items that moved to Tested**: Per user preference, if a Test Plan item has been verified during the session (screenshots, manual testing), move it to Tested as checked — do not leave it in Test Plan.

Accuracy rule still applies: every claim in the new body must match the current diff. If the old body mentioned a file that no longer exists in the diff, drop that claim.

## 4. Show the diff to the user (optional but recommended)

Before pushing the update, briefly summarize what changed between the old and new description:
- What was removed (obsolete claims, resolved WIP notes)
- What was added (new implementation details from recent commits)
- What was preserved (screenshots, reviewer notes)

Keep this under 5 bullets. Skip it if the update is trivial (one-line change).

## 5. Update the PR

Run `gh pr edit <number> --body "$(cat <<'EOF' ... EOF)"` with the merged body. Use a HEREDOC to ensure correct formatting.

**Do not escape backticks inside the heredoc.** With a quoted delimiter (`<<'EOF'`) there is no command substitution, so write code fences as literal triple-backticks — never backslash-escaped. Escaped backticks reach GitHub as literal characters and the fenced blocks render as plain text.

If the **title** also needs updating (e.g. scope changed, tickets added), update it with `--title` in the same command. Keep it in sync with the head commit's Conventional Commit subject (`git log -1 --format=%s`) — reuse that subject and only prepend `[TICKET-ID]`; don't reword it.

Do not push commits or create new PRs — this skill only updates description metadata.

## 6. Report

Return the PR URL and a one-line summary of what changed. Do not paste the full new body back to the user unless they ask.
