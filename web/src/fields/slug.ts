import { slugField, type RowField, type TextFieldSingleValidation } from 'payload'

import { slugify } from '@/lib/slugify'

/**
 * Slug localisé (un par langue), généré depuis `useAsSlug` puis modifiable.
 * Basé sur `slugField` de Payload (marqué expérimental, voir CLAUDE.md D21) avec notre slugify
 * qui retire les accents. L'unicité est vérifiée par langue (index unique désactivé, voir `uniquePerLocale`).
 */
export function localizedSlug(useAsSlug = 'title'): RowField {
  return slugField({
    useAsSlug,
    localized: true,
    disableUnique: true,
    slugify: ({ valueToSlugify }) =>
      typeof valueToSlugify === 'string' ? slugify(valueToSlugify) : undefined,
    overrides: (row) => {
      const [checkbox, slug] = row.fields
      if (slug && 'name' in slug && slug.type === 'text') {
        slug.label = 'Slug (adresse de la page)'
        slug.admin = {
          ...slug.admin,
          description:
            'Généré depuis le titre. Une fois publié, évitez de le changer : les liens existants casseraient.',
        }
        slug.validate = uniquePerLocale
      }
      if (checkbox && 'name' in checkbox && checkbox.type === 'checkbox') {
        checkbox.label = 'Générer le slug automatiquement'
      }
      return row
    },
  })
}

/** Refuse un slug déjà pris dans la même langue et la même collection. */
const uniquePerLocale: TextFieldSingleValidation = async (value, { req, collectionSlug, id }) => {
  if (typeof value !== 'string' || value === '') return 'Le slug est obligatoire.'
  if (value !== slugify(value)) {
    return 'Uniquement des minuscules sans accents, des chiffres et des tirets.'
  }
  if (!collectionSlug) return true
  const existing = await req.payload.find({
    collection: collectionSlug as 'pages',
    locale: req.locale ?? 'fr',
    draft: true,
    depth: 0,
    limit: 1,
    pagination: false,
    overrideAccess: true,
    where: {
      and: [{ slug: { equals: value } }, ...(id ? [{ id: { not_equals: id } }] : [])],
    },
    req,
  })
  return existing.docs.length === 0 ? true : 'Ce slug est déjà utilisé dans cette langue.'
}
