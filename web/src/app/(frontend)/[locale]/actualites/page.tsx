import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { PostCard } from '@/components/site/cards'
import { EmptyState, Pagination } from '@/components/site/nav'
import { PageHeader } from '@/components/site/PageHeader'
import { Container } from '@/components/site/primitives'
import { SiteShell } from '@/components/site/SiteShell'
import { getPathname } from '@/i18n/navigation'
import { listPosts } from '@/lib/content'
import { initLocale, pageMetadata, staticAlternates } from '@/lib/page'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await initLocale(params)
  const t = await getTranslations({ locale, namespace: 'posts' })
  return pageMetadata({
    locale,
    alternates: staticAlternates('/actualites'),
    title: t('title'),
    description: t('intro'),
  })
}

export default async function PostsPage({ params, searchParams }: Props) {
  const locale = await initLocale(params)
  const raw = (await searchParams).page
  const page = raw === undefined ? 1 : Number(raw)
  if (!Number.isInteger(page) || page < 1) notFound()

  const [t, tc, { docs, totalPages }] = await Promise.all([
    getTranslations({ locale, namespace: 'posts' }),
    getTranslations({ locale, namespace: 'common' }),
    listPosts(locale, page),
  ])
  if (page > 1 && page > totalPages) notFound()

  const hrefFor = (n: number) =>
    getPathname({
      locale,
      href: n === 1 ? '/actualites' : { pathname: '/actualites', query: { page: String(n) } },
    })
  const alternates = staticAlternates('/actualites')

  return (
    <SiteShell locale={locale} alternates={alternates} currentPath={alternates[locale]}>
      <PageHeader title={t('title')} intro={t('intro')} />
      <Container className="py-12 sm:py-16">
        {docs.length ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {docs.map((p) => (
              <li key={p.id}>
                <PostCard post={p} locale={locale} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState>{t('empty')}</EmptyState>
        )}
        <Pagination
          page={page}
          totalPages={totalPages}
          hrefFor={hrefFor}
          labels={{
            nav: tc('pagination'),
            previous: tc('previous'),
            next: tc('next'),
            pageOf: tc('pageOf', { page, total: totalPages }),
          }}
        />
      </Container>
    </SiteShell>
  )
}
