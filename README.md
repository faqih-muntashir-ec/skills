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

Several skills here are other people's work, or adaptations of published
material. The source authors deserve the credit; any error in the adaptation is
mine.

### Emil Kowalski — animation and design engineering

`emil-design-eng`, `apple-design`, `review-animations`, `improve-animations`,
`find-animation-opportunities`, and `animation-vocabulary` all come from
**[github.com/emilkowalski/skills](https://github.com/emilkowalski/skills)** by
**[Emil Kowalski](https://emilkowal.ski/)**. They encode his animation and UI
craft philosophy, taught in full at
**[animations.dev](https://animations.dev/)**. `find-animation-opportunities` is
built around his essay
["You Don't Need Animations"](https://emilkowal.ski/ui/you-dont-need-animations);
`apple-design` distills Apple's WWDC design talks, chiefly *Designing Fluid
Interfaces* (WWDC 2018).

If these are useful to you, go to the source. The course teaches far more than a
skill file can carry.

### Cursor — code quality

`deslop` and `thermo-nuclear-code-quality-review` are from the
**[Cursor team kit](https://github.com/cursor/plugins/tree/main/cursor-team-kit/skills)**
(`cursor/plugins`, `cursor-team-kit/skills`).

### Builder.io — Fable delegation

`efficient-fable` is from
**[github.com/BuilderIO/skills](https://github.com/BuilderIO/skills/tree/main/skills/efficient-fable)**
by **[Builder.io](https://www.builder.io/)**, including its Excalidraw diagram
and README.

### Google Testing Blog — code craft

`write-tests`, `write-review-feedback`, `name-things`, `simplify-code`,
`write-code-comments`, and `write-logs-and-errors` are mine, but the substance is
not: each was compiled from posts on the
**[Google Testing Blog](https://testing.googleblog.com/)**. The rules, the code
examples, and the flakiness and review-tone statistics are Google's published
work.

### Matt Pocock — planning skills (removed)

`write-a-prd` and `to-local-issues` were forks of `to-prd` and `to-issues` from
**[github.com/mattpocock/skills](https://github.com/mattpocock/skills)**. Both
were removed from this repository. Use the upstream plugin instead, where
`to-prd` is now **`/to-spec`** and `to-plan` + `to-issues` are merged into
**`/to-tickets`**. `analyze-jira-ticket` points at those two skills.

### Other tools referenced

- `test-http-api-hurl` drives [hurl](https://hurl.dev/) by Orange OpenSource.
- `md-to-pdf` and `html-pdf-report` use
  [marked](https://marked.js.org/), [Puppeteer](https://pptr.dev/),
  [highlight.js](https://highlightjs.org/), and
  [Mermaid](https://mermaid.js.org/).

## License

MIT for the skill files in this repository. Adapted material remains the
property of its original authors, credited above.
