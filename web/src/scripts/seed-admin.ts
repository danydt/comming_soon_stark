/**
 * Crée (ou met à jour) le premier administrateur. Idempotent : peut être relancé sans doublon.
 * Usage : pnpm seed:admin   (lit ADMIN_EMAIL, ADMIN_PASSWORD et ADMIN_NAME dans .env)
 */
import { getPayload } from 'payload'

import config from '@payload-config'

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
const password = process.env.ADMIN_PASSWORD
const name = process.env.ADMIN_NAME?.trim() || 'Administrateur'

if (!email || !password) {
  console.error('ADMIN_EMAIL et ADMIN_PASSWORD sont requis (voir .env.example).')
  process.exit(1)
}
if (password.length < 12) {
  console.error('ADMIN_PASSWORD doit contenir au moins 12 caractères.')
  process.exit(1)
}

const payload = await getPayload({ config })

const existing = await payload.find({
  collection: 'users',
  where: { email: { equals: email } },
  limit: 1,
  overrideAccess: true,
})

if (existing.docs[0]) {
  const user = existing.docs[0]
  if (user.role !== 'admin') {
    await payload.update({
      collection: 'users',
      id: user.id,
      data: { role: 'admin' },
      overrideAccess: true,
    })
    payload.logger.info(`Utilisateur ${email} promu administrateur.`)
  } else {
    payload.logger.info(`Administrateur ${email} déjà présent : rien à faire.`)
  }
} else {
  await payload.create({
    collection: 'users',
    data: { email, password, name, role: 'admin' },
    overrideAccess: true,
  })
  payload.logger.info(`Administrateur ${email} créé.`)
}

process.exit(0)
