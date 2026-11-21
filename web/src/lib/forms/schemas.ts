import { z } from 'zod'

import { CONTACT_SUBJECTS, CURRENCIES, SUPPORT_AREAS, SUPPORT_TYPES, TIME_SLOTS } from './options'

/**
 * Validation des formulaires, partagée entre le navigateur et la Server Action.
 * Les messages d'erreur sont des **codes** (`required`, `phone`…), traduits côté interface
 * avec next-intl (`forms.errors.<code>`).
 */

export const MESSAGE_MAX = { donation: 1000, contact: 2000 } as const

/**
 * Met un numéro au format international. Préfixe +243 (RDC) par défaut :
 * `0812 345 678` → `+243812345678`, `00 33 6…` → `+336…`, `+1 202…` inchangé.
 * Renvoie `null` si le résultat n'a pas la forme d'un numéro E.164.
 */
export function normalizePhone(raw: string): string | null {
  const compact = raw.trim().replace(/[\s.\-()/]/g, '')
  if (!compact) return null
  let phone: string
  if (compact.startsWith('+')) phone = compact
  else if (compact.startsWith('00')) phone = `+${compact.slice(2)}`
  else if (compact.startsWith('243') && compact.length === 12) phone = `+${compact}`
  else if (compact.startsWith('0')) phone = `+243${compact.slice(1)}`
  else phone = `+243${compact}`
  if (!/^\+[1-9]\d{7,14}$/.test(phone)) return null
  // Numéros congolais : 9 chiffres après l'indicatif.
  if (phone.startsWith('+243') && !/^\+243\d{9}$/.test(phone)) return null
  return phone
}

/** Montant saisi librement : « 1 000 », « 250,50 »… Vide → `undefined`. */
export function parseAmount(raw: unknown): number | undefined {
  if (typeof raw !== 'string') return raw === undefined || raw === null ? undefined : NaN
  const compact = raw.replace(/[\s  ]/g, '').replace(',', '.')
  if (!compact) return undefined
  return /^\d+(\.\d{1,2})?$/.test(compact) ? Number(compact) : NaN
}

const emptyToUndefined = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? undefined : v)

const name = z
  .string({ error: 'required' })
  .trim()
  .min(2, { error: 'required' })
  .max(120, { error: 'tooLong' })

const phone = z
  .string({ error: 'required' })
  .trim()
  .min(1, { error: 'required' })
  .transform((value, ctx) => {
    const normalized = normalizePhone(value)
    if (!normalized) {
      ctx.addIssue({ code: 'custom', message: 'phone' })
      return z.NEVER
    }
    return normalized
  })

const optionalPhone = z.preprocess(emptyToUndefined, phone.optional())

const email = z
  .string({ error: 'required' })
  .trim()
  .min(1, { error: 'required' })
  .max(200, { error: 'tooLong' })
  .pipe(z.email({ error: 'email' }))

const optionalEmail = z.preprocess(emptyToUndefined, email.optional())

const optionalText = (max: number) =>
  z.preprocess(emptyToUndefined, z.string().trim().max(max, { error: 'tooLong' }).optional())

const consent = z.literal('on', { error: 'consent' })

const choice = <T extends readonly [string, ...string[]]>(values: T) =>
  z.enum(values, { error: 'required' })

const optionalChoice = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(emptyToUndefined, z.enum(values, { error: 'required' }).optional())

/** Contexte transmis par des champs cachés (jamais saisi par le visiteur). */
const context = {
  locale: z.enum(['fr', 'en']).catch('fr'),
  sourcePage: z
    .string()
    .trim()
    .max(300)
    .regex(/^\/[^\s]*$/)
    .optional()
    .catch(undefined),
}

export const donationSchema = z
  .object({
    name,
    phone,
    email: optionalEmail,
    supportType: choice(SUPPORT_TYPES),
    area: optionalChoice(SUPPORT_AREAS),
    amount: z.preprocess(
      parseAmount,
      z
        .number({ error: 'amount' })
        .positive({ error: 'amount' })
        .max(1_000_000_000, { error: 'amount' })
        .optional(),
    ),
    currency: optionalChoice(CURRENCIES),
    timeSlot: optionalChoice(TIME_SLOTS),
    message: optionalText(MESSAGE_MAX.donation),
    consent,
    ...context,
  })
  // Une devise n'a de sens qu'avec un montant ; par défaut, le dollar.
  .transform(({ currency, ...data }) => ({
    ...data,
    currency: data.amount === undefined ? undefined : (currency ?? 'USD'),
  }))

export const contactSchema = z.object({
  name,
  email,
  phone: optionalPhone,
  organization: optionalText(160),
  subject: choice(CONTACT_SUBJECTS),
  product: optionalText(200),
  message: z
    .string({ error: 'required' })
    .trim()
    .min(10, { error: 'messageShort' })
    .max(MESSAGE_MAX.contact, { error: 'tooLong' }),
  consent,
  ...context,
})

export type DonationInput = z.output<typeof donationSchema>
export type ContactInput = z.output<typeof contactSchema>

export type FieldErrors = Partial<Record<string, string>>

/** Premier code d'erreur par champ (`{ phone: 'phone', consent: 'consent' }`). */
export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form')
    out[key] ??= issue.message
  }
  return out
}
