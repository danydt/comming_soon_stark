import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

/**
 * Phase 4 : « Faire un don » (page Nous soutenir, formulaire de rappel), formulaire de contact
 * (dont les demandes de devis), bouton WhatsApp. Chaque test simule sa propre IP
 * (`x-forwarded-for`) pour ne pas consommer la limite d'envois des autres.
 * Les demandes créées (nom « E2E … ») sont supprimées à la fin (globalTeardown).
 */

test.describe.configure({ timeout: 180_000 })

const uniqueIp = () =>
  `198.51.100.${Math.floor(Math.random() * 250) + 1}-${Date.now()}-${Math.random()}`

async function withIp(page: Page, ip = uniqueIp()) {
  await page.setExtraHTTPHeaders({ 'x-forwarded-for': ip })
  return ip
}

/** Message d'erreur général du formulaire (Next a aussi un `role="alert"` : l'annonceur de route). */
const formAlert = (page: Page) => page.locator('main form [role="alert"]')

/** Le jeton anti-spam impose 3 s entre l'affichage et l'envoi. */
async function waitForToken(page: Page) {
  await expect(page.locator('input[name="startedAt"]')).not.toHaveValue('')
  await page.waitForTimeout(3_200)
}

const DONATE = { fr: '/fr/nous-soutenir', en: '/en/support-us' } as const
const CONTACT = { fr: '/fr/contact', en: '/en/contact' } as const

const T = {
  fr: {
    name: 'Nom complet',
    phone: 'Téléphone',
    email: 'E-mail',
    supportType: 'Type de soutien',
    supportValue: 'Don financier',
    amount: 'Montant envisagé',
    subject: 'Sujet',
    message: 'Message',
    consent: /J’accepte/,
    donateSubmit: 'Être rappelé',
    contactSubmit: 'Envoyer le message',
    donateSuccess: 'Merci pour votre générosité !',
    contactSuccess: 'Message envoyé',
    required: 'Ce champ est obligatoire.',
    invalid: 'Merci de corriger les champs signalés.',
    rateLimit: /Trop d’envois/,
    again: 'Envoyer une autre demande',
    donate: 'Faire un don',
  },
  en: {
    name: 'Full name',
    phone: 'Phone',
    email: 'Email',
    supportType: 'Type of support',
    supportValue: 'Financial donation',
    amount: 'Intended amount',
    subject: 'Subject',
    message: 'Message',
    consent: /I agree/,
    donateSubmit: 'Request a call back',
    contactSubmit: 'Send message',
    donateSuccess: 'Thank you for your generosity!',
    contactSuccess: 'Message sent',
    required: 'This field is required.',
    invalid: 'Please correct the highlighted fields.',
    rateLimit: /Too many submissions/,
    again: 'Send another request',
    donate: 'Donate',
  },
} as const

async function fillDonation(page: Page, locale: 'fr' | 'en', name = `E2E Donateur ${locale}`) {
  const t = T[locale]
  await page.getByLabel(t.name).fill(name)
  await page.getByLabel(t.phone, { exact: false }).first().fill('0812 345 678')
  await page.getByLabel(t.supportType).selectOption({ label: t.supportValue })
  await page.getByLabel(t.amount).fill('250')
  await page.getByLabel(t.consent).check()
}

test.describe('boutons « Faire un don » et WhatsApp', () => {
  const pages = ['/fr', '/fr/secteurs/sante', '/fr/produits', '/fr/contact', '/en', '/en/about']

  test('présents sur toutes les pages (ordinateur), liens corrects', async ({ page }) => {
    for (const url of pages) {
      await page.goto(url)
      const locale = url.startsWith('/en') ? 'en' : 'fr'
      const donate = page.locator('header a[data-cta="donate"]')
      await expect(donate, url).toBeVisible()
      await expect(donate).toHaveText(T[locale].donate)
      expect(await donate.getAttribute('href')).toBe(DONATE[locale])
      const chat = page.locator('a[data-chat="whatsapp"]')
      await expect(chat, url).toBeVisible()
      expect(await chat.getAttribute('href')).toMatch(/^https:\/\/wa\.me\/\d+\?text=/)
    }
  })

  test.describe('mobile', () => {
    test.use({ viewport: { width: 360, height: 780 } })

    test('barre « Faire un don » collante et WhatsApp au-dessus, sans chevauchement', async ({
      page,
    }) => {
      for (const url of ['/fr', '/en/sectors/health', '/fr/contact']) {
        await page.goto(url)
        const bar = page.getByRole('navigation', { name: /Actions rapides|Quick actions/ })
        await expect(bar, url).toBeVisible()
        await expect(page.locator('header a[data-cta="donate"]')).toBeHidden()
        const barBox = (await bar.boundingBox())!
        const chatBox = (await page.locator('a[data-chat="whatsapp"]').boundingBox())!
        expect(barBox.y + barBox.height).toBeCloseTo(780, 0)
        expect(chatBox.y + chatBox.height, url).toBeLessThanOrEqual(barBox.y)
        expect(chatBox.width).toBeGreaterThanOrEqual(44)
      }
    })
  })
})

