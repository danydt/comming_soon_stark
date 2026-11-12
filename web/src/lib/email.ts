import type { EmailAdapter } from 'payload'
import { resendAdapter } from '@payloadcms/email-resend'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'

import { readEnv, requireEnv } from './env'

export type EmailProvider = 'resend' | 'smtp' | 'console'

/**
 * Choisit le fournisseur d'e-mail :
 * - EMAIL_PROVIDER explicite (resend | smtp | console) ;
 * - sinon Resend si RESEND_API_KEY est défini, SMTP si SMTP_HOST l'est ;
 * - sinon « console » : Payload affiche les e-mails dans les logs (développement).
 */
export function resolveEmailProvider(
  env: Record<string, string | undefined> = process.env,
): EmailProvider {
  const explicit = env.EMAIL_PROVIDER?.trim().toLowerCase()
  if (explicit === 'resend' || explicit === 'smtp' || explicit === 'console') return explicit
  if (env.RESEND_API_KEY?.trim()) return 'resend'
  if (env.SMTP_HOST?.trim()) return 'smtp'
  return 'console'
}

export function emailAdapter(): Promise<EmailAdapter> | EmailAdapter | undefined {
  const defaultFromAddress = readEnv('EMAIL_FROM_ADDRESS') ?? 'noreply@fondationstarkhold.org'
  const defaultFromName = readEnv('EMAIL_FROM_NAME') ?? 'Fondation Stark Hold Solutions'

  switch (resolveEmailProvider()) {
    case 'resend':
      return resendAdapter({
        apiKey: requireEnv('RESEND_API_KEY'),
        defaultFromAddress,
        defaultFromName,
      })
    case 'smtp':
      return nodemailerAdapter({
        defaultFromAddress,
        defaultFromName,
        transportOptions: {
          host: requireEnv('SMTP_HOST'),
          port: Number(readEnv('SMTP_PORT') ?? 587),
          secure: readEnv('SMTP_SECURE') === 'true',
          auth: readEnv('SMTP_USER')
            ? { user: requireEnv('SMTP_USER'), pass: requireEnv('SMTP_PASS') }
            : undefined,
        },
      })
    case 'console':
      // Pas d'adaptateur : Payload journalise les e-mails dans la console.
      return undefined
  }
}

/** Destinataire des notifications internes (formulaire de rappel, phase 4). */
export function contactRecipient(): string {
  return readEnv('EMAIL_CONTACT_TO') ?? 'contact@fondationstarkhold.org'
}
