import type { CollectionConfig } from 'payload'

import { publicCollection } from './shared'

export const TEAM_GROUPS = [
  { label: 'Direction', value: 'direction' },
  { label: 'Chirurgiens', value: 'surgeons' },
  { label: 'Équipe médicale', value: 'medical' },
  { label: 'Administration', value: 'administration' },
  { label: 'Autres', value: 'other' },
] as const

export const Team: CollectionConfig = publicCollection(
  {
    slug: 'team',
    labels: { singular: 'Membre de l’équipe', plural: 'Équipe' },
    defaultSort: 'order',
    admin: {
      group: 'Organisation',
      defaultColumns: ['name', 'role', 'group', 'order', '_status'],
      description:
        'Ne jamais saisir les téléphones ni les e-mails personnels : cette fiche est publique.',
    },
    fields: [
      { name: 'name', label: 'Nom', type: 'text', required: true },
      { name: 'role', label: 'Fonction', type: 'text', localized: true, required: true },
      {
        type: 'row',
        fields: [
          {
            name: 'group',
            label: 'Groupe',
            type: 'select',
            required: true,
            options: [...TEAM_GROUPS],
            admin: { width: '50%' },
          },
          {
            name: 'order',
            label: 'Ordre',
            type: 'number',
            defaultValue: 10,
            admin: { width: '50%' },
          },
        ],
      },
      {
        name: 'bio',
        label: 'Biographie courte',
        type: 'textarea',
        localized: true,
        maxLength: 600,
      },
      {
        type: 'row',
        fields: [
          {
            name: 'training',
            label: 'Formation',
            type: 'text',
            localized: true,
            admin: { width: '50%' },
          },
          {
            name: 'experience',
            label: 'Expérience',
            type: 'text',
            localized: true,
            admin: { width: '50%' },
          },
        ],
      },
      {
        name: 'photo',
        label: 'Photo',
        type: 'upload',
        relationTo: 'media',
        admin: { description: 'Sans photo, les initiales sont affichées.' },
      },
    ],
  },
  { slugFrom: 'name', seo: false },
)

export const Partners: CollectionConfig = publicCollection(
  {
    slug: 'partners',
    labels: { singular: 'Partenaire', plural: 'Partenaires' },
    defaultSort: 'order',
    admin: {
      group: 'Organisation',
      defaultColumns: ['name', 'type', 'order', '_status'],
      description:
        'Un partenaire en négociation reste en brouillon : il n’apparaît pas sur le site.',
    },
    fields: [
      { name: 'name', label: 'Nom', type: 'text', required: true },
      {
        type: 'row',
        fields: [
          {
            name: 'type',
            label: 'Type',
            type: 'select',
            required: true,
            options: [
              { label: 'Bailleur', value: 'funder' },
              { label: 'Hôpital', value: 'hospital' },
              { label: 'Partenaire', value: 'partner' },
            ],
            admin: { width: '50%' },
          },
          {
            name: 'order',
            label: 'Ordre',
            type: 'number',
            defaultValue: 10,
            admin: { width: '50%' },
          },
        ],
      },
      { name: 'logo', label: 'Logo', type: 'upload', relationTo: 'media' },
      {
        name: 'url',
        label: 'Site web',
        type: 'text',
        validate: (v: unknown) =>
          !v || (typeof v === 'string' && /^https:\/\//.test(v)) ? true : 'Adresse en https://',
      },
      { name: 'description', label: 'Présentation', type: 'textarea', localized: true },
    ],
  },
  { slugFrom: 'name', seo: false },
)
