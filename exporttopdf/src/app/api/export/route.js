import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "chrome-aws-lambda"; // Agregar chrome-aws-lambda

export async function POST(request) {
  let browser;

  try {
    const html = await request.text();
    const executablePath = chromium.executablePath || puppeteer.executablePath();

    // Usamos chrome-aws-lambda para manejar el binario de Chrome adecuado
    browser = await puppeteer.launch({
      headless: true,
      executablePath,
      args: chromium.args, // Usamos los argumentos específicos para chrome-aws-lambda
      defaultViewport: chromium.defaultViewport,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Generamos el PDF
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

    // Cerramos Puppeteer
    await browser.close();

    const base64 = pdfBuffer.toString("base64");

    return new NextResponse(base64, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (err) {
    // Aquí vamos a capturar el error con detalles
    console.error("Error during PDF generation:", err);

    if (browser) {
      try {
        await browser.close();
      } catch (closeErr) {
        console.error("Error closing browser:", closeErr);
      }
    }

    return NextResponse.json({
      error: "Error generating the PDF",
      details: err.message || err,
    }, { status: 500 });
  }
}
