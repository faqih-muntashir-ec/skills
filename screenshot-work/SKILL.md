---
name: screenshot-work
description: Capture before/after screenshot comparisons locally with Playwright MCP and git branch switching. Use when the user wants screenshots of a UI change, e.g. for a PR's before/after preview.
---

# Screenshot Work

Capture before/after screenshot comparisons locally using **Playwright MCP** and git branch switching.

## Workflow

Use a single dev server on one port. Capture "after" on the current branch, then checkout the comparison branch for "before":

1. **Start the dev server** on the current branch (the "after"):
   ```bash
   npm run dev
   ```
2. **Authenticate** and navigate to the target page
3. **Capture the "after" screenshot**
4. **Stop the dev server**, then switch branches:
   ```bash
   # Ctrl+C the server, then:
   git stash --include-untracked  # if there are uncommitted changes
   git checkout master
   npm install --prefer-offline
   npm run dev
   ```
5. **Navigate to the same page** — session cookies persist (same port)
6. **Capture the "before" screenshot**
7. **Switch back** to the working branch:
   ```bash
   # Ctrl+C the server, then:
   git checkout -
   git stash pop  # if you stashed earlier
   npm install --prefer-offline
   ```

This avoids worktrees, second ports, and re-authentication.

## Authentication

If your app requires authentication, navigate to its login URL and authenticate before capturing. Session cookies persist across branch switches on the same port — so you only need to log in once per screenshot session.

## Capturing with Playwright MCP

Use the Playwright MCP tools (prefixed `mcp__plugin_playwright_playwright__`). Load them first with `ToolSearch` if needed.

### Setup
- **Resize viewport** to a consistent size before capturing:
  ```
  browser_resize(width=1440, height=900)
  ```

### Navigation & Snapshots
- `browser_navigate(url)` — navigate to a URL
- `browser_snapshot()` — accessibility tree with `ref` selectors (compact, token-friendly). Use `filename` param to save large snapshots to disk.
- `browser_click(ref, element)` — click an element by ref
- `browser_fill_form(ref, value)` — type into an input
- `browser_run_code(code)` — run arbitrary Playwright JS (`async (page) => { ... }`)

### Screenshots
- `browser_take_screenshot(type="png")` — viewport screenshot
- `browser_take_screenshot(type="png", fullPage=true)` — full page screenshot
- `browser_take_screenshot(type="png", ref, element)` — element screenshot
- Use `filename` param to control save path (e.g. `filename="screenshots/01-main-page.png"`)

### Element Screenshots (crop to component)

Playwright MCP supports element screenshots directly via `ref` + `element` params. For more control:

1. **Scroll the element into the viewport** using `browser_run_code`:
   ```js
   async (page) => {
     const el = page.locator('<selector>');
     await el.scrollIntoViewIfNeeded();
     const box = await el.boundingBox();
     return JSON.stringify(box);
   }
   ```

2. **Take an element screenshot** using the ref from a snapshot:
   ```
   browser_take_screenshot(ref="e123", element="Chart component", filename="screenshots/chart.png")
   ```

3. **Or take a viewport screenshot and crop** with sharp-cli (add ~8px padding):
   ```bash
   npx sharp-cli -i /tmp/viewport.png -o output.png extract <top-8> <left-8> <width+16> <height+16>
   ```
   Note: sharp-cli extract takes positional args: `top left width height` (not flags).

### Running Arbitrary Code
Use `browser_run_code` for complex interactions:
```js
async (page) => {
  // Example: scroll overflow container
  await page.evaluate(() => {
    const containers = document.querySelectorAll('[class*="overflow"]');
    for (const c of containers) {
      if (c.scrollHeight > c.clientHeight) {
        c.scrollTop = c.scrollHeight / 2;
      }
    }
  });
  await page.waitForTimeout(500);
}
```

### Closing
- `browser_close()` — close the browser when done

## Screenshot Guidelines

- **Focus on the component** — always crop to just the target element, never include unrelated UI (sidebars, headers, other sections)
- Add **~8px padding** around the element so the screenshot isn't cramped
- Before and after screenshots do **NOT** need matching dimensions — size depends on the component
- Save all screenshots to the `screenshots/` directory in the project root
- **Do NOT commit screenshots** to the repo
- **Do NOT upload screenshots** to the PR via `gh` CLI (it can't attach images). Instead, add a **Preview** section to the PR description with a before/after table using the screenshot filenames as placeholders (e.g. `[02-feature-before.png]`). The user will manually replace placeholders with real images when editing the PR.
- Label columns as **"Before"** and **"After"** — do NOT include branch names
