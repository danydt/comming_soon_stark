import type { Block, Field } from 'payload'

import { linkField } from '@/fields/link'

const heading: Field = { name: 'heading', label: 'Titre', type: 'text', localized: true }
const eyebrow: Field = {
  name: 'eyebrow',
  label: 'Sur-titre',
  type: 'text',
  localized: true,
  admin: { description: 'Petit texte en capitales au-dessus du titre (facultatif).' },
}
const intro: Field = { name: 'intro', label: 'Introduction', type: 'textarea', localized: true }
const buttons: Field = {
  name: 'links',
  label: 'Boutons',
  type: 'array',
  maxRows: 2,
  labels: { singular: 'Bouton', plural: 'Boutons' },
  fields: [linkField({ withStyle: true })],
}

export const HeroBlock: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  labels: { singular: 'Hero (bandeau d’ouverture)', plural: 'Heros' },
  fields: [
    eyebrow,
    { name: 'title', label: 'Titre', type: 'text', localized: true, required: true },
    { name: 'text', label: 'Texte', type: 'textarea', localized: true },
    { name: 'image', label: 'Image', type: 'upload', relationTo: 'media' },
    buttons,
  ],
}

export const RichTextBlock: Block = {
  slug: 'content',
  interfaceName: 'ContentBlock',
  labels: { singular: 'Texte riche', plural: 'Textes riches' },
  fields: [
    eyebrow,
    heading,
    { name: 'content', label: 'Contenu', type: 'richText', localized: true, required: true },
  ],
}

export const KeyFiguresBlock: Block = {
  slug: 'keyFigures',
  interfaceName: 'KeyFiguresBlock',
  labels: { singular: 'Chiffres clés', plural: 'Chiffres clés' },
  fields: [
    eyebrow,
    heading,
    intro,
    {
      name: 'items',
      label: 'Chiffres',
      type: 'array',
      minRows: 1,
      maxRows: 8,
      labels: { singular: 'Chiffre', plural: 'Chiffres' },
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
              admin: { width: '30%', description: 'Ex. « 250+ », « > 86 % ».' },
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
      name: 'source',
      label: 'Source / précision',
      type: 'text',
      localized: true,
      admin: { description: 'Ex. « 2022–2025 », « Source : DHIS2 ».' },
    },
  ],
}

export const SectorsGridBlock: Block = {
  slug: 'sectorsGrid',
  interfaceName: 'SectorsGridBlock',
  labels: { singular: 'Grille de secteurs', plural: 'Grilles de secteurs' },
  fields: [
    eyebrow,
    heading,
    intro,
    {
      name: 'sectors',
      label: 'Secteurs',
      type: 'relationship',
      relationTo: 'sectors',
      hasMany: true,
      admin: {
        description: 'Laisser vide pour afficher tous les secteurs publiés, dans leur ordre.',
      },
    },
  ],
}

export const ProjectsGridBlock: Block = {
  slug: 'projectsGrid',
  interfaceName: 'ProjectsGridBlock',
  labels: { singular: 'Grille de projets', plural: 'Grilles de projets' },
  fields: [
    eyebrow,
    heading,
    intro,
    {
      name: 'projects',
      label: 'Projets choisis',
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
      admin: { description: 'Laisser vide pour une sélection automatique (filtres ci-dessous).' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'sector',
          label: 'Filtrer par secteur',
          type: 'relationship',
          relationTo: 'sectors',
          admin: { width: '50%' },
        },
        {
          name: 'limit',
          label: 'Nombre maximum',
          type: 'number',
          defaultValue: 6,
          min: 1,
          max: 24,
          admin: { width: '50%' },
        },
      ],
    },
    buttons,
  ],
}

export const TeamBlock: Block = {
  slug: 'team',
  interfaceName: 'TeamBlock',
  labels: { singular: 'Équipe', plural: 'Équipes' },
  fields: [
    eyebrow,
    heading,
    intro,
    {
      name: 'groups',
      label: 'Groupes à afficher',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Direction', value: 'direction' },
        { label: 'Chirurgiens', value: 'surgeons' },
        { label: 'Équipe médicale', value: 'medical' },
        { label: 'Administration', value: 'administration' },
        { label: 'Autres', value: 'other' },
      ],
      admin: { description: 'Laisser vide pour afficher toute l’équipe publiée.' },
    },
  ],
}

export const PartnersBlock: Block = {
  slug: 'partners',
  interfaceName: 'PartnersBlock',
  labels: { singular: 'Partenaires', plural: 'Partenaires' },
  fields: [
    eyebrow,
    heading,
    intro,
    {
      name: 'types',
      label: 'Types à afficher',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Bailleurs', value: 'funder' },
        { label: 'Hôpitaux', value: 'hospital' },
        { label: 'Partenaires', value: 'partner' },
      ],
      admin: { description: 'Laisser vide pour afficher tous les partenaires publiés.' },
    },
  ],
}

export const GalleryBlock: Block = {
  slug: 'gallery',
  interfaceName: 'GalleryBlock',
  labels: { singular: 'Galerie', plural: 'Galeries' },
  fields: [
    eyebrow,
    heading,
    {
      name: 'images',
      label: 'Images',
      type: 'array',
      minRows: 1,
      maxRows: 24,
      labels: { singular: 'Image', plural: 'Images' },
      fields: [
        { name: 'image', label: 'Image', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', label: 'Légende', type: 'text', localized: true },
      ],
    },
  ],
}

export const CallToActionBlock: Block = {
  slug: 'cta',
  interfaceName: 'CallToActionBlock',
  labels: { singular: 'Appel à l’action', plural: 'Appels à l’action' },
  fields: [
    heading,
    { name: 'text', label: 'Texte', type: 'textarea', localized: true },
    {
      name: 'tone',
      label: 'Fond',
      type: 'select',
      defaultValue: 'warm',
      options: [
        { label: 'Clair chaud', value: 'warm' },
        { label: 'Noir', value: 'dark' },
      ],
      admin: { description: 'Le rouge reste réservé aux boutons (charte).' },
    },
    buttons,
  ],
}

export const FAQBlock: Block = {
  slug: 'faq',
  interfaceName: 'FAQBlock',
  labels: { singular: 'FAQ', plural: 'FAQ' },
  fields: [
    eyebrow,
    heading,
    {
      name: 'items',
      label: 'Questions',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Question', plural: 'Questions' },
      fields: [
        { name: 'question', label: 'Question', type: 'text', localized: true, required: true },
        { name: 'answer', label: 'Réponse', type: 'richText', localized: true, required: true },
      ],
    },
  ],
}

export const PAGE_BLOCKS: Block[] = [
  HeroBlock,
  RichTextBlock,
  KeyFiguresBlock,
  SectorsGridBlock,
  ProjectsGridBlock,
  TeamBlock,
  PartnersBlock,
  GalleryBlock,
  CallToActionBlock,
  FAQBlock,
]
