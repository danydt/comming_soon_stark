import type { CollectionConfig } from 'payload'

import { anyone, isStaff } from '@/access'

/**
 * Médiathèque. Fichiers stockés dans Supabase Storage (bucket public `media`) via l'adaptateur S3,
 * ou sur le disque local (`web/media/`) si S3 n'est pas configuré en développement.
 * Le modèle complet (texte alternatif localisé obligatoire, etc.) est finalisé en phase 2.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Média', plural: 'Médias' },
  admin: {
    group: 'Contenu',
    description:
      'Images jusqu’à 4 Mo (limite des envois sur Vercel). Les tailles d’affichage sont générées automatiquement.',
  },
  access: {
    read: anyone,
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  fields: [
    {
      name: 'alt',
      label: 'Texte alternatif',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'Décrit l’image pour les personnes malvoyantes et le référencement.',
      },
    },
  ],
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'],
    focalPoint: true,
    formatOptions: { format: 'webp', options: { quality: 82 } },
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        formatOptions: { format: 'webp', options: { quality: 78 } },
      },
      { name: 'card', width: 768, formatOptions: { format: 'webp', options: { quality: 80 } } },
      { name: 'hero', width: 1600, formatOptions: { format: 'webp', options: { quality: 80 } } },
    ],
  },
}
