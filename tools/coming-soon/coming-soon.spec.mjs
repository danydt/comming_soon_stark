// Tests de la page de lancement (coming-soon/).
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const csDir = path.join(root, 'coming-soon');
const shots = path.join(root, 'docs/captures/phase-0');
fs.mkdirSync(shots, { recursive: true });

const LAUNCH = '2026-11-20T00:00:00+01:00';
const MOBILE = { width: 360, height: 800 };
const DESKTOP = { width: 1440, height: 900 };

const digits = async (page) =>
  Promise.all(['d', 'h', 'm', 's'].map((u) => page.locator(`#cd-${u}`).textContent()));

test.describe('langue', () => {
  test('français détecté par défaut', async ({ browser }) => {
    const page = await (await browser.newContext({ locale: 'fr-FR' })).newPage();
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page.locator('h1')).toHaveText('Notre nouveau site arrive');
  });

  test('lingala → français, anglais → anglais', async ({ browser }) => {
    const ln = await (await browser.newContext({ locale: 'ln-CD' })).newPage();
    await ln.goto('/');
    await expect(ln.locator('html')).toHaveAttribute('lang', 'fr');
    const en = await (await browser.newContext({ locale: 'en-US' })).newPage();
    await en.goto('/');
    await expect(en.locator('html')).toHaveAttribute('lang', 'en');
    await expect(en.locator('h1')).toHaveText('Our new website is coming');
  });

  test('le sélecteur change la langue sans recharger et la mémorise', async ({ browser }) => {
    const page = await (await browser.newContext({ locale: 'fr-FR' })).newPage();
    await page.goto('/');
    await page.evaluate(() => (window.__marker = 1));
    await page.getByRole('button', { name: 'EN' }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('h1')).toHaveText('Our new website is coming');
    await expect(page.getByRole('button', { name: 'EN' })).toHaveAttribute('aria-pressed', 'true');
    expect(await page.evaluate(() => window.__marker)).toBe(1); // pas de rechargement
    await expect(page).toHaveTitle(/Our new website is coming/);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('WhatsApp : message prérempli dans la langue active', async ({ page }) => {
    await page.goto('/');
    const fr = await page.locator('#cta-whatsapp').getAttribute('href');
    expect(fr).toContain('https://wa.me/243904947476?text=');
    expect(decodeURIComponent(fr)).toContain('Bonjour');
    await page.getByRole('button', { name: 'EN' }).click();
    expect(decodeURIComponent(await page.locator('#cta-whatsapp').getAttribute('href'))).toContain('Hello');
    await expect(page.locator('#cta-call')).toHaveAttribute('href', 'tel:+243904947476');
    await expect(page.locator('#cta-email')).toHaveAttribute('href', 'mailto:contact@fondationstarkhold.org');
  });

  test('réseaux sociaux masqués quand les URLs sont vides', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#social-block')).toBeHidden();
  });
});

