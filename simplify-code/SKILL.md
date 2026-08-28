---
name: simplify-code
description: Rules for code a reader follows in one pass - guard clauses over nesting, positive booleans, one abstraction level per function, domain types over primitives, pure core separated from side effects, and no code built for a need that has not arrived. Use when a function is hard to follow, when nesting goes past two levels, when a boolean condition mixes and-or, when a new feature does not fit the existing shape, or when reviewing for maintainability.
---

# Simplify code

A reader holds the whole control flow in working memory, and that memory is small. Every branch you remove is capacity you give back.

Two related skills sit beside this one: `name-things` for identifiers, `write-code-comments` for comments. A comment explaining tangled code is a signal to simplify the code instead.

## Fail fast with guard clauses

Deep nesting separates a check from the error it raises, and bugs hide in that gap.

```python
# Nested: which error belongs to which check?
if response.GetStatus() == RPC.OK:
    if response.GetAuthorizedUser():
        if response.GetRows():
            return summarize(response)
        else: raise EmptyError()
    else: raise AuthError()
else: raise RpcError(response.GetStatus())

# Guarded: each check sits next to its error.
if response.GetStatus() != RPC.OK: raise RpcError(response.GetStatus())
if not response.GetAuthorizedUser(): raise AuthError()
if not response.GetRows(): raise EmptyError()
return summarize(response)
```

Rules of thumb: keep conditional blocks short; refactor when loops and branches go more than two levels deep; move nested logic into a named function rather than writing a double loop.

## Check for the presence of something

Name flags for the positive case, then put the positive branch first.

```python
if not nodisable_kryptonite_shield: escape()   # two negations
else: fight()

if enable_kryptonite_shield: fight()           # reads straight through
else: escape()
```

The same holds for flags: `--enable_feature=True` reads better than `--disable_feature=False`.

Exception: a language idiom that reads as positive, such as Python `if foo is not None`, is fine.

## Give each half of a condition a name

A condition that mixes `&&` and `||` forces the reader to simulate it. Split it into named intermediate booleans, each one a single quality.

```java
boolean hasGoodMeat = !pepperoni.empty() || sausages.size() > 0;
boolean hasGoodVeggies = useOnion.get() || hasMushroom(ENOKI, PORTOBELLO);
boolean isPizzaFantastic = hasGoodMeat && hasGoodVeggies && hasCheese();
```

Or move the whole condition into a method, which then also allows guard clauses.

## Keep one abstraction level per function

A function that mixes high-level steps with low-level detail has no narrative. Delegate each step to a function one level down, and let that function do the same.

```go
func createPizza(order *Order) *Pizza {
    pizza := prepare(order)
    bake(pizza)
    box(pizza)
    return pizza
}
```

`bake` calls `heatOven` and `bakePizza`. Each layer reads as a summary of the layer below.

## Replace primitives with the concept they stand for

Primitive obsession is using `int`, `string`, `pair`, or `map` where a domain type belongs. Generic field names such as `first` and `second` carry no meaning, and the domain logic ends up scattered at every call site.

| Primitive | Domain type |
|---|---|
| `vector<pair<int,int>> polygon` | `Polygon` with `GetBoundingBox()` and `GetArea()` |
| `map<UserId,string> names; map<UserId,int> ages;` | `map<UserId, Person>` |
| `person_data[kName] = "Foo"` | `person.SetName("Foo")` |
| `string date = "01-02-03"` | `Date(Month::Feb, Day(1), Year(2003))` |
| `int timeout_secs = 5` | `Duration timeout = Seconds(5)` |

## Separate the pure core from the side effects

Put business logic in pure functions that only read their arguments. Put database calls, network calls, and writes in a thin shell that calls those functions. The core is then testable with no setup, and a second feature reuses it.

```ts
// Core: pure, takes data, returns data.
function getExpiredUsers(users: User[], cutoff: Date): User[] { ... }
function generateExpiryEmails(users: User[]): [string, string][] { ... }

// Shell: does the I/O.
email.bulkSend(generateExpiryEmails(getExpiredUsers(db.getUsers(), Date.now())));
```

Adding a reminder email is then one new pure function plus one shell line.

## Use the collection operation the language gives you

A hand-rolled loop that accumulates a flag repeats a pattern the standard library already names.

```js
let everyRequestValid = true;
for (const r of requests) { if (!isValid(r)) { everyRequestValid = false; break; } }
if (everyRequestValid) { ... }

if (requests.every(isValid)) { ... }
```

`map`, `filter`, `every`, `some`, `reduce`. Stop when the functional version gets harder to read, or when it is unidiomatic for the language.

## Build only what is needed today

Delete or refuse code written for a need that has not arrived. These are the signals:

- A base class or interface with exactly one implementation.
- A parameter, variable, or flag that always carries the same value at every call site.
- A return type for errors that never occur.
- A class designed for subclassing that nothing subclasses.
- Public or protected members that could be private.
- Code executed only by its own tests.

Each one costs a maintainer understanding, documentation, and tests, for a case that never runs.

## Make the interface hard to misuse

Do not push an invariant onto the caller. If `Insert()` requires the caller to have called `AddSlots()` first, `Insert()` should allocate the slot itself. Prefer, in order: a contract the compiler enforces, then a runtime check, then documentation.

Other signals that an interface invites mistakes:

- Callers must call an init function. Expose a factory that returns a ready object.
- Callers must run custom cleanup. Use the language construct that cleans up on scope exit.
- An object can be built without a required field, such as a user with no ID.
- A parameter accepts values that are not valid. `Duration timeout` beats `int timeout_in_millis`.

Do not over-correct into defensive code. Validation that guards nothing adds complexity and cost.

## Prefactor: make the change easy, then make the change

When a new feature does not fit the current shape, do not force it in. Restructure first in a separate change that alters no behavior, then add the feature in a second change.

```python
# Change 1 (prefactor): extract the duplicated helper, behavior unchanged.
def get_display_name(user): return f"{user.first_name} {user.last_name}"

# Change 2 (feature): the actual change is now one line.
def get_display_name(user): return f"{user.first_name} {user.middle_name} {user.last_name}"
```

This keeps each review focused, keeps cleanups away from logic changes so a bug is easier to locate, and lets you revert the feature without reverting the cleanup. A cleanup that does not block the feature can wait for a follow-up change instead.

## Completion criteria

- No branch or loop nests more than two levels.
- No condition mixes `&&` and `||` without named intermediates.
- Every function calls out at one consistent abstraction level.
- Every parameter, flag, and interface implementation has at least one real use today.
- Behavior-preserving restructuring sits in its own change, separate from the feature.
