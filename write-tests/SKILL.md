---
name: write-tests
description: Rules for tests that survive refactoring - real objects over mocks, DAMP setup, narrow assertions on state, behavior-named cases, no tautological assertions, verified-failing before trusted. Use when adding or changing a test, when a refactor breaks tests that should have passed, when a test passes no matter what the code does, when a test gives both results on the same code, or when code resists being tested.
---

# Write tests

A test earns its keep by failing exactly once: when the behavior it names breaks. Every rule here protects that property.

## The loop

Run this for each behavior under test. Finish one loop before starting the next.

1. **Name the behavior.** Write the test name as a sentence with a condition and a result: `emptyCart_checkout_throwsEmptyCartError`. The name is the specification; the body only demonstrates it. A name that mentions a method rather than a behavior means the behavior is still undecided, so decide it before writing the body.
2. **Arrange with the real thing.** Construct the real collaborator. Climb the double ladder below only as far as the real object forces you.
3. **Act once.** One call to the code under test, so a failure points at one line.
4. **Assert narrowly.** Assert the state the name promised and nothing else, so unrelated changes leave the test green.
5. **Watch it fail for the named reason.** Run the test against the unfixed bug, or break the line it covers. Read the failure text. A test that has never failed proves nothing, and a failure text that fails to name the wrong value costs the next reader an hour.
6. **Make it pass**, then re-read the test as a stranger would. If the reader needs another file to know why the assertion is correct, inline what is missing.

## Test doubles: stay as high on the ladder as the code allows

Each rung down trades fidelity for control. Take the lowest rung only when the rung above is unavailable.

1. **Real object.** Default. Use it whenever construction is cheap and behavior is deterministic: value objects, pure logic, in-memory collections.
2. **Fake.** A working, simplified implementation (in-memory repository, in-memory clock). Use it when the real object needs a network, a disk, or a clock. A fake is owned and tested by the team that owns the real thing, so it stays honest as the real API moves.
3. **Stub.** A canned return value. Use it to steer the code under test into a branch the real object reaches rarely (a timeout, a 500, a rate limit).
4. **Mock with verified interactions.** Use it only when the interaction *is* the behavior: "the payment gateway is charged exactly once", "the audit log records the deletion". Verifying a call that is merely a step toward the result makes the test a change-detector.

A test whose setup is mostly double configuration is telling you the code under test asks for too much. Read `TESTABILITY.md` and fix the code instead of the test.

## Assert on state, not on the path taken

A **change-detector** test restates the implementation, so refactoring turns it red while the product still works. It teaches the team to update tests without reading them, which is how a real regression gets waved through.

- Assert the value returned, the state left behind, or the message sent to the outside world.
- Let call order, private helpers, and intermediate values stay unasserted.
- Treat a refactor that breaks tests without changing behavior as a defect in those tests, and rewrite them around the public result.

## Tautological tests: an assertion that is true by construction

A **tautological** test asserts something the code cannot make false, so it stays green while the product breaks. It costs a full test to run and maintain, returns nothing, and reports as coverage, which is how an untested path gets signed off as tested. Treat one as a defect and rewrite it.

Three shapes, and the assertion each one wants instead:

- **Asserting a double's own return value.** The test stubs `repo.find` to return `user`, calls code that hands that value straight back, and asserts the result is `user`. It proves the stub works. Assert a value the code under test computed itself, or drop the double and use the real object.
- **Computing the expected value with the code under test.** `expect(total(cart)).toEqual(cart.items.reduce(sumPrices, 0))` runs the same logic on both sides, so the two move together forever and a wrong `sumPrices` passes. Write the expected value as a literal: `toEqual(4250)`.
- **Asserting only what the language already guarantees.** `expect(result).toBeDefined()`, `expect(() => parse(input)).not.toThrow()`, `expect(items.length).toBeGreaterThanOrEqual(0)`. Name the value the behavior promises and assert that value.

Step 5 of the loop is the detector: break the line the test covers, and read what the test says. Green there means tautological, whatever the test name claims.

## DAMP over DRY

Test code and production code want opposite things. Production code hides repetition; test code shows it.

- Put the values that make the case special inside the test body, in plain sight. `createUser("alice", age = 17)` in the test beats `createStandardUser()` in a helper, when 17 is the reason the test exists.
- Keep a shared helper for the noise that no case depends on (wiring, builders with defaults), and keep every meaningful value out of it.
- Accept duplication between tests. Two tests that read alike and fail independently are worth more than one clever parameterized test that fails ambiguously.

## Write each test as a straight line

Setup, one action, assertions, in that order, top to bottom. A test with a branch, a loop, or a computed expected value can carry its own bug, and nothing tests the test. Write the expected value as a literal, and write a second test instead of a second iteration.

## Test through the public surface

Test what a caller can reach. A test that reaches into private state locks the class's internals in place and blocks every later refactor. When a private path feels untestable through the public surface, that path usually wants to be its own unit with its own public surface.

## Completion criteria

The work is done when every one of these holds for every test you touched:

- Each test name states a condition and an expected result, and the body demonstrates that and nothing else.
- Each test has been observed failing for the reason its name states.
- Each failure message names the expected value and the actual value.
- No assertion checks a call that is not itself the behavior under test.
- No assertion is true by construction: no double's own return value, no expected value computed by the code under test, no bare existence check standing in for the promised value.
- Every value that explains why the assertion is correct appears inside the test body.

## Reference

- `TESTABILITY.md` - the production-code flaw behind a painful test, and the refactor that removes it: work in constructors, global state and singletons, static logic, Law of Demeter, hard-to-test third-party APIs.
- `FLAKES.md` - a test that passes and fails on the same code: the causes, the fix for each, and the cost of rerunning instead of fixing.
- `SCOPE.md` - choosing the test level: small/medium/large limits, the pyramid and its anti-patterns, hermetic setups, and what coverage does and does not tell you.

## Sibling skills

The Google Testing Blog corpus split by use case. Reach for the one that matches the work in front of you:

- `simplify-code` - the code is hard to follow: nesting, boolean conditions, abstraction levels, primitives, dead flags.
- `name-things` - naming a variable, function, class, or test.
- `write-code-comments` - writing or pruning a comment or docstring.
- `write-review-feedback` - wording a review comment, or replying to one.
- `write-logs-and-errors` - log lines, log levels, exception handling.
