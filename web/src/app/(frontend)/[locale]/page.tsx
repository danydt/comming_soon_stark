import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import { SiteShell } from '@/components/site/SiteShell'
import { getPage, getSettings } from '@/lib/content'
import { initLocale, pageMetadata, staticAlternates } from '@/lib/page'

type Props = { params: Promise<{ locale: string }> }

/** Page d'accueil : la page choisie dans Réglages du site → « Page d'accueil ». */
async function loadHome(params: Props['params']) {
  const locale = await initLocale(params)
  const settings = await getSettings(locale)
  const home = settings.homePage
  const slug = typeof home === 'object' && home ? home.slug : undefined
  const page = slug ? await getPage(locale, slug) : null
  return { locale, page }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, page } = await loadHome(params)
  return pageMetadata({ locale, alternates: staticAlternates('/'), meta: page?.meta, isHome: true })
}

export default async function HomePage({ params }: Props) {
  const { locale, page } = await loadHome(params)
  if (!page) notFound()
  return (
    <SiteShell locale={locale} alternates={staticAlternates('/')} currentPath={`/${locale}`}>
      <RenderBlocks blocks={page.layout} locale={locale} home={page.slug} />
    </SiteShell>
  )
}
