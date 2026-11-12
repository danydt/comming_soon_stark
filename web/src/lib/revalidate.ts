import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  PayloadRequest,
} from 'payload'

export type Locale = 'fr' | 'en'
const LOCALES: readonly Locale[] = ['fr', 'en']

/**
 * Étiquettes de cache utilisées par le front (phase 3) :
 * - `<collection>:<locale>`          toute liste de la collection dans une langue ;
 * - `<collection>:<locale>:<slug>`   un document précis ;
 * - `global:<slug>:<locale>`         un global (réglages, en-tête, pied de page).
 */
export const tags = {
  collection: (collection: string, locale: Locale) => `${collection}:${locale}`,
  doc: (collection: string, locale: Locale, slug: string) => `${collection}:${locale}:${slug}`,
  global: (global: string, locale: Locale) => `global:${global}:${locale}`,
}

/**
 * Langues dont l'affichage dépend d'une modification faite dans `locale`.
 * Le français est la langue de repli : le modifier peut changer l'anglais (champ non traduit).
 */
export function affectedLocales(locale: string | null | undefined): Locale[] {
  if (locale === 'en') return ['en']
  return [...LOCALES]
}

type RevalidateFn = (tag: string, profile: 'max') => void

/** Chargé à la demande : `next/cache` n'existe pas hors du serveur Next (seed, scripts). */
async function loadRevalidateTag(): Promise<RevalidateFn | null> {
  try {
    const mod = await import('next/cache')
    return mod.revalidateTag as RevalidateFn
  } catch {
    return null
  }
}

async function revalidate(req: PayloadRequest, list: string[]): Promise<void> {
  if (req.context?.disableRevalidate) return
  const revalidateTag = await loadRevalidateTag()
  if (!revalidateTag) return
  for (const tag of list) {
    try {
      // Next 16 : le second argument (profil) est requis ; `max` = stale-while-revalidate.
      revalidateTag(tag, 'max')
    } catch (error) {
      // Hors contexte de requête Next (ex. `payload run`) : rien à invalider.
      req.payload.logger.debug({ msg: `revalidateTag ignoré (${tag})`, err: error })
    }
  }
}

type Doc = { slug?: unknown; _status?: unknown }

function slugsOf(...docs: (Doc | undefined)[]): string[] {
  return [
    ...new Set(
      docs.map((d) => d?.slug).filter((s): s is string => typeof s === 'string' && s !== ''),
    ),
  ]
}

/** Tags à invalider pour un document (liste + document, ancien et nouveau slug). */
export function docTags(collection: string, locale: string | null | undefined, slugs: string[]) {
  return affectedLocales(locale).flatMap((l) => [
    tags.collection(collection, l),
    ...slugs.map((s) => tags.doc(collection, l, s)),
  ])
}

/**
 * Invalide le cache quand un document publié change, est dépublié ou supprimé.
 * Un simple enregistrement de brouillon ne touche pas au site public.
 */
export function revalidateCollection(collection: string): {
  afterChange: CollectionAfterChangeHook
  afterDelete: CollectionAfterDeleteHook
} {
  return {
    afterChange: async ({ doc, previousDoc, req }) => {
      const d = doc as Doc
      const p = previousDoc as Doc | undefined
      const hasDrafts = d._status !== undefined
      const visibleNow = !hasDrafts || d._status === 'published'
      const visibleBefore = !hasDrafts || p?._status === 'published'
      if (visibleNow || visibleBefore) {
        await revalidate(req, docTags(collection, req.locale, slugsOf(d, p)))
      }
      return doc
    },
    afterDelete: async ({ doc, req }) => {
      await revalidate(req, docTags(collection, 'all', slugsOf(doc as Doc)))
      return doc
    },
  }
}

export function revalidateGlobal(global: string): GlobalAfterChangeHook {
  return async ({ doc, req }) => {
    await revalidate(
      req,
      affectedLocales(req.locale).map((l) => tags.global(global, l)),
    )
    return doc
  }
}
