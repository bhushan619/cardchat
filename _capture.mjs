import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE = 'https://cardchat.lovable.app';
const OUT = '/tmp/screens';
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(`${OUT}/admin`, { recursive: true });
fs.mkdirSync(`${OUT}/customer`, { recursive: true });
fs.mkdirSync(`${OUT}/misc`, { recursive: true });

const adminScreens = [
  ['messages', '/admin'],
  ['team-chat', '/admin/team-chat'],
  ['customers', '/admin/customers'],
  ['card-rates', '/admin/card-rates'],
  ['orders', '/admin/orders'],
  ['wallets', '/admin/wallets'],
  ['naira-rate', '/admin/naira-rate'],
  ['users', '/admin/users'],
  ['team', '/admin/team'],
  ['ranking', '/admin/ranking'],
  ['rewards', '/admin/rewards'],
  ['ip-restrictions', '/admin/ip-restrictions'],
  ['sensitive-words', '/admin/sensitive-words'],
  ['api-config', '/admin/api-config'],
  ['broadcast', '/admin/broadcast'],
  ['customer-guide', '/admin/customer-guide'],
  ['guide', '/admin/guide'],
  ['profile', '/admin/profile'],
  ['login', '/admin/login'],
  ['screens-gallery', '/admin/screens'],
];

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

const misc = [['index', '/']];

(async () => {
  const browser = await chromium.launch();

  // DESKTOP for admin
  const desktopCtx = await browser.newContext({
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 2,
  });
  // Pre-set admin auth so admin pages render
  await desktopCtx.addInitScript(() => {
    sessionStorage.setItem('adminAuth', 'true');
    sessionStorage.setItem('adminRole', 'super_admin');
    sessionStorage.setItem('adminName', 'Demo Admin');
  });

  const dPage = await desktopCtx.newPage();
  for (const [name, route] of [...adminScreens, ...misc.map(([n,r])=>[n,r])]) {
    const url = BASE + route;
    const folder = adminScreens.find(s=>s[0]===name) ? 'admin' : 'misc';
    console.log('→', folder, name, url);
    try {
      await dPage.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await dPage.waitForTimeout(800);
      await dPage.screenshot({ path: `${OUT}/${folder}/${name}.png`, fullPage: true });
    } catch (e) {
      console.error('FAIL', name, e.message);
    }
  }
  await desktopCtx.close();

  // MOBILE for customer
  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  await mobileCtx.addInitScript(() => {
    // skip splash/onboarding if present
    sessionStorage.setItem('splashSeen', 'true');
    sessionStorage.setItem('onboardingSeen', 'true');
    localStorage.setItem('onboardingComplete', 'true');
    sessionStorage.setItem('customerAuth', 'true');
    sessionStorage.setItem('customerAlias', 'A7X3KP');
  });

  const mPage = await mobileCtx.newPage();
  for (const [name, route] of customerScreens) {
    const url = BASE + route;
    console.log('→ customer', name, url);
    try {
      await mPage.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await mPage.waitForTimeout(1200);
      await mPage.screenshot({ path: `${OUT}/customer/${name}.png`, fullPage: true });
    } catch (e) {
      console.error('FAIL', name, e.message);
    }
  }
  await mobileCtx.close();

  await browser.close();
  console.log('Done.');
})();
