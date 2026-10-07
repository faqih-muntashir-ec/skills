# Create Pull Request

Follow these steps in order. Each step names the skill, agent or sibling file that owns that part of the work. Use it instead of doing the work inline, so the output matches the format those files set.

## 1. Read the Jira ticket (if applicable)

If the branch name contains a ticket ID (e.g. `fix/proj-668`, `feat/PROJ-123`):
- Extract the ticket ID from the branch name
- Use the Atlassian MCP tool (`getJiraIssue`) to fetch the full ticket context
- Use the ticket summary, description, and acceptance criteria to enrich the PR description

## 2. Review the code

Run **both** of these and address any critical issues found before proceeding:
- **Invoke the `code-reviewer` agent via the Agent tool** (`subagent_type: "code-reviewer:code-reviewer"`) to review the diff between the current branch and `master`.
- **Invoke the `thermo-nuclear-code-quality-review` skill via the Skill tool** for a deep code-quality pass on the same diff.

## 3. Commit

**Invoke the `write-commit-message` skill via the Skill tool** to generate a Conventional Commits message, stage changes, and commit. Do NOT ask for confirmation — stage and commit directly.

## 4. Show UI changes in the real app

Run this step when the diff changes anything a user sees in the UI. Otherwise go to step 5.

Run the base branch and your branch locally, and take one before/after screenshot pair per visible change, uploaded, with its Preview row. Also drive the changed flow once as a real user, and keep what you saw for the Tested section. Pass the Preview rows and the observed results to step 5.

Done when: every visible change has an uploaded pair whose diff image shows only that change.

## 5. Create the PR

**Read `describe.md` in this skill and follow it** to generate the PR title and body. `describe.md` owns the PR format. Pass the base branch argument if the user specified one (default: `master`). Also pass any additional context the user provided (e.g. "mention why X" or "include Y") so `describe.md` can incorporate it.

Then push the branch and create the PR using `gh pr create` with the title and body produced by `describe.md`.

Call `link_pull_request` with the new PR's URL, so T3 shows the PR on this thread.
