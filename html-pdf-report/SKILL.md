---
name: html-pdf-report
description: Create a styled, print-ready HTML report and convert it to PDF with headless Chrome. Use when the user asks for a report, write-up, or investigation document as HTML and/or PDF, or wants an HTML file converted to PDF.
---

# HTML + PDF Report

Produce two files: a self-contained HTML report and its PDF, in `~/reports/`
(or a location the user names). File name: short kebab-case, e.g.
`PROJ-1234-investigation-report.html` / `.pdf`.

## 1. Write the HTML

Rules:
- **Self-contained**: inline `<style>`, no external CSS/JS/fonts. The PDF converter must not fetch anything.
- Start with `<meta charset="utf-8">` and a `<title>`.
- Plain English prose (per global CLAUDE.md). Exact identifiers, file paths, and line numbers stay precise.
- Structure: `<h1>` title → meta table (ticket/author/date/status) → numbered `<h2>` sections, **executive summary first** → `<footer>` with method + date caveats.
- State verification status honestly (e.g. "from code review, not yet verified against live data").

Use this boilerplate CSS (tuned for both screen and print):

```html
<style>
* { box-sizing: border-box; }
body { margin: 0; color: #1a1a1a; background: #fff;
  font-family: Georgia, 'Times New Roman', serif; font-size: 11pt; line-height: 1.55; }
main { max-width: 46rem; margin: 0 auto; padding: 2.5rem 1.5rem 4rem; }
h1 { font-size: 1.9rem; font-weight: 400; line-height: 1.2; margin: 0 0 .2rem; }
h2 { font-size: 1.25rem; font-weight: 700; margin: 2.2rem 0 .6rem;
  border-bottom: 1.5px solid #1a1a1a; padding-bottom: .2rem; }
h3 { font-size: 1.02rem; margin: 1.4rem 0 .4rem; }
p { margin: .7rem 0; }
.meta { color: #555; font-size: .95em; margin: 0 0 1.6rem; }
.meta td { padding: .1rem 1.2rem .1rem 0; border: none; }
code, pre { font-family: ui-monospace, 'Cascadia Code', Consolas, monospace;
  font-size: .86em; background: #f2f0ea; border-radius: 3px; }
code { padding: .06em .3em; }
pre { padding: .7rem .9rem; overflow-x: auto; line-height: 1.4; }
pre code { background: none; padding: 0; }
table { border-collapse: collapse; margin: 1rem 0; width: 100%; font-size: .95em; }
th, td { border: 1px solid #c9c5ba; padding: .4rem .6rem; text-align: left; vertical-align: top; }
th { background: #f2f0ea; font-size: .9em; }
td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }
.good { color: #2e6e4e; font-weight: 700; }
.bad { color: #a33a3a; font-weight: 700; }
.callout { border-left: 3px solid #8b2635; background: #f7f4ec; padding: .6rem 1rem; margin: 1.2rem 0; }
.callout .label { display: block; font-size: .75em; letter-spacing: .08em;
  text-transform: uppercase; color: #8b2635; margin-bottom: .2rem; }
footer { margin-top: 3rem; padding-top: .8rem; border-top: 1px solid #c9c5ba;
  font-size: .85em; color: #555; }
@media print {
  main { max-width: none; padding: 0; }
  h2 { break-after: avoid; }
  table, .callout, pre { break-inside: avoid; }
  a { color: inherit; text-decoration: none; }
}
</style>
```

## 2. Convert to PDF

```bash
google-chrome --headless --disable-gpu --no-sandbox \
  --print-to-pdf=<report>.pdf --no-pdf-header-footer \
  "file://<absolute-path-to-report>.html"
```

- Confirm the command printed "N bytes written" and the PDF exists with non-zero size.
- If `google-chrome` is missing, try `chromium`, `wkhtmltopdf <html> <pdf>`, or Windows Edge headless (same flags as Chrome) — check with `which` first.
- If the user later edits the HTML, re-run the same command to regenerate the PDF.

## 3. Open for the user (WSL)

Only when asked. Launch Windows Edge directly with a `file:` URL — NOT `cmd.exe /c start`:

```bash
URL="file:$(wslpath -w "<absolute-path>" | sed 's|\\|/|g')"
"/mnt/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" "$URL"   # run_in_background: true
```

If the launch fails with "Invalid argument", the WSL interop socket is stale — don't retry;
give the user the `file://wsl.localhost/...` URL to paste into Edge, plus the command
prefixed with `!` to run themselves.

## 4. Report back

Give the user both file paths, note the PDF was generated with headless Chrome, and
suggest they skim the PDF for awkward page breaks (offer to adjust print CSS and regenerate).
