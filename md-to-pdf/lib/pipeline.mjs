import { readFile, mkdir } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { markdownToHtml, generateTocHtml } from "./markdown.mjs";
import { wrapHtml } from "./html-template.mjs";
import { htmlToPdf } from "./pdf-generator.mjs";

/**
 * Convert a single markdown file to PDF.
 * Returns the output PDF path.
 */
export async function convertFile(filePath, browser, { outputDir, theme } = {}) {
  const markdown = await readFile(filePath, "utf-8");
  const fileName = basename(filePath, ".md");
  const title = formatTitle(fileName);

  // Parse markdown to HTML + collect TOC
  const { html: bodyHtml, toc } = markdownToHtml(markdown, { theme });

  // Build TOC page + body
  const tocHtml = generateTocHtml(toc, title);
  const fullBody = tocHtml + bodyHtml;

  // Wrap in HTML document
  const htmlDoc = wrapHtml(fullBody, { title });

  // Determine output path
  const outDir = outputDir ? resolve(outputDir) : dirname(filePath);
  await mkdir(outDir, { recursive: true });
  const pdfPath = join(outDir, `${fileName}.pdf`);

  // Generate PDF
  await htmlToPdf(browser, htmlDoc, pdfPath);

  return pdfPath;
}

/**
 * Convert a file name like "01-high-level-proposal-a" to a readable title.
 */
function formatTitle(fileName) {
  return fileName
    .replace(/^\d+-/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
