# Scope

## Sizes

Name tests by what they may touch, so the limits can be enforced by the runner rather than argued about.

| | Small | Medium | Large |
|---|---|---|---|
| Network | none | localhost only | yes |
| Database | none | yes | yes |
| Filesystem | none | yes | yes |
| External systems | none | discouraged | yes |
| Multiple threads | none | yes | yes |
| Sleeps | none | yes | yes |
| Time limit | 60 s | 300 s | 900 s+ |

A small test is a unit test, a large test is end-to-end, and a medium test proves that two layers agree. A small test that needs more than a few milliseconds is usually a medium test wearing the wrong label.

## Pick the level by the bug you are hunting

Three kinds of defect, and each has a level that catches it cheapest:

- **Logic** - the wrong branch, the wrong arithmetic, the unhandled edge. Most defects live here, they are the hardest to reproduce, and they are the most expensive to fix. Small tests catch them.
- **Wiring** - two components connected wrongly, or an output shape the next component does not accept. Rarer, and they fail loudly and consistently. Medium tests catch them.
- **Rendering** - it looks wrong, and only a human can say so. Rarest. A human catches them; a screenshot diff at most.

Aim for roughly 70% small, 20% medium, 10% large, and treat the shape as the target rather than the exact numbers. Two shapes to correct when you see them:

- **Ice-cream cone** - mostly end-to-end tests. Every failure needs a bisect through the whole product, one broken sign-in hides fifty other defects, and a fix waits a day for its verdict.
- **Hourglass** - many small, many large, almost nothing between. The missing middle means every cross-component question gets answered by the slowest tool available. Replace each large test that only proves two components agree with a medium test between exactly those two.

## Shrink the system under test

The value of a test falls as the system under test grows: more to build, more to start, more places for the defect to hide, more ways to flake. Before writing a large test, ask what it is really checking. If it checks that the client and server still agree on a protocol, extract the client's protocol layer and test that against a local server, and leave the UI to its own tests.

## Hermetic setups

A **hermetic** server starts on one machine with no network and still works. Build for it from the start:

- Inject every address of every dependency, through flags or the wiring layer.
- Bundle static assets into the binary.
- Let the datastore be replaceable by an in-memory implementation or a data file.
- Ship modules that load test data and that trace a request through the stack.

Then an end-to-end test starts the whole stack locally, and it is fast and deterministic. The cost is startup time and memory per test run, so keep hermetic end-to-end tests few.

## Fakes are the API owner's job

When a team publishes an API, that team writes and owns the fake. Run a shared set of tests against both the fake and the real implementation, and make the fake's owner responsible for any divergence. This puts the pain of a hard-to-use API on the people who can change it, and it gives every client a fast, honest way to test against it.

## Coverage

Coverage tells you which lines no test executed. It never tells you which lines are *checked*, because a line can run under a test that asserts nothing about it.

Use it this way:

- **Read the uncovered lines.** They are a list of untested code, and that list is the whole value of the metric.
- **Measure on the change, not on the codebase.** Coverage of a diff, shown during review, is the moment the author will act on it. A repository-wide percentage is a number nobody owns.
- **Aggregate across levels.** Coverage from unit tests plus integration tests together answers "what does the pipeline never exercise". Coverage from an integration test is partly incidental, so treat unit coverage as the stronger signal.
- **Watch the direction.** A gate on a drop in coverage is enforceable. A gate on an absolute target turns into a box to tick, and boxes get ticked with tests that assert nothing.
- **Ask whether the assertions bite.** Mutation testing answers this directly: change an operator or a constant in covered code and see whether any test notices. A surviving mutant is covered code with no test behind it.

Error-handling code is the most consistently uncovered code in any codebase, and it is the code that runs on the worst day. Cover it by faking the failure in the dependency.

## The cost of a test

Every test carries three costs, and only the first is one-time:

1. **Writing it.** Paid once, and set almost entirely by how testable the code is.
2. **Running it.** Paid on every run, by every engineer. A test that adds 20 minutes to the pre-submit run costs 20 minutes multiplied by everyone, forever.
3. **Failing it.** Paid on every failure, in diagnosis time. This is the cost that flakes and vague failure messages inflate without limit.

Its benefit is one number: the defects it kept out of production. So delete a test that cannot fail, a test that asserts only that a function did not throw, and a test that stays broken. Writing tests costs roughly 10% of development time when the code is testable; that ratio holds only while the suite stays free of tests that are all cost.
