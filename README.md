# Claude Code Skills

A personal collection of [Claude Code](https://claude.com/claude-code) skills for
Jira workflows, PR and commit authoring, code review, planning, testing,
animation and design craft, and report writing.

## Install

Clone into your personal skills directory:

```bash
git clone https://github.com/faqih-muntashir-ec/skills.git ~/.claude/skills
```

Or copy individual skill folders into `~/.claude/skills/`. Each folder holds a
`SKILL.md` that Claude Code loads on demand.

All examples use neutral placeholders (`PROJ-123`, `<org>`, `<your-site>`), so
the skills work in any repository.

## Credits

Several skills are adaptations rather than original work. They distill published
material into a form Claude Code can act on. The source authors deserve the
credit for the ideas; any error in the adaptation is mine.

### Emil Kowalski — animation and design engineering

`emil-design-eng`, `review-animations`, `improve-animations`,
`find-animation-opportunities`, and `animation-vocabulary` encode the animation
and UI craft philosophy of **[Emil Kowalski](https://emilkowal.ski/)**. The
standards, target values, and easing curves come from his writing and his course
at **[animations.dev](https://animations.dev/)** — including
["You Don't Need Animations"](https://emilkowal.ski/ui/you-dont-need-animations),
which `find-animation-opportunities` is built around.

If these skills are useful to you, go to the source. The course teaches far more
than a skill file can carry.

### Apple — fluid interfaces

`apple-design` translates Apple's WWDC design talks to the web platform, chiefly
*Designing Fluid Interfaces* (WWDC 2018), *The Details of UI Typography*
(WWDC 2020), and *Principles of Great Design* (WWDC 2026). The projection
function and spring parameters are Apple's, taken from the published sample code.
Watch the talks at [developer.apple.com/videos](https://developer.apple.com/videos/).

### Google — engineering practices

`write-tests`, `write-review-feedback`, `name-things`, `simplify-code`,
`write-code-comments`, and `write-logs-and-errors` draw on Google's public
engineering guidance: the
[Google Engineering Practices documentation](https://google.github.io/eng-practices/),
the [Google Testing Blog](https://testing.googleblog.com/), and
*Software Engineering at Google* (O'Reilly, 2020). The flakiness and
review-tone statistics quoted in those skills are Google's published figures.

### Other tools referenced

- `test-http-api-hurl` drives [hurl](https://hurl.dev/) by Orange OpenSource.
- `md-to-pdf` and `html-pdf-report` use
  [marked](https://marked.js.org/), [Puppeteer](https://pptr.dev/),
  [highlight.js](https://highlightjs.org/), and
  [Mermaid](https://mermaid.js.org/).

## License

MIT for the skill files in this repository. Adapted material remains the
property of its original authors, credited above.
