const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 2 });
  const file = 'file://' + path.resolve(__dirname, 'deck.html');
  await page.goto(file, { waitUntil: 'networkidle0' });
  // ensure fonts loaded
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.pdf({
    path: path.resolve(__dirname, 'investment_slides.pdf'),
    width: '1280px',
    height: '720px',
    printBackground: true,
    pageRanges: '1-13',
  });
  await browser.close();
  console.log('PDF generated.');
})();
