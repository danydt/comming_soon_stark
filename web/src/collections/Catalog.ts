import type { CollectionConfig } from 'payload'

import { publicCollection } from './shared'

export const PRODUCT_CATEGORIES = [
  { label: 'Aliments pour poissons', value: 'fish-feed' },
  { label: 'Équipements', value: 'equipment' },
  { label: 'Intrants', value: 'inputs' },
] as const

export const Brands: CollectionConfig = publicCollection(
  {
    slug: 'brands',
    labels: { singular: 'Marque', plural: 'Marques' },
    admin: { group: 'Catalogue', defaultColumns: ['name', '_status', 'updatedAt'] },
    fields: [
      { name: 'name', label: 'Nom', type: 'text', required: true },
      { name: 'logo', label: 'Logo', type: 'upload', relationTo: 'media' },
      {
        name: 'website',
        label: 'Site web',
        type: 'text',
        validate: (v: unknown) =>
          !v || (typeof v === 'string' && /^https:\/\//.test(v)) ? true : 'Adresse en https://',
      },
      { name: 'description', label: 'Présentation', type: 'textarea', localized: true },
    ],
  },
  { slugFrom: 'name' },
)

export const Products: CollectionConfig = publicCollection(
  {
    slug: 'products',
    labels: { singular: 'Produit', plural: 'Produits' },
    admin: {
      group: 'Catalogue',
      defaultColumns: ['name', 'brand', 'category', 'availability', '_status'],
      description:
        'Catalogue sans paiement : chaque fiche propose « Demander un devis », qui ouvre le formulaire de rappel.',
    },
    fields: [
      { name: 'name', label: 'Nom', type: 'text', localized: true, required: true },
      {
        type: 'row',
        fields: [
          {
            name: 'brand',
            label: 'Marque',
            type: 'relationship',
            relationTo: 'brands',
            admin: { width: '50%' },
          },
          {
            name: 'category',
            label: 'Catégorie',
            type: 'select',
            required: true,
            options: [...PRODUCT_CATEGORIES],
            admin: { width: '50%' },
          },
        ],
      },
      {
        name: 'availability',
        label: 'Disponibilité',
        type: 'select',
        required: true,
        defaultValue: 'available',
        options: [
          { label: 'Disponible', value: 'available' },
          { label: 'Sur commande', value: 'on-order' },
          { label: 'Indisponible', value: 'unavailable' },
        ],
        admin: { position: 'sidebar' },
      },
      {
        name: 'excerpt',
        label: 'Accroche',
        type: 'textarea',
        localized: true,
        admin: { description: 'Une phrase, affichée sur les cartes du catalogue.' },
      },
      { name: 'description', label: 'Description', type: 'richText', localized: true },
      {
        name: 'specs',
        label: 'Caractéristiques',
        type: 'array',
        labels: { singular: 'Caractéristique', plural: 'Caractéristiques' },
        fields: [
          {
            type: 'row',
            fields: [
              {
                name: 'label',
                label: 'Caractéristique',
                type: 'text',
                localized: true,
                required: true,
                admin: { width: '40%' },
              },
              {
                name: 'value',
                label: 'Valeur',
                type: 'text',
                localized: true,
                required: true,
                admin: { width: '60%' },
              },
            ],
          },
        ],
      },
      {
        name: 'photos',
        label: 'Photos',
        type: 'upload',
        relationTo: 'media',
        hasMany: true,
      },
    ],
  },
  { slugFrom: 'name' },
)
