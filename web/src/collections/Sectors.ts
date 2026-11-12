import type { CollectionConfig } from 'payload'

import { publicCollection } from './shared'

/** Icônes lucide-react proposées (noms kebab-case, rendus en phase 3). */
export const SECTOR_ICONS = [
  { label: 'Santé (cœur)', value: 'heart-pulse' },
  { label: 'Agriculture (pousse)', value: 'sprout' },
  { label: 'Élevage (bétail)', value: 'beef' },
  { label: 'Pêche (poisson)', value: 'fish' },
  { label: 'Commerce (colis)', value: 'package' },
  { label: 'Génie civil (casque)', value: 'hard-hat' },
  { label: 'Affaires sociales (mains)', value: 'hand-heart' },
  { label: 'Environnement (feuille)', value: 'leaf' },
  { label: 'Gouvernance (institution)', value: 'landmark' },
  { label: 'Formation (diplôme)', value: 'graduation-cap' },
] as const

export const Sectors: CollectionConfig = publicCollection({
  slug: 'sectors',
  labels: { singular: 'Secteur', plural: 'Secteurs' },
  defaultSort: 'order',
  admin: {
    group: 'Activités',
    defaultColumns: ['title', 'order', '_status', 'updatedAt'],
    description:
      'Domaines d’intervention. Pour ouvrir un nouveau secteur (génie civil, environnement…), créez-le ici puis publiez-le.',
  },
  fields: [
    { name: 'title', label: 'Titre', type: 'text', localized: true, required: true },
    {
      name: 'tagline',
      label: 'Accroche',
      type: 'textarea',
      localized: true,
      required: true,
      admin: { description: 'Une ou deux phrases, affichées sur les cartes.' },
    },
    { name: 'description', label: 'Description', type: 'richText', localized: true },
    {
      type: 'row',
      fields: [
        {
          name: 'icon',
          label: 'Icône',
          type: 'select',
          options: [...SECTOR_ICONS],
          admin: { width: '50%' },
        },
        {
          name: 'order',
          label: 'Ordre d’affichage',
          type: 'number',
          defaultValue: 10,
          admin: { width: '50%', description: 'Du plus petit au plus grand.' },
        },
      ],
    },
    { name: 'coverImage', label: 'Image de couverture', type: 'upload', relationTo: 'media' },
    {
      name: 'keyPoints',
      label: 'Points clés',
      type: 'array',
      labels: { singular: 'Point clé', plural: 'Points clés' },
      fields: [{ name: 'text', label: 'Texte', type: 'text', localized: true, required: true }],
    },
    {
      name: 'figures',
      label: 'Chiffres du secteur',
      type: 'array',
      labels: { singular: 'Chiffre', plural: 'Chiffres' },
      admin: { description: 'Facultatif. Uniquement des chiffres sourcés.' },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'value',
              label: 'Valeur',
              type: 'text',
              localized: true,
              required: true,
              admin: { width: '30%' },
            },
            {
              name: 'label',
              label: 'Libellé',
              type: 'text',
              localized: true,
              required: true,
              admin: { width: '70%' },
            },
          ],
        },
      ],
    },
    {
      name: 'methodology',
      label: 'Méthodologie (étapes)',
      type: 'array',
      labels: { singular: 'Étape', plural: 'Étapes' },
      fields: [
        { name: 'title', label: 'Étape', type: 'text', localized: true, required: true },
        { name: 'text', label: 'Détail', type: 'textarea', localized: true },
      ],
    },
    {
      name: 'callout',
      label: 'Appel au soutien',
      type: 'group',
      admin: { description: 'Facultatif : encadré « Soutenez-nous » sur la page du secteur.' },
      fields: [
        { name: 'title', label: 'Titre', type: 'text', localized: true },
        { name: 'text', label: 'Texte', type: 'textarea', localized: true },
      ],
    },
  ],
})
