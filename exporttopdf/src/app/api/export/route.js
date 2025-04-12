import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";

export async function POST(request) {
  let browser;

  try {
    const html = await request.text();
    const executablePath = process.env.CHROME_PATH || puppeteer.executablePath();

    browser = await puppeteer.launch({
      headless: true,
      executablePath, 
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "10mm",
        right: "10mm",
        bottom: "10mm",
        left: "10mm",
      },
    });

    await browser.close();
    const base64 = pdfBuffer.toString("base64");

    return new NextResponse(base64, {
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