# Dry Review (No Comments)

Follow these steps:

1. If no PR number is provided in the args, run `gh pr list` to show open PRs
2. If a PR number or URL is provided, run `gh pr view <number>` to get PR details
3. Run `gh pr diff <number>` to get the diff
   - **Find the Jira ticket before writing any finding.** The ticket states the intended behaviour, and the diff alone cannot. Search the PR title, the head branch (`gh pr view <number> --json headRefName`), the commit messages, and the body for a `CINS-1234`-style key. A missing key in the title does not mean there is no ticket: branches like `arif/CINS-2285` often carry the only copy. Read the ticket with the Atlassian MCP (`getJiraIssue`), and check each acceptance criterion against the diff. Raise "what is this PR meant to do?" as an open question only when no ticket exists or the ticket does not answer it.
   - **Read the consumer when the diff sends something to another system.** A CLI flag, a message payload, or an API field means only what the receiving code does with it. Open that code in the local repo and trace how the value is read, before judging when the diff should send it.
4. Run the **thermo-nuclear-code-quality-review** skill against this diff (invoke it via the Skill tool) and fold its maintainability/structural findings into your review.
5. Load the rulebooks the diff needs. These skills hold the standard the reviewed code must meet, so a finding cites a rule instead of a preference. Invoke each one via the Skill tool when its trigger appears in the diff:

   | Load | When the diff contains |
   |---|---|
   | `simplify-code` | any changed logic — nesting, conditions, abstraction levels, primitives, new flags or interfaces |
   | `name-things` | a new or renamed variable, function, class, file, or test |
   | `write-code-comments` | an added or edited comment or docstring |
   | `write-tests` | a changed or missing test |
   | `write-logs-and-errors` | a log line, a `try`/`catch`, or a raised exception |

   Skip a rulebook the diff never touches. Loading all five on a one-line change wastes the review.

6. Load `write-review-feedback` on every review. It governs how each finding is worded, so the author can act on it without asking what you meant.

7. Sketch the findings that have a **shape**. A finding sitting on one line reads fine as prose. A finding whose subject is a shape costs the reader a mental reconstruction that a six-line sketch hands them for free: a call path across several files, a control-flow branch that is missing, a state two places disagree about, a layout this PR reorganises. Sketch those, and leave the rest as prose, because a diagram on a one-line nit buries the nit.

   Pick the smallest form that carries the point:

   - **Pseudocode** for logic, an algorithm, or a control-flow branch.
   - **Call tree** for runtime order across functions.
   - **Component tree** for UI structure, with the state and module boundaries that matter.
   - **Shallow file tree** for file responsibility, or a layout this PR reorganises.
   - **`diff` of any of the four above** when the shape exists already and the point is what changes. This fits most findings. Match the diff shape to the topic:

   ```diff
    submitForm
      createSession
   +    validateSession
        launchAgent
   -  navigateToSession
   ```

   Place each sketch directly under the finding it explains, and keep only the calls, files, props and states the finding turns on. This review lands in a terminal, so every sketch is plain text in a fenced block, under about 12 lines. A Mermaid diagram or an HTML page needs a browser: offer one only when the reader asks to see the review there.

8. Analyze the changes and produce the review:
   - Overview of what the PR does
   - Findings, each one naming the rule it breaks and the file:line it breaks it at
   - Specific suggestions for improvements
   - Any potential issues or risks

Keep your review concise but thorough. Beyond the loaded rulebooks, check:
- Code correctness
- Following project conventions
- Performance implications
- Test coverage
- Security considerations

Format your review with clear sections and bullet points.

## Completion criteria

- The Jira ticket was located (title, branch, commits, or body) and each acceptance criterion was checked against the diff, or the review states that no ticket was found.
- Every rulebook whose trigger appears in the diff was loaded before the findings were written.
- Every finding names its rule and its `file:line`.
- Every finding is worded to the `write-review-feedback` rules: about the code, with its reason, and marked `Nit` or `Optional` when it does not block.
- Every finding whose subject is a shape (a call path, a missing branch, a state two places disagree about, a layout change) carries one plain-text sketch under it.

**CRITICAL: Do NOT post any comments, reviews, or feedback to GitHub. Do NOT use `gh pr review`, `gh pr comment`, or any GitHub API that writes to the PR. Output the review to the terminal only.**
