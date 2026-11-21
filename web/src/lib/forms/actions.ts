'use server'

import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'

import { getProduct } from '@/lib/content'

import {
  checkStartedAt,
  clientIp,
  hashIp,
  HONEYPOT,
  isRateLimited,
  signStartedAt,
} from './antispam'
import { sendContactEmails, sendDonationEmails } from './emails'
import { contactSchema, donationSchema, fieldErrors, type FieldErrors } from './schemas'

/**
 * Server Actions des formulaires « Nous soutenir » et « Contact ».
 * Ordre : champ piège → délai minimum → validation zod → limite par IP → enregistrement
 * (`overrideAccess`, la collection refuse toute création publique) → e-mails.
 */

export type FormState =
  | { status: 'idle' }
  | { status: 'success' }
  | {
      status: 'error'
      /** Erreur générale (code traduit côté interface, `forms.errors.<code>`). */
      code: 'invalid' | 'rateLimit' | 'tooFast' | 'server'
      errors?: FieldErrors
    }

/**
 * Jeton « formulaire affiché à t », demandé par le formulaire à son montage : les pages sont
 * statiques (ISR), un jeton posé au rendu porterait l'heure de génération de la page.
 */
export async function issueFormToken(): Promise<string> {
  return signStartedAt()
}

type Guard = { ipHash: string } | FormState

async function guard(formData: FormData): Promise<Guard> {
  // Robot : succès simulé, rien n'est enregistré.
  const trap = formData.get(HONEYPOT)
  if (typeof trap === 'string' && trap.trim() !== '') return { status: 'success' }
  const timing = checkStartedAt(formData.get('startedAt'))
  if (timing !== 'ok') return { status: 'error', code: 'tooFast' }
  const ipHash = hashIp(clientIp(await headers()))
  return { ipHash }
}

const entries = (formData: FormData) =>
  Object.fromEntries([...formData.entries()].filter(([, v]) => typeof v === 'string'))

export async function submitDonation(_prev: FormState, formData: FormData): Promise<FormState> {
  const checked = await guard(formData)
  if ('status' in checked) return checked

  const parsed = donationSchema.safeParse(entries(formData))
  if (!parsed.success)
    return { status: 'error', code: 'invalid', errors: fieldErrors(parsed.error) }
  const data = parsed.data

  try {
    const payload = await getPayload({ config })
    if (await isRateLimited(payload, checked.ipHash)) return { status: 'error', code: 'rateLimit' }
    const doc = await payload.create({
      collection: 'donation-requests',
      overrideAccess: true,
      data: { ...data, consent: true, ipHash: checked.ipHash, status: 'new' },
    })
    await sendDonationEmails(payload, doc.id, data)
    return { status: 'success' }
  } catch (error) {
    console.error('Formulaire de don :', error)
    return { status: 'error', code: 'server' }
  }
}

export async function submitContact(_prev: FormState, formData: FormData): Promise<FormState> {
  const checked = await guard(formData)
  if ('status' in checked) return checked

  const parsed = contactSchema.safeParse(entries(formData))
  if (!parsed.success)
    return { status: 'error', code: 'invalid', errors: fieldErrors(parsed.error) }
  const { product: productSlug, ...data } = parsed.data

  try {
    const payload = await getPayload({ config })
    if (await isRateLimited(payload, checked.ipHash)) return { status: 'error', code: 'rateLimit' }
    // Produit d'une demande de devis : slug publié dans la langue du visiteur, sinon ignoré.
    const product = productSlug ? await getProduct(data.locale, productSlug) : null
    const doc = await payload.create({
      collection: 'contact-messages',
      overrideAccess: true,
      data: {
        ...data,
        product: product?.id,
        consent: true,
        ipHash: checked.ipHash,
        status: 'new',
      },
    })
    await sendContactEmails(payload, doc.id, parsed.data, product?.name)
    return { status: 'success' }
  } catch (error) {
    console.error('Formulaire de contact :', error)
    return { status: 'error', code: 'server' }
  }
}
