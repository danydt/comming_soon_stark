import { expect, test } from '@playwright/test'

test.describe('langues et routes', () => {
  test('/ redirige vers /fr pour un navigateur en français', async ({ browser }) => {
    const page = await (await browser.newContext({ locale: 'fr-FR' })).newPage()
    await page.goto('/')
    await expect(page).toHaveURL(/\/fr$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
    await expect(page.locator('h1')).toHaveText('Aller plus loin ensemble')
  })

  test('/ redirige vers /en pour un navigateur en anglais', async ({ browser }) => {
    const page = await (await browser.newContext({ locale: 'en-US' })).newPage()
    await page.goto('/')
    await expect(page).toHaveURL(/\/en$/)
    await expect(page.locator('h1')).toHaveText('Go further together')
  })

  test('le sélecteur FR | EN renvoie vers la page équivalente et mémorise le choix', async ({
    browser,
  }) => {
    const context = await browser.newContext({ locale: 'fr-FR' })
    const page = await context.newPage()
    await page.goto('/fr')
    await page.getByRole('link', { name: 'EN', exact: true }).click()
    await expect(page).toHaveURL(/\/en$/)
    await expect(page.getByRole('link', { name: 'EN', exact: true })).toHaveAttribute(
      'aria-current',
      'true',
    )
    await page.goto('/')
    await expect(page).toHaveURL(/\/en$/)
  })

  test('hreflang et x-default présents', async ({ page }) => {
    await page.goto('/fr')
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1)
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1)
  })

  test('aucun défilement horizontal à 360 px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 })
    await page.goto('/fr')
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(scrollWidth).toBeLessThanOrEqual(360)
  })
})

test.describe('administration', () => {
  test('/admin affiche la connexion en français, sans préfixe de langue', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/admin(\/login|\/create-first-user)?/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
  })
})
