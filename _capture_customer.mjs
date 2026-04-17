import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'https://cardchat.lovable.app';
const OUT = '/tmp/screens/customer';
fs.mkdirSync(OUT, { recursive: true });

const customerScreens = [
  ['auth', '/customer/auth'],
  ['home', '/customer'],
  ['chat', '/customer/chat'],
  ['contacts', '/customer/contacts'],
  ['me', '/customer/me'],
  ['guide', '/customer/guide'],
  ['rewards', '/customer/rewards'],
  ['ranking', '/customer/ranking'],
];

(async () => {
  const browser = await chromium.launch({ executablePath: '/bin/chromium', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  await ctx.addInitScript(() => {
    localStorage.setItem('beginner_guide_done', '1');
  });
  const page = await ctx.newPage();
  for (const [name, route] of customerScreens) {
    console.log('→ customer', name, route);
    try {
      await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
    } catch (e) { console.error('FAIL', name, e.message); }
  }
  await browser.close();
  console.log('Done.');
})();
