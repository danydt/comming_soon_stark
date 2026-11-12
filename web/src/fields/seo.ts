import type { Field } from 'payload'

/** Groupe SEO commun : titre méta, description, image de partage (valeurs de repli en phase 5). */
export const seoFields: Field = {
  name: 'meta',
  label: 'Référencement (SEO)',
  type: 'group',
  admin: {
    description:
      'Facultatif. À défaut, le titre et le résumé du contenu sont utilisés pour Google et les réseaux sociaux.',
  },
  fields: [
    {
      name: 'title',
      label: 'Titre méta',
      type: 'text',
      localized: true,
      maxLength: 70,
      admin: { description: '70 caractères au plus.' },
    },
    {
      name: 'description',
      label: 'Description méta',
      type: 'textarea',
      localized: true,
      maxLength: 160,
      admin: { description: '160 caractères au plus.' },
    },
    {
      name: 'image',
      label: 'Image de partage',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Idéalement 1200 × 630 px.' },
    },
  ],
}
