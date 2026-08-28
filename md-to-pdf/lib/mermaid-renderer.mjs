import { renderMermaidSVG, THEMES } from "beautiful-mermaid";

const UNSUPPORTED_TYPES = new Set(["gantt", "pie", "mindmap", "timeline", "journey", "quadrantchart", "sankey", "packet", "kanban", "architecture", "block"]);

/**
 * Detect the diagram type from the first non-empty line of mermaid source.
 */
function detectDiagramType(text) {
  const firstLine = text.trim().split("\n")[0].trim().toLowerCase();
  if (firstLine.startsWith("graph ") || firstLine.startsWith("flowchart ")) return "flowchart";
  if (firstLine.startsWith("sequencediagram")) return "sequence";
  if (firstLine.startsWith("classdiagram")) return "class";
  if (firstLine.startsWith("statediagram")) return "state";
  if (firstLine.startsWith("erdiagram")) return "er";
  if (firstLine.startsWith("xychart")) return "xychart";
  // Return the first word as-is for unsupported type detection
  return firstLine.split(/[\s-]/)[0];
}

/**
 * Render a mermaid code block to SVG, or return a styled fallback for
 * unsupported/errored diagrams.
 */
export function renderMermaid(text, theme = "default") {
  const diagramType = detectDiagramType(text);

  if (UNSUPPORTED_TYPES.has(diagramType)) {
    return fallbackBlock(text, diagramType);
  }

  const options = resolveTheme(theme);

  try {
    return renderMermaidSVG(text, options);
  } catch (err) {
    console.warn(`  ⚠ Mermaid render failed (${diagramType}): ${err.message}`);
    return fallbackBlock(text, diagramType, err.message);
  }
}

function resolveTheme(theme) {
  if (theme === "default") {
    return { bg: "#FFFFFF", fg: "#27272A", font: "system-ui, sans-serif" };
  }
  // Try exact match in THEMES
  if (THEMES[theme]) return { ...THEMES[theme], font: "system-ui, sans-serif" };
  // Try with -light / -dark suffix
  if (THEMES[`${theme}-light`]) return { ...THEMES[`${theme}-light`], font: "system-ui, sans-serif" };
  if (THEMES[`${theme}-dark`]) return { ...THEMES[`${theme}-dark`], font: "system-ui, sans-serif" };
  // Fallback to default
  return { bg: "#FFFFFF", fg: "#27272A", font: "system-ui, sans-serif" };
}

function fallbackBlock(text, diagramType, errorMsg) {
  const escapedText = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const title = errorMsg
    ? `⚠ Mermaid render error (${diagramType})`
    : `📊 ${diagramType} diagram (not rendered — unsupported type)`;

  return `<div class="mermaid-fallback">
  <div class="mermaid-fallback-title">${title}</div>
  <pre><code>${escapedText}</code></pre>
</div>`;
}
