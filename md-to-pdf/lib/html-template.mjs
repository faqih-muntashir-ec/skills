/**
 * Wrap HTML body content in a full HTML document with print-optimized CSS.
 */
export function wrapHtml(bodyHtml, { title = "Document" } = {}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <style>
    /* ── Base ── */
    * { box-sizing: border-box; }

    html {
      font-size: 11pt;
      line-height: 1.6;
      font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
      color: #1a1a1a;
    }

    body {
      margin: 0;
      padding: 0;
    }

    /* ── Typography ── */
    h1 { font-size: 1.8rem; margin: 1.5rem 0 0.75rem; color: #111; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.4rem; }
    h2 { font-size: 1.4rem; margin: 1.3rem 0 0.6rem; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3rem; }
    h3 { font-size: 1.15rem; margin: 1.1rem 0 0.5rem; color: #334155; }
    h4 { font-size: 1rem; margin: 1rem 0 0.4rem; color: #475569; }

    p { margin: 0.5rem 0; }

    a { color: #2563eb; text-decoration: none; }

    ul, ol { margin: 0.4rem 0; padding-left: 1.5rem; }
    li { margin: 0.15rem 0; }

    blockquote {
      margin: 0.8rem 0;
      padding: 0.5rem 1rem;
      border-left: 4px solid #3b82f6;
      background: #f0f7ff;
      color: #334155;
    }

    hr { border: none; border-top: 1px solid #e2e8f0; margin: 1.5rem 0; }

    strong { font-weight: 600; }

    /* ── Tables ── */
    .table-container {
      page-break-inside: avoid;
      margin: 0.8rem 0;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }

    th {
      background: #f1f5f9;
      font-weight: 600;
      text-align: left;
      padding: 0.5rem 0.75rem;
      border: 1px solid #cbd5e1;
    }

    td {
      padding: 0.45rem 0.75rem;
      border: 1px solid #e2e8f0;
    }

    tr:nth-child(even) td {
      background: #f8fafc;
    }

    /* ── Code blocks ── */
    .code-block {
      page-break-inside: avoid;
      margin: 0.8rem 0;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      overflow: hidden;
    }

    .code-lang {
      background: #f1f5f9;
      color: #64748b;
      font-size: 0.75rem;
      font-family: "JetBrains Mono", "Fira Code", monospace;
      padding: 0.25rem 0.75rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .code-lang:empty { display: none; }

    pre {
      margin: 0;
      padding: 0.75rem;
      overflow-x: auto;
      background: #fafbfc;
    }

    code {
      font-family: "JetBrains Mono", "Fira Code", "Cascadia Code", monospace;
      font-size: 0.85rem;
      line-height: 1.5;
    }

    /* Inline code */
    p code, li code, td code {
      background: #f1f5f9;
      padding: 0.15rem 0.35rem;
      border-radius: 3px;
      font-size: 0.85em;
      color: #c7254e;
    }

    /* ── Highlight.js theme (GitHub-like) ── */
    .hljs { color: #24292e; }
    .hljs-keyword { color: #d73a49; }
    .hljs-string { color: #032f62; }
    .hljs-number { color: #005cc5; }
    .hljs-comment { color: #6a737d; font-style: italic; }
    .hljs-function { color: #6f42c1; }
    .hljs-title { color: #6f42c1; }
    .hljs-built_in { color: #005cc5; }
    .hljs-type { color: #d73a49; }
    .hljs-attr { color: #005cc5; }
    .hljs-literal { color: #005cc5; }
    .hljs-meta { color: #6a737d; }
    .hljs-selector-tag { color: #22863a; }
    .hljs-selector-class { color: #6f42c1; }
    .hljs-addition { color: #22863a; background: #f0fff4; }
    .hljs-deletion { color: #b31d28; background: #ffeef0; }

    /* ── Mermaid containers ── */
    .mermaid-container {
      page-break-inside: avoid;
      margin: 1rem 0;
      text-align: center;
    }

    .mermaid-container svg {
      max-width: 100%;
      height: auto;
    }

    /* ── Mermaid fallback (unsupported/errored diagrams) ── */
    .mermaid-fallback {
      page-break-inside: avoid;
      margin: 1rem 0;
      border: 2px dashed #d97706;
      border-radius: 8px;
      background: #fffbeb;
      overflow: hidden;
    }

    .mermaid-fallback-title {
      background: #fef3c7;
      color: #92400e;
      font-weight: 600;
      font-size: 0.85rem;
      padding: 0.4rem 0.75rem;
      border-bottom: 1px solid #fcd34d;
    }

    .mermaid-fallback pre {
      margin: 0;
      padding: 0.75rem;
      background: transparent;
      font-size: 0.8rem;
    }

    /* ── TOC ── */
    .toc-page {
      page-break-after: always;
    }

    .toc-title {
      text-align: center;
      border-bottom: none;
      margin-bottom: 0.25rem;
    }

    .toc h2 {
      font-size: 1.2rem;
      color: #475569;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 0.3rem;
    }

    .toc ul {
      list-style: none;
      padding-left: 0;
    }

    .toc li {
      padding: 0.2rem 0;
      line-height: 1.4;
    }

    .toc-level-1 { font-weight: 600; font-size: 1rem; }
    .toc-level-2 { font-size: 0.95rem; }
    .toc-level-3 { font-size: 0.9rem; color: #64748b; }

    .toc a {
      color: #2563eb;
      text-decoration: none;
    }

    /* ── Page break utilities ── */
    .page-break {
      page-break-after: always;
    }

    h1, h2, h3, h4 {
      page-break-after: avoid;
    }

    /* ── Print-specific ── */
    @media print {
      html { font-size: 10pt; }
      body { margin: 0; }
      a { color: #2563eb; }

      .table-container,
      .code-block,
      .mermaid-container,
      .mermaid-fallback {
        page-break-inside: avoid;
      }

      h1, h2, h3, h4 {
        page-break-after: avoid;
      }
    }
  </style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
