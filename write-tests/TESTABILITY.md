# Testability

A test that is painful to write is a report about the production code, not about testing. Each section below names a flaw, the pain it produces, and the refactor that removes it.

The tell you can trust: **the pain is felt where the mistake was not made.** When a test for `SongWriter` forces you to build a `MusicPlayer`, the defect lives in `Song`.

## Seams

A **seam** is a place where a test can substitute behavior without editing the code under test. Seams come from polymorphism: an injected collaborator, an interface, an overridable method. Every rule below exists to create seams or to keep them open.

## Flaw: the constructor does real work

**Signs.** `new` in a constructor or a field initializer. A static call in a constructor. A branch or a loop in a constructor. An `initialize()` the caller must remember. Reading config or touching disk during construction.

**Pain.** Every test of every behavior pays the construction cost, and no test can replace what the constructor built.

**Fix.** Let constructors assign fields and nothing else. Move object-graph construction into a factory or a composition root that has no logic of its own: no conditionals, no loops, no I/O. Then a test builds the small part of the graph it needs and passes doubles for the rest.

## Flaw: digging into collaborators

**Signs.** A parameter that is only used to reach another object. A call chain with more than one dot: `ctx.getCar().getEngine().getSparkPlug()`. Parameter names like `context`, `environment`, `manager`, `container`, `registry`.

**Pain.** The test must build a whole haystack so the code can find its needle, and every mock of the context spreads to every test that touches the class.

**Fix.** Ask for what the code actually uses. `Mechanic(Engine engine)` in place of `Mechanic(Context context)`. The constructor signature then documents the real dependencies, and the test builds two objects instead of twenty.

## Flaw: global state and singletons

**Signs.** A global instance variable, a static mutable field, a service locator, a registry, a static initializer block.

**Pain.** Global state is transitive: everything reachable from a global is global too. Tests then pass alone and fail together, or fail alone and pass together, and the order matters. The API also lies, because a class secretly reaches collaborators its signature never mentions.

**Fix.** Keep the *single instance* and drop the *global handle*. Create one instance in the composition root and pass it to whoever needs it. A singleton stays acceptable only when it is immutable or when no information flows back into the application, such as a logger.

## Flaw: static methods carrying logic

**Signs.** A static method that branches, loops, or reaches a service. `StringUtil`, `SomethingHelper`, `SomethingManager`.

**Pain.** A static call has no seam. Anything behind it is unreachable from the test, and the reach grows every time the method stops being a leaf.

**Fix.** Move the method onto the argument it interacts with most: `a.method(b)` in place of `Util.method(a, b)`. Keep static only for true leaves that take their whole input as arguments and return a value.

## Flaw: the class does too much

**Signs.** Summarizing the class needs the word "and". Fields that only some methods use. A new team member cannot state its job after reading it.

**Pain.** Every test of one responsibility drags in the others.

**Fix.** Split along the responsibilities the fields already reveal, and give each piece its own tests.

## Flaw: branching on a type flag

**Signs.** The same `if (user.isSuperUser())` or `switch (kind)` repeated across the codebase.

**Pain.** Each new kind needs an edit at every branch site, and each branch multiplies the cases a test must cover.

**Fix.** Replace the flag with a subtype that carries the behavior. The branches and the flag fields both disappear, and each subtype is testable on its own.

## Separate what is constructed from what is injected

Two kinds of object, two rules:

- **Value objects** (`Email`, `CreditCard`, `Song`, `User`) hold data and sit at the leaves of the graph. Call `new` on them freely, inline, including inside business logic. Never mock them; construct the real one.
- **Service objects** (`MailSender`, `CreditCardProcessor`, `Repository`) do work and collaborate. Obtain them by injection, never by `new` in business logic.

A service object never takes a value object in its constructor, because the wiring layer cannot supply one. A value object never holds a *field reference* to a service object, because that forces every creator of the value object to obtain the service. Passing a service to a value object *as a method argument* stays fine: `song.isPlayable(player)`.

## Flaw: a third-party API that resists testing

**When your code calls the library.** Define the interface your application actually wants, sized to your use, not to the library:

```java
interface Authenticator {
  boolean authenticate(String username, String password);
}
```

Implement it with a thin adapter over the library. Test everything against the interface, keep the adapter free of logic, and cover the adapter with one integration test. A library API change then lands in one file, and an in-memory implementation becomes trivial.

**When the library calls your code** (a servlet, a handler, a framework base class). Put the logic in a plain class the framework knows nothing about, and let the framework class be an adapter that translates and delegates. Test the plain class in depth. The adapter can only hold wiring bugs, which fail loudly and consistently.

## Assertions about arguments

A null check on every constructor argument forces every test to build collaborators it does not use, which hides which objects the behavior actually needs. Prefer asserting on an object's own internal consistency, and let the test pass `null` for the collaborators the behavior never touches. Keep argument validation at trust boundaries: public APIs, user input, and data crossing a process edge.
