import type { CollectionConfig } from 'payload'

import { amountVisible } from '@/access'
import { provinceOptions } from '@/lib/provinces'

import { publicCollection } from './shared'

export const Projects: CollectionConfig = publicCollection({
  slug: 'projects',
  labels: { singular: 'Réalisation', plural: 'Réalisations' },
  defaultSort: '-updatedAt',
  admin: {
    group: 'Activités',
    defaultColumns: ['title', 'sector', 'provinces', '_status', 'updatedAt'],
  },
  fields: [
    { name: 'title', label: 'Titre', type: 'text', localized: true, required: true },
    {
      name: 'summary',
      label: 'Résumé',
      type: 'textarea',
      localized: true,
      required: true,
      admin: { description: 'Deux ou trois phrases, affichées sur les cartes.' },
    },
    { name: 'description', label: 'Description détaillée', type: 'richText', localized: true },
    {
      type: 'row',
      fields: [
        {
          name: 'location',
          label: 'Lieu',
          type: 'text',
          required: true,
          admin: { width: '50%', description: 'Ex. « HGR Muya ».' },
        },
        {
          name: 'provinces',
          label: 'Province(s)',
          type: 'select',
          hasMany: true,
          options: provinceOptions,
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'sector',
      label: 'Secteur',
      type: 'relationship',
      relationTo: 'sectors',
      admin: { position: 'sidebar' },
    },
    {
      name: 'featured',
      label: 'Projet phare',
      type: 'checkbox',
      admin: { position: 'sidebar', description: 'Mis en avant sur l’accueil.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'funders',
          label: 'Bailleur(s)',
          type: 'relationship',
          relationTo: 'partners',
          hasMany: true,
          admin: { width: '50%' },
        },
        {
          name: 'partners',
          label: 'Partenaire(s) de mise en œuvre',
          type: 'relationship',
          relationTo: 'partners',
          hasMany: true,
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'team',
      label: 'Équipe mobilisée',
      type: 'relationship',
      relationTo: 'team',
      hasMany: true,
    },
    {
      name: 'amount',
      label: 'Montant',
      type: 'group',
      access: { read: amountVisible },
      admin: {
        description:
          'Invisible sur le site tant que « Afficher le montant » n’est pas coché. Ne jamais publier un montant en négociation.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'value', label: 'Valeur', type: 'number', min: 0, admin: { width: '40%' } },
            {
              name: 'currency',
              label: 'Devise',
              type: 'select',
              defaultValue: 'USD',
              options: [
                { label: 'Dollar US (USD)', value: 'USD' },
                { label: 'Franc congolais (CDF)', value: 'CDF' },
                { label: 'Euro (EUR)', value: 'EUR' },
              ],
              admin: { width: '30%' },
            },
            {
              name: 'display',
              label: 'Afficher le montant',
              type: 'checkbox',
              defaultValue: false,
              admin: { width: '30%', style: { alignSelf: 'flex-end' } },
            },
          ],
        },
      ],
    },
    {
      name: 'beneficiaries',
      label: 'Bénéficiaires',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'count', label: 'Nombre', type: 'number', min: 0, admin: { width: '40%' } },
            {
              name: 'unit',
              label: 'Unité',
              type: 'select',
              defaultValue: 'cases',
              options: [
                { label: 'Cas opérés / pris en charge', value: 'cases' },
                { label: 'Bénéficiaires', value: 'beneficiaries' },
                { label: 'Personnes sensibilisées', value: 'sensitized' },
              ],
              admin: { width: '60%' },
            },
          ],
        },
      ],
    },
    {
      name: 'period',
      label: 'Période',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'start',
              label: 'Début (année)',
              type: 'number',
              min: 1990,
              max: 2100,
              admin: { width: '50%' },
            },
            {
              name: 'end',
              label: 'Fin (année)',
              type: 'number',
              min: 1990,
              max: 2100,
              admin: { width: '50%', description: 'Vide si en cours.' },
            },
          ],
        },
      ],
    },
    { name: 'coverImage', label: 'Image de couverture', type: 'upload', relationTo: 'media' },
    {
      name: 'gallery',
      label: 'Galerie',
      type: 'array',
      labels: { singular: 'Image', plural: 'Images' },
      fields: [
        { name: 'image', label: 'Image', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', label: 'Légende', type: 'text', localized: true },
      ],
    },
  ],
})
