import type { Field, GroupField } from 'payload'

export const LINKABLE = ['pages', 'sectors', 'projects', 'products', 'posts'] as const

/** Accepte un chemin interne (/…), https://, mailto:, tel: ou une ancre (#…). */
export function validateHref(value: unknown): true | string {
  if (typeof value !== 'string' || value.trim() === '') return 'L’adresse est obligatoire.'
  return /^(\/|#|https:\/\/|mailto:|tel:)/.test(value.trim())
    ? true
    : 'Commencez par / (page du site), https://, mailto: ou tel:.'
}

type LinkOptions = { name?: string; label?: string; withStyle?: boolean }

/**
 * Lien : vers un contenu du site (référence, suit les changements de slug)
 * ou vers une adresse saisie (chemin sans préfixe de langue, ex. /secteurs, ou lien externe).
 */
export function linkField({
  name = 'link',
  label = 'Lien',
  withStyle = false,
}: LinkOptions = {}): GroupField {
  const fields: Field[] = [
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          label: 'Type de lien',
          type: 'radio',
          defaultValue: 'custom',
          options: [
            { label: 'Contenu du site', value: 'reference' },
            { label: 'Adresse', value: 'custom' },
          ],
          admin: { layout: 'horizontal', width: '50%' },
        },
        {
          name: 'newTab',
          label: 'Ouvrir dans un nouvel onglet',
          type: 'checkbox',
          admin: { width: '50%', style: { alignSelf: 'flex-end' } },
        },
      ],
    },
    {
      name: 'label',
      label: 'Texte du lien',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'reference',
      label: 'Contenu',
      type: 'relationship',
      relationTo: [...LINKABLE],
      admin: { condition: (_, s) => s?.type === 'reference' },
      validate: (value: unknown, { siblingData }: { siblingData: { type?: string } }) =>
        siblingData?.type !== 'reference' || value ? true : 'Choisissez un contenu.',
    },
    {
      name: 'url',
      label: 'Adresse',
      type: 'text',
      localized: true,
      admin: {
        condition: (_, s) => s?.type !== 'reference',
        description:
          'Page du site sans la langue (ex. /secteurs, /en : /sectors), ou lien externe en https://.',
      },
      validate: (value: unknown, { siblingData }: { siblingData: { type?: string } }) =>
        siblingData?.type === 'reference' ? true : validateHref(value),
    },
  ]
  if (withStyle) {
    fields.push({
      name: 'style',
      label: 'Style',
      type: 'select',
      defaultValue: 'primary',
      options: [
        { label: 'Bouton rouge', value: 'primary' },
        { label: 'Bouton contour', value: 'outline' },
        { label: 'Lien simple', value: 'ghost' },
      ],
    })
  }
  return { name, label, type: 'group', interfaceName: withStyle ? 'ButtonLink' : 'Link', fields }
}
