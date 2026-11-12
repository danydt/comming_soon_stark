import type { GlobalConfig } from 'payload'

import { anyone, isAdmin, isStaff } from '@/access'
import { linkField } from '@/fields/link'
import { provinceOptions } from '@/lib/provinces'
import { revalidateGlobal } from '@/lib/revalidate'

const httpsOrEmpty = (v: unknown) =>
  !v || (typeof v === 'string' && /^https:\/\//.test(v)) ? true : 'Adresse en https://'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Réglages du site',
  admin: { group: 'Paramètres' },
  // Coordonnées et identité : modifiables par les administrateurs uniquement.
  access: { read: anyone, update: isAdmin },
  hooks: { afterChange: [revalidateGlobal('site-settings')] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identité',
          fields: [
            { name: 'name', label: 'Nom', type: 'text', required: true },
            { name: 'shortName', label: 'Sigle', type: 'text' },
            { name: 'tagline', label: 'Slogan', type: 'text', localized: true, required: true },
            {
              name: 'legalStatus',
              label: 'Statut légal',
              type: 'textarea',
              localized: true,
              admin: { description: 'Forme juridique et arrêté (affichés dans le pied de page).' },
            },
            {
              name: 'homePage',
              label: 'Page d’accueil',
              type: 'relationship',
              relationTo: 'pages',
              required: true,
            },
            {
              name: 'interventionZones',
              label: 'Zones d’intervention',
              type: 'select',
              hasMany: true,
              options: provinceOptions,
            },
          ],
        },
        {
          label: 'Coordonnées',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'phone',
                  label: 'Téléphone (affiché)',
                  type: 'text',
                  required: true,
                  admin: { width: '50%', description: 'Ex. +243 904 947 476' },
                },
                {
                  name: 'email',
                  label: 'E-mail public',
                  type: 'email',
                  required: true,
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'headOffice',
              label: 'Adresse du siège',
              type: 'textarea',
              localized: true,
              required: true,
            },
            {
              name: 'branchOffice',
              label: 'Adresse de l’antenne',
              type: 'textarea',
              localized: true,
            },
          ],
        },
        {
          label: 'WhatsApp',
          fields: [
            {
              name: 'whatsappNumber',
              label: 'Numéro WhatsApp',
              type: 'text',
              required: true,
              validate: (v: unknown) =>
                typeof v === 'string' && /^[1-9]\d{7,14}$/.test(v)
                  ? true
                  : 'Format international sans + ni espaces, ex. 243904947476.',
            },
            {
              name: 'whatsappMessage',
              label: 'Message prérempli',
              type: 'textarea',
              localized: true,
              required: true,
              admin: {
                description: 'Texte proposé quand on ouvre la discussion (une version par langue).',
              },
            },
          ],
        },
        {
          label: 'Réseaux sociaux',
          description: 'Laisser vide tant que le compte n’existe pas : le lien ne s’affichera pas.',
          fields: [
            { name: 'xUrl', label: 'X (Twitter)', type: 'text', validate: httpsOrEmpty },
            { name: 'linkedinUrl', label: 'LinkedIn', type: 'text', validate: httpsOrEmpty },
            { name: 'facebookUrl', label: 'Facebook', type: 'text', validate: httpsOrEmpty },
          ],
        },
      ],
    },
  ],
}

const navItems = {
  name: 'items',
  label: 'Liens',
  type: 'array' as const,
  labels: { singular: 'Lien', plural: 'Liens' },
  fields: [linkField()],
}

export const Header: GlobalConfig = {
  slug: 'header',
  label: 'En-tête (navigation)',
  admin: { group: 'Paramètres' },
  access: { read: anyone, update: isStaff },
  hooks: { afterChange: [revalidateGlobal('header')] },
  fields: [{ ...navItems, maxRows: 8 }],
}

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Pied de page',
  admin: { group: 'Paramètres' },
  access: { read: anyone, update: isStaff },
  hooks: { afterChange: [revalidateGlobal('footer')] },
  fields: [
    {
      name: 'about',
      label: 'Présentation courte',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'columns',
      label: 'Colonnes de liens',
      type: 'array',
      maxRows: 3,
      labels: { singular: 'Colonne', plural: 'Colonnes' },
      fields: [
        { name: 'title', label: 'Titre', type: 'text', localized: true, required: true },
        navItems,
      ],
    },
    {
      name: 'legalLinks',
      label: 'Liens légaux',
      type: 'array',
      labels: { singular: 'Lien', plural: 'Liens' },
      fields: [linkField()],
    },
  ],
}
