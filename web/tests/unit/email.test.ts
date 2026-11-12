import { describe, expect, it } from 'vitest'

import { resolveEmailProvider } from '@/lib/email'

describe('choix du fournisseur d’e-mail', () => {
  it('console par défaut (développement)', () => {
    expect(resolveEmailProvider({})).toBe('console')
  })
  it('Resend si une clé est fournie', () => {
    expect(resolveEmailProvider({ RESEND_API_KEY: 're_test' })).toBe('resend')
  })
  it('SMTP si un hôte est fourni', () => {
    expect(resolveEmailProvider({ SMTP_HOST: 'mail.example.org' })).toBe('smtp')
  })
  it('EMAIL_PROVIDER explicite prioritaire', () => {
    expect(resolveEmailProvider({ EMAIL_PROVIDER: 'SMTP', RESEND_API_KEY: 're_test' })).toBe('smtp')
  })
})
