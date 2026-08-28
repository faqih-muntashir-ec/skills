import { Marked } from "marked";
import hljs from "highlight.js";
import { renderMermaid } from "./mermaid-renderer.mjs";

/**
 * Convert markdown text to HTML body + table of contents.
 * Returns { html, toc } where toc is an array of { level, id, text }.
 */
export function markdownToHtml(markdown, { theme = "default" } = {}) {
  const toc = [];
  let headingCounter = 0;

  const renderer = {
    heading({ text, depth }) {
      headingCounter++;
      const id = `heading-${headingCounter}`;
      if (depth <= 3) {
        toc.push({ level: depth, id, text });
      }
      return `<h${depth} id="${id}">${text}</h${depth}>`;
    },

    code({ text, lang }) {
      // Mermaid blocks → render as SVG
      if (lang === "mermaid") {
        return `<div class="mermaid-container">${renderMermaid(text, theme)}</div>`;
      }

      // Code blocks → syntax highlight
      const language = lang && hljs.getLanguage(lang) ? lang : "plaintext";
      const highlighted = hljs.highlight(text, { language }).value;
      const langLabel = lang || "";
      return `<div class="code-block"><div class="code-lang">${langLabel}</div><pre><code class="hljs language-${language}">${highlighted}</code></pre></div>`;
    },

    table({ header, rows }) {
      const thead = `<thead><tr>${header.map((cell) => `<th align="${cell.align || ""}">${cell.text}</th>`).join("")}</tr></thead>`;
      const tbody = rows.map(
        (row) => `<tr>${row.map((cell) => `<td align="${cell.align || ""}">${cell.text}</td>`).join("")}</tr>`
      ).join("");
      return `<div class="table-container"><table>${thead}<tbody>${tbody}</tbody></table></div>`;
    },
  };

  const marked = new Marked({ renderer, gfm: true, breaks: false });
  const html = marked.parse(markdown);

  return { html, toc };
}

/**
 * Generate an HTML table of contents from collected headings.
 */
export function generateTocHtml(toc, title) {
  if (toc.length === 0) return "";

  const items = toc
    .map(({ level, id, text }) => {
      const indent = (level - 1) * 20;
      return `<li style="margin-left: ${indent}px" class="toc-level-${level}"><a href="#${id}">${text}</a></li>`;
    })
    .join("\n");

  return `
<div class="toc-page">
  <h1 class="toc-title">${title}</h1>
  <nav class="toc">
    <h2>Table of Contents</h2>
    <ul>${items}</ul>
  </nav>
</div>`;
}
