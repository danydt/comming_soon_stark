import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'

import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import { PageHeader } from '@/components/site/PageHeader'
import { homeSlug, SiteShell } from '@/components/site/SiteShell'
import { routing } from '@/i18n/routing'
import { getPage, listSlugs } from '@/lib/content'
import { detailAlternates, initLocale, pageMetadata } from '@/lib/page'

type Props = { params: Promise<{ locale: string; slug: string }> }

export async function generateStaticParams() {
  const all = await Promise.all(
    routing.locales.map(async (locale) =>
      (await listSlugs('pages', locale)).map((slug) => ({ locale, slug })),
    ),
  )
  return all.flat()
}

async function load(params: Props['params']) {
  const locale = await initLocale(params)
  const { slug } = await params
  const [page, home] = await Promise.all([
    getPage(locale, decodeURIComponent(slug)),
    homeSlug(locale),
  ])
  return { locale, page, home }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, page } = await load(params)
  if (!page) return {}
  return pageMetadata({
    locale,
    alternates: await detailAlternates('pages', page.id),
    title: page.title,
    meta: page.meta,
  })
}

export default async function GenericPage({ params }: Props) {
  const { locale, page, home } = await load(params)
  if (!page) notFound()
  // La page d'accueil n'a qu'une adresse : /fr ou /en.
  if (page.slug === home) permanentRedirect(`/${locale}`)
  const alternates = await detailAlternates('pages', page.id)
  const startsWithHero = page.layout?.[0]?.blockType === 'hero'
  return (
    <SiteShell locale={locale} alternates={alternates} currentPath={alternates[locale]}>
      {!startsWithHero && <PageHeader title={page.title} />}
      <RenderBlocks blocks={page.layout} locale={locale} home={home} />
    </SiteShell>
  )
}
