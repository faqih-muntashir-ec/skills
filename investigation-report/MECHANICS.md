# Editing and verifying a report

For the HTML skeleton, the CSS and the PDF command, use `html-pdf-report`. This file covers
the edits and the checks that run on an existing report.

## Replace with an assertion, never with sed

A prose string appears more times than you expect, and a silent second match corrupts a
second section. Edit with a helper that fails when the count is wrong:

```python
import pathlib
p = pathlib.Path('report.html'); s = p.read_text()

def rep(s, old, new, label):
    assert s.count(old) == 1, (label, s.count(old))
    return s.replace(old, new)

s = rep(s, OLD, NEW, 'section 3 lead')
p.write_text(s)
```

Copy `old` out of the file itself, so the whitespace and the line breaks match.

## Renumber in two passes

A direct `&sect;9` → `&sect;8` also rewrites `&sect;12` into `&sect;11 2`. Write a
placeholder first, then resolve it:

```python
s = s.replace('&sect;9', '&sect;#8#').replace('&sect;10', '&sect;#9#')
s = re.sub(r'&sect;#(\d+)#', r'&sect;\1', s)
```

Then print every heading in order and confirm the run has no gap and no repeat.

## Check the tags after every edit

```python
VOID = {'br','hr','img','meta','link','input','col','area','base','source','track','wbr',
        'embed','param',
        # SVG self-closing elements
        'line','rect','path','circle','use','stop','polygon','polyline','ellipse'}
```

Walk the tags with a stack and report the first unbalanced one. A missing `</div>` renders
as a page that looks correct in the browser and collapses in the PDF.

## The figure contract

`diagram-design` owns the connector grammar: orthogonal paths with rounded elbows, the 6–10px
label gap, the fanned attach points, arrows drawn before boxes, the node budget. Follow it.

Four things are specific to a figure inside a report:

1. **The report's palette wins over the skill's skin.** A figure sits in a printed document,
   so it uses the report CSS colours and the report typeface. Read the palette out of the
   report's own `<style>` block before drawing.
2. **A label mask matches the background it sits on.** Read the CSS for the container: a
   figure in the body needs the `body` background, and a figure inside a callout needs the
   callout background. A wrong fill shows as a pale rectangle in the PDF.
3. **A mask must clear every node drawn after it.** Nodes paint last and clip the text. Keep
   at least 6px between a mask edge and the nearest node edge.
4. **Every figure carries `role="img"` with `aria-labelledby`, and per-figure id prefixes**
   on its `<title>`, `<desc>` and `<marker>`, because several figures share one document.

## The verify loop

Run all four after every edit, in order:

1. The tag-balance check.
2. A screenshot of each new or changed figure. Extract the `<svg>`, wrap it in a page with the
   real container background, then:
   ```bash
   google-chrome --headless --disable-gpu --no-sandbox --window-size=1000,700 \
     --screenshot=chk.png chk.html
   ```
   Read the image. A clipped label or a wrong mask fill is visible and nothing else catches it.
3. Regenerate the PDF with the command in `html-pdf-report`.
4. Report the byte size of the HTML and the PDF, so a truncated write shows up at once.
