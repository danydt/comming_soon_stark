import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { SectorCard } from '@/components/site/cards'
import { EmptyState } from '@/components/site/nav'
import { PageHeader } from '@/components/site/PageHeader'
import { Container } from '@/components/site/primitives'
import { SiteShell } from '@/components/site/SiteShell'
import { listSectors } from '@/lib/content'
import { initLocale, pageMetadata, staticAlternates } from '@/lib/page'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await initLocale(params)
  const t = await getTranslations({ locale, namespace: 'sectors' })
  return pageMetadata({
    locale,
    alternates: staticAlternates('/secteurs'),
    title: t('title'),
    description: t('intro'),
  })
}

export default async function SectorsPage({ params }: Props) {
  const locale = await initLocale(params)
  const [t, sectors] = await Promise.all([
    getTranslations({ locale, namespace: 'sectors' }),
    listSectors(locale),
  ])
  const alternates = staticAlternates('/secteurs')
  return (
    <SiteShell locale={locale} alternates={alternates} currentPath={alternates[locale]}>
      <PageHeader title={t('title')} intro={t('intro')} />
      <Container className="py-12 sm:py-16">
        {sectors.length ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sectors.map((s) => (
              <li key={s.id}>
                <SectorCard sector={s} locale={locale} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState>{t('empty')}</EmptyState>
        )}
      </Container>
    </SiteShell>
  )
}
