import chromium from 'chrome-aws-lambda';

export async function POST(request) {
  try {
    const html = await request.text();

    const browser = await chromium.puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath || process.env.CHROME_EXECUTABLE_PATH,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '5mm',
        right: '5mm',
        bottom: '5mm',
        left: '5mm',
      },
    });

    await browser.close();

    const base64String = pdfBuffer.toString('base64');
    return new Response(base64String, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });

  } catch (err) {
    console.error('Error generando PDF:', err);
    return new Response('Error generando el PDF', { status: 500 });
  }
}