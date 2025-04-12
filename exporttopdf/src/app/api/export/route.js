import { NextResponse } from "next/server";

const isProd = process.env.NODE_ENV === "production";

let chromium, puppeteer;

if (isProd) {
  chromium = require("chrome-aws-lambda");
  puppeteer = require("puppeteer-core");
} else {
  puppeteer = require("puppeteer");
}

export async function POST(request) {
  let browser;
  const logs = [];

  try {
    logs.push("Reading HTML");
    const html = await request.text();

    logs.push(`Launching browser (${isProd ? "production" : "dev"})`);

    browser = await (isProd
      ? puppeteer.launch({
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath,
          headless: chromium.headless,
        })
      : puppeteer.launch({ headless: true }));

    const page = await browser.newPage();
    logs.push("Page created");

    await page.setContent(html, { waitUntil: "networkidle0" });
    logs.push("HTML set");

    const buffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
    });

    await browser.close();
    logs.push("PDF generated");

    const base64 = buffer.toString("base64");
    logs.push("PDF converted to base64");

    return NextResponse.json({ base64, logs });
  } catch (err) {
    logs.push("ERROR: " + err.message);
    if (browser) await browser.close();
    return NextResponse.json({ error: err.message, logs }, { status: 500 });
  }
}
