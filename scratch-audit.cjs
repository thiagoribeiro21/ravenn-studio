const { chromium } = require('playwright');
const OUT = 'C:/Users/thiag/AppData/Local/Temp/claude/c--Users-thiag-Downloads-teste-raven/2b7fd0e4-06e5-4066-9de0-a15982a01603/scratchpad';

const PAGES = ['landing-pages', 'sites-institucionais', 'agentes-ia', 'gestao-google-ads', 'lojas-virtuais', 'sites-imersivos'];
const VPS = [
  ['desktop-1440x900', 1440, 900],
  ['laptop-1280x720', 1280, 720],
  ['iphone-se-375x667', 375, 667],
  ['iphone-390x844', 390, 844],
];

(async () => {
  const browser = await chromium.launch();

  // ── A) MOCKUP DO HERO: aparece? onde? cortado? ──────────────────────
  console.log('===== HERO DEVICE =====');
  for (const [vname, w, h] of VPS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    const failed = [];
    page.on('requestfailed', (r) => failed.push(r.url()));
    await page.goto('http://localhost:5174/landing-pages.html', { waitUntil: 'load' });
    await page.waitForTimeout(1800);

    const r = await page.evaluate(() => {
      const img = document.querySelector('#hero picture img');
      if (!img) return { found: false };
      const b = img.getBoundingClientRect();
      const sec = document.querySelector('#hero').getBoundingClientRect();
      return {
        found: true,
        currentSrc: img.currentSrc.split('/').pop(),
        natural: `${img.naturalWidth}x${img.naturalHeight}`,
        complete: img.complete,
        rect: { top: Math.round(b.top), bottom: Math.round(b.bottom), w: Math.round(b.width), h: Math.round(b.height) },
        heroBottom: Math.round(sec.bottom),
        viewportH: window.innerHeight,
        visibleInFirstScreen: b.top < window.innerHeight && b.bottom > 0,
        pctVisible: Math.max(0, Math.round(((Math.min(b.bottom, window.innerHeight) - Math.max(b.top, 0)) / b.height) * 100)),
      };
    });
    console.log(vname, JSON.stringify(r));
    if (failed.length) console.log('   requests falhados:', failed);
    await page.screenshot({ path: `${OUT}/hero-${vname}.png` });
    await ctx.close();
  }

  // ── B) AUDITORIA DE FONTES < 15px em toda a LP ──────────────────────
  console.log('\n===== FONTES < 15px =====');
  for (const slug of PAGES) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(`http://localhost:5174/${slug}.html`, { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    // rola a página inteira pra montar tudo que é lazy/inView
    await page.evaluate(async () => {
      const sc = document.querySelector('[data-lp-scroller]') || document.scrollingElement;
      for (let y = 0; y < sc.scrollHeight; y += 400) { sc.scrollTop = y; await new Promise((r) => setTimeout(r, 40)); }
      sc.scrollTop = 0;
    });
    await page.waitForTimeout(800);

    const small = await page.evaluate(() => {
      const acc = {};
      document.querySelectorAll('body *').forEach((el) => {
        if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') return;
        const txt = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim();
        if (!txt) return;
        const cs = getComputedStyle(el);
        const fs = parseFloat(cs.fontSize);
        if (fs >= 15) return;
        const key = `${fs}px|${el.tagName}|${(el.className?.baseVal ?? el.className ?? '').toString().slice(0, 70)}`;
        if (!acc[key]) acc[key] = { fs, tag: el.tagName, cls: (el.className?.baseVal ?? el.className ?? '').toString().slice(0, 90), sample: txt.slice(0, 45), n: 0 };
        acc[key].n++;
      });
      return Object.values(acc).sort((a, b) => a.fs - b.fs);
    });
    console.log(`\n--- ${slug} (${small.length} grupos) ---`);
    small.forEach((s) => console.log(`  ${s.fs}px  x${s.n}  <${s.tag}> "${s.sample}"\n        ${s.cls}`));
    await ctx.close();
  }

  await browser.close();
})();
