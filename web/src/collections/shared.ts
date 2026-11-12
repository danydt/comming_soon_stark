import type { CollectionConfig } from 'payload'

import { isStaff, publishedOrStaff } from '@/access'
import { localizedSlug } from '@/fields/slug'
import { seoFields } from '@/fields/seo'
import { revalidateCollection } from '@/lib/revalidate'

type Options = {
  /** Champ utilisé pour générer le slug (défaut : `title`). */
  slugFrom?: string
  /** Ajoute le groupe SEO (défaut : oui). */
  seo?: boolean
}

/**
 * Règles communes aux collections publiques (brief, phase 2) :
 * brouillons et versions, slug localisé, groupe SEO, lecture publique du seul contenu publié,
 * écriture réservée à l'équipe, revalidation du cache du site à la publication.
 */
export function publicCollection(
  config: CollectionConfig,
  { slugFrom = 'title', seo = true }: Options = {},
): CollectionConfig {
  const { afterChange, afterDelete } = revalidateCollection(config.slug)
  return {
    ...config,
    access: {
      read: publishedOrStaff,
      readVersions: isStaff,
      create: isStaff,
      update: isStaff,
      delete: isStaff,
      ...config.access,
    },
    versions: {
      drafts: { autosave: { interval: 2000 }, schedulePublish: true },
      maxPerDoc: 25,
    },
    admin: {
      defaultColumns: [slugFrom, 'slug', '_status', 'updatedAt'],
      useAsTitle: slugFrom,
      ...config.admin,
    },
    fields: [...config.fields, localizedSlug(slugFrom), ...(seo ? [seoFields] : [])],
    hooks: {
      ...config.hooks,
      afterChange: [...(config.hooks?.afterChange ?? []), afterChange],
      afterDelete: [...(config.hooks?.afterDelete ?? []), afterDelete],
    },
  }
}
