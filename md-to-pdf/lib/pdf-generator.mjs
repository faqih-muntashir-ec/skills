import puppeteer from "puppeteer";

/**
 * Launch a reusable Puppeteer browser instance.
 */
export async function launchBrowser() {
  return puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
}

/**
 * Close the browser instance.
 */
export async function closeBrowser(browser) {
  await browser.close();
}

/**
 * Convert an HTML string to a PDF buffer using Puppeteer.
 */
export async function htmlToPdf(browser, html, outputPath) {
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: "networkidle0" });

  await page.pdf({
    path: outputPath,
    format: "Letter",
    printBackground: true,
    margin: {
      top: "0.75in",
      right: "0.75in",
      bottom: "1in",
      left: "0.75in",
    },
    displayHeaderFooter: true,
    headerTemplate: "<span></span>",
    footerTemplate: `
      <div style="width: 100%; text-align: center; font-size: 9px; color: #94a3b8; font-family: system-ui, sans-serif;">
        <span class="pageNumber"></span> / <span class="totalPages"></span>
      </div>
    `,
  });

  await page.close();
}
