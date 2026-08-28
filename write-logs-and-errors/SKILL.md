---
name: write-logs-and-errors
description: Rules for logs and error handling that shorten a root-cause hunt - log the decisions not the steps, wrap only the risky call, keep the original cause, and carry a request ID across components. Use when adding a log line or log level, when writing a try-catch or raising an exception, when a failure could not be diagnosed from the logs, or when a test failure does not say whether the test or the system broke.
---

# Write logs and errors

Measure logging by one number: how long it takes to find the cause of a failure. If the answer is days, the logs are wrong — too sparse, too noisy, or missing the cause.

## Log the decisions, not the steps

**Log these:**

- Startup configuration that changes behavior
- Errors and warnings
- Changes to persistent data
- Requests and responses between major components
- Significant state changes and user interactions
- Calls with a known risk of failure
- Waits on a condition that can take measurable time
- Periodic progress inside a long-running task
- A branch point, plus the condition that chose the branch
- A summary from the high-level function, rather than every step from the low-level ones

**Leave these out:**

- Function entry, unless it is significant, or unless it is at debug level
- Every iteration of a large loop — log periodically instead
- Whole messages or files — truncate or summarize to what debugging needs
- Benign errors, such as an exception used inside a successful path
- The same error repeated — it buries the real cause; count these in monitoring instead

Too much logging costs disk, archiving, and query complexity, and hides the useful line. Too little means the log cannot answer "why did this fail" or "did this transaction happen". Both are failures.

## Use the levels, and only two configurations

| Level | Meaning |
|---|---|
| Debug | Verbose, useful only while developing or reproducing |
| Info | Normal significant events |
| Warning | Unexpected but acceptable state |
| Error | Something failed, the process recovers |
| Critical | The process cannot recover and will stop or restart |

In practice you need two setups: **production** enables everything except debug, so a production failure is explained by its logs; **development** enables everything.

## Carry a request ID across components

When a transaction crosses threads, processes, or services, the initiator creates one identifier and passes it to every component. Each component logs it. Without it, concurrent transactions interleave and no single trace can be read back out.

## Log timings for the calls that can be slow

Log start and finish for significant system calls, network requests, CPU-heavy operations, device interactions, and transactions. A timeout in a large system is otherwise very hard to place.

## Hold detail in memory, write it only on failure

Append verbose per-step detail to an in-memory queue during a transaction. On success, discard the queue and log one summary line. On failure, write the whole queue plus the error. This gives full detail exactly where you need it, at no cost on the normal path.

## Treat every hard diagnosis as a logging defect

When a failure takes a long time to explain, improve the logging **before** you fix the failure. If it happens again, the log answers it. Do the same for a flake you cannot reproduce: add the logging that will catch it next time.

While writing new code, work from the logs instead of a debugger. If the logs do not describe what is happening, the logging is not finished.

## Wrap only the call that can fail

```java
try {
  // 100+ lines preparing ingredients
  bakePizza();
  // 100+ lines delivering
} catch (Exception e) {
  throw new IllegalStateException();   // cause discarded
}
```

Three defects: the risky call is buried, so unrelated exceptions get caught; `catch (Exception e)` catches everything when only one type is handled here; and the new exception drops the original, so the root cause is gone at debug time.

```java
// 100+ lines preparing ingredients

try {
  bakePizza();
} catch (PizzaOverbakedException e) {           // only this type
  throw new IllegalStateException("You burned the pizza!", e);   // cause kept
}

// 100+ lines delivering
```

Three rules: keep the `try` around the one call that throws, catch the narrowest type you actually handle, and always pass the original exception as the cause.

## Keep argument checks off the constructor

A null check on every constructor argument forces every test to build every collaborator, even the ones the test does not touch. The test then says nothing about which object caused a failure.

Check the internal state of an object, and validate arguments at an external API boundary where callers are outside your control. Inside your own code, let the tests carry that weight. Well-tested code without argument asserts beats untested code with them.

## Log tests as carefully as production

When a test fails, its log must show whether the test or the system broke. A test log records: the execution environment, the initial state, setup steps, the steps of the test case, interactions with the system, expected result, actual result, teardown.

## Monitoring and logs answer different questions

Monitoring shows symptoms in real time and raises the alert: an error rate, a traffic anomaly, a latency change. Logs carry the per-transaction detail that explains the cause. A production service needs both; neither replaces the other.

## Completion criteria

- A production failure can be explained from production-level logs alone.
- Every `catch` names a specific type and passes the original exception onward.
- Every cross-component transaction carries one shared identifier through its logs.
- No log line repeats per loop iteration or per function entry above debug level.
