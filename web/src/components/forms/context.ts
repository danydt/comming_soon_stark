import 'server-only'

import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import { getSettings } from '@/lib/content'
import { hrefFor } from '@/lib/links'

import type { FormMessages } from './useRequestForm'

/** Textes et lien « Confidentialité » transmis aux formulaires client (sans provider next-intl). */
export async function formContext(locale: Locale) {
  const [t, settings] = await Promise.all([getTranslations({ locale }), getSettings(locale)])
  const messages = t.raw('forms') as FormMessages
  const page = settings.privacyPage
  const privacy =
    page && typeof page === 'object' && page.slug
      ? { href: hrefFor(locale, 'pages', page.slug), label: messages.fields.privacy }
      : undefined
  return { locale, messages, privacy }
}