for (const locale of ['fr', 'en'] as const) {
  test.describe(`formulaire de don (${locale})`, () => {
    test('le bouton mène à la page Nous soutenir', async ({ page }) => {
      await page.goto(`/${locale}`)
      await page.locator('header a[data-cta="donate"]').click()
      await expect(page).toHaveURL(new RegExp(`${DONATE[locale]}$`))
      await expect(page.locator('form[aria-labelledby="donation-form-title"]')).toBeVisible()
    })

    test('envoi invalide : erreurs par champ, focus sur le premier', async ({ page }) => {
      await withIp(page)
      await page.goto(DONATE[locale])
      await page.getByRole('button', { name: T[locale].donateSubmit }).click()
      await expect(formAlert(page)).toHaveText(T[locale].invalid)
      await expect(page.getByLabel(T[locale].name)).toBeFocused()
      await expect(page.getByLabel(T[locale].name)).toHaveAttribute('aria-invalid', 'true')
      await expect(page.getByText(T[locale].required).first()).toBeVisible()
    })

    test('envoi valide : message de succès', async ({ page }) => {
      await withIp(page)
      await page.goto(DONATE[locale])
      await waitForToken(page)
      await fillDonation(page, locale)
      await page.getByRole('button', { name: T[locale].donateSubmit }).click()
      await expect(page.getByRole('heading', { name: T[locale].donateSuccess })).toBeFocused()
    })
  })

  test.describe(`formulaire de contact (${locale})`, () => {
    test('envoi invalide puis valide', async ({ page }) => {
      await withIp(page)
      await page.goto(CONTACT[locale])
      await waitForToken(page)
      const t = T[locale]
      await page.getByLabel(t.name).fill('E2E Contact')
      await page.locator('main form input[name="email"]').fill('pas-un-email')
      await page.getByRole('button', { name: t.contactSubmit }).click()
      await expect(formAlert(page)).toHaveText(t.invalid)
      await expect(page.locator('main form input[name="email"]')).toHaveAttribute(
        'aria-invalid',
        'true',
      )
      await page.locator('main form input[name="email"]').fill('e2e@example.org')
      await page.getByLabel(t.subject).selectOption('partnership')
      await page.getByLabel(t.message).fill('Message de test automatisé, à ignorer.')
      await page.getByLabel(t.consent).check()
      await page.getByRole('button', { name: t.contactSubmit }).click()
      await expect(page.getByRole('heading', { name: t.contactSuccess })).toBeFocused()
    })
  })
}

test('demande de devis : depuis une fiche produit, sujet et produit repris', async ({ page }) => {
  await withIp(page)
  await page.goto('/fr/produits')
  const cards = page.locator('main a[href^="/fr/produits/"]')
  // Les fiches du seed sont des brouillons d'exemple : rien à tester tant qu'aucune n'est publiée.
  test.skip((await cards.count()) === 0, 'Aucun produit publié')
  await cards.first().click()
  await expect(page).toHaveURL(/\/fr\/produits\/.+/)
  const product = (await page.locator('h1').innerText()).trim()
  await page.getByRole('link', { name: 'Demander un devis' }).first().click()
  await expect(page).toHaveURL(/\/fr\/contact\?produit=/)
  await expect(page.getByText(`Demande de devis : ${product}`)).toBeVisible()
  await expect(page.getByLabel('Sujet')).toHaveValue('quote')
  await waitForToken(page)
  await page.getByLabel('Nom complet').fill('E2E Devis')
  await page.locator('main form input[name="email"]').fill('e2e@example.org')
  await page.getByLabel('Message').fill('Merci de m’envoyer un devis (test automatisé).')
  await page.getByLabel(/J’accepte/).check()
  await page.getByRole('button', { name: 'Envoyer le message' }).click()
  await expect(page.getByRole('heading', { name: 'Message envoyé' })).toBeVisible()
})

test('demande de devis : un produit inconnu ou non publié est ignoré', async ({ page }) => {
  await page.goto('/fr/contact?produit=produit-inexistant')
  await expect(page.locator('main form')).toBeVisible()
  await expect(page.getByText(/Demande de devis :/)).toHaveCount(0)
  await expect(page.getByLabel('Sujet')).toHaveValue('')
  await expect(page.locator('input[name="product"]')).toHaveCount(0)
})

test('limite atteinte : 6e envoi depuis la même IP refusé', async ({ page }) => {
  test.setTimeout(300_000)
  await withIp(page)
  await page.goto(DONATE.fr)
  for (let i = 1; i <= 5; i++) {
    await waitForToken(page)
    await fillDonation(page, 'fr', `E2E Limite ${i}`)
    await page.getByRole('button', { name: 'Être rappelé' }).click()
    await expect(page.getByRole('heading', { name: T.fr.donateSuccess })).toBeVisible()
    await page.getByRole('button', { name: T.fr.again }).click()
  }
  await waitForToken(page)
  await fillDonation(page, 'fr', 'E2E Limite 6')
  await page.getByRole('button', { name: 'Être rappelé' }).click()
  await expect(formAlert(page)).toHaveText(T.fr.rateLimit)
})

test('envoi trop rapide refusé (délai anti-spam)', async ({ page }) => {
  await withIp(page)
  await page.goto(DONATE.en)
  await expect(page.locator('input[name="startedAt"]')).not.toHaveValue('')
  await fillDonation(page, 'en')
  await page.getByRole('button', { name: T.en.donateSubmit }).click()
  await expect(formAlert(page)).toHaveText(/Sent too quickly/)
})

test.describe('accessibilité des formulaires (axe)', () => {
  for (const url of [DONATE.fr, CONTACT.en]) {
    test(`${url}, erreurs affichées`, async ({ page }) => {
      await page.goto(url)
      await page.locator('form button[type="submit"]').click()
      await expect(formAlert(page)).not.toBeEmpty()
      const { violations } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
      expect(
        violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
      ).toEqual([])
    })
  }
})
