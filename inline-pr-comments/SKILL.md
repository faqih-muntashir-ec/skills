---
name: inline-pr-comments
description: Post PR review findings as inline comments anchored to file:line, keeping the review body to the summary alone. Use when submitting a code review to GitHub, when the code-reviewer agent reaches review submission, or when another skill needs the inline-comment submission format.
---

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
  "body": "## Summary\n\n**Assessment**: REQUEST_CHANGES\n**Stack**: SSR\n**Jira**: PROJ-1234 - 2/3 criteria met\n**Commits**: Compliant\n\n## Verification\n- [x] Dependencies synchronized\n- [x] Self-verification passed\n**Confidence**: HIGH",
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
