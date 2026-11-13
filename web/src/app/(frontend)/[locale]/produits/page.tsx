import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { ProductCard } from '@/components/site/cards'
import { EmptyState, FilterGroup } from '@/components/site/nav'
import { PageHeader } from '@/components/site/PageHeader'
import { ButtonLinks, Container } from '@/components/site/primitives'
import { SiteShell } from '@/components/site/SiteShell'
import { getPathname } from '@/i18n/navigation'
import { listProducts } from '@/lib/content'
import { contactLink, initLocale, pageMetadata, staticAlternates } from '@/lib/page'
import type { Brand, Product } from '@/payload-types'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ category?: string; brand?: string }>
}

const CATEGORIES = ['fish-feed', 'equipment', 'inputs'] as const satisfies Product['category'][]

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await initLocale(params)
  const t = await getTranslations({ locale, namespace: 'products' })
  return pageMetadata({
    locale,
    alternates: staticAlternates('/produits'),
    title: t('title'),
    description: t('intro'),
  })
}

export default async function ProductsPage({ params, searchParams }: Props) {
  const locale = await initLocale(params)
  const sp = await searchParams
  const [t, tc, all] = await Promise.all([
    getTranslations({ locale, namespace: 'products' }),
    getTranslations({ locale, namespace: 'common' }),
    listProducts(locale, {}),
  ])
  const contact = await contactLink(locale, { label: t('requestQuote') })

  const brands = [
    ...new Map(
      all
        .map((p) => p.brand)
        .filter((b): b is Brand => typeof b === 'object' && b !== null)
        .map((b) => [b.id, b]),
    ).values(),
  ]
  const categories = CATEGORIES.filter((c) => all.some((p) => p.category === c))
  const category = categories.find((c) => c === sp.category)
  const brand = brands.find((b) => b.slug === sp.brand)
  const products = all.filter(
    (p) =>
      (!category || p.category === category) &&
      (!brand || (typeof p.brand === 'object' ? p.brand?.id : p.brand) === brand.id),
  )

  const href = (q: { category?: string; brand?: string }) => {
    const query = Object.fromEntries(Object.entries(q).filter(([, v]) => v)) as Record<
      string,
      string
    >
    return getPathname({ locale, href: { pathname: '/produits', query } })
  }

  const alternates = staticAlternates('/produits')
  return (
    <SiteShell locale={locale} alternates={alternates} currentPath={alternates[locale]}>
      <PageHeader title={t('title')} intro={t('intro')}>
        <ButtonLinks className="mt-8" links={[contact]} />
      </PageHeader>
      <Container className="py-12 sm:py-16">
        {(categories.length > 1 || brands.length > 1) && (
          <div role="group" aria-label={tc('filters')} className="mb-10 space-y-6">
            {categories.length > 1 && (
              <FilterGroup
                legend={t('category')}
                options={[
                  { href: href({ brand: brand?.slug }), label: tc('all'), active: !category },
                  ...categories.map((c) => ({
                    href: href({ category: c, brand: brand?.slug }),
                    label: t(`categories.${c}`),
                    active: c === category,
                  })),
                ]}
              />
            )}
            {brands.length > 1 && (
              <FilterGroup
                legend={t('brand')}
                options={[
                  { href: href({ category }), label: tc('all'), active: !brand },
                  ...brands.map((b) => ({
                    href: href({ category, brand: b.slug }),
                    label: b.name,
                    active: b.id === brand?.id,
                  })),
                ]}
              />
            )}
          </div>
        )}

        <p className="sr-only" aria-live="polite">
          {t('count', { count: products.length })}
        </p>
        {products.length ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} locale={locale} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState>{all.length ? tc('noResults') : t('empty')}</EmptyState>
        )}
      </Container>
    </SiteShell>
  )
}
