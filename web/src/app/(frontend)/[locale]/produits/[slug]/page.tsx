import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { AvailabilityBadge } from '@/components/site/cards'
import { Breadcrumb } from '@/components/site/nav'
import { ButtonLinks, Container, MediaImage } from '@/components/site/primitives'
import { RichText } from '@/components/site/RichText'
import { SiteShell } from '@/components/site/SiteShell'
import { getPathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { getProduct, listSlugs } from '@/lib/content'
import { contactLink, detailAlternates, initLocale, pageMetadata } from '@/lib/page'
import type { Media } from '@/payload-types'

type Props = { params: Promise<{ locale: string; slug: string }> }

export async function generateStaticParams() {
  const all = await Promise.all(
    routing.locales.map(async (locale) =>
      (await listSlugs('products', locale)).map((slug) => ({ locale, slug })),
    ),
  )
  return all.flat()
}

async function load(params: Props['params']) {
  const locale = await initLocale(params)
  const { slug } = await params
  return { locale, product: await getProduct(locale, decodeURIComponent(slug)) }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, product } = await load(params)
  if (!product) return {}
  const photo = product.photos?.find((p): p is Media => typeof p === 'object')
  return pageMetadata({
    locale,
    alternates: await detailAlternates('products', product.id),
    title: product.name,
    description: product.excerpt,
    image: photo,
    meta: product.meta,
  })
}

export default async function ProductPage({ params }: Props) {
  const { locale, product } = await load(params)
  if (!product) notFound()
  const [t, tc, alternates] = await Promise.all([
    getTranslations({ locale, namespace: 'products' }),
    getTranslations({ locale, namespace: 'common' }),
    detailAlternates('products', product.id),
  ])
  // « Demander un devis » ouvre la page Contact avec le produit (repris par le formulaire en phase 4).
  const quote = await contactLink(locale, {
    label: t('requestQuote'),
    query: { produit: product.slug },
  })
  const brand = typeof product.brand === 'object' ? product.brand : null
  const photos = (product.photos ?? []).filter((p): p is Media => typeof p === 'object')

  return (
    <SiteShell locale={locale} alternates={alternates} currentPath={alternates[locale]}>
      <Breadcrumb
        label={tc('breadcrumb')}
        items={[
          { href: getPathname({ locale, href: '/' }), label: tc('home') },
          { href: getPathname({ locale, href: '/produits' }), label: t('title') },
          { label: product.name },
        ]}
      />
      <Container className="grid gap-10 pt-6 pb-16 lg:grid-cols-2">
        <div className="space-y-3">
          {photos.length ? (
            photos.map((p, i) => (
              <div
                key={p.id}
                className="relative aspect-square overflow-hidden rounded-[var(--radius-card)] bg-surface-warm"
              >
                <MediaImage
                  media={p}
                  size="hero"
                  fill
                  priority={i === 0}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-contain p-6"
                />
              </div>
            ))
          ) : (
            <div
              aria-hidden="true"
              className="aspect-square rounded-[var(--radius-card)] bg-surface-warm"
            />
          )}
        </div>
        <div>
          <p className="eyebrow mb-3 text-[0.8125rem]">{t(`categories.${product.category}`)}</p>
          <h1 className="text-[clamp(1.875rem,6vw,2.75rem)] tracking-[-0.01em]">{product.name}</h1>
          {brand && (
            <p className="mt-2 text-text-muted">
              {t('brand')} : {brand.name}
              {brand.website && (
                <>
                  {' · '}
                  <a
                    href={brand.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline-offset-4 hover:underline"
                  >
                    {t('website')}
                    <span className="sr-only"> {tc('newTab')}</span>
                  </a>
                </>
              )}
            </p>
          )}
          <p className="mt-5">
            <AvailabilityBadge
              value={product.availability}
              label={t(`availability.${product.availability}`)}
            />
          </p>
          {product.excerpt && (
            <p className="mt-6 text-[1.0625rem] text-[#333]">{product.excerpt}</p>
          )}
          <RichText data={product.description} className="mt-6" />
          {product.specs?.length ? (
            <section aria-labelledby="caracteristiques" className="mt-10">
              <h2 id="caracteristiques" className="text-xl">
                {t('specs')}
              </h2>
              <dl className="mt-4 divide-y divide-line border-y border-line">
                {product.specs.map((s, i) => (
                  <div key={s.id ?? i} className="grid grid-cols-[1fr_1.4fr] gap-4 py-3">
                    <dt className="font-semibold">{s.label}</dt>
                    <dd>{s.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}
          <div className="mt-10 rounded-[var(--radius-card)] bg-surface-warm p-6">
            <p className="text-[#333]">{t('quoteIntro')}</p>
            <ButtonLinks className="mt-5" links={[quote]} />
          </div>
        </div>
      </Container>
    </SiteShell>
  )
}
