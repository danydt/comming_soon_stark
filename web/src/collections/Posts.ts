import type { CollectionConfig } from 'payload'

import { publicCollection } from './shared'

export const Posts: CollectionConfig = publicCollection({
  slug: 'posts',
  labels: { singular: 'Actualité', plural: 'Actualités' },
  defaultSort: '-publishedAt',
  admin: {
    group: 'Contenu',
    defaultColumns: ['title', 'category', 'publishedAt', '_status'],
  },
  fields: [
    { name: 'title', label: 'Titre', type: 'text', localized: true, required: true },
    {
      name: 'excerpt',
      label: 'Extrait',
      type: 'textarea',
      localized: true,
      required: true,
      maxLength: 300,
      admin: { description: 'Deux phrases maximum, affichées dans la liste des actualités.' },
    },
    { name: 'content', label: 'Contenu', type: 'richText', localized: true, required: true },
    { name: 'coverImage', label: 'Image de couverture', type: 'upload', relationTo: 'media' },
    {
      name: 'category',
      label: 'Catégorie',
      type: 'select',
      required: true,
      defaultValue: 'news',
      options: [
        { label: 'Actualité', value: 'news' },
        { label: 'Sur le terrain', value: 'field' },
        { label: 'Communiqué', value: 'press' },
        { label: 'Événement', value: 'event' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishedAt',
      label: 'Date',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly', displayFormat: 'dd/MM/yyyy' },
      },
    },
    {
      name: 'author',
      label: 'Auteur',
      type: 'text',
      defaultValue: 'Fondation Stark Hold Solutions',
      admin: { position: 'sidebar', description: 'Nom affiché publiquement.' },
    },
    {
      name: 'sectors',
      label: 'Secteurs liés',
      type: 'relationship',
      relationTo: 'sectors',
      hasMany: true,
      admin: { position: 'sidebar' },
    },
  ],
})
