import type { CollectionConfig } from 'payload'

import { PAGE_BLOCKS } from '@/blocks'

import { publicCollection } from './shared'

export const Pages: CollectionConfig = publicCollection({
  slug: 'pages',
  labels: { singular: 'Page', plural: 'Pages' },
  admin: {
    group: 'Contenu',
    description: 'Pages construites à partir de blocs (Accueil, À propos, Contact…).',
  },
  fields: [
    { name: 'title', label: 'Titre', type: 'text', localized: true, required: true },
    {
      name: 'layout',
      label: 'Contenu de la page',
      type: 'blocks',
      blocks: PAGE_BLOCKS,
      labels: { singular: 'Bloc', plural: 'Blocs' },
    },
  ],
})
