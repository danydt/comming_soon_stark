import { getLocale, getTranslations } from 'next-intl/server'

import { NotFoundContent } from '@/components/site/NotFoundContent'
import { SiteShell } from '@/components/site/SiteShell'
import { routing, type Locale } from '@/i18n/routing'
import { staticAlternates } from '@/lib/page'

export default async function NotFound() {
  const raw = await getLocale()
  const locale: Locale = (routing.locales as readonly string[]).includes(raw)
    ? (raw as Locale)
    : 'fr'
  const t = await getTranslations({ locale, namespace: 'meta' })
  return (
    <SiteShell locale={locale} alternates={staticAlternates('/')} currentPath="">
      <title>{`404 — ${t('siteName')}`}</title>
      <meta name="robots" content="noindex" />
      <NotFoundContent locale={locale} />
    </SiteShell>
  )
}
