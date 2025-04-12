import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "chrome-aws-lambda";

export async function POST(request) {
  let browser;
  let logs = [];  // Array para almacenar los logs

  try {
    logs.push("Step 1: Parsing the HTML request");
    const html = await request.text();

    logs.push("Step 2: Setting executable path");
    const executablePath = chromium.executablePath || puppeteer.executablePath();
    logs.push(`Executable Path: ${executablePath}`);

    logs.push("Step 3: Launching Puppeteer browser");
    browser = await puppeteer.launch({
      headless: true,
      executablePath,
      args: chromium.args, 
      defaultViewport: chromium.defaultViewport,
    });

    logs.push("Step 4: Creating new page");
    const page = await browser.newPage();

    logs.push("Step 5: Setting content to page");
    await page.setContent(html, { waitUntil: "networkidle0" });

    logs.push("Step 6: Generating PDF");
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

    logs.push("Step 7: Closing browser");
    await browser.close();

    logs.push("Step 8: Converting PDF to Base64");
    const base64 = pdfBuffer.toString("base64");

    logs.push("Step 9: Returning response");

    // Incluir los logs en la respuesta
    return new NextResponse(
      JSON.stringify({ base64, logs }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );

  } catch (err) {
    logs.push("Error during PDF generation: " + err.message);

    if (browser) {
      try {
        logs.push("Step 10: Closing browser due to error");
        await browser.close();
      } catch (closeErr) {
        logs.push("Error closing browser: " + closeErr);
      }
    }

    // Incluir los logs y el error en la respuesta
    return NextResponse.json({
      error: "Error generating the PDF",
      details: err.message || err,
      logs,
    }, { status: 500 });
  }
}
