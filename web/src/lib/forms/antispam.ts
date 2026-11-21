import 'server-only'

import { createHmac, timingSafeEqual } from 'node:crypto'

import type { Payload } from 'payload'

import { requireEnv } from '@/lib/env'

import { HONEYPOT_FIELD } from './constants'

/**
 * Anti-spam des formulaires (phase 4) :
 * - champ piège `website`, invisible : rempli → envoi ignoré (succès simulé) ;
 * - délai minimum : le formulaire porte l'heure de son affichage, signée (HMAC) pour ne pas
 *   pouvoir être falsifiée ; un envoi moins de 3 s après est refusé ;
 * - limite par IP : 5 envois par heure, tous formulaires confondus. On ne stocke qu'une
 *   empreinte HMAC-SHA256 de l'IP (clé : PAYLOAD_SECRET), jamais l'IP en clair.
 */

export const MIN_DELAY_MS = 3_000
const MAX_AGE_MS = 24 * 60 * 60 * 1000
export const RATE_LIMIT = { max: 5, windowMs: 60 * 60 * 1000 }
export const HONEYPOT = HONEYPOT_FIELD

const secret = () => requireEnv('PAYLOAD_SECRET', 'dev-secret-a-remplacer')
const hmac = (value: string) => createHmac('sha256', secret()).update(value).digest('hex')

/** Jeton « formulaire affiché à t » : `t.signature`. */
export function signStartedAt(now = Date.now()): string {
  return `${now}.${hmac(`form:${now}`)}`
}

export type StartedAtCheck = 'ok' | 'invalid' | 'tooFast'

export function checkStartedAt(token: unknown, now = Date.now()): StartedAtCheck {
  if (typeof token !== 'string') return 'invalid'
  const [ts, signature] = token.split('.')
  const startedAt = Number(ts)
  if (!Number.isSafeInteger(startedAt) || !signature) return 'invalid'
  const expected = Buffer.from(hmac(`form:${startedAt}`))
  const given = Buffer.from(signature)
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return 'invalid'
  const elapsed = now - startedAt
  if (elapsed < MIN_DELAY_MS) return 'tooFast'
  if (elapsed > MAX_AGE_MS) return 'invalid'
  return 'ok'
}

/**
 * IP du visiteur. Sur Vercel, `x-forwarded-for` est réécrit par la plateforme (première valeur
 * = client) ; en local, il est absent et toutes les requêtes partagent l'empreinte « local ».
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || headers.get('x-real-ip')?.trim() || 'local'
}

export const hashIp = (ip: string) => hmac(`ip:${ip}`)

const LIMITED_COLLECTIONS = ['donation-requests', 'contact-messages'] as const

/** Vrai si cette empreinte a déjà envoyé `RATE_LIMIT.max` demandes dans l'heure. */
export async function isRateLimited(payload: Payload, ipHash: string, now = Date.now()) {
  const since = new Date(now - RATE_LIMIT.windowMs).toISOString()
  const counts = await Promise.all(
    LIMITED_COLLECTIONS.map((collection) =>
      payload.count({
        collection,
        overrideAccess: true,
        where: { and: [{ ipHash: { equals: ipHash } }, { createdAt: { greater_than: since } }] },
      }),
    ),
  )
  return counts.reduce((sum, { totalDocs }) => sum + totalDocs, 0) >= RATE_LIMIT.max
}
