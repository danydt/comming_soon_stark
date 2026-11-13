import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { formatDate } from '@/components/site/cards'
import { Breadcrumb } from '@/components/site/nav'
import { Container, MediaImage } from '@/components/site/primitives'
import { RichText } from '@/components/site/RichText'
import { SiteShell } from '@/components/site/SiteShell'
import { getPathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { getPost, listSlugs } from '@/lib/content'
import { hrefFor } from '@/lib/links'
import { detailAlternates, initLocale, pageMetadata } from '@/lib/page'
import type { Sector } from '@/payload-types'

type Props = { params: Promise<{ locale: string; slug: string }> }

export async function generateStaticParams() {
  const all = await Promise.all(
    routing.locales.map(async (locale) =>
      (await listSlugs('posts', locale)).map((slug) => ({ locale, slug })),
    ),
  )
  return all.flat()
}

async function load(params: Props['params']) {
  const locale = await initLocale(params)
  const { slug } = await params
  return { locale, post: await getPost(locale, decodeURIComponent(slug)) }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, post } = await load(params)
  if (!post) return {}
  const meta = await pageMetadata({
    locale,
    alternates: await detailAlternates('posts', post.id),
    title: post.title,
    description: post.excerpt,
    image: post.coverImage,
    meta: post.meta,
  })
  return {
    ...meta,
    openGraph: { ...meta.openGraph, type: 'article', publishedTime: post.publishedAt },
  }
}

export default async function PostPage({ params }: Props) {
  const { locale, post } = await load(params)
  if (!post) notFound()
  const [t, tc, alternates] = await Promise.all([
    getTranslations({ locale, namespace: 'posts' }),
    getTranslations({ locale, namespace: 'common' }),
    detailAlternates('posts', post.id),
  ])
  const sectors = (post.sectors ?? []).filter((s): s is Sector => typeof s === 'object')

  return (
    <SiteShell locale={locale} alternates={alternates} currentPath={alternates[locale]}>
      <Breadcrumb
        label={tc('breadcrumb')}
        items={[
          { href: getPathname({ locale, href: '/' }), label: tc('home') },
          { href: getPathname({ locale, href: '/actualites' }), label: t('title') },
          { label: post.title },
        ]}
      />
      <article>
        <Container className="max-w-3xl pt-6 pb-16">
          <p className="eyebrow mb-3 text-[0.8125rem]">
            {t(`categories.${post.category}`)} ·{' '}
            <time dateTime={post.publishedAt}>{formatDate(locale, post.publishedAt)}</time>
          </p>
          <h1 className="text-[clamp(1.875rem,6vw,2.75rem)] tracking-[-0.01em]">{post.title}</h1>
          {post.author && (
            <p className="mt-3 text-text-muted">{t('by', { author: post.author })}</p>
          )}
          <p className="mt-6 text-lg text-[#333]">{post.excerpt}</p>
          {post.coverImage && typeof post.coverImage === 'object' && (
            <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-[var(--radius-card)] bg-surface-warm">
              <MediaImage
                media={post.coverImage}
                size="hero"
                fill
                priority
                sizes="(min-width: 768px) 720px, 100vw"
                className="object-cover"
              />
            </div>
          )}
          <RichText data={post.content} className="mt-10" />
          {sectors.length > 0 && (
            <ul className="mt-10 flex flex-wrap gap-2">
              {sectors.map((s) => (
                <li key={s.id}>
                  <a
                    href={hrefFor(locale, 'sectors', s.slug)}
                    className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm font-semibold hover:border-brand-black"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </article>
    </SiteShell>
  )
}
