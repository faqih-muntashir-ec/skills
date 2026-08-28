---
name: md-to-pdf
description: Convert Markdown files (with Mermaid diagrams) to PDFs. Use when user asks to create a PDF, convert markdown to PDF, or generate a document with diagrams.
user_invocable: true
argument: file path or directory path
---

# Convert Markdown to PDF

Convert one or more Markdown files to professional PDF documents. Mermaid diagrams in fenced code blocks are rendered as beautiful SVGs.

## Usage

Run the `md-to-pdf` CLI tool:

```bash
md-to-pdf <path> [options]
```

- `<path>` — A single `.md` file or a directory of `.md` files
- `--output, -o <dir>` — Output directory for PDFs (default: same as input)
- `--theme, -t <name>` — Mermaid theme: `default`, `dark`, `forest`, `neutral`

## Process

1. If the user provides a file path, use it directly.
2. If the user asks to "create a PDF" of something you've already written, identify the markdown file path.
3. If no markdown file exists yet, write one first, then convert.
4. Run: `md-to-pdf <path>` (add `--output` if user specifies a destination)
5. Confirm the output path and file size to the user.

## Mermaid Support

Mermaid diagrams in standard fenced code blocks are automatically rendered:

````
```mermaid
graph LR
    A --> B --> C
```
````

Supported diagram types: flowchart, sequence, gantt, class, state, ER, pie, and more.

## Examples

```bash
# Single file
md-to-pdf ./docs/architecture.md

# Directory of markdown files
md-to-pdf ./docs/

# Custom output directory
md-to-pdf ./README.md --output ./pdfs/

# Dark theme for Mermaid diagrams
md-to-pdf ./docs/ --theme dark
```

## Tool Location

The tool source is bundled with this skill. The package is globally linked so `md-to-pdf` is available on `PATH`.

- CLI: `md-to-pdf` (resolves to this skill's `convert.mjs` via npm link)
- Source: `./convert.mjs` and `./lib/` (this skill directory)
- Legacy path: `~/tools/md-to-pdf` is a symlink to this skill directory for backward compatibility

### Reinstalling

If `md-to-pdf` stops working or you reinstall from a fresh clone:

```bash
cd ~/.claude/skills/md-to-pdf
npm install
npm link
```
