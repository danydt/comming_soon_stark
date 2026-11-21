import type { CollectionConfig, Field } from 'payload'

import { isStaff } from '@/access'
import {
  ADMIN_LABELS,
  adminOptions,
  CONTACT_SUBJECTS,
  CURRENCIES,
  SUPPORT_AREAS,
  SUPPORT_TYPES,
  TIME_SLOTS,
} from '@/lib/forms/options'

/**
 * Demandes reçues par le site (phase 4) : promesses de don à rappeler et messages de contact.
 * Créées uniquement par le serveur (Server Actions, `overrideAccess`) : l'API publique ne permet
 * ni de les lire ni d'en créer. L'équipe (admin, éditeurs) les traite dans /admin.
 */

const GROUP = 'Demandes'

const access: CollectionConfig['access'] = {
  create: () => false,
  read: isStaff,
  update: isStaff,
  delete: isStaff,
}

/** Champs de suivi, dans la barre latérale. */
const followUp = (statuses: { value: string; label: string }[]): Field[] => [
  {
    name: 'status',
    label: 'Statut',
    type: 'select',
    required: true,
    defaultValue: 'new',
    options: statuses,
    index: true,
    admin: { position: 'sidebar' },
  },
  {
    name: 'assignedTo',
    label: 'Assignée à',
    type: 'relationship',
    relationTo: 'users',
    admin: { position: 'sidebar' },
  },
  {
    name: 'internalNote',
    label: 'Note interne',
    type: 'textarea',
    admin: { position: 'sidebar', description: 'Visible uniquement par l’équipe.' },
  },
]

/** Contexte de l'envoi, en lecture seule. */
const origin: Field[] = [
  {
    type: 'row',
    fields: [
      {
        name: 'locale',
        label: 'Langue',
        type: 'select',
        options: [
          { value: 'fr', label: 'Français' },
          { value: 'en', label: 'English' },
        ],
        admin: { readOnly: true, width: '30%' },
      },
      {
        name: 'sourcePage',
        label: 'Page d’origine',
        type: 'text',
        admin: { readOnly: true, width: '70%' },
      },
    ],
  },
  {
    name: 'consent',
    label: 'Consentement donné',
    type: 'checkbox',
    admin: { readOnly: true },
  },
  {
    // Empreinte de l'IP (HMAC-SHA256 avec PAYLOAD_SECRET) pour la limite d'envois.
    // L'IP n'est jamais stockée en clair ; le champ n'est ni affiché, ni lisible, ni exporté.
    name: 'ipHash',
    type: 'text',
    index: true,
    access: { read: () => false, update: () => false },
    admin: { hidden: true },
    custom: { 'plugin-import-export': { disabled: true } },
  },
]

export const DonationRequests: CollectionConfig = {
  slug: 'donation-requests',
  labels: { singular: 'Demande de don', plural: 'Demandes de don' },
  access,
  admin: {
    group: GROUP,
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'supportType', 'amount', 'status', 'createdAt'],
    listSearchableFields: ['name', 'phone', 'email'],
    description:
      'Personnes à rappeler pour organiser leur don (formulaire de la page « Nous soutenir »).',
  },
  defaultSort: '-createdAt',
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', label: 'Nom complet', type: 'text', required: true },
        { name: 'phone', label: 'Téléphone', type: 'text', required: true },
        { name: 'email', label: 'E-mail', type: 'email' },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'supportType',
          label: 'Type de soutien',
          type: 'select',
          required: true,
          index: true,
          options: adminOptions(SUPPORT_TYPES, ADMIN_LABELS.supportType),
        },
        {
          name: 'area',
          label: 'Domaine à soutenir',
          type: 'select',
          options: adminOptions(SUPPORT_AREAS, ADMIN_LABELS.area),
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'amount', label: 'Montant envisagé', type: 'number', min: 0 },
        {
          name: 'currency',
          label: 'Devise',
          type: 'select',
          options: CURRENCIES.map((c) => ({ value: c, label: c })),
        },
        {
          name: 'timeSlot',
          label: 'Créneau de rappel',
          type: 'select',
          options: adminOptions(TIME_SLOTS, ADMIN_LABELS.timeSlot),
        },
      ],
    },
    { name: 'message', label: 'Message', type: 'textarea' },
    ...origin,
    ...followUp([
      { value: 'new', label: 'Nouvelle' },
      { value: 'contacted', label: 'Rappelée' },
      { value: 'closed', label: 'Clôturée' },
    ]),
  ],
}

export const ContactMessages: CollectionConfig = {
  slug: 'contact-messages',
  labels: { singular: 'Message de contact', plural: 'Messages de contact' },
  access,
  admin: {
    group: GROUP,
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'subject', 'product', 'status', 'createdAt'],
    listSearchableFields: ['name', 'email', 'organization'],
    description: 'Messages du formulaire de la page Contact, dont les demandes de devis.',
  },
  defaultSort: '-createdAt',
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', label: 'Nom', type: 'text', required: true },
        { name: 'email', label: 'E-mail', type: 'email', required: true },
        { name: 'phone', label: 'Téléphone', type: 'text' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'organization', label: 'Organisation', type: 'text' },
        {
          name: 'subject',
          label: 'Sujet',
          type: 'select',
          required: true,
          index: true,
          options: adminOptions(CONTACT_SUBJECTS, ADMIN_LABELS.subject),
        },
        {
          name: 'product',
          label: 'Produit concerné',
          type: 'relationship',
          relationTo: 'products',
        },
      ],
    },
    { name: 'message', label: 'Message', type: 'textarea', required: true },
    ...origin,
    ...followUp([
      { value: 'new', label: 'Nouveau' },
      { value: 'answered', label: 'Répondu' },
      { value: 'closed', label: 'Clos' },
    ]),
  ],
}
