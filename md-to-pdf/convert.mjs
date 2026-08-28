#!/usr/bin/env node

import { parseArgs } from "node:util";
import { resolve, basename } from "node:path";
import { readdir, stat } from "node:fs/promises";
import { convertFile } from "./lib/pipeline.mjs";
import { launchBrowser, closeBrowser } from "./lib/pdf-generator.mjs";

const HELP = `
Usage: md-to-pdf <path> [options]

  <path>   A single .md file or a directory containing .md files

Options:
  --output, -o <dir>    Output directory for PDFs (default: same as input file)
  --theme, -t <name>    Mermaid theme: default, dark, forest, neutral (default: default)
  --help, -h            Show this help message
`.trim();

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    output: { type: "string", short: "o" },
    theme: { type: "string", short: "t", default: "default" },
    help: { type: "boolean", short: "h", default: false },
  },
});

if (values.help || positionals.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const inputPath = resolve(positionals[0]);
const inputStat = await stat(inputPath);

let mdFiles;
if (inputStat.isDirectory()) {
  const entries = await readdir(inputPath);
  mdFiles = entries
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((f) => resolve(inputPath, f));
} else {
  mdFiles = [inputPath];
}

if (mdFiles.length === 0) {
  console.error("No .md files found.");
  process.exit(1);
}

console.log(`Found ${mdFiles.length} markdown file(s)\n`);

const browser = await launchBrowser();

let failed = 0;
for (const file of mdFiles) {
  const name = basename(file);
  try {
    console.log(`Converting: ${name}`);
    const pdfPath = await convertFile(file, browser, {
      outputDir: values.output ? resolve(values.output) : undefined,
      theme: values.theme,
    });
    console.log(`  → ${pdfPath}\n`);
  } catch (err) {
    failed++;
    console.error(`  ✗ Failed: ${err.message}\n`);
  }
}

await closeBrowser(browser);

if (failed > 0) {
  console.error(`\n${failed} file(s) failed.`);
  process.exit(1);
}

console.log("Done.");
