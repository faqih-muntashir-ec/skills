# Inline PR comments

This skill replaces the Output Format and GitHub review submission behavior of the code-reviewer plugin agent. When that agent reaches review submission, follow the steps here in place of its default "Output Format" and "GitHub Approval Comments" sections.

## Where each finding goes

Anchor every finding to the `path` and `line` it refers to, so it lands as an inline comment. This covers critical issues, code quality issues, architecture recommendations, and suggestions. The review body carries the summary and verification sections alone.

`line` is the line number in the **new** version of the file (the `+` side of the diff):

1. Run `gh pr diff {number}`.
2. Locate the file and line for the finding.
3. Read the line number off the right side of the diff.

GitHub only accepts inline comments on lines inside the diff. A finding about pre-existing, unmodified code goes in the review body instead.

## Review body format

```markdown
## Summary

**Assessment**: [APPROVE / REQUEST_CHANGES / COMMENT]
**Stack**: [detected stack, e.g. SSR / SPA / etc.] (detected/specified)
**Jira**: [Ticket ID + validation summary, or N/A]
**PR Comments**: [X total (Y general, Z inline), W exceptions accepted]
**Commits**: [Compliant / Issues found]

## Jira Acceptance Criteria
[From jira-acceptance-criteria skill - or N/A]

## PR Comment Analysis

### Existing Comments Found
| Source | Author | File/Line | Summary | Status |
|--------|--------|-----------|---------|--------|
| Inline | @user | file.ts:45 | Issue description | Addressed/Unresolved/Valid |

### Unresolved Issues from Comments
- [List any issues raised in comments that are NOT yet addressed]

### Justified Exceptions
- [List any flagged patterns that have valid justifications in comments]

## Verification
- [x] Dependencies synchronized
- [x] Jira criteria validated
- [x] PR comments analyzed
- [x] Self-verification passed
**Confidence**: [HIGH / MEDIUM / LOW]
```

## Inline comment format

- Blocking issue: state the problem, why it matters, and the fix. Add a code suggestion where one applies.
- Suggestion or nit: state what to improve and why.

### When a finding earns a picture

A finding that sits on one line reads fine as prose. A finding whose subject is a **shape** costs the author a mental reconstruction that a six-line sketch hands them for free: a call path across several files, a control-flow branch that is missing, a state two places disagree about, a layout this PR reorganises. Sketch those. Leave every other finding as prose, because a diagram on a one-line nit buries the nit.

Pick the smallest form that carries the point:

| Form | Use it for |
|---|---|
| Pseudocode | logic, an algorithm, a control-flow branch |
| Call tree | runtime order across functions |
| Component tree | UI structure, with the state and module boundaries that matter |
| Shallow file tree | file responsibility, or a layout this PR reorganises |
| `diff` of any of the four above | a shape that exists already, where the point is what changes |
| Mermaid `sequenceDiagram` | interaction between parts over time |

The `diff` form fits most findings, because a PR comment argues about a change. Match the diff shape to the topic — here, a call tree:

```diff
 submitForm
   createSession
+    validateSession
     launchAgent
-  navigateToSession
```

Every visual ships as a fenced block inside the comment body, where GitHub renders both markdown and Mermaid. The comment column is narrow, so hold a sketch to about 10 lines and a Mermaid graph to about 6 nodes, and keep only the calls, files, props and states the finding turns on. One visual per comment, at most.

## Clean the prose

Run this before you build the payload, so the pass never sees the JSON.

Invoke the `avoid-ai-writing` skill with `--mode rewrite --voice blunt --context technical-blog`, so the author reads the author's words instead of model phrasing. Pass the body text of every finding and the prose of the review summary. Hold back the `path` and `line` anchors, code suggestion blocks, every fenced sketch or diagram, the checklist lines, and the payload itself. `~/.claude/docs/prose-cleanup.md` carries the general pass and hold-back rules, plus the condition for skipping the pass on a finding too short to argue anything.

Done when every finding body and the summary has been through the pass, and every anchor, identifier, and code block reads exactly as it did before.

## Submitting the review

`gh pr review` has no support for inline comments, so submit through `gh api`:

1. Get the head commit SHA: `gh api repos/{owner}/{repo}/pulls/{number} --jq '.head.sha'`
2. Build the JSON payload: review body plus a `comments` array holding every finding.
3. Write the JSON to a temp file, which keeps the shell out of the escaping.
4. Submit: `gh api repos/{owner}/{repo}/pulls/{number}/reviews --input <json-file>`

### Payload structure

```json
{
  "commit_id": "<head_sha>",
  "event": "REQUEST_CHANGES | APPROVE | COMMENT",
  "body": "<review summary in markdown>",
  "comments": [
    {
      "path": "relative/path/to/file.ts",
      "line": 42,
      "body": "Inline comment explaining the issue or suggestion."
    }
  ]
}
```

### Example: REQUEST_CHANGES with inline comments

```bash
# 1. Get head SHA
HEAD_SHA=$(gh api repos/{owner}/{repo}/pulls/{number} --jq '.head.sha')

# 2. Write JSON payload to temp file
cat <<REVIEW_EOF > /tmp/pr-review.json
{
  "commit_id": "$HEAD_SHA",
  "event": "REQUEST_CHANGES",
  "body": "## Summary\n\n**Assessment**: REQUEST_CHANGES\n**Stack**: SSR\n**Jira**: TOOL-1234 - 2/3 criteria met\n**Commits**: Compliant\n\n## Verification\n- [x] Dependencies synchronized\n- [x] Self-verification passed\n**Confidence**: HIGH",
  "comments": [
    {
      "path": "src/controllers/example-controller.ts",
      "line": 63,
      "body": "The \`result.authorized\` field is never checked. If the service returns \`{ authorized: false }\` with 200 OK, the controller proceeds despite failed authorization.\n\n\`\`\`ts\nif (result instanceof Error || !result.authorized) {\n\`\`\`"
    },
    {
      "path": "src/views/example-launch.ts",
      "line": 47,
      "body": "Nit: Route naming — other auth routes use \`/authorize/*\` pattern. Consider \`/password/authorize\` for consistency."
    }
  ]
}
REVIEW_EOF

# 3. Submit
gh api repos/{owner}/{repo}/pulls/{number}/reviews --input /tmp/pr-review.json
```

### Example: APPROVE with no inline comments

A clean approval has no `comments` array, so the simpler `gh pr review` works:

```bash
gh pr review 123 --approve --body "$(cat <<'EOF'
## Summary

**Assessment**: APPROVE
**Stack**: SSR (detected)
**Jira**: PROJ-123 - All criteria met
**Commits**: Compliant

## Verification
- [x] Dependencies synchronized
- [x] Jira criteria validated
- [x] PR comments analyzed
- [x] Self-verification passed
**Confidence**: HIGH
EOF
)"
```
