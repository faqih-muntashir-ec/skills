---
name: write-a-prd
description: Create a PRD through user interview, codebase exploration, and module design, then save as a local Markdown file. Use when user wants to write a PRD, create a product requirements document, or plan a new feature.
---

You may skip steps you don't consider necessary.

1. Ask the user for a long, detailed description of the problem they want to solve and any potential ideas for solutions.

2. Explore relevant codebases to verify their assertions and understand the current state of the code.

   - Check the locally cloned repos — use the Explore agent to search for relevant code, patterns, components, routes, or services across candidate repos.
   - Consult your organization's repository catalog and internal docs to identify which repos are relevant to the problem domain.
   - If a relevant repo is not cloned locally, use `gh` CLI to browse or clone it from your GitHub org.
   - Look at existing architecture, patterns, database schemas, API contracts, and related features to ground the PRD in reality.

3. Interview the user relentlessly about every aspect of this plan until you reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one.

   **If the feature spans multiple repos (e.g. database + backend + frontend):** explicitly surface the deployment-order constraint during the interview. If your stack deploys in a fixed order (for example database → backends → frontends), then at every stage the layer being deployed must remain backward-compatible with the **currently-deployed** version of its consumers. So:

   - A DB function cannot start surfacing new rows / new shapes / NULL-able columns that the deployed backend's response contract can't represent. If a wider shape is needed, gate it behind a parameter so legacy callers keep getting the legacy shape.
   - A backend cannot require a column or behavior the DB hasn't shipped yet, and cannot start emitting a response shape the deployed frontend can't parse.
   - Confirm with the user how each layer will *temporarily* keep the legacy contract while the new contract rolls out (dual-shape responses, opt-in parameters, defense-in-depth filters at the consumer boundary, etc.). Capture the decision in **Implementation Decisions**.

4. Sketch out the major modules you will need to build or modify to complete the implementation. Actively look for opportunities to extract deep modules that can be tested in isolation.

A deep module (as opposed to a shallow module) is one which encapsulates a lot of functionality in a simple, testable interface which rarely changes.

Check with the user that these modules match their expectations. Check with the user which modules they want tests written for.

5. Once you have a complete understanding of the problem and solution, use the template below to write the PRD. Create `./prds/` if it doesn't exist. Save the PRD as a Markdown file named after the feature (e.g. `./prds/user-onboarding.md`).

<prd-template>

## Problem Statement

The problem that the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## User Stories

A LONG, numbered list of user stories. Each user story should be in the format of:

1. As an <actor>, I want a <feature>, so that <benefit>

<user-story-example>
1. As a mobile bank customer, I want to see balance on my accounts, so that I can make better informed decisions about my spending
</user-story-example>

This list of user stories should be extremely extensive and cover all aspects of the feature.

## Implementation Decisions

A list of implementation decisions that were made. This can include:

- The modules that will be built/modified
- The interfaces of those modules that will be modified
- Technical clarifications from the developer
- Architectural decisions
- Schema changes
- API contracts
- Specific interactions

Do NOT include specific file paths or code snippets. They may end up being outdated very quickly.

## Testing Decisions

A list of testing decisions that were made. Include:

- A description of what makes a good test (only test external behavior, not implementation details)
- Which modules will be tested
- Prior art for the tests (i.e. similar types of tests in the codebase)

## Out of Scope

A description of the things that are out of scope for this PRD.

## Further Notes

Any further notes about the feature.

</prd-template>
