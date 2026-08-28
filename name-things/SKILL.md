---
name: name-things
description: Rules for identifier names that are clear and precise - describe behavior not timing, cut filler words, match the abstraction level, name tests as sentences. Use when introducing a variable, function, class, file, or test name, when a name needs the implementation read to be understood, or when a name carries Manager, Util, Helper, Data, or Info.
---

# Name things

A name is **clear** when the reader knows what it refers to, and **precise** when the reader knows what it does not refer to. Both, or the name is not done.

Spend effort in proportion to the cost of renaming later. A local variable is cheap to change. A public API name may never be changed at all.

## Cut every word that carries nothing

- **Words the type already states.** `String nameString` → `String name`. `List<Date> holidayDateList` → `List<Date> holidays`.
- **Detail nothing else disambiguates.** `Monster finalBattleMostDangerousBossMonster` → `Monster boss`.
- **Words the surrounding scope repeats.** Inside `class AnnualHolidaySale`, `annualSaleRebate` → `rebate`, `promoteHolidaySale()` → `promote()`.
- **Words that fit any identifier at all:** data, state, amount, number, value, manager, engine, object, entity, instance, helper, util, broker, metadata, process, handle, context, info.
- **The same word twice.** `userData.userBirthdayDate` → `user.birthDate`.

A name that is too long still beats one that is too short. Cut to the shortest name that stays precise, then stop.

## Name the behavior, not the moment

Prefixes like `handle` and `on` state *when* the function runs, which the call site already shows. State *what* it does.

```
button.listen('click', handleClick)      // says when
button.listen('click', addItemToCart)    // says what
```

## Match the abstraction level of the caller

High-level functions name the *what* and take high-level types. Low-level functions name the *how* and take low-level types. `logout` calls `clearUserToken`. `recordWithCamera` calls `parseStreamBytes`. A high-level name over low-level work misleads the reader.

## Treat Manager and Util as a design signal

If the only honest name is `UserManager`, the class does more than one thing. Split it until each part has a precise name. The naming problem is the design problem.

## Use only abbreviations your reader already knows

`HTML`, `RPC`, and `i18n` are shared vocabulary. A team-invented short form is not. Ask whether a reader five years from now still decodes it.

## Name a test as a sentence about the class

Start each test name with an implied subject: the class under test. Describe one responsibility.

```java
class HtmlLinkRewriterTest {
  void testAppendsAdditionalParameterToUrlsInHrefAttributes() {}
  void testDoesNotRewriteImageOrJavascriptLinks() {}
  void testThrowsExceptionIfHrefContainsSessionId() {}
}
```

Read as: "HtmlLinkRewriter appends additional parameter to URLs in href attributes."

This doubles as a design check. If you cannot build the sentence with the class as the subject, the test sits in the wrong file, or the class has too many responsibilities.

## Rename when the name stops fitting

Code changes and names drift. When you read an identifier that no longer describes itself, rename it in that change.

## Completion criteria

- Every new name survives with the implementation hidden.
- No name carries a filler word from the list above.
- No name states when the code runs instead of what it does.
- Every test name reads as a sentence whose subject is the unit under test.
