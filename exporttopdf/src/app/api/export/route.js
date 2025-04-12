import { NextResponse } from "next/server";

export async function POST(request) {
  let browser;

  try {
    const html = await request.text();
    let puppeteer;
    let chromium;

    if (process.env.AWS_REGION || process.env.VERCEL) {
      chromium = await import('chrome-aws-lambda');
      puppeteer = await import('puppeteer-core');

      browser = await puppeteer.default.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath || '/usr/bin/chromium-browser',
        headless: true,
      });
    } else {
      puppeteer = await import('puppeteer');

      browser = await puppeteer.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "5mm",
        right: "5mm",
        bottom: "5mm",
        left: "5mm",
      },
    });

    await browser.close();
    const base64 = pdfBuffer.toString("base64");

    return new Response(base64, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (err) {
    if (browser) {
      try {
        await browser.close();
      } catch (closeErr) {
        console.error("Error closing browser:", closeErr);
      }
    }

    console.error("Error generating PDF:", err);
    return NextResponse.json({ error: "Error generating the PDF" }, { status: 500 });
  }
}
