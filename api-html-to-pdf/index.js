const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = 3000;

app.use(express.text({ type: '*/*' }));

app.post('/generar-pdf', async (req, res) => {
    try {
        const html = req.body;

        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
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
                left: '5mm'
            },
            scale: 1
        });

        await browser.close();

        const base64String = pdfBuffer.toString('base64');
        res.setHeader('Content-Type', 'text/plain');
        
        res.send(base64String);
    } catch (err) {
        console.error("Error generando PDF:", err);
        res.status(500).send('Error generando el PDF');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});