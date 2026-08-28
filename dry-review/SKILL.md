---
name: dry-review
description: Review a pull request without posting any comments. Shows the review in the terminal only. Use when user wants a local-only PR review, a dry run review, or to review without leaving feedback on GitHub.
argument-hint: "<PR number or URL>"
---

# Dry Review (No Comments)

Follow these steps:

1. If no PR number is provided in the args, run `gh pr list` to show open PRs
2. If a PR number or URL is provided, run `gh pr view <number>` to get PR details
3. Run `gh pr diff <number>` to get the diff
4. Run the **thermo-nuclear-code-quality-review** skill against this diff (invoke it via the Skill tool) and fold its maintainability/structural findings into your review.
5. Analyze the changes and provide a thorough code review that includes:
   - Overview of what the PR does
   - Analysis of code quality and style
   - Specific suggestions for improvements
   - Any potential issues or risks

Keep your review concise but thorough. Focus on:
- Code correctness
- Following project conventions
- Performance implications
- Test coverage
- Security considerations

Format your review with clear sections and bullet points.

**CRITICAL: Do NOT post any comments, reviews, or feedback to GitHub. Do NOT use `gh pr review`, `gh pr comment`, or any GitHub API that writes to the PR. Output the review to the terminal only.**