test.describe('compte à rebours', () => {
  for (const timezoneId of ['Africa/Kinshasa', 'America/New_York', 'Asia/Tokyo', 'Pacific/Kiritimati']) {
    test(`même valeur quel que soit le fuseau (${timezoneId})`, async ({ browser }) => {
      const page = await (await browser.newContext({ timezoneId })).newPage();
      // 1 j 2 h 3 min 4 s avant l'ouverture.
      const now = Date.parse(LAUNCH) - ((1 * 24 + 2) * 3600 + 3 * 60 + 4) * 1000 + 500;
      await page.goto(`/?now=${now}`);
      const [d, h, m] = await digits(page);
      expect([d, h, m]).toEqual(['01', '02', '03']);
    });
  }

  test('chiffres à largeur fixe : aucune variation de mise en page', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto(`/?now=2026-11-19T23:58:50%2B01:00`);
    const box = () => page.locator('#countdown').boundingBox();
    const widths = async () => page.locator('.cd-num').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().width));
    const b0 = await box();
    const w0 = await widths();
    await page.waitForTimeout(2200);
    expect(await box()).toEqual(b0);
    expect(await widths()).toEqual(w0);
  });

  test('région aria-live mise à jour au plus une fois par minute', async ({ page }) => {
    await page.goto(`/?now=2026-11-19T23:50:10%2B01:00`);
    await expect(page.locator('#countdown-status')).toHaveText(/Ouverture dans 0 jours, 0 heures et 9 minutes/);
    await page.evaluate(() => {
      window.__changes = 0;
      new MutationObserver(() => window.__changes++).observe(document.getElementById('countdown-status'), {
        childList: true, characterData: true, subtree: true,
      });
    });
    await page.waitForTimeout(4000); // 4 tics de seconde, même minute
    expect(await page.evaluate(() => window.__changes)).toBe(0);
    await expect(page.locator('#cd-s')).not.toHaveText('--');
  });

  test('échéance passée : « Le site est en ligne » + bouton vers la racine', async ({ page }) => {
    await page.goto(`/?now=2026-11-20T00:00:01%2B01:00`);
    await expect(page.locator('h1')).toHaveText('Le site est en ligne');
    await expect(page.locator('#countdown')).toBeHidden();
    const cta = page.getByRole('link', { name: 'Découvrir le site' });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', '/');
    await page.getByRole('button', { name: 'EN' }).click();
    await expect(page.locator('h1')).toHaveText('We’re live');
    await expect(page.getByRole('link', { name: 'Discover the website' })).toBeVisible();
  });

  test('bascule automatique à l’échéance, page ouverte', async ({ page }) => {
    await page.goto(`/?now=2026-11-19T23:59:58%2B01:00`);
    await expect(page.locator('#countdown')).toBeVisible();
    await expect(page.locator('h1')).toHaveText('Le site est en ligne', { timeout: 5000 });
    await expect(page.locator('#countdown-status')).toHaveText('Le site est en ligne');
  });

  test('?now= ignoré hors développement (domaine de production)', async ({ browser }) => {
    test.skip(Date.now() >= Date.parse(LAUNCH), 'pertinent seulement avant l’ouverture');
    const page = await (await browser.newContext()).newPage();
    await page.route('https://fondationstarkhold.org/**', async (route) => {
      const u = new URL(route.request().url());
      const res = await route.fetch({ url: `http://localhost:4173${u.pathname}` });
      await route.fulfill({ response: res });
    });
    await page.goto('https://fondationstarkhold.org/?now=2026-12-01T00:00:00%2B01:00');
    await expect(page.locator('#countdown')).toBeVisible();
    await expect(page.locator('h1')).toHaveText('Notre nouveau site arrive');
  });
});

test.describe('mise en page et accessibilité', () => {
  for (const vp of [MOBILE, { width: 768, height: 1024 }, DESKTOP]) {
    test(`aucun défilement horizontal à ${vp.width}px`, async ({ page }) => {
      await page.setViewportSize(vp);
      await page.goto('/');
      for (const lang of ['FR', 'EN']) {
        await page.getByRole('button', { name: lang }).click();
        const sw = await page.evaluate(() => document.documentElement.scrollWidth);
        expect(sw).toBeLessThanOrEqual(vp.width);
      }
    });
  }

  test('cibles tactiles ≥ 44 px', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto('/');
    const small = await page.locator('a:visible, button:visible').evaluateAll((els) =>
      els
        .filter((e) => !e.classList.contains('skip-link'))
        .map((e) => ({ t: e.textContent.trim().slice(0, 30), r: e.getBoundingClientRect() }))
        .filter(({ r }) => r.width < 44 || r.height < 44)
        .map(({ t, r }) => `${t} ${r.width}x${r.height}`),
    );
    expect(small).toEqual([]);
  });

  test('poids total < 300 Ko hors polices', async () => {
    let total = 0;
    const walk = (d) => {
      for (const f of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, f.name);
        if (f.isDirectory()) {
          if (f.name !== 'fonts') walk(p);
        } else if (f.name !== 'README.md') total += fs.statSync(p).size;
      }
    };
    walk(csDir);
    console.log(`Poids coming-soon hors polices : ${(total / 1024).toFixed(1)} Ko`);
    expect(total).toBeLessThan(300 * 1024);
  });
});

test.describe('captures', () => {
  const states = [
    { name: 'countdown', q: '?now=2026-11-12T09:30:00%2B01:00' },
    { name: 'live', q: '?now=2026-11-20T00:00:05%2B01:00' },
  ];
  for (const s of states) {
    for (const [vpName, vp] of [['mobile', MOBILE], ['desktop', DESKTOP]]) {
      for (const lang of ['fr', 'en']) {
        test(`capture ${s.name} ${vpName} ${lang}`, async ({ browser }) => {
          const ctx = await browser.newContext({ viewport: vp, locale: lang === 'fr' ? 'fr-FR' : 'en-US', reducedMotion: 'reduce' });
          const page = await ctx.newPage();
          await page.goto('/' + s.q);
          await page.evaluate(() => document.fonts.ready);
          await page.screenshot({ path: path.join(shots, `${s.name}-${vpName}-${lang}.png`), fullPage: true });
        });
      }
    }
  }
});
