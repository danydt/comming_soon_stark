/**
 * Listes de choix des formulaires « Nous soutenir » et « Contact ».
 * Partagées par la validation (zod), les collections Payload et les formulaires.
 * Les libellés du site sont dans messages/{fr,en}.json (`forms.options.*`),
 * ceux de l'administration ci-dessous (administration en français).
 */

export const SUPPORT_TYPES = ['financial', 'inKind', 'partnership', 'other'] as const
export type SupportType = (typeof SUPPORT_TYPES)[number]

export const SUPPORT_AREAS = ['health', 'agriculture', 'livestock', 'fishing', 'anywhere'] as const
export type SupportArea = (typeof SUPPORT_AREAS)[number]

export const CONTACT_SUBJECTS = [
  'health',
  'agriculture',
  'livestock',
  'fishing',
  'quote',
  'partnership',
  'press',
  'other',
] as const
export type ContactSubject = (typeof CONTACT_SUBJECTS)[number]

export const TIME_SLOTS = ['morning', 'afternoon', 'evening', 'any'] as const
export type TimeSlot = (typeof TIME_SLOTS)[number]

export const CURRENCIES = ['USD', 'CDF'] as const
export type Currency = (typeof CURRENCIES)[number]

export const ADMIN_LABELS = {
  supportType: {
    financial: 'Don financier',
    inKind: 'Don en nature',
    partnership: 'Partenariat ou mécénat',
    other: 'Autre',
  },
  area: {
    health: 'Santé',
    agriculture: 'Agriculture',
    livestock: 'Élevage',
    fishing: 'Pêche & pisciculture',
    anywhere: 'Là où c’est le plus utile',
  },
  subject: {
    health: 'Santé',
    agriculture: 'Agriculture',
    livestock: 'Élevage',
    fishing: 'Pêche & pisciculture',
    quote: 'Produits & devis',
    partnership: 'Partenariat',
    press: 'Presse',
    other: 'Autre',
  },
  timeSlot: {
    morning: 'Matin (8 h – 12 h)',
    afternoon: 'Après-midi (12 h – 16 h)',
    evening: 'Fin de journée (16 h – 19 h)',
    any: 'N’importe quand',
  },
} as const

/** Options Payload `select` à partir d'une liste et de ses libellés d'administration. */
export function adminOptions<T extends string>(values: readonly T[], labels: Record<T, string>) {
  return values.map((value) => ({ value, label: labels[value] }))
}
