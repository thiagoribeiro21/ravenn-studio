const { chromium } = require('playwright');
const OUT = 'C:/Users/thiag/AppData/Local/Temp/claude/c--Users-thiag-Downloads-teste-raven/2b7fd0e4-06e5-4066-9de0-a15982a01603/scratchpad';

(async () => {
  const browser = await chromium.launch();
  for (const [n, w, h] of [['home-375', 375, 667], ['home-1440', 1440, 900]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await page.goto('http://localhost:5174/index.html', { waitUntil: 'load' });
    await page.waitForTimeout(2000);
    await page.evaluate(async () => {
      const sc = document.querySelector('[data-lp-scroller]') || document.scrollingElement;
      for (let y = 0; y < sc.scrollHeight; y += 500) { sc.scrollTop = y; await new Promise((r) => setTimeout(r, 45)); }
      sc.scrollTop = 0;
    });
    await page.waitForTimeout(800);

    const r = await page.evaluate(() => {
      const small = {};
      document.querySelectorAll('body *').forEach((el) => {
        if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') return;
        const txt = [...el.childNodes].filter((x) => x.nodeType === 3).map((x) => x.textContent.trim()).join(' ').trim();
        if (!txt) return;
        const fs = parseFloat(getComputedStyle(el).fontSize);
        if (fs >= 15) return;
        const k = `${fs}px|${txt.slice(0, 30)}`;
        small[k] = (small[k] || 0) + 1;
      });
      // transbordo horizontal em qualquer lugar da pagina
      const de = document.documentElement;
      const overflowX = de.scrollWidth > de.clientWidth ? `${de.scrollWidth} > ${de.clientWidth}` : 'ok';
      // botoes que estouram o proprio container
      const wide = [...document.querySelectorAll('a,button')]
        .filter((a) => a.getBoundingClientRect().right > innerWidth + 1)
        .map((a) => a.textContent.trim().slice(0, 30));
      return { small: Object.entries(small), overflowX, wide };
    });
    console.log(`== ${n} ==`);
    console.log('  <15px:', r.small.length ? r.small : 'nenhum');
    console.log('  overflowX:', r.overflowX, '| botoes fora da tela:', r.wide.length ? r.wide : 'nenhum');
    await page.screenshot({ path: `${OUT}/${n}.png` });
    await ctx.close();
  }
  await browser.close();
})();
