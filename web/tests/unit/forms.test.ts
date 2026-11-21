import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import { checkStartedAt, clientIp, hashIp, MIN_DELAY_MS, signStartedAt } from '@/lib/forms/antispam'
import {
  contactSchema,
  donationSchema,
  fieldErrors,
  normalizePhone,
  parseAmount,
} from '@/lib/forms/schemas'

describe('normalizePhone', () => {
  it('ajoute +243 aux numéros congolais saisis sans indicatif', () => {
    expect(normalizePhone('0812 345 678')).toBe('+243812345678')
    expect(normalizePhone('812345678')).toBe('+243812345678')
    expect(normalizePhone('243 812 345 678')).toBe('+243812345678')
    expect(normalizePhone('+243 (0)81-234-5678')).toBeNull() // 10 chiffres après +243
    expect(normalizePhone('+243 81 234 5678')).toBe('+243812345678')
  })

  it('accepte les numéros internationaux', () => {
    expect(normalizePhone('+33 6 12 34 56 78')).toBe('+33612345678')
    expect(normalizePhone('0033 6 12 34 56 78')).toBe('+33612345678')
    expect(normalizePhone('+1 (202) 555-0143')).toBe('+12025550143')
  })

  it('refuse ce qui n’est pas un numéro', () => {
    expect(normalizePhone('')).toBeNull()
    expect(normalizePhone('abc')).toBeNull()
    expect(normalizePhone('0812')).toBeNull()
    expect(normalizePhone('+0123456789')).toBeNull()
  })
})

describe('parseAmount', () => {
  it('lit les montants saisis librement', () => {
    expect(parseAmount('1 000')).toBe(1000)
    expect(parseAmount('250,50')).toBe(250.5)
    expect(parseAmount('')).toBeUndefined()
    expect(Number.isNaN(parseAmount('10 USD'))).toBe(true)
  })
})

const donation = {
  name: 'Awa Test',
  phone: '0812345678',
  supportType: 'financial',
  consent: 'on',
  locale: 'fr',
}

describe('donationSchema', () => {
  it('valide une demande minimale et normalise le téléphone', () => {
    const r = donationSchema.safeParse(donation)
    expect(r.success).toBe(true)
    expect(r.data?.phone).toBe('+243812345678')
    expect(r.data?.currency).toBeUndefined()
  })

  it('devise USD par défaut quand un montant est saisi', () => {
    const r = donationSchema.safeParse({ ...donation, amount: '500', currency: '' })
    expect(r.data?.amount).toBe(500)
    expect(r.data?.currency).toBe('USD')
  })

  it('renvoie un code d’erreur par champ', () => {
    const r = donationSchema.safeParse({ name: '', phone: '12', supportType: 'x', amount: '-3' })
    expect(r.success).toBe(false)
    expect(fieldErrors(r.error!)).toMatchObject({
      name: 'required',
      phone: 'phone',
      supportType: 'required',
      amount: 'amount',
      consent: 'consent',
    })
  })

  it('ignore une langue ou une page d’origine invalides', () => {
    const r = donationSchema.safeParse({ ...donation, locale: 'de', sourcePage: 'javascript:1' })
    expect(r.data?.locale).toBe('fr')
    expect(r.data?.sourcePage).toBeUndefined()
  })
})

describe('contactSchema', () => {
  const contact = {
    name: 'Jean Test',
    email: 'jean@example.org',
    subject: 'quote',
    message: 'Bonjour, je souhaite un devis.',
    consent: 'on',
    locale: 'en',
  }

  it('valide un message et laisse le téléphone facultatif', () => {
    const r = contactSchema.safeParse({ ...contact, phone: '' })
    expect(r.success).toBe(true)
    expect(r.data?.phone).toBeUndefined()
  })

  it('exige un e-mail valide et un message d’au moins 10 caractères', () => {
    const r = contactSchema.safeParse({ ...contact, email: 'jean@', message: 'court' })
    expect(fieldErrors(r.error!)).toMatchObject({ email: 'email', message: 'messageShort' })
  })

  it('limite le message à 2 000 caractères', () => {
    const r = contactSchema.safeParse({ ...contact, message: 'a'.repeat(2001) })
    expect(fieldErrors(r.error!)).toMatchObject({ message: 'tooLong' })
  })
})

describe('anti-spam', () => {
  it('jeton signé : trop rapide, valide, falsifié', () => {
    const t0 = 1_700_000_000_000
    const token = signStartedAt(t0)
    expect(checkStartedAt(token, t0 + 1000)).toBe('tooFast')
    expect(checkStartedAt(token, t0 + MIN_DELAY_MS)).toBe('ok')
    expect(checkStartedAt(token.replace(/^\d+/, String(t0 - 60_000)), t0 + 5000)).toBe('invalid')
    expect(checkStartedAt(undefined)).toBe('invalid')
    expect(checkStartedAt(token, t0 + 2 * 24 * 3600 * 1000)).toBe('invalid')
  })

  it('IP : première valeur de x-forwarded-for, empreinte stable et non réversible', () => {
    const h = new Headers({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' })
    expect(clientIp(h)).toBe('203.0.113.7')
    expect(clientIp(new Headers())).toBe('local')
    const hash = hashIp('203.0.113.7')
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
    expect(hash).toBe(hashIp('203.0.113.7'))
    expect(hash).not.toContain('203')
  })
})
