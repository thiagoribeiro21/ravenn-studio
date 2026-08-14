const { chromium } = require('playwright');
const OUT = 'C:/Users/thiag/AppData/Local/Temp/claude/c--Users-thiag-Downloads-teste-raven/2b7fd0e4-06e5-4066-9de0-a15982a01603/scratchpad';
const VPS = [['desktop-1440x900', 1440, 900], ['laptop-1280x720', 1280, 720], ['se-375x667', 375, 667], ['ip-390x844', 390, 844]];

(async () => {
  const browser = await chromium.launch();
  for (const [n, w, h] of VPS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await page.goto('http://localhost:5174/landing-pages.html', { waitUntil: 'load' });
    await page.waitForTimeout(1800);
    const r = await page.evaluate(() => {
      const img = document.querySelector('#hero picture img');
      const b = img.getBoundingClientRect();
      return {
        top: Math.round(b.top), h: Math.round(b.height), w: Math.round(b.width),
        vh: window.innerHeight,
        heroH: Math.round(document.querySelector('#hero').getBoundingClientRect().height),
        pctVisible: Math.max(0, Math.round(((Math.min(b.bottom, innerHeight) - Math.max(b.top, 0)) / b.height) * 100)),
      };
    });
    console.log(n.padEnd(18), JSON.stringify(r));
    await page.screenshot({ path: `${OUT}/hero2-${n}.png` });
    await ctx.close();
  }
  await browser.close();
})();
