import puppeteer from "puppeteer";

export async function POST(request) {
  try {
    const html = await request.text();

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A3',
      printBackground: true,
      margin: {
        top: '5mm',
        right: '5mm',
        bottom: '5mm',
        left: '5mm',
      },
      scale: 1,
    });

    await browser.close();

    const base64String = pdfBuffer.toString('base64');

    return new Response(base64String, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (err) {
    console.error("Error generando PDF:", err);
    return new Response('Error generando el PDF', { status: 500 });
  }
}