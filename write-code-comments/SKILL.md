---
name: write-code-comments
description: Rules for comments that stay true - delete the need first, keep only the why, make each comment readable on its own, describe the contract instead of the implementation. Use when adding a comment or docstring, when a comment repeats the code below it, when a comment went stale after the implementation changed, or when a reviewer asks for an explanation.
---

# Write code comments

A comment earns its place when a competent reader cannot derive it from the code.

My own comment rules live in `~/.claude/docs/code-comments.md`. Read that file first. This skill adds the rules it does not cover.

## 1. Try to remove the need before you write it

A comment that explains *what* the code does marks code that should be clearer. Reach for these in order:

1. **Introduce an explaining variable** so the step names itself.
   `finalPrice = (numItems * itemPrice) - min(5, numItems) * itemPrice * 0.1;`
   becomes `price = ...; discount = ...; finalPrice = price - discount;`
2. **Extract a method** so the block gets a name.
   `// Filter offensive words` over a loop becomes `filterOffensiveWords(words)`.
3. **Rename the identifier** so the unit or meaning travels with it.
   `int width; // in pixels` becomes `int widthInPixels`.
4. **Add a check** so the assumption is enforced, not just claimed.
   `// Safe since height is always > 0` becomes `checkArgument(height > 0)`.

If none of the four apply, write the comment.

## 2. Keep only the four kinds that survive

- **Intent** — why this and not the obvious alternative. `// Compute once because it is expensive.`
- **A guard for the next editor** — why the odd-looking line must stay. `// Create a new Foo because Foo is not thread-safe.`
- **An answer to a question raised in review** — the next reader will ask it too. `// Order matters because ...`
- **A rationale for a bad-looking practice.** `@SuppressWarnings("unchecked") // The cast is safe because ...`

## 3. Make the comment readable on its own

Write it so a reader who has not read the code below still understands it. If you must read the code to decode the comment, the comment is backwards.

```
// Respond to flashing lights in rearview mirror.   <- needs the code
// Pull over for police, or yield to emergency vehicles.   <- stands alone
```

Check this by reading the comment with the code hidden.

## 4. Describe the contract, not the implementation

A function-level comment states what the function guarantees. Implementation detail in that comment goes stale the first time the body changes, and then it lies to the reader.

```
// For high-traffic intersections prone to accidents, pass through the
// intersection and make 3 right turns, which is equivalent to turning left.
```
becomes
```
// Perform a safe left turn at a high-traffic intersection.
```

## 5. Link out instead of growing the comment

Put the short reason inline and the long reason behind a link. A `TODO` names the intended change in one line and links the issue; it does not argue the case.

```
// TODO: Consider various factors to present the best transit option.
// See issuetracker.example/bus-vs-subway
```

Judge how much to inline: a reader may not be able to open the link.

## Completion criteria

- Each remaining comment fails the "could a reader derive this from the code" test.
- No comment names an implementation detail of the function it heads.
- Each comment reads correctly with the code hidden.
- No `ponytail:` marker and no ticket ID reached the source file.
