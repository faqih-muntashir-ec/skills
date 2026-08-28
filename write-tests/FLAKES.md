# Flakes

A **flake** is a test that produces both a pass and a fail on the same code. It costs twice: it hides the real regressions inside it, and it trains the team to dismiss failures. At Google's scale roughly 1.5% of test runs flake, and about 84% of pass-to-fail transitions in continuous integration turn out to be flakes rather than breakages.

## Start with size

Flakiness tracks the size of the test far more strongly than the tool it uses. Measured across Google's corpus: 0.5% of small tests flake, 1.6% of medium, and 14% of large. Binary size and memory use each correlate with flakiness at r-squared above 0.75, while switching frameworks moves the number by a few points at most.

So the first question about a flaky test is not "which wait is wrong" but **"what can this test stop exercising and still catch its bug?"** Shrinking the system under test fixes more flakes than any retry policy.

## Causes and fixes

**Shared state between tests.** The test passes alone and fails in the suite, or fails only in a particular order.
Fix: give each test its own data. Create the rows the test needs inside the test. Reserve a pool of test accounts with a lock, or run one database per worker. Require that tests pass in any order, and run them shuffled to prove it.

**A real clock.** Sleeps, timeouts, "expires after 30 days", tests that fail near midnight or at a month boundary.
Fix: inject the clock and advance it explicitly. A test that sleeps is a test that is guessing.

**A real network or an external service.** Every test fails at once, for one shared reason.
Fix: make the setup hermetic - the whole system under test starts on one machine with no network. Inject every address, bundle static assets, and back the datastore with an in-memory implementation. Where an external service must stay, block the parts the test does not assert on.

**A wait that is too short.** Passes on an idle machine, fails under load.
Fix: stop guessing durations. Wait for an explicit signal from the system - a flag the code sets, an element the UI renders when it is done - and give the timeout a generous ceiling that only trips on a genuine hang.

**A wait that is too long.** The test hangs for the full timeout when the server has already returned a 500.
Fix: poll for the known error conditions alongside the success condition, and fail immediately with the error text when one appears.

**Concurrency.** Races and deadlocks that appear only under specific interleavings.
Fix: simplify the synchronization before adding tests to it. Acquire locks in one fixed order everywhere. Prefer fewer, coarser locks until a measurement demands more. Run the thread and memory sanitizers in continuous integration.

**Undefined order.** The test depends on the iteration order of a set or a map, or on a query without an `ORDER BY`.
Fix: sort before asserting, or assert on the collection as a set.

**Randomness.** Generated identifiers, random test data, timestamps used as keys.
Fix: seed the generator and print the seed in the failure, or use fixed values.

**Resource limits.** Fails only on the loaded continuous-integration machine.
Fix: measure what the test actually needs, then either cut the requirement or reserve the resources explicitly.

## Handling a flake you have not fixed yet

Rank these by cost, and take the cheapest that is honest:

1. **Fix the cause.** Always available; usually smaller than it looks once the size question above is answered.
2. **Delete the test.** A test nobody trusts has negative value. If a smaller test already covers the same bug, deleting is the correct fix, not a retreat.
3. **Quarantine it.** Take it off the critical path, file the bug, and state in the bug what regression is now unguarded. Quarantine hides real races, so it buys time rather than solving anything.

Rerunning until green is the option that looks cheapest and is not. A "fails three times in a row" rule turns a 15-minute test into a 45-minute wait, and teaches everyone that the first two failures mean nothing.

## Turn each failure into better diagnostics

When a test fails and you cannot tell why from its output, improve the output before fixing the bug. Log the environment, the initial state, each interaction with the system, and both the expected and the actual result. Keep verbose per-step detail in an in-memory buffer, discard it when the test passes, and print all of it when the test fails. The next occurrence then diagnoses itself.
