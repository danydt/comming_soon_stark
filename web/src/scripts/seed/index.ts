/**
 * Seed idempotent : `pnpm seed`.
 * Crée ou met à jour (jamais en double) le contenu initial en FR puis en EN.
 * Clé de rapprochement : le slug français (médias : le nom de fichier).
 * Le cache du site n'est pas invalidé pendant le seed (`disableRevalidate`).
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import config from '@payload-config'
import { getPayload, type CollectionSlug, type Payload } from 'payload'

import {
  BRANDS,
  FOOTER,
  HEADER,
  MEDIA,
  PAGES,
  PARTNERS,
  PRODUCTS,
  PROJECTS,
  SECTORS,
  SITE_SETTINGS,
  TEAM,
  type SeedDoc,
} from './data'
import { pick, withRowIds, type Locale } from './helpers'

const here = path.dirname(fileURLToPath(import.meta.url))
const PHOTOS_DIR = path.resolve(here, '../../../../photos')
const context = { disableRevalidate: true }

type Ids = Map<string, number | string>
const ids: Ids = new Map()
const key = (collection: string, k: string) => `${collection}:${k}`

/** Remplace les références `{ __ref: [collection, clé] }` par les identifiants créés. */
function resolveRefs(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(resolveRefs)
  if (value && typeof value === 'object') {
    const r = (value as { __ref?: [string, string] }).__ref
    if (r) {
      const id = ids.get(key(r[0], r[1]))
      if (id === undefined) throw new Error(`Référence introuvable : ${r[0]} « ${r[1]} »`)
      return id
    }
    if ('root' in value) return value
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolveRefs(v)]))
  }
  return value
}

const localeData = (data: unknown, locale: Locale) =>
  pick(resolveRefs(data), locale) as Record<string, unknown>

type Counts = { created: number; updated: number }

/**
 * Le seed écrit des données construites dynamiquement dans plusieurs collections :
 * les types génériques de Payload (union de toutes les collections) ne peuvent pas les vérifier.
 * Cast unique et localisé ici ; la validation de Payload s'applique toujours à l'exécution.
 */
type Args = Record<string, unknown>
const write = (payload: Payload) => ({
  create: (args: Args) => payload.create(args as never) as Promise<{ id: number | string }>,
  update: (args: Args) => payload.update(args as never) as Promise<unknown>,
})

async function upsert(payload: Payload, collection: CollectionSlug, doc: SeedDoc, counts: Counts) {
  const slugs = pick(doc.slug, 'fr') as string
  const slugEn = pick(doc.slug, 'en') as string
  const draft = doc.status === 'draft'
  const common = { context, overrideAccess: true, depth: 0, draft } as const

  const existing = await payload.find({
    collection,
    locale: 'fr',
    draft: true,
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { slug: { equals: slugs } },
  })

  const fr = {
    ...localeData(doc.data, 'fr'),
    slug: slugs,
    generateSlug: false,
    _status: doc.status,
  }
  let id: number | string
  if (existing.docs[0]) {
    id = existing.docs[0].id
    await write(payload).update({ collection, id, locale: 'fr', data: fr, ...common })
    counts.updated++
  } else {
    const created = await write(payload).create({ collection, locale: 'fr', data: fr, ...common })
    id = created.id
    counts.created++
  }

  // Version anglaise : mêmes lignes de tableaux/blocs (ids repris), champs localisés en anglais.
  const saved = await payload.findByID({
    collection,
    id,
    locale: 'fr',
    draft: true,
    depth: 0,
    overrideAccess: true,
  })
  const en = withRowIds(
    { ...localeData(doc.data, 'en'), slug: slugEn, generateSlug: false, _status: doc.status },
    saved,
  ) as Record<string, unknown>
  await write(payload).update({ collection, id, locale: 'en', data: en, ...common })

  ids.set(key(collection, doc.key), id)
}

async function seedMedia(payload: Payload, counts: Counts) {
  for (const m of MEDIA) {
    const filename = m.file.replace(/\.[a-z]+$/i, '.webp')
    const found = await payload.find({
      collection: 'media',
      where: { filename: { equals: filename } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    let id = found.docs[0]?.id
    if (id === undefined) {
      const created = await payload.create({
        collection: 'media',
        locale: 'fr',
        data: { alt: m.alt.fr },
        filePath: path.join(PHOTOS_DIR, m.file),
        overrideAccess: true,
        context,
      })
      id = created.id
      counts.created++
    } else {
      await payload.update({
        collection: 'media',
        id,
        locale: 'fr',
        data: { alt: m.alt.fr },
        overrideAccess: true,
        context,
      })
      counts.updated++
    }
    await payload.update({
      collection: 'media',
      id,
      locale: 'en',
      data: { alt: m.alt.en },
      overrideAccess: true,
      context,
    })
    ids.set(key('media', m.key), id)
  }
}

async function seedGlobal(
  payload: Payload,
  slug: 'site-settings' | 'header' | 'footer',
  data: unknown,
) {
  await payload.updateGlobal({
    slug,
    locale: 'fr',
    data: localeData(data, 'fr'),
    overrideAccess: true,
    context,
    depth: 0,
  })
  const saved = await payload.findGlobal({ slug, locale: 'fr', depth: 0, overrideAccess: true })
  await payload.updateGlobal({
    slug,
    locale: 'en',
    data: withRowIds(localeData(data, 'en'), saved) as Record<string, unknown>,
    overrideAccess: true,
    context,
    depth: 0,
  })
}

async function main() {
  const payload = await getPayload({ config })
  const report: Record<string, Counts> = {}
  const run = async (label: string, fn: (c: Counts) => Promise<void>) => {
    const c = { created: 0, updated: 0 }
    await fn(c)
    report[label] = c
    payload.logger.info(`Seed ${label} : ${c.created} créé(s), ${c.updated} mis à jour.`)
  }

  await run('médias', (c) => seedMedia(payload, c))
  const steps: [CollectionSlug, SeedDoc[]][] = [
    ['partners', PARTNERS],
    ['team', TEAM],
    ['sectors', SECTORS],
    ['projects', PROJECTS],
    ['brands', BRANDS],
    ['products', PRODUCTS],
    ['pages', PAGES],
  ]
  for (const [collection, docs] of steps) {
    await run(collection, async (c) => {
      for (const doc of docs) await upsert(payload, collection, doc, c)
    })
  }
  await run('globals', async () => {
    await seedGlobal(payload, 'site-settings', SITE_SETTINGS)
    await seedGlobal(payload, 'header', HEADER)
    await seedGlobal(payload, 'footer', FOOTER)
  })

  payload.logger.info('Seed terminé.')
  process.exit(0)
}

// `payload run` quitte dès que le module est chargé : on attend explicitement la fin du seed.
try {
  await main()
} catch (error: unknown) {
  console.error(error)
  process.exit(1)
}
